import type { Seiyuu } from "@/lib/types";
import type { CSSProperties } from "react";
import { Wave } from "./icons";

export function SeiyuuPortrait({
  person,
  index = 0,
  compact = false,
}: {
  person: Seiyuu;
  index?: number;
  compact?: boolean;
}) {
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
