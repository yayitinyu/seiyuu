import Link from "next/link";
import { dictionaries, tr } from "@/lib/i18n";
import { filingLinks } from "@/lib/filings";
import type { Locale } from "@/lib/types";
export function Footer({ locale }: { locale: Locale }) {
  const d = dictionaries[locale];
  const filings = filingLinks(
    process.env.NEXT_PUBLIC_ICP_BEIAN_NUMBER,
    process.env.NEXT_PUBLIC_MPS_BEIAN_NUMBER,
  );
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
        <div className="footer-meta">
          <span className="footer-copyright">
            © {new Date().getFullYear()} SEIYUU
          </span>
          {filings.length > 0 && (
            <nav
              className="filing-links"
              aria-label={tr(locale, "备案信息", "届出情報", "Filing information")}
            >
              {filings.map(({ label, href }) => (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer">
                  {label}
                </a>
              ))}
            </nav>
          )}
        </div>
      </div>
    </footer>
  );
}
