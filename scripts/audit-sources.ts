import { readFile, rename, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { recordObservation, sha256, sourceReviewStatus } from "../lib/editorial.ts";
import type { SourceAudit } from "../lib/editorial.ts";
import { observeSource } from "../lib/source-audit.ts";
import type { Archive } from "../lib/types.ts";

const root = process.cwd();
const archive = JSON.parse(await readFile(resolve(root, "content/archive.json"), "utf8")) as Archive;
const auditPath = resolve(root, "content/source-audit.json");
const originalAudit = await readFile(auditPath, "utf8");
const audit = JSON.parse(originalAudit) as SourceAudit;
const selected = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const dryRun = process.argv.includes("--dry-run");
const unknown = selected.filter((id) => !archive.sources.some((source) => source.id === id));
if (unknown.length) throw new Error(`Unknown source IDs: ${unknown.join(", ")}`);
const sources = selected.length
  ? archive.sources.filter((source) => selected.includes(source.id))
  : archive.sources;

let next = 0;
let failures = 0;
async function worker() {
  while (next < sources.length) {
    const source = sources[next++];
    const observation = await observeSource(source);
    const updated = recordObservation(audit, source.id, observation);
    audit.sources[source.id] = updated.sources[source.id];
    const status = sourceReviewStatus(source, audit.sources[source.id]);
    if (status === "unavailable") failures++;
    console.log(`${source.id}: ${observation.status ?? observation.error} · ${status}`);
  }
}
await Promise.all(Array.from({ length: Math.min(3, sources.length) }, () => worker()));
if (!dryRun) {
  if (sha256(await readFile(auditPath, "utf8")) !== sha256(originalAudit))
    throw new Error("Source audit changed during checks; rerun to avoid overwriting another review");
  const temp = `${auditPath}.${randomUUID()}.tmp`;
  await writeFile(temp, `${JSON.stringify(audit, null, 2)}\n`, { flag: "wx" });
  await rename(temp, auditPath);
}
console.log(`${sources.length} sources checked, ${failures} unavailable${dryRun ? " (dry run)" : ""}.`);
if (failures) process.exitCode = 1;
