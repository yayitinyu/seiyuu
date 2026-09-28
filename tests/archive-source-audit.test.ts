import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { auditArchiveSources } from "../lib/archive-source-audit.ts";
import type { Archive, Source } from "../lib/types.ts";

const source = (id: string, url = `https://example.com/${id}`): Source => ({
  id,
  title: id,
  source_url: url,
  source_type: "official-person",
  retrieved_at: "2026-09-23",
  verified: true,
  confidence: "high",
});

function fixture(): Archive {
  return {
    sources: [source("ok"), source("gone"), source("blocked"), source("moved")],
    media: [], agencies: [], anime: [{ id: "work", slug: "work", title: { "zh-CN": "", "ja-JP": "", en: "" }, format: "TV", sourceIds: ["ok"], url: "https://example.com/work" }],
    characters: [], roles: [{ id: "role", seiyuuId: "person", characterId: "character", animeId: "work", sourceIds: ["ok"] }],
    conflicts: [],
    seiyuu: [{
      id: "person", slug: "person", names: { ja: "", kana: "", romaji: "", zh: "" }, aliases: [],
      agencyId: "agency", kanaGroup: "", color: "", introduction: { "zh-CN": "", "ja-JP": "", en: "" },
      tagline: { "zh-CN": "", "ja-JP": "", en: "" }, evidence: { names: { sourceIds: ["ok"], verified: true, confidence: "high" } },
      timeline: [], activities: [], sourceIds: ["ok"], officialUrl: "https://example.com/person",
      imageStatus: "IMAGE_LICENSE_TODO", socialLinks: [],
    }],
  };
}

test("reports stale, unreachable and redirected URLs without altering archive data", () => {
  const archive = fixture();
  archive.sources[0].accessedAt = "2026-09-25T12:00:00Z";
  const before = structuredClone(archive);
  const report = auditArchiveSources(archive, new Map([
    ["ok", { status: 200, finalUrl: archive.sources[0].source_url }],
    ["gone", { status: 404 }],
    ["blocked", { error: "fetch failed" }],
    ["moved", { status: 200, finalUrl: "https://example.com/new" }],
  ]), "2026-09-26");
  assert.equal(report.sources, 4);
  assert.equal(report.checkedUrls, 4);
  assert.equal(report.imageLicenseTodo, 1);
  assert.deepEqual(report.findings.filter((finding) => finding.kind === "stale-url").map((finding) => finding.location), ["sources.gone", "sources.moved"]);
  assert.deepEqual(report.findings.filter((finding) => finding.kind === "unreachable-url").map((finding) => finding.location), ["sources.blocked"]);
  assert.equal(report.findings.filter((finding) => finding.kind === "missing-accessed-at").length, 3);
  assert.deepEqual(archive, before);
});

test("reports missing URLs, old access dates and broken evidence references", () => {
  const archive = fixture();
  archive.sources[0].source_url = "";
  archive.sources[1].accessedAt = "2025-01-01";
  archive.sources[2].accessedAt = "2026-99-99";
  archive.seiyuu[0].sourceIds = ["missing"];
  archive.seiyuu[0].evidence.names.sourceIds = [];
  archive.seiyuu[0].birth = { month: 1, day: 1 };
  archive.seiyuu[0].socialLinks = [{ platform: "test", url: "https://example.com", verifiedBySourceId: "unknown" }];
  archive.roles[0].sourceIds = [];
  archive.conflicts.push({ entityId: "person", field: "names", assertions: [{ value: "A", sourceId: "" }], status: "open" });
  const report = auditArchiveSources(archive, new Map(), "2026-09-26");
  assert.ok(report.findings.some((finding) => finding.kind === "missing-url" && finding.location === "sources.ok.source_url"));
  assert.ok(report.findings.some((finding) => finding.kind === "stale-url" && finding.location === "sources.gone"));
  assert.ok(report.findings.some((finding) => finding.kind === "invalid-accessed-at" && finding.location === "sources.blocked"));
  assert.ok(report.findings.some((finding) => finding.kind === "missing-evidence-reference" && finding.location === "seiyuu.person.evidence.birth"));
  assert.ok(report.findings.some((finding) => finding.kind === "missing-evidence-reference" && finding.location === "roles.role"));
  assert.ok(report.findings.some((finding) => finding.kind === "unknown-evidence-reference" && finding.location === "seiyuu.person.socialLinks[0]"));
});

test("offline command reads a fixture without writing any archive or audit file", async () => {
  const root = await mkdtemp(join(tmpdir(), "seiyuu-audit-"));
  try {
    await mkdir(join(root, "content"));
    const archiveText = `${JSON.stringify(fixture())}\n`;
    await writeFile(join(root, "content", "archive.json"), archiveText);
    const result = spawnSync(process.execPath, ["--experimental-strip-types", resolve("scripts/audit-archive.ts"), "--no-network"], { cwd: root, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /IMAGE_LICENSE_TODO: 1/);
    assert.match(result.stdout, /missing-accessed-at: 4/);
    assert.equal(await readFile(join(root, "content", "archive.json"), "utf8"), archiveText);
    await assert.rejects(readFile(join(root, "content", "source-audit.json"), "utf8"), { code: "ENOENT" });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
