import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  latestObservation,
  localeDigest,
  localeReviewStatus,
  recordObservation,
  sha256,
  sourceReviewStatus,
} from "../lib/editorial.ts";
import type { LocaleReviews, SourceAudit } from "../lib/editorial.ts";
import { validateMediaFiles } from "../lib/media-server.ts";
import { observeSource } from "../lib/source-audit.ts";
import type { Archive, Locale } from "../lib/types.ts";
import { validateArchive } from "../lib/validate.ts";

const root = process.cwd();
const file = (path: string) => resolve(root, path);
const archivePath = file("content/archive.json");
const auditPath = file("content/source-audit.json");
const reviewsPath = file("content/locale-reviews.json");
const origin = `http://127.0.0.1:${Number(process.env.STUDIO_PORT ?? 3210)}`;
const token = randomBytes(32).toString("hex");

async function readState() {
  const [archiveText, auditText, reviewsText, uiSource, journalSource] =
    await Promise.all([
      readFile(archivePath, "utf8"),
      readFile(auditPath, "utf8"),
      readFile(reviewsPath, "utf8"),
      readFile(file("lib/i18n.ts"), "utf8"),
      readFile(file("content/journal.ts"), "utf8"),
    ]);
  const archive = JSON.parse(archiveText) as Archive;
  const audit = JSON.parse(auditText) as SourceAudit;
  const reviews = JSON.parse(reviewsText) as LocaleReviews;
  const digests = Object.fromEntries(
    (["zh-CN", "ja-JP", "en"] as Locale[]).map((locale) => [
      locale,
      localeDigest(archive, locale, uiSource, journalSource),
    ]),
  ) as Record<Locale, string>;
  return {
    archive,
    archiveHash: sha256(archiveText),
    audit,
    auditHash: sha256(auditText),
    reviews,
    reviewsHash: sha256(reviewsText),
    digests,
    localeStatuses: Object.fromEntries(
      (["zh-CN", "ja-JP", "en"] as Locale[]).map((locale) => [
        locale,
        localeReviewStatus(reviews.reviews[locale], digests[locale]),
      ]),
    ),
    sourceStatuses: Object.fromEntries(
      archive.sources.map((source) => [
        source.id,
        sourceReviewStatus(source, audit.sources[source.id]),
      ]),
    ),
  };
}

async function writeJson(path: string, value: unknown) {
  const temp = `${path}.${randomUUID()}.tmp`;
  await writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, { flag: "wx" });
  await rename(temp, path);
}

function json(response: ServerResponse, status: number, value: unknown) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(JSON.stringify(value));
}

async function body(request: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 2_000_000) throw new Error("Request exceeds 2 MB");
    chunks.push(chunk);
  }
  const parsed = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
    throw new Error("Expected a JSON object");
  return parsed as Record<string, unknown>;
}

