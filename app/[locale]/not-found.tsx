"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { dictionaries, isLocale } from "@/lib/i18n";
export default function NotFound() {
  const params = useParams();
  const locale =
    typeof params.locale === "string" && isLocale(params.locale)
      ? params.locale
      : "zh-CN";
  const d = dictionaries[locale];
  return (
    <main id="main" className="quiet-page">
      <span className="quiet-number">404</span>
      <h1>{d.notFound}</h1>
      <Link className="text-link" href={`/${locale}`}>
        {d.returnHome}
      </Link>
    </main>
  );
}
