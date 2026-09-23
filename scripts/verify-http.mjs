import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3001";
const canonical = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://seiyuu.page"
).replace(/\/$/, "");
const data = JSON.parse(
  readFileSync(new URL("../content/archive.json", import.meta.url), "utf8"),
);
const locales = ["zh-CN", "ja-JP", "en"];
const paths = [
  "",
  "/seiyuu",
  "/journal",
  "/about",
  ...data.seiyuu.map((p) => `/seiyuu/${p.slug}`),
  ...data.anime.map((p) => `/works/${p.slug}`),
];
let pages = 0;

for (const locale of locales) {
  for (const path of paths) {
    const url = `/${locale}${path}`;
    const response = await fetch(`${base}${url}`);
    const html = await response.text();
    assert.equal(response.status, 200, url);
    assert.ok(html.includes(`lang="${locale}"`), `${url}: document language`);
    assert.ok(html.includes("<h1"), `${url}: primary heading`);
    assert.ok(
      html.includes(`rel="canonical" href="${canonical}${url}"`),
      `${url}: canonical`,
    );
    for (const language of locales)
      assert.ok(
        html.includes(`hrefLang="${language}"`),
        `${url}: hreflang ${language}`,
      );
    if (path.startsWith("/seiyuu/") || path.startsWith("/works/")) {
      const match = html.match(
        /<script type="application\/ld\+json">(.*?)<\/script>/s,
      );
      assert.ok(match, `${url}: structured data`);
      const structured = JSON.parse(match[1]);
      assert.ok(["Person", "Movie", "TVSeries"].includes(structured["@type"]));
    }
    pages += 1;
  }
}

// A streamed notFound() can show the correct screen with HTTP 200. Keep the
// static archive's unknown slugs out of the success response and search index.
for (const path of [
  "/zh-CN/seiyuu/not-a-person",
  "/zh-CN/works/not-a-work",
  "/zh-CN/missing",
  "/not-a-route",
  "/fr/seiyuu",
]) {
  const response = await fetch(`${base}${path}`);
  assert.equal(response.status, 404, path);
  assert.ok((await response.text()).includes("noindex"), `${path}: noindex`);
}

for (const [path, status, destination] of [
  ["/", 307, "/zh-CN"],
  ["/seiyuu/saori-hayami", 308, "/zh-CN/seiyuu/saori-hayami"],
]) {
  const response = await fetch(`${base}${path}`, { redirect: "manual" });
  assert.equal(response.status, status, path);
  assert.equal(response.headers.get("location"), destination, path);
}
const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
assert.equal((sitemap.match(/<loc>/g) || []).length, pages);
for (const path of ["/robots.txt", "/manifest.webmanifest"])
  assert.equal((await fetch(`${base}${path}`)).status, 200, path);
for (const path of [
  "/zh-CN/opengraph-image",
  "/zh-CN/seiyuu/saori-hayami/opengraph-image",
]) {
  const response = await fetch(`${base}${path}`);
  assert.equal(response.status, 200, path);
  assert.equal(response.headers.get("content-type"), "image/png", path);
  const png = Buffer.from(await response.arrayBuffer());
  assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 630);
}
console.log(
  `HTTP checks passed: ${pages} localized pages, 5 true 404s, redirects, structured data, metadata, sitemap, manifest, robots, and 2 share images.`,
);
