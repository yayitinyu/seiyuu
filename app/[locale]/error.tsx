"use client";
import { useParams } from "next/navigation";
import { dictionaries, isLocale } from "@/lib/i18n";
export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const params = useParams();
  const locale =
    typeof params.locale === "string" && isLocale(params.locale)
      ? params.locale
      : "zh-CN";
  const d = dictionaries[locale];
  return (
    <main id="main" className="quiet-page">
      <span className="quiet-number">—</span>
      <h1>{d.error}</h1>
      <button className="text-link" onClick={reset}>
        {d.retry}
      </button>
    </main>
  );
}
