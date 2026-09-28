import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { auditArchiveSources } from "../lib/archive-source-audit.ts";
import type { UrlCheck, SourceAuditFindingKind } from "../lib/archive-source-audit.ts";
import type { Archive } from "../lib/types.ts";

async function checkUrl(url: string): Promise<UrlCheck> {
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(12000),
      headers: {
        Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5",
        "User-Agent": "SeiyuuArchiveSourceAudit/1.0 (+https://seiyuu.page)",
      },
    });
    await response.body?.cancel();
    if (new URL(response.url).protocol !== "https:")
      return { error: `redirected to non-HTTPS URL ${response.url}` };
    return { status: response.status, finalUrl: response.url };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

const args = process.argv.slice(2);
if (args.some((arg) => arg !== "--no-network"))
  throw new Error(`Unknown option: ${args.find((arg) => arg !== "--no-network")}`);

const archive = JSON.parse(await readFile(resolve("content/archive.json"), "utf8")) as Archive;
const checks = new Map<string, UrlCheck>();
if (!args.includes("--no-network")) {
  const sources = archive.sources.filter((source) => {
    try {
      return new URL(source.source_url).protocol === "https:";
    } catch {
      return false;
    }
  });
  let next = 0;
  async function worker() {
    while (next < sources.length) {
      const source = sources[next++];
      checks.set(source.id, await checkUrl(source.source_url));
    }
  }
  await Promise.all(Array.from({ length: Math.min(3, sources.length) }, () => worker()));
}

const report = auditArchiveSources(archive, checks);
const counts = new Map<SourceAuditFindingKind, number>();
for (const finding of report.findings)
  counts.set(finding.kind, (counts.get(finding.kind) ?? 0) + 1);
console.log(`Archive source audit: ${report.sources} sources, ${report.checkedUrls} URLs checked${args.includes("--no-network") ? " (network skipped)" : ""}.`);
for (const kind of [
  "stale-url", "unreachable-url", "missing-accessed-at", "invalid-accessed-at",
  "missing-url", "invalid-url", "missing-evidence-reference", "unknown-evidence-reference",
] as SourceAuditFindingKind[])
  console.log(`${kind}: ${counts.get(kind) ?? 0}`);
console.log(`IMAGE_LICENSE_TODO: ${report.imageLicenseTodo}`);
for (const finding of report.findings)
  console.log(`- ${finding.kind} ${finding.location}: ${finding.detail}`);
console.log("URL failures and redirects need human review; an automated response does not establish whether archive facts are true.");
