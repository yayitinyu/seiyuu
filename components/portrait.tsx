import Image from "next/image";
import { archive } from "@/lib/content";
import { isLicenseActive } from "@/lib/media";
import type { Locale, Seiyuu } from "@/lib/types";
import type { CSSProperties } from "react";
import { Wave } from "./icons";

export function SeiyuuPortrait({
  person,
  locale,
  index = 0,
  compact = false,
}: {
  person: Seiyuu;
  locale: Locale;
  index?: number;
  compact?: boolean;
}) {
  const asset = archive.media.find(
    (entry) => entry.id === person.portraitAssetId && entry.kind === "portrait",
  );
  if (asset && isLicenseActive(asset))
    return (
      <div className="portrait portrait-photo">
        <Image
          src={`/media/${asset.id}`}
          alt={asset.alt?.[locale] ?? person.names.ja}
          width={asset.width}
          height={asset.height}
          sizes={compact ? "(max-width: 700px) 46vw, 25vw" : "(max-width: 700px) 100vw, 50vw"}
          style={{ objectFit: asset.cropAllowed ? "cover" : "contain" }}
          unoptimized
        />
        {asset.rights.attribution && (
          <span className="portrait-credit">{asset.rights.attribution}</span>
        )}
      </div>
    );
  const name = person.names.ja.replaceAll(" ", "");
  return (
    <div
      className={`portrait portrait-${person.color}${compact ? " portrait-compact" : ""}`}
      style={{ "--name-length": Array.from(name).length } as CSSProperties}
      aria-hidden="true"
    >
      <div className="portrait-top">
        <span>声の記録</span>
        <span>NO. {String(index + 1).padStart(3, "0")}</span>
      </div>
      <Wave large />
      <span className="portrait-name" lang="ja">
        {name}
      </span>
      <div className="portrait-bottom">
        <span>
          {person.names.romaji.split(" ").map((word) => (
            <span key={word}>
              {word}
              <br />
            </span>
          ))}
        </span>
        <span className="portrait-seal">声</span>
      </div>
    </div>
  );
}
