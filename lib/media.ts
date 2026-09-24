import type { MediaAsset } from "./types.ts";

export function isLicenseActive(
  asset: MediaAsset,
  today = new Date().toISOString().slice(0, 10),
): boolean {
  const { rights } = asset;
  return (
    !!rights &&
    !!rights.holder?.trim() &&
    !!rights.authorizationRef?.trim() &&
    !!asset.reviewedBy?.trim() &&
    rights.territories === "worldwide" &&
    rights.allowedUse ===
      (asset.kind === "portrait" ? "portrait-display" : "audio-stream") &&
    rights.startsAt <= today &&
    (rights.perpetual === true
      ? !rights.endsAt
      : !!rights.endsAt && today <= rights.endsAt)
  );
}
