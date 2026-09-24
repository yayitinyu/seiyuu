import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  localeDigest,
  localeReviewStatus,
  recordObservation,
  sourceReviewStatus,
} from "../lib/editorial.ts";
import type { SourceAudit } from "../lib/editorial.ts";
import { isLicenseActive } from "../lib/media.ts";
import { readVerifiedMedia, validateMediaFiles } from "../lib/media-server.ts";
import type { Archive, MediaAsset } from "../lib/types.ts";
import { validateArchive } from "../lib/validate.ts";

const archive = JSON.parse(
  await readFile(new URL("../content/archive.json", import.meta.url), "utf8"),
) as Archive;

function fixtureAsset(): MediaAsset {
  return {
    id: "test-portrait",
    personId: archive.seiyuu[0].id,
    kind: "portrait",
    filename: "test.webp",
    mimeType: "image/webp",
    sha256: "0".repeat(64),
    rights: {
      holder: "Test fixture",
      authorizationRef: "fixture-only",
      allowedUse: "portrait-display",
      startsAt: "2026-01-01",
      endsAt: "2026-12-31",
      territories: "worldwide",
    },
    reviewedBy: "Test fixture",
    reviewedAt: "2026-01-01",
    alt: { "zh-CN": "测试图", "ja-JP": "テスト画像", en: "Test image" },
    cropAllowed: false,
    width: 400,
    height: 500,
  };
}

test("portrait use requires a matching person and reviewed rights", () => {
  const bad = structuredClone(archive);
  const asset = fixtureAsset();
  bad.media.push(asset);
  bad.seiyuu[0].portraitAssetId = asset.id;
  bad.seiyuu[0].imageStatus = "LICENSED";
  assert.deepEqual(validateArchive(bad), []);
  asset.rights.authorizationRef = "";
  assert.ok(validateArchive(bad).some((error) => error.includes("missing authorization reference")));
  asset.rights.authorizationRef = "fixture-only";
  asset.rights.allowedUse = "audio-stream";
  assert.ok(validateArchive(bad).some((error) => error.includes("portrait use not authorized")));
  asset.rights.allowedUse = "portrait-display";
  bad.seiyuu[0].portraitAssetId = undefined;
  assert.ok(validateArchive(bad).some((error) => error.includes("portrait authorization mismatch")));
});

test("license start and end dates gate delivery", () => {
  const asset = fixtureAsset();
  assert.equal(isLicenseActive(asset, "2025-12-31"), false);
  assert.equal(isLicenseActive(asset, "2026-01-01"), true);
  assert.equal(isLicenseActive(asset, "2026-12-31"), true);
  assert.equal(isLicenseActive(asset, "2027-01-01"), false);
  delete asset.rights.endsAt;
  asset.rights.perpetual = true;
  assert.equal(isLicenseActive(asset, "2030-01-01"), true);
});

test("media file checksum and expiry are checked before publication", async () => {
  const root = await mkdtemp(join(tmpdir(), "seiyuu-media-"));
  try {
    await mkdir(join(root, "content", "media"), { recursive: true });
    const bytes = Buffer.from("RIFF0000WEBPtest media fixture");
    await writeFile(join(root, "content", "media", "test.webp"), bytes);
    const asset = fixtureAsset();
    asset.sha256 = createHash("sha256").update(bytes).digest("hex");
    assert.deepEqual(await readVerifiedMedia(asset, root), bytes);
    assert.deepEqual(await validateMediaFiles({ ...archive, media: [asset] }, root, "2026-06-01"), []);
    assert.ok((await validateMediaFiles({ ...archive, media: [asset] }, root, "2027-01-01"))
      .some((error) => error.includes("license is not active")));
    await writeFile(join(root, "content", "media", "test.webp"), "RIFF0000WEBPchanged");
    await assert.rejects(readVerifiedMedia(asset, root), /checksum mismatch/);
    await writeFile(join(root, "content", "media", "test.webp"), "invalid image");
    await assert.rejects(readVerifiedMedia(asset, root), /signature\/MIME mismatch/);
    asset.filename = "../outside.webp";
    await assert.rejects(readVerifiedMedia(asset, root), /invalid filename/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("source observations require a new human review after changes", () => {
  const source = archive.sources[0];
  let audit: SourceAudit = { version: 1, sources: {} };
  const observation = {
    sourceUrl: source.source_url,
    checkedAt: "2026-09-23T00:00:00Z",
    status: 200,
    finalUrl: source.source_url,
    sha256: "a".repeat(64),
    bytes: 100,
  };
  audit = recordObservation(audit, source.id, observation);
  assert.equal(sourceReviewStatus(source, audit.sources[source.id]), "pending");
  audit.sources[source.id].review = {
    method: "digest",
    sha256: observation.sha256,
    sourceUrl: source.source_url,
    reviewer: "Test fixture",
    reviewedAt: observation.checkedAt,
    note: "Fixture review",
  };
  assert.equal(sourceReviewStatus(source, audit.sources[source.id]), "current");
  audit = recordObservation(audit, source.id, { ...observation, checkedAt: "2026-09-24T00:00:00Z" });
  assert.equal(audit.sources[source.id].observations.length, 1);
  audit = recordObservation(audit, source.id, { ...observation, sha256: "b".repeat(64) });
  assert.equal(sourceReviewStatus(source, audit.sources[source.id]), "changed");
  audit = recordObservation(audit, source.id, { ...observation, status: 403, sha256: undefined });
  assert.equal(sourceReviewStatus(source, audit.sources[source.id]), "unavailable");
  audit.sources[source.id].review = {
    method: "manual",
    sourceUrl: source.source_url,
    reviewer: "Test fixture",
    reviewedAt: "2026-09-23T00:00:00Z",
    note: "Fixture manual check",
  };
  assert.equal(sourceReviewStatus(source, audit.sources[source.id], "2026-09-24"), "manual");
  assert.equal(sourceReviewStatus(source, audit.sources[source.id], "2026-10-24"), "unavailable");
});

test("any shared archive or UI edit makes language sign-offs stale", () => {
  const digest = localeDigest(archive, "zh-CN", "ui", "journal");
  const review = { digest, reviewer: "Test fixture", reviewedAt: "2026-09-23", note: "Fixture" };
  assert.equal(localeReviewStatus(review, digest), "current");
  assert.equal(localeReviewStatus(review, localeDigest(archive, "zh-CN", "updated ui", "journal")), "stale");
  const changed = structuredClone(archive);
  changed.seiyuu[0].tagline.en += " revised";
  assert.equal(localeReviewStatus(review, localeDigest(changed, "zh-CN", "ui", "journal")), "stale");
});
