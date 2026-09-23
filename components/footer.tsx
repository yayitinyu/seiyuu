import Link from "next/link";
import { dictionaries } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
export function Footer({ locale }: { locale: Locale }) {
  const d = dictionaries[locale];
  return (
    <footer className="site-footer shell">
      <div className="footer-top">
        <Link className="brand" href={`/${locale}`}>
          seiyuu.
        </Link>
        <p className="footer-line">{d.footerLine}</p>
        <Link href={`/${locale}/about`}>
          {d.about}
          <span aria-hidden="true"> ↗</span>
        </Link>
      </div>
      <div className="footer-bottom">
        <span>{d.footerNote}</span>
        <span>© {new Date().getFullYear()} SEIYUU</span>
      </div>
    </footer>
  );
}
