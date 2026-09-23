import Link from "next/link";
import type { Metadata } from "next";
import { siteUrl } from "@/lib/seo";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "404 — Seiyuu / 声優",
  robots: { index: false },
};
export default function GlobalNotFound() {
  return (
    <html lang="zh-CN">
      <head>
        <title>404 — Seiyuu / 声優</title>
        <meta name="robots" content="noindex" />
      </head>
      <body>
        <main className="quiet-page">
          <Link href="/zh-CN" className="brand">
            seiyuu.
          </Link>
          <span className="quiet-number">404</span>
          <h1>这一页，暂时没有声音。</h1>
          <p lang="ja">まだ、聞こえない。</p>
          <Link className="text-link" href="/zh-CN">
            回到声音档案 <span aria-hidden="true">→</span>
          </Link>
        </main>
      </body>
    </html>
  );
}
