import { agencies, anime, characters, roles, seiyuu } from "./content";
import type { SearchEntry } from "./search";
export function buildSearchIndex(): SearchEntry[] {
  return [
    ...seiyuu.map((person): SearchEntry => ({
      id: person.id,
      kind: "people",
      label: {
        "zh-CN": person.names.zh,
        "ja-JP": person.names.ja,
        en: person.names.romaji,
      },
      secondary: person.names.ja + " · " + person.names.romaji,
      values: [...Object.values(person.names), ...person.aliases],
      path: `/seiyuu/${person.slug}`,
    })),
    ...characters.map((character): SearchEntry => {
      const person = seiyuu.find(
        (p) =>
          p.id === roles.find((r) => r.characterId === character.id)?.seiyuuId,
      )!;
      return {
        id: character.id,
        kind: "character",
        label: character.names,
        secondary: person.names.ja,
        values: [...Object.values(character.names), ...character.aliases],
        path: `/seiyuu/${person.slug}#character-${character.id}`,
      };
    }),
    ...anime.map((work): SearchEntry => ({
      id: work.id,
      kind: "works",
      label: work.title,
      secondary: work.title["ja-JP"],
      values: Object.values(work.title),
      path: `/works/${work.slug}`,
    })),
    ...agencies.map((agency): SearchEntry => ({
      id: agency.id,
      kind: "agency",
      label: { "zh-CN": agency.name, "ja-JP": agency.name, en: agency.name },
      secondary: "",
      values: [agency.name, agency.id],
      path: `/seiyuu?agency=${agency.id}`,
    })),
  ];
}
