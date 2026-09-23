import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";
import { locales } from "@/lib/i18n";
import { anime, seiyuu } from "@/lib/content";
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/seiyuu",
    "/journal",
    "/about",
    ...seiyuu.map((person) => `/seiyuu/${person.slug}`),
    ...anime.map((work) => `/works/${work.slug}`),
  ];
  return paths.flatMap((path) =>
    locales.map((locale) => ({
      url: `${siteUrl}/${locale}${path}`,
      alternates: {
        languages: Object.fromEntries(
          locales.map((lang) => [lang, `${siteUrl}/${lang}${path}`]),
        ),
      },
    })),
  );
}
