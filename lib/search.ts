import type { Locale, Seiyuu } from "./types.ts";

export function normalizeSearch(input: string): string {
  return input
    .normalize("NFKC")
    .replace(/[\u30a1-\u30f6]/g, (char) =>
      String.fromCharCode(char.charCodeAt(0) - 0x60),
    )
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[\s\p{P}\p{S}]/gu, "");
}
export function matchesQuery(values: string[], query: string): boolean {
  const tokens = query
    .normalize("NFKC")
    .trim()
    .split(/\s+/)
    .map(normalizeSearch)
    .filter(Boolean);
  if (!tokens.length) return true;
  const haystack = values.map(normalizeSearch).join("|");
  return tokens.every((token) => haystack.includes(token));
}
export interface SearchEntry {
  id: string;
  kind: "people" | "character" | "works" | "agency";
  label: Record<Locale, string>;
  secondary: string;
  values: string[];
  path: string;
}
export function searchEntries(
  entries: SearchEntry[],
  query: string,
): SearchEntry[] {
  return entries
    .filter((entry) => matchesQuery(entry.values, query))
    .sort((a, b) => {
      const q = normalizeSearch(query);
      const rank = (entry: SearchEntry) =>
        entry.values.some((value) => normalizeSearch(value) === q)
          ? 0
          : entry.kind === "people"
            ? 1
            : 2;
      return rank(a) - rank(b);
    });
}
export interface Filters {
  q: string;
  agency: string;
  month: string;
  gender: string;
  decade: string;
  year: string;
  kana: string;
}
export const emptyFilters: Filters = {
  q: "",
  agency: "",
  month: "",
  gender: "",
  decade: "",
  year: "",
  kana: "",
};
export function filterPeople(people: Seiyuu[], filters: Filters) {
  return people.filter(
    (person) =>
      matchesQuery(
        [...Object.values(person.names), ...person.aliases],
        filters.q,
      ) &&
      (!filters.agency || person.agencyId === filters.agency) &&
      (!filters.month || String(person.birth?.month) === filters.month) &&
      (!filters.gender ||
        (filters.gender === "unknown"
          ? !person.gender
          : person.gender === filters.gender)) &&
      (!filters.decade ||
        (filters.decade === "unknown"
          ? !person.debutYear
          : person.debutYear !== undefined &&
            Math.floor(person.debutYear / 10) * 10 ===
              Number(filters.decade))) &&
      (!filters.year ||
        (filters.year === "unknown"
          ? !person.debutYear
          : person.debutYear === Number(filters.year))) &&
      (!filters.kana || person.kanaGroup === filters.kana),
  );
}