async function handle(request: IncomingMessage, response: ServerResponse) {
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Referrer-Policy", "no-referrer");
  response.setHeader(
    "Content-Security-Policy",
    "default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'none'",
  );
  if (request.headers.host !== new URL(origin).host) {
    json(response, 403, { error: "Invalid host" });
    return;
  }
  const path = new URL(request.url ?? "/", origin).pathname;
  if (request.method === "GET" && (path === "/" || path === "/studio.js")) {
    const filename = path === "/" ? "scripts/studio.html" : "scripts/studio.js";
    const payload = await readFile(file(filename));
    response.writeHead(200, {
      "Content-Type": path === "/" ? "text/html; charset=utf-8" : "text/javascript; charset=utf-8",
      "Cache-Control": "no-store",
    });
    response.end(payload);
    return;
  }
  const received = request.headers["x-studio-token"];
  const supplied = typeof received === "string" ? Buffer.from(received) : Buffer.alloc(0);
  const expected = Buffer.from(token);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    json(response, 401, { error: "Invalid studio token" });
    return;
  }
  if (request.method === "GET" && path === "/api/state") {
    json(response, 200, await readState());
    return;
  }
  if (request.method !== "POST" || request.headers.origin !== origin ||
      request.headers["content-type"]?.split(";")[0] !== "application/json") {
    json(response, 405, { error: "Unsupported request" });
    return;
  }
  try {
    const input = await body(request);
    if (path === "/api/archive") {
      const state = await readState();
      if (input.baseHash !== state.archiveHash)
        return json(response, 409, { error: "Archive changed; reload before saving" });
      const proposed = input.archive as Archive;
      let errors: string[];
      try {
        errors = [...validateArchive(proposed), ...(await validateMediaFiles(proposed))];
      } catch (error) {
        return json(response, 422, { error: `Invalid archive shape: ${String(error)}` });
      }
      if (errors.length) return json(response, 422, { error: errors.join("\n") });
      if (sha256(await readFile(archivePath, "utf8")) !== state.archiveHash)
        return json(response, 409, { error: "Archive changed during validation; reload" });
      const revisionDir = file("content/.revisions");
      await mkdir(revisionDir, { recursive: true });
      await writeFile(
        resolve(revisionDir, `${new Date().toISOString().replaceAll(":", "-")}-${state.archiveHash.slice(0, 12)}.json`),
        `${JSON.stringify(state.archive, null, 2)}\n`,
        { flag: "wx" },
      );
      await writeJson(archivePath, proposed);
      return json(response, 200, { ok: true });
    }
    if (path === "/api/audit") {
      const state = await readState();
      if (input.auditHash !== state.auditHash)
        return json(response, 409, { error: "Audit changed; reload before checking" });
      const source = state.archive.sources.find((entry) => entry.id === input.sourceId);
      if (!source) return json(response, 404, { error: "Unknown source" });
      const observation = await observeSource(source);
      const fresh = await readState();
      if (fresh.auditHash !== state.auditHash ||
          fresh.archive.sources.find((entry) => entry.id === source.id)?.source_url !== source.source_url)
        return json(response, 409, { error: "Content changed during check; retry" });
      const audit = recordObservation(state.audit, source.id, observation);
      if (sha256(await readFile(auditPath, "utf8")) !== state.auditHash)
        return json(response, 409, { error: "Audit changed during check; reload" });
      await writeJson(auditPath, audit);
      return json(response, 200, { observation });
    }
    if (path === "/api/review/source") {
      const state = await readState();
      if (input.auditHash !== state.auditHash)
        return json(response, 409, { error: "Audit changed; reload before reviewing" });
      const source = state.archive.sources.find((entry) => entry.id === input.sourceId);
      if (!source) return json(response, 404, { error: "Unknown source" });
      const entry = state.audit.sources[source.id];
      const latest = latestObservation(entry);
      if (!latest || latest.sourceUrl !== source.source_url)
        return json(response, 422, { error: "Check this source before reviewing" });
      const method = input.method === "manual" ? "manual" : "digest";
      if (method === "digest" && (!latest.sha256 || latest.status !== 200 || latest.sha256 !== input.sha256))
        return json(response, 422, { error: "No matching successful observation" });
      if (method === "manual" && latest.status === 200 && latest.sha256)
        return json(response, 422, { error: "A content digest is available; review that version" });
      const reviewer = String(input.reviewer ?? "").trim();
      const note = String(input.note ?? "").trim();
      if (!reviewer || !note)
        return json(response, 422, { error: "Reviewer and review note are required" });
      entry.review = {
        method,
        ...(method === "digest" ? { sha256: latest.sha256 } : {}),
        sourceUrl: source.source_url,
        reviewer,
        reviewedAt: new Date().toISOString(),
        note,
      };
      if (sha256(await readFile(auditPath, "utf8")) !== state.auditHash)
        return json(response, 409, { error: "Audit changed during review; reload" });
      await writeJson(auditPath, state.audit);
      return json(response, 200, { ok: true });
    }
    if (path === "/api/review/locale") {
      const state = await readState();
      const locale = input.locale as Locale;
      if (!["zh-CN", "ja-JP", "en"].includes(locale) || input.digest !== state.digests[locale])
        return json(response, 409, { error: "Language content changed; reload before reviewing" });
      const reviewer = String(input.reviewer ?? "").trim();
      const note = String(input.note ?? "").trim();
      if (!reviewer || !note)
        return json(response, 422, { error: "Reviewer and review note are required" });
      state.reviews.reviews[locale] = {
        digest: state.digests[locale],
        reviewer,
        reviewedAt: new Date().toISOString(),
        note,
      };
      const fresh = await readState();
      if (fresh.digests[locale] !== state.digests[locale] ||
          fresh.reviewsHash !== state.reviewsHash)
        return json(response, 409, { error: "Review content changed; reload" });
      await writeJson(reviewsPath, state.reviews);
      return json(response, 200, { ok: true });
    }
    json(response, 404, { error: "Unknown action" });
  } catch (error) {
    console.error("Studio request failed", error);
    json(response, 400, { error: error instanceof Error ? error.message : String(error) });
  }
}

const server = createServer((request, response) => {
  void handle(request, response).catch((error) => {
    console.error("Studio request failed", error);
    if (!response.headersSent)
      json(response, 500, { error: "Studio could not complete this request" });
    else response.end();
  });
});

server.listen(Number(process.env.STUDIO_PORT ?? 3210), "127.0.0.1", () => {
  console.log(`Open ${origin}/#${token}`);
});
