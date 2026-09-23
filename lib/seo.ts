import type { Metadata } from "next";
import type { Locale } from "./types";
import { locales } from "./i18n";

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://seiyuu.page"
).replace(/\/$/, "");
export function pageMetadata(
  locale: Locale,
  path: string,
  title: string,
  description: string,
  image = `${siteUrl}/${locale}/opengraph-image`,
): Metadata {
  const url = `${siteUrl}/${locale}${path}`;
  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(
          locales.map((lang) => [lang, `${siteUrl}/${lang}${path}`]),
        ),
        "x-default": `${siteUrl}/zh-CN${path}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Seiyuu / 声優",
      type: "website",
      locale: locale.replace("-", "_"),
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
