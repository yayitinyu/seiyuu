import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import type { Archive, MediaAsset } from "./types.ts";
import { isLicenseActive } from "./media.ts";

const MIME_EXTENSIONS: Record<MediaAsset["mimeType"], string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "audio/mpeg": ".mp3",
  "audio/ogg": ".ogg",
};

function matchesMime(bytes: Buffer, mime: MediaAsset["mimeType"]): boolean {
  if (mime === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8;
  if (mime === "image/png")
    return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (mime === "image/webp")
    return bytes.toString("ascii", 0, 4) === "RIFF" &&
      bytes.toString("ascii", 8, 12) === "WEBP";
  if (mime === "audio/ogg") return bytes.toString("ascii", 0, 4) === "OggS";
  return bytes.toString("ascii", 0, 3) === "ID3" ||
    (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0);
}

export function mediaPath(asset: MediaAsset, root = process.cwd()): string {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(asset.filename))
    throw new Error(`${asset.id}: invalid filename`);
  if (!asset.filename.toLowerCase().endsWith(MIME_EXTENSIONS[asset.mimeType]))
    throw new Error(`${asset.id}: filename/MIME mismatch`);
  return join(root, "content", "media", asset.filename);
}

export async function readVerifiedMedia(asset: MediaAsset, root = process.cwd()) {
  const path = mediaPath(asset, root);
  const limit = asset.kind === "portrait" ? 5_000_000 : 20_000_000;
  const info = await stat(path);
  if (!info.isFile() || info.size === 0 || info.size > limit)
    throw new Error(`${asset.id}: invalid media file size`);
  const bytes = await readFile(path);
  if (!matchesMime(bytes, asset.mimeType))
    throw new Error(`${asset.id}: file signature/MIME mismatch`);
  if (createHash("sha256").update(bytes).digest("hex") !== asset.sha256)
    throw new Error(`${asset.id}: media checksum mismatch`);
  return bytes;
}

export async function validateMediaFiles(
  archive: Archive,
  root = process.cwd(),
  today = new Date().toISOString().slice(0, 10),
): Promise<string[]> {
  const errors: string[] = [];
  for (const asset of archive.media) {
    if (!isLicenseActive(asset, today))
      errors.push(`${asset.id}: license is not active on ${today}`);
    try {
      await readVerifiedMedia(asset, root);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }
  return errors;
}
