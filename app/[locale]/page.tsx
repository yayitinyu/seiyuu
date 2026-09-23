import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, dictionaries, tr } from "@/lib/i18n";
import { seiyuu, getRoles, getAgency } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { Arrow, Wave } from "@/components/icons";
import { PersonCard } from "@/components/person-card";
import { Birthday } from "@/components/birthday";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata(
    locale,
    "",
    tr(
      locale,
      "声音与人物的数字档案馆",
      "人と声のデジタルアーカイブ",
      "An archive of people and voices",
    ),
    dictionaries[locale].footerNote,
  );
}
export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = dictionaries[locale];
  const featured = [seiyuu[0], seiyuu[1], seiyuu[6]];
  return (
    <main id="main">
      <section className="hero shell">
        <div className="hero-copy">
          <h1 lang="ja">
            <span>声を知る。</span>
            <span>
              人を知る<span className="accent">。</span>
            </span>
          </h1>
          <p>{d.homeDescription}</p>
          <Link className="text-link" href={`/${locale}/seiyuu`}>
            {d.openArchive}
            <Arrow />
          </Link>
        </div>
        <figure className="hero-figure">
          <div className="hero-image">
            <Image
              src="/images/studio.webp"
              alt={tr(
                locale,
                "日光穿过纱帘的空录音室，原创生成意象",
                "カーテン越しの光が入る無人の録音室。オリジナル生成イメージ。",
                "An empty recording studio in soft daylight. Original generated imagery.",
              )}
              fill
              sizes="(max-width: 700px) 100vw, 50vw"
              preload
              quality={85}
            />
          </div>
          <figcaption lang="ja">
            どんな声も、どこかで誰かの記憶になっている。
          </figcaption>
        </figure>
        <div className="hero-baseline">
          <div className="hero-wave">
            <Wave />
            <span className="wave-rule" />
            <span lang="en">A living archive of Japanese voices.</span>
          </div>
          <span className="folio">
            001 <span>—</span> {d.entrance}
          </span>
        </div>
      </section>
      <section className="selected-section shell">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              SELECTED VOICES <span className="short-rule" />
            </span>
            <h2>{d.selected}</h2>
          </div>
          <Link className="text-link" href={`/${locale}/seiyuu`}>
            {d.allPeople}
            <Arrow />
          </Link>
        </div>
        <div className="featured-layout">
          <div className="featured-aside">
            <span className="folio">{d.editorialEdition} / 01</span>
            <p>{d.featuredIntro}</p>
            <span className="short-rule" />
            <p className="muted">{d.featuredDetail}</p>
            <span className="vertical-note" lang="ja">
              声の向こうに、人がいる。
            </span>
          </div>
          {featured.map((person) => (
            <PersonCard
              key={person.id}
              person={person}
              index={seiyuu.findIndex((p) => p.id === person.id)}
              agencyName={getAgency(person.agencyId).name}
              locale={locale}
              featured
            />
          ))}
        </div>
      </section>
      <section className="connection-band">
        <div className="shell connection-inner">
          <div>
            <span className="eyebrow">VOICE × CHARACTER</span>
            <h2>
              {d.relationshipTitle.split("\n").map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </h2>
            <p>{d.relationshipIntro}</p>
          </div>
          <div className="connection-rows">
            {featured.slice(0, 2).map((person) => {
              const role = getRoles(person.id)[0];
              return (
                <Link
                  className="connection-row"
                  key={person.id}
                  href={`/${locale}/seiyuu/${person.slug}#character-${role.characterId}`}
                >
                  <div>
                    <span lang="ja">{role.character.names["ja-JP"]}</span>
                    <small>{role.anime.title[locale]}</small>
                  </div>
                  <Arrow />
                  <div>
                    <span lang="ja">{person.names.ja}</span>
                    <small lang="en">{person.names.romaji}</small>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      <section className="journal-preview shell">
        <div>
          <span className="eyebrow">THE JOURNAL</span>
          <h2>{d.journal}</h2>
        </div>
        <Link href={`/${locale}/journal`} className="journal-story">
          <span className="story-number">01</span>
          <div>
            <h3>{d.journalTitle}</h3>
            <p>{d.journalSubtitle}</p>
          </div>
          <Arrow />
        </Link>
      </section>
      <div className="shell">
        <Birthday
          locale={locale}
          people={seiyuu
            .filter((p) => p.birth)
            .map((p) => ({
              slug: p.slug,
              name: p.names.ja,
              romaji: p.names.romaji,
              birth: p.birth!,
            }))}
        />
      </div>
    </main>
  );
}
