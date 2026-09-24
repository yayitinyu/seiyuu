import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { localeDigest, localeReviewStatus, sourceReviewStatus } from "../lib/editorial.ts";
import type { LocaleReviews, SourceAudit } from "../lib/editorial.ts";
import type { Archive, Locale } from "../lib/types.ts";

const root = process.cwd();
const read = (path: string) => readFile(resolve(root, path), "utf8");
const [archiveText, reviewsText, auditText, uiSource, journalSource] = await Promise.all([
  read("content/archive.json"),
  read("content/locale-reviews.json"),
  read("content/source-audit.json"),
  read("lib/i18n.ts"),
  read("content/journal.ts"),
]);
const archive = JSON.parse(archiveText) as Archive;
const reviews = JSON.parse(reviewsText) as LocaleReviews;
const audit = JSON.parse(auditText) as SourceAudit;
let pending = false;
for (const locale of ["zh-CN", "ja-JP", "en"] as Locale[]) {
  const digest = localeDigest(archive, locale, uiSource, journalSource);
  const status = localeReviewStatus(reviews.reviews[locale], digest);
  if (status !== "current") pending = true;
  console.log(`${locale}: ${status}`);
}
const counts = { "not-checked": 0, unavailable: 0, pending: 0, changed: 0, current: 0, manual: 0 };
for (const source of archive.sources)
  counts[sourceReviewStatus(source, audit.sources[source.id])]++;
console.log(`Sources: ${JSON.stringify(counts)}`);
if (counts["not-checked"] + counts.unavailable + counts.pending + counts.changed > 0)
  pending = true;
if (process.argv.includes("--gate") && pending) {
  console.error("Editorial gate failed: complete source and language review before publication.");
  process.exitCode = 1;
}
