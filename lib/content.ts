import raw from "@/content/archive.json";
import type { Archive } from "./types";

// JSON inference widens enums and unions optional fields; the build validates this boundary.
export const archive = raw as unknown as Archive;
export const { seiyuu, agencies, anime, characters, roles, sources } = archive;
export const getPerson = (slug: string) =>
  seiyuu.find((person) => person.slug === slug);
export const getAnime = (slug: string) =>
  anime.find((work) => work.slug === slug);
export const getAgency = (id: string) =>
  agencies.find((agency) => agency.id === id)!;
export const getRoles = (id: string) =>
  roles
    .filter((role) => role.seiyuuId === id)
    .map((role) => ({
      ...role,
      character: characters.find(
        (character) => character.id === role.characterId,
      )!,
      anime: anime.find((work) => work.id === role.animeId)!,
    }));
export function personSources(id: string) {
  const person = seiyuu.find((entry) => entry.id === id)!;
  const ids = new Set([
    ...person.sourceIds,
    ...getRoles(id).flatMap((role) => [
      ...role.sourceIds,
      ...role.anime.sourceIds,
    ]),
  ]);
  return sources.filter((source) => ids.has(source.id));
}
