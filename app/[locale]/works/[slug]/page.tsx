import Link from "next/link";
import { notFound } from "next/navigation";
import {
  anime,
  getAnime,
  roles,
  characters,
  seiyuu,
  sources,
} from "@/lib/content";
import { isLocale, dictionaries } from "@/lib/i18n";
import { jsonLd, pageMetadata } from "@/lib/seo";
import { SeiyuuPortrait } from "@/components/portrait";
import { SourceCitation } from "@/components/profile";
import { Arrow, Wave } from "@/components/icons";
type Props = { params: Promise<{ locale: string; slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return anime.map((work) => ({ slug: work.slug }));
}
export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const work = getAnime(slug);
  if (!isLocale(locale) || !work) return {};
  return pageMetadata(
    locale,
    `/works/${slug}`,
    work.title[locale],
    `${work.title[locale]} — ${dictionaries[locale].cast}`,
  );
}
export default async function WorkPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const work = getAnime(slug);
  if (!work) notFound();
  const d = dictionaries[locale];
  const credits = roles.filter((r) => r.animeId === work.id);
  const ids = new Set([
    ...work.sourceIds,
    ...credits.flatMap((r) => r.sourceIds),
  ]);
  return (
    <main id="main" className="shell work-page">
      <nav className="breadcrumb">
        <Link href={`/${locale}/seiyuu`}>{d.archive}</Link>
        <span>/</span>
        <span>{d.works}</span>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": work.format === "Film" ? "Movie" : "TVSeries",
            name: work.title["ja-JP"],
            alternateName: work.title[locale],
            ...(work.year ? { datePublished: String(work.year) } : {}),
          }),
        }}
      />
      <header className="work-header">
        <div>
          <span className="eyebrow">
            {work.format} {work.year ? `/ ${work.year}` : ""}
          </span>
          <h1 lang="ja">{work.title["ja-JP"]}</h1>
          <p>{locale === "ja-JP" ? work.title.en : work.title[locale]}</p>
          <a
            className="text-link"
            href={work.url}
            target="_blank"
            rel="noreferrer"
          >
            {d.officialWork}
            <Arrow external />
          </a>
        </div>
        <Wave large />
      </header>
      <section className="work-cast">
        <div className="section-heading">
          <h2>{d.cast}</h2>
          <span className="section-note">{d.selectedCredits}</span>
        </div>
        {credits.map((role) => {
          const person = seiyuu.find((p) => p.id === role.seiyuuId)!;
          const character = characters.find((c) => c.id === role.characterId)!;
          return (
            <Link
              href={`/${locale}/seiyuu/${person.slug}#character-${character.id}`}
              className="cast-row"
              key={role.id}
            >
              <div className="cast-portrait">
                <SeiyuuPortrait person={person} locale={locale} />
              </div>
              <div>
                <span className="eyebrow">{d.character}</span>
                <h3 lang="ja">{character.names["ja-JP"]}</h3>
                <p>{character.names[locale]}</p>
              </div>
              <Arrow />
              <div>
                <span className="eyebrow">{d.voiceCredit}</span>
                <h3 lang="ja">{person.names.ja}</h3>
                <p>{person.names.romaji}</p>
              </div>
            </Link>
          );
        })}
      </section>
      <SourceCitation
        locale={locale}
        sources={sources.filter((s) => ids.has(s.id))}
      />
    </main>
  );
}
