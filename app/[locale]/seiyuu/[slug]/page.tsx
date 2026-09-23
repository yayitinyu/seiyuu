import Link from "next/link";
import { notFound } from "next/navigation";
import {
  seiyuu,
  getPerson,
  getRoles,
  personSources,
  getAgency,
} from "@/lib/content";
import { dictionaries, isLocale, tr } from "@/lib/i18n";
import { jsonLd, pageMetadata, siteUrl } from "@/lib/seo";
import {
  ProfileHeader,
  CharacterCard,
  Timeline,
  SourceCitation,
} from "@/components/profile";
import { PersonCard } from "@/components/person-card";
import { Arrow } from "@/components/icons";

type Props = { params: Promise<{ locale: string; slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return seiyuu.map((person) => ({ slug: person.slug }));
}
export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const person = getPerson(slug);
  if (!isLocale(locale) || !person) return {};
  return pageMetadata(
    locale,
    `/seiyuu/${slug}`,
    tr(
      locale,
      `${person.names.zh}｜声优资料、角色与出演作品`,
      `${person.names.ja}｜プロフィールと出演作品`,
      `${person.names.romaji} — Profile and voice roles`,
    ),
    person.introduction[locale],
    `${siteUrl}/${locale}/seiyuu/${slug}/opengraph-image`,
  );
}
export default async function ProfilePage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const person = getPerson(slug);
  if (!person) notFound();
  const d = dictionaries[locale];
  const credits = getRoles(person.id);
  const sources = personSources(person.id);
  const relatedIds = new Set(
    credits.flatMap((role) =>
      seiyuu
        .filter(
          (p) =>
            p.id !== person.id &&
            getRoles(p.id).some((r) => r.animeId === role.animeId),
        )
        .map((p) => p.id),
    ),
  );
  const related = seiyuu.filter((p) => relatedIds.has(p.id)).slice(0, 3);
  const structured = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.names.ja,
    alternateName: [person.names.zh, person.names.romaji, person.names.kana],
    url: `${siteUrl}/${locale}/seiyuu/${slug}`,
    sameAs: [person.officialUrl],
    jobTitle: tr(locale, "声优", "声優", "Voice actor"),
    ...(person.birth?.year
      ? {
          birthDate: `${person.birth.year}-${String(person.birth.month).padStart(2, "0")}-${String(person.birth.day).padStart(2, "0")}`,
        }
      : {}),
    ...(person.birthplace
      ? { birthPlace: { "@type": "Place", name: person.birthplace } }
      : {}),
    affiliation: {
      "@type": "Organization",
      name: getAgency(person.agencyId).name,
    },
  };
  return (
    <main id="main" className="shell profile-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structured) }}
      />
      <nav
        className="breadcrumb"
        aria-label={tr(locale, "面包屑", "パンくず", "Breadcrumb")}
      >
        <Link href={`/${locale}/seiyuu`}>{d.archive}</Link>
        <span>/</span>
        <span lang="ja">{person.names.ja}</span>
      </nav>
      <ProfileHeader person={person} locale={locale} />
      <nav className="profile-tabs" aria-label={d.profile}>
        {[
          ["profile", d.profile],
          ["characters", d.characters],
          ...(person.timeline.length ? [["timeline", d.timeline]] : []),
          ["activities", d.activities],
          ["sources", d.sources],
        ].map(([id, label], index) => (
          <a href={`#${id}`} key={id}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            {label}
          </a>
        ))}
      </nav>
      <section className="profile-description">
        <span className="eyebrow">01 / PROFILE</span>
        <p>{person.introduction[locale]}</p>
      </section>
      {credits.length > 0 && (
        <section id="characters" className="characters-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">02 / CHARACTERS</span>
              <h2>{d.differentVoices}</h2>
            </div>
            <span className="section-note">{d.selectedCredits}</span>
          </div>
          <div className="character-grid">
            {credits.map((role, index) => (
              <CharacterCard
                key={role.id}
                role={role}
                locale={locale}
                index={index}
              />
            ))}
          </div>
        </section>
      )}
      <Timeline person={person} locale={locale} />
      <section id="activities" className="activities-section">
        <div className="section-side">
          <span className="eyebrow">BEYOND THE VOICE</span>
          <h2>{d.beyond}</h2>
        </div>
        <div className="activity-list">
          {person.activities.map((activity) => (
            <div className="activity-row" key={activity.id}>
              <span className="activity-kind">{d[activity.kind]}</span>
              <div>
                <h3 lang="ja">{activity.title}</h3>
                <p>{activity.detail[locale]}</p>
              </div>
              <a
                className="activity-source"
                href={`#source-${activity.sourceIds[0]}`}
                aria-label={`${activity.title} · ${d.sources}`}
              >
                <Arrow external />
              </a>
            </div>
          ))}
        </div>
      </section>
      <div className="official-links">
        <span className="eyebrow">LINKS</span>
        <a
          className="text-link"
          href={person.officialUrl}
          target="_blank"
          rel="noreferrer"
        >
          {d.official}
          <Arrow external />
        </a>
        {person.voiceUrl && (
          <a
            className="text-link"
            href={person.voiceUrl}
            target="_blank"
            rel="noreferrer"
          >
            {d.voice}
            <Arrow external />
          </a>
        )}
        {person.socialLinks.map((link) => (
          <a
            key={link.platform}
            className="text-link"
            href={link.url}
            target="_blank"
            rel="noreferrer"
          >
            {link.platform}
            <Arrow external />
          </a>
        ))}
      </div>
      <SourceCitation person={person} sources={sources} locale={locale} />
      {related.length > 0 && (
        <section className="related-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">CONNECTED VOICES</span>
              <h2>{d.more}</h2>
            </div>
          </div>
          <div className="related-grid">
            {related.map((p) => (
              <PersonCard
                person={p}
                locale={locale}
                key={p.id}
                index={seiyuu.findIndex((person) => person.id === p.id)}
                agencyName={getAgency(p.agencyId).name}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
