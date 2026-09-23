import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { Archive } from "../lib/types.ts";
import { validateArchive } from "../lib/validate.ts";
import {
  filterPeople,
  emptyFilters,
  matchesQuery,
  normalizeSearch,
  searchEntries,
} from "../lib/search.ts";
import { nextBirthday } from "../lib/dates.ts";
import { wavePath } from "../lib/wave.ts";
const archive = JSON.parse(
  readFileSync(new URL("../content/archive.json", import.meta.url), "utf8"),
) as Archive;

test("wave paths use stable precision for server and browser hydration", () => {
  const path = wavePath(90);
  assert.ok(path.includes("M47 39.28v11.43"));
  assert.ok(path.includes("M137 21.01v47.97"));
  assert.equal(path.split("M").length - 1, 90);
  assert.equal(/\.\d{3}/.test(path), false);
});
test("all content has valid references, dates and evidence", () =>
  assert.deepEqual(validateArchive(archive), []));
test("validator rejects a role linked to the wrong work", () => {
  const bad = structuredClone(archive);
  bad.roles[0].animeId = "demon-slayer";
  assert.ok(
    validateArchive(bad).some((error) =>
      error.includes("character/work mismatch"),
    ),
  );
});
test("validator rejects unsourced facts and invalid dates", () => {
  const bad = structuredClone(archive);
  delete bad.seiyuu[0].evidence.birth;
  bad.seiyuu[0].birth = { month: 2, day: 30 };
  const errors = validateArchive(bad);
  assert.ok(errors.some((error) => error.includes("missing evidence")));
  assert.ok(errors.some((error) => error.includes("invalid birthday")));
});
test("Hayami is discoverable in four scripts and either romaji order", () => {
  for (const q of [
    "Hayami Saori",
    "Saori Hayami",
    "早見沙織",
    "早见沙织",
    "はやみ さおり",
    "ハヤミ サオリ",
    "ﾊﾔﾐ ｻｵﾘ",
    "ＨＡＹＡＭＩ",
  ]) {
    assert.equal(
      filterPeople(archive.seiyuu, { ...emptyFilters, q })[0]?.id,
      "saori-hayami",
      q,
    );
  }
});
test("Japanese dakuten are preserved and Latin macrons normalise", () => {
  assert.equal(normalizeSearch("Yūki"), normalizeSearch("Yuki"));
  assert.notEqual(normalizeSearch("が"), normalizeSearch("か"));
  assert.ok(matchesQuery(["ゆうきあおい"], "ユウキアオイ"));
});
test("empty and punctuation-only input do not hide the archive", () => {
  assert.equal(filterPeople(archive.seiyuu, emptyFilters).length, 8);
  assert.equal(
    filterPeople(archive.seiyuu, { ...emptyFilters, q: "  ・ " }).length,
    8,
  );
});
test("filters intersect and unknown facts do not match known filters", () => {
  assert.equal(
    filterPeople(archive.seiyuu, {
      ...emptyFilters,
      agency: "aoni",
      month: "3",
    })[0]?.id,
    "aoi-yuki",
  );
  assert.equal(
    filterPeople(archive.seiyuu, { ...emptyFilters, year: "2001" })[0]?.id,
    "mamoru-miyano",
  );
  assert.equal(
    filterPeople(archive.seiyuu, {
      ...emptyFilters,
      kana: "は",
      agency: "aoni",
    }).length,
    0,
  );
  assert.ok(
    filterPeople(archive.seiyuu, { ...emptyFilters, gender: "unknown" }).every(
      (person) => !person.gender,
    ),
  );
});
test("birthdays cross the year boundary and support an empty archive", () => {
  const people = [
    { slug: "a", name: "A", romaji: "A", birth: { month: 1, day: 2 } },
    { slug: "b", name: "B", romaji: "B", birth: { month: 12, day: 1 } },
  ];
  assert.equal(nextBirthday(people, "2026-12-31")?.slug, "a");
  assert.equal(nextBirthday(people, "2026-01-02")?.isToday, true);
  assert.equal(nextBirthday([], "2026-01-01"), null);
});
test("search ranking favours an exact match", () => {
  const base = {
    kind: "people" as const,
    secondary: "",
    label: { "zh-CN": "", "ja-JP": "", en: "" },
    path: "/",
  };
  assert.equal(
    searchEntries(
      [
        { ...base, id: "partial", values: ["Hayami Saori"] },
        { ...base, id: "exact", values: ["Hayami"] },
      ],
      "Hayami",
    )[0].id,
    "exact",
  );
});
