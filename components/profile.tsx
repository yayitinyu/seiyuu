import Link from "next/link";
import type { Locale, Seiyuu, Source } from "@/lib/types";
import { dictionaries, tr } from "@/lib/i18n";
import { archive, getAgency, getRoles, seiyuu } from "@/lib/content";
import { isLicenseActive } from "@/lib/media";
import { Arrow, Wave } from "./icons";
import { SeiyuuPortrait } from "./portrait";

export function AgencyBadge({ id, locale }: { id: string; locale: Locale }) {
  return (
    <Link className="agency-link" href={`/${locale}/seiyuu?agency=${id}`}>
      {getAgency(id).name}
    </Link>
  );
}
export function Metadata({
  person,
  locale,
}: {
  person: Seiyuu;
  locale: Locale;
}) {
  const d = dictionaries[locale];
  return (
    <dl className="profile-metadata">
      {person.birth && (
        <div>
          <dt>{d.birthday}</dt>
          <dd className="birthday-value">
            {person.birth.year && (
              <span className="birth-year">{person.birth.year}.</span>
            )}
            {String(person.birth.month).padStart(2, "0")}.
            {String(person.birth.day).padStart(2, "0")}
          </dd>
        </div>
      )}
      {person.birthplace && (
        <div>
          <dt>{d.birthplace}</dt>
          <dd lang="ja">{person.birthplace}</dd>
        </div>
      )}
      <div>
        <dt>{d.agency}</dt>
        <dd>
          <AgencyBadge id={person.agencyId} locale={locale} />
        </dd>
      </div>
      {person.debutYear && (
        <div>
          <dt>{d.debut}</dt>
          <dd>{person.debutYear}</dd>
        </div>
      )}
    </dl>
  );
}
export function ProfileHeader({
  person,
  locale,
}: {
  person: Seiyuu;
  locale: Locale;
}) {
  const d = dictionaries[locale];
  const audio = archive.media.find(
    (asset) => asset.id === person.voiceAssetId && asset.kind === "audio",
  );
  const activeAudio = audio && isLicenseActive(audio);
  return (
    <section className="profile-hero" id="profile">
      <SeiyuuPortrait
        person={person}
        locale={locale}
        index={seiyuu.findIndex((p) => p.id === person.id)}
      />
      <div className="profile-intro">
        <span className="profile-kana" lang="ja">
          {person.names.kana}
        </span>
        <h1 lang="ja">{person.names.ja}</h1>
        <p className="profile-romaji" lang="en">
          {person.names.romaji}
          {locale === "zh-CN" && (
            <span className="profile-translated" lang="zh-CN">
              {person.names.zh}
            </span>
          )}
        </p>
        <div className="accent-rule" />
        <p className="profile-tagline">{person.tagline[locale]}</p>
        <Metadata person={person} locale={locale} />
        <a
          className="text-link"
          href={activeAudio ? person.officialUrl : person.voiceUrl || person.officialUrl}
          target="_blank"
          rel="noreferrer"
        >
          {activeAudio ? d.official : person.voiceUrl ? d.voice : d.official}
          <Arrow external />
        </a>
        {activeAudio && (
          <figure className="profile-audio">
            <figcaption>{d.voice}</figcaption>
            <audio controls preload="none" src={`/media/${audio.id}`} />
            {audio.rights.attribution && <p>{audio.rights.attribution}</p>}
          </figure>
        )}
      </div>
    </section>
  );
}
export function CharacterCard({
  role,
  locale,
  index,
}: {
  role: ReturnType<typeof getRoles>[number];
  locale: Locale;
  index: number;
}) {
  const d = dictionaries[locale];
  return (
    <article
      className={`character-card character-tone-${index % 3}`}
      id={`character-${role.characterId}`}
    >
      <Link href={`/${locale}/works/${role.anime.slug}`}>
        <div className="character-top">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <span>{role.anime.year || role.anime.format}</span>
        </div>
        <h3 lang="ja">{role.character.names["ja-JP"]}</h3>
        <p className="character-local">
          {locale === "ja-JP"
            ? role.character.names.en
            : role.character.names[locale]}
        </p>
        <div className="character-bottom">
          <div>
            <span>{role.anime.title[locale]}</span>
            <small>
              {role.roleType
                ? d[role.roleType === "lead" ? "mainRole" : "supportingRole"]
                : d.voiceCredit}
            </small>
          </div>
          <Arrow />
        </div>
      </Link>
    </article>
  );
}
export function Timeline({
  person,
  locale,
}: {
  person: Seiyuu;
  locale: Locale;
}) {
  const d = dictionaries[locale];
  if (!person.timeline.length) return null;
  return (
    <section className="timeline-section" id="timeline">
      <div className="section-side">
        <span className="eyebrow">03 / TIMELINE</span>
        <h2>{d.alongTheWay}</h2>
        <Wave />
      </div>
      <ol className="timeline-list">
        {person.timeline.map((entry, index) => (
          <li key={`${entry.year}-${index}`}>
            <span className="timeline-year">{entry.year}</span>
            <span className="timeline-dot" />
            <div>
              <h3>{entry.title[locale]}</h3>
              {entry.description && <p>{entry.description[locale]}</p>}
              <a
                href="#sources"
                className="source-reference"
                aria-label={`[${index + 1}] ${entry.title[locale]} · ${d.sources}`}
              >
                [{index + 1}]
              </a>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
export function SourceCitation({
  sources,
  person,
  locale,
}: {
  sources: Source[];
  person?: Seiyuu;
  locale: Locale;
}) {
  const d = dictionaries[locale];
  const fieldName: Record<string, string> = {
    names: tr(locale, "姓名", "名前", "Name"),
    birth: d.birthday,
    birthplace: d.birthplace,
    agencyId: d.agency,
    debutYear: d.debut,
    gender: d.gender,
    introduction: d.profile,
  };
  return (
    <section id="sources" className="sources-section">
      <details>
        <summary>
          <div>
            <span className="eyebrow">SOURCES & REFERENCES</span>
            <h2>{d.verification}</h2>
          </div>
          <span className="sources-toggle">
            <span>{String(sources.length).padStart(2, "0")}</span>
            <span className="plus" aria-hidden="true">
              +
            </span>
          </span>
        </summary>
        <div className="sources-content">
          {person && (
            <dl className="evidence-list">
              {Object.entries(person.evidence).map(([field, evidence]) => (
                <div key={field}>
                  <dt>{fieldName[field] || field}</dt>
                  <dd>
                    {evidence.sourceIds.map((id) => (
                      <a key={id} href={`#source-${id}`}>
                        {sources.find((source) => source.id === id)?.title ||
                          id}
                      </a>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          <ol className="source-list">
            {sources.map((source) => (
              <li key={source.id} id={`source-${source.id}`}>
                <a
                  href={source.public_url || source.source_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {source.title}
                  <Arrow external />
                </a>
                <p>
                  {d.sourceTypes[source.source_type]} · {d.sourceNote}{" "}
                  {source.retrieved_at} ·{" "}
                  {source.verified ? d.verified : d.undocumented} ·{" "}
                  {d.confidence} {d[source.confidence]}
                </p>
              </li>
            ))}
          </ol>
          {person?.timeline.length ? (
            <div className="timeline-source-map">
              {person.timeline.map((event, index) => (
                <p key={index}>
                  [{index + 1}] {event.year} —{" "}
                  {event.sourceIds.map((id) => (
                    <a href={`#source-${id}`} key={id}>
                      {sources.find((s) => s.id === id)?.title}{" "}
                    </a>
                  ))}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      </details>
    </section>
  );
}
