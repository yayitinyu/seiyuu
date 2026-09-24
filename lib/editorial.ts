import { createHash } from "node:crypto";
import type { Archive, Locale, Source } from "./types.ts";

export interface LocaleReview {
  digest: string;
  reviewer: string;
  reviewedAt: string;
  note: string;
}
export interface LocaleReviews {
  version: 1;
  reviews: Partial<Record<Locale, LocaleReview>>;
}
export interface SourceObservation {
  sourceUrl: string;
  checkedAt: string;
  status?: number;
  finalUrl?: string;
  sha256?: string;
  bytes?: number;
  error?: string;
}
export interface SourceAuditEntry {
  checkedAt: string;
  observations: SourceObservation[];
  review?: {
    method: "digest" | "manual";
    sha256?: string;
    sourceUrl: string;
    reviewer: string;
    reviewedAt: string;
    note: string;
  };
}
export interface SourceAudit {
  version: 1;
  sources: Record<string, SourceAuditEntry>;
}

export const sha256 = (value: string | Uint8Array) =>
  createHash("sha256").update(value).digest("hex");

// A shared-content edit can affect any language page, so it invalidates all three sign-offs.
export function localeDigest(
  archive: Archive,
  locale: Locale,
  uiSource: string,
  journalSource: string,
) {
  return sha256(JSON.stringify({ archive, locale, uiSource, journalSource }));
}

export function localeReviewStatus(
  review: LocaleReview | undefined,
  digest: string,
): "pending" | "current" | "stale" {
  if (!review) return "pending";
  return review.digest === digest ? "current" : "stale";
}

export function latestObservation(entry?: SourceAuditEntry) {
  return entry?.observations.at(-1);
}

export function sourceReviewStatus(
  source: Source,
  entry?: SourceAuditEntry,
  today = new Date().toISOString().slice(0, 10),
): "not-checked" | "unavailable" | "pending" | "changed" | "current" | "manual" {
  const latest = latestObservation(entry);
  if (!latest) return "not-checked";
  if (latest.error || latest.status !== 200 || !latest.sha256) {
    const review = entry?.review;
    const age = review ? Date.parse(`${today}T00:00:00Z`) - Date.parse(review.reviewedAt) : Infinity;
    return review?.method === "manual" &&
      review.sourceUrl === source.source_url &&
      latest.sourceUrl === source.source_url &&
      age >= 0 && age <= 30 * 86400000
      ? "manual"
      : "unavailable";
  }
  if (latest.sourceUrl !== source.source_url) return "changed";
  if (!entry?.review) return "pending";
  return entry.review.method === "digest" &&
    entry.review.sha256 === latest.sha256 &&
    entry.review.sourceUrl === source.source_url
    ? "current"
    : "changed";
}

export function recordObservation(
  audit: SourceAudit,
  sourceId: string,
  observation: SourceObservation,
): SourceAudit {
  const result = structuredClone(audit);
  const entry = result.sources[sourceId] ?? { checkedAt: observation.checkedAt, observations: [] };
  const previous = latestObservation(entry);
  if (
    !previous ||
    previous.sourceUrl !== observation.sourceUrl ||
    previous.status !== observation.status ||
    previous.finalUrl !== observation.finalUrl ||
    previous.sha256 !== observation.sha256 ||
    previous.error !== observation.error
  ) {
    entry.observations.push(observation);
  }
  entry.checkedAt = observation.checkedAt;
  result.sources[sourceId] = entry;
  return result;
}
