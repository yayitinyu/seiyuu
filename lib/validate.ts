import type { Archive } from "./types.ts";

export function validateArchive(archive: Archive): string[] {
  const errors: string[] = [];
  const assert = (condition: unknown, message: string) => {
    if (!condition) errors.push(message);
  };
  const sourceIds = new Set(archive.sources.map((s) => s.id));
  const people = new Set(archive.seiyuu.map((p) => p.id));
  const agencies = new Set(archive.agencies.map((a) => a.id));
  const works = new Set(archive.anime.map((a) => a.id));
  const characters = new Map(archive.characters.map((c) => [c.id, c]));
  function evidence(ids: string[], context: string) {
    assert(ids.length > 0, `${context}: missing sources`);
    for (const id of ids)
      assert(sourceIds.has(id), `${context}: unknown source ${id}`);
  }
  function url(value: string, context: string) {
    try {
      assert(
        new URL(value).protocol === "https:",
        `${context}: HTTPS required`,
      );
    } catch {
      errors.push(`${context}: invalid URL`);
    }
  }
  for (const [name, entries] of Object.entries(archive)) {
    if (name === "conflicts") continue;
    const ids = (entries as { id: string }[]).map((entry) => entry.id);
    assert(new Set(ids).size === ids.length, `${name}: duplicate IDs`);
  }
  for (const source of archive.sources) {
    url(source.source_url, source.id);
    if (source.public_url) url(source.public_url, source.id);
    assert(
      /^\d{4}-\d{2}-\d{2}$/.test(source.retrieved_at),
      `${source.id}: invalid retrieval date`,
    );
  }
  for (const person of archive.seiyuu) {
    assert(agencies.has(person.agencyId), `${person.id}: unknown agency`);
    assert(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(person.slug),
      `${person.id}: invalid slug`,
    );
    evidence(person.sourceIds, person.id);
    url(person.officialUrl, person.id);
    if (person.voiceUrl) url(person.voiceUrl, person.id);
    for (const field of [
      "names",
      "agencyId",
      "introduction",
      "birth",
      "birthplace",
      "debutYear",
      "gender",
    ]) {
      if (person[field as keyof typeof person] !== undefined) {
        const fact = person.evidence[field];
        assert(!!fact, `${person.id}.${field}: missing evidence`);
        if (fact) evidence(fact.sourceIds, `${person.id}.${field}`);
      }
    }
    if (person.birth) {
      const { month, day, year } = person.birth;
      const max = new Date(Date.UTC(year ?? 2000, month, 0)).getUTCDate();
      assert(
        month >= 1 && month <= 12 && day >= 1 && day <= max,
        `${person.id}: invalid birthday`,
      );
    }
    for (const locale of ["zh-CN", "ja-JP", "en"] as const) {
      assert(
        !!person.introduction[locale]?.trim(),
        `${person.id}: missing introduction ${locale}`,
      );
      assert(
        !!person.tagline[locale]?.trim(),
        `${person.id}: missing tagline ${locale}`,
      );
    }
    for (const entry of person.timeline)
      evidence(entry.sourceIds, `${person.id} timeline ${entry.year}`);
    for (const entry of person.activities) evidence(entry.sourceIds, entry.id);
    assert(
      person.imageStatus === "IMAGE_LICENSE_TODO",
      `${person.id}: unreviewed portrait license`,
    );
  }
  for (const work of archive.anime) {
    evidence(work.sourceIds, work.id);
    url(work.url, work.id);
  }
  for (const character of archive.characters)
    assert(works.has(character.animeId), `${character.id}: unknown work`);
  for (const role of archive.roles) {
    assert(people.has(role.seiyuuId), `${role.id}: unknown person`);
    assert(works.has(role.animeId), `${role.id}: unknown work`);
    assert(characters.has(role.characterId), `${role.id}: unknown character`);
    assert(
      characters.get(role.characterId)?.animeId === role.animeId,
      `${role.id}: character/work mismatch`,
    );
    evidence(role.sourceIds, role.id);
  }
  return errors;
}
