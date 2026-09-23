import { notFound } from "next/navigation";
import { seiyuu, agencies } from "@/lib/content";
import { isLocale, dictionaries, tr } from "@/lib/i18n";
import { emptyFilters, type Filters } from "@/lib/search";
import { pageMetadata } from "@/lib/seo";
import { Explore } from "@/components/explore";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata(
    locale,
    "/seiyuu",
    dictionaries[locale].explore,
    tr(
      locale,
      "通过姓名、角色与事务所，探索日本声优。",
      "名前、役柄、事務所から日本の声優を探す。",
      "Explore Japanese voice actors through names, characters and agencies.",
    ),
  );
}
export default async function DirectoryPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const query = await searchParams;
  const filters = Object.fromEntries(
    Object.keys(emptyFilters).map((key) => [
      key,
      typeof query[key] === "string" ? query[key] : "",
    ]),
  ) as unknown as Filters;
  return (
    <main id="main" className="shell directory-page">
      <div className="directory-heading">
        <h1 lang="ja">声の持ち主たち。</h1>
        <p>
          {tr(
            locale,
            "声音背后，是一个个鲜活的人。",
            "声の向こうに、ひとりひとりの人生。",
            "Behind each voice, a life of its own.",
          )}
        </p>
      </div>
      <Explore
        initialFilters={filters}
        locale={locale}
        people={seiyuu}
        agencies={agencies}
      />
    </main>
  );
}
