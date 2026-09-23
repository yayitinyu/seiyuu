import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales, dictionaries } from "@/lib/i18n";
import { buildSearchIndex } from "@/lib/search-index";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { siteUrl } from "@/lib/seo";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Seiyuu / 声優", template: "%s | Seiyuu" },
  applicationName: "Seiyuu",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/apple-touch-icon.png" },
};
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = dictionaries[locale];
  return (
    <html lang={locale} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="/fonts/editorial-jp.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('seiyuu-theme');document.documentElement.dataset.theme=t==='light'||t==='dark'?t:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}catch(e){document.documentElement.dataset.theme='light'}`,
          }}
        />
      </head>
      <body>
        <a href="#main" className="skip-link">
          {d.skip}
        </a>
        <Navigation locale={locale} entries={buildSearchIndex()} />
        {children}
        <Footer locale={locale} />
      </body>
    </html>
  );
}
