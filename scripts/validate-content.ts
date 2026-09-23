import { readFileSync } from "node:fs";
import { validateArchive } from "../lib/validate.ts";
import type { Archive } from "../lib/types.ts";
const archive = JSON.parse(
  readFileSync(new URL("../content/archive.json", import.meta.url), "utf8"),
) as Archive;
const errors = validateArchive(archive);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Content verified: ${archive.seiyuu.length} people, ${archive.roles.length} roles, ${archive.sources.length} sources. Referential integrity and evidence passed.`,
  );
}
