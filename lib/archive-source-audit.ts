import type { Archive } from "./types.ts";

export interface UrlCheck {
  status?: number;
  finalUrl?: string;
  error?: string;
}

export type SourceAuditFindingKind =
  | "missing-accessed-at"
  | "invalid-accessed-at"
  | "missing-url"
  | "invalid-url"
  | "missing-evidence-reference"
  | "unknown-evidence-reference"
  | "stale-url"
  | "unreachable-url";

export interface SourceAuditFinding {
  kind: SourceAuditFindingKind;
  location: string;
  detail: string;
}

export interface ArchiveSourceAuditReport {
  sources: number;
  imageLicenseTodo: number;
  checkedUrls: number;
  findings: SourceAuditFinding[];
}

function accessTime(value: string): number {
  const day = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return NaN;
  const date = new Date(`${day}T00:00:00Z`);
  if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== day)
    return NaN;
  if (value === day) return date.valueOf();
  return /^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value)
    ? Date.parse(value)
    : NaN;
}

function validHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function auditArchiveSources(
  archive: Archive,
  checks: ReadonlyMap<string, UrlCheck> = new Map(),
  today = new Date().toISOString().slice(0, 10),
  staleAfterDays = 180,
): ArchiveSourceAuditReport {
  const findings: SourceAuditFinding[] = [];
  const add = (kind: SourceAuditFindingKind, location: string, detail: string) =>
    findings.push({ kind, location, detail });
  const sourceIds = new Set(archive.sources.map((source) => source.id));
  const checkReferences = (ids: string[] | undefined, location: string) => {
    if (!Array.isArray(ids) || ids.length === 0) {
      add("missing-evidence-reference", location, "no source IDs");
      return;
    }
    for (const id of ids) {
      if (!id || typeof id !== "string")
        add("missing-evidence-reference", location, "empty source ID");
      else if (!sourceIds.has(id))
        add("unknown-evidence-reference", location, `unknown source ID ${id}`);
    }
  };
  const todayMs = Date.parse(`${today}T00:00:00Z`);

  for (const source of archive.sources) {
    const location = `sources.${source.id}`;
    const accessedAt = source.accessedAt;
    if (!accessedAt?.trim()) {
      add("missing-accessed-at", location, "accessedAt is absent");
    } else if (!Number.isFinite(accessTime(accessedAt))) {
      add("invalid-accessed-at", location, `invalid accessedAt ${accessedAt}`);
    } else if (Number.isFinite(todayMs) && todayMs - accessTime(accessedAt) > staleAfterDays * 86400000) {
      add("stale-url", location, `last accessed ${accessedAt} (over ${staleAfterDays} days ago)`);
    }

    if (source.public_url !== undefined && !source.public_url.trim())
      add("missing-url", `${location}.public_url`, "public URL is empty");
    else if (source.public_url && !validHttpsUrl(source.public_url))
      add("invalid-url", `${location}.public_url`, `invalid HTTPS URL ${source.public_url}`);

    if (!source.source_url?.trim()) {
      add("missing-url", `${location}.source_url`, "source URL is absent");
      continue;
    }
    if (!validHttpsUrl(source.source_url)) {
      add("invalid-url", `${location}.source_url`, `invalid HTTPS URL ${source.source_url}`);
      continue;
    }
    const check = checks.get(source.id);
    if (!check) continue;
    if (check.error) {
      add("unreachable-url", location, check.error);
    } else if (check.status === 404 || check.status === 410) {
      add("stale-url", location, `HTTP ${check.status}`);
    } else if (check.status === undefined || check.status < 200 || check.status >= 300) {
      add("unreachable-url", location, `HTTP ${check.status ?? "unknown"}`);
    } else if (check.finalUrl && check.finalUrl !== source.source_url) {
      add("stale-url", location, `redirected to ${check.finalUrl}`);
    }
  }

  for (const person of archive.seiyuu) {
    const location = `seiyuu.${person.id}`;
    checkReferences(person.sourceIds, location);
    for (const field of ["names", "agencyId", "introduction", "birth", "birthplace", "debutYear", "gender"])
      if (person[field as keyof typeof person] !== undefined && !person.evidence?.[field])
        add("missing-evidence-reference", `${location}.evidence.${field}`, "fact has no evidence");
    for (const [field, evidence] of Object.entries(person.evidence ?? {}))
      checkReferences(evidence?.sourceIds, `${location}.evidence.${field}`);
    for (const [index, entry] of person.timeline.entries())
      checkReferences(entry.sourceIds, `${location}.timeline[${index}]`);
    for (const activity of person.activities)
      checkReferences(activity.sourceIds, `${location}.activities.${activity.id}`);
    for (const [index, link] of person.socialLinks.entries())
      checkReferences([link.verifiedBySourceId], `${location}.socialLinks[${index}]`);
  }
  for (const work of archive.anime)
    checkReferences(work.sourceIds, `anime.${work.id}`);
  for (const role of archive.roles)
    checkReferences(role.sourceIds, `roles.${role.id}`);
  for (const [index, conflict] of archive.conflicts.entries())
    for (const [assertionIndex, assertion] of conflict.assertions.entries())
      checkReferences([assertion.sourceId], `conflicts[${index}].assertions[${assertionIndex}]`);

  return {
    sources: archive.sources.length,
    imageLicenseTodo: archive.seiyuu.filter((person) => person.imageStatus === "IMAGE_LICENSE_TODO").length,
    checkedUrls: checks.size,
    findings,
  };
}
