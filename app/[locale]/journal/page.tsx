import Link from "next/link";
import { notFound } from "next/navigation";
import { dictionaries, isLocale, tr } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { Arrow, Wave } from "@/components/icons";
import { journal } from "@/content/journal";
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata(
    locale,
    "/journal",
    dictionaries[locale].journalTitle,
    dictionaries[locale].journalSubtitle,
  );
}
export default async function JournalPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = dictionaries[locale];
  return (
    <main id="main" className="shell journal-page">
      <article className="editorial-article">
        <header>
          <span className="eyebrow">THE JOURNAL / 01</span>
          <h1>{d.journalTitle}</h1>
          <p className="article-deck">{d.journalSubtitle}</p>
          <div className="article-byline">
            {tr(
              locale,
              "Seiyuu 编辑札记",
              "Seiyuu 編集ノート",
              "An editorial note by Seiyuu",
            )}
            <span>2026.09.21</span>
          </div>
        </header>
        <Wave />
        {journal[locale].map((section, index) => (
          <section key={section.title}>
            <span className="article-section-number">0{index + 1}</span>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </section>
        ))}
        <div className="article-end">
          <Link className="text-link" href={`/${locale}/seiyuu/saori-hayami`}>
            {tr(
              locale,
              "从早见沙织的档案开始",
              "早見沙織のアーカイブから",
              "Begin with Saori Hayami",
            )}
            <Arrow />
          </Link>
        </div>
      </article>
    </main>
  );
}
