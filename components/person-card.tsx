import Link from "next/link";
import type { Locale, Seiyuu } from "@/lib/types";
import { SeiyuuPortrait } from "./portrait";
import { Arrow } from "./icons";

export function PersonCard({
  person,
  locale,
  featured = false,
  index,
  agencyName,
  headingLevel = 3,
}: {
  person: Seiyuu;
  locale: Locale;
  featured?: boolean;
  index: number;
  agencyName: string;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className={`person-card ${featured ? "featured-person" : ""}`}>
      <Link href={`/${locale}/seiyuu/${person.slug}`} className="person-link">
        <SeiyuuPortrait person={person} index={index} compact={!featured} />
        <div className="person-name-row">
          <Heading lang="ja">{person.names.ja}</Heading>
          <Arrow />
        </div>
        <p className="romaji" lang="en">
          {person.names.romaji}
        </p>
      </Link>
      {featured ? (
        <p className="person-caption">{person.tagline[locale]}</p>
      ) : (
        <p className="agency-caption">{agencyName}</p>
      )}
    </article>
  );
}
