import type { Archive } from "./types.ts";
import { isLicenseActive } from "./media.ts";

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
  const media = new Map(archive.media.map((asset) => [asset.id, asset]));
  const date = (value: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) &&
    new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
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
      date(source.retrieved_at),
      `${source.id}: invalid retrieval date`,
    );
  }
  for (const asset of archive.media) {
    assert(people.has(asset.personId), `${asset.id}: unknown person`);
    assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(asset.id), `${asset.id}: invalid media ID`);
    assert(/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(asset.filename), `${asset.id}: invalid filename`);
    assert(/^[a-f0-9]{64}$/.test(asset.sha256), `${asset.id}: invalid SHA-256`);
    assert(!!asset.rights?.holder?.trim(), `${asset.id}: missing rights holder`);
    assert(!!asset.rights?.authorizationRef?.trim(), `${asset.id}: missing authorization reference`);
    assert(asset.rights?.territories === "worldwide", `${asset.id}: territory restriction cannot be enforced`);
    assert(date(asset.rights?.startsAt ?? ""), `${asset.id}: invalid rights start`);
    assert(
      asset.rights?.perpetual === true
        ? !asset.rights.endsAt
        : date(asset.rights?.endsAt ?? ""),
      `${asset.id}: provide a valid rights end or explicit perpetual grant`,
    );
    if (asset.rights?.endsAt)
      assert(asset.rights.startsAt <= asset.rights.endsAt, `${asset.id}: rights end precedes start`);
    assert(!!asset.reviewedBy?.trim(), `${asset.id}: missing rights reviewer`);
    assert(date(asset.reviewedAt), `${asset.id}: invalid rights review date`);
    if (asset.kind === "portrait") {
      assert(asset.rights?.allowedUse === "portrait-display", `${asset.id}: portrait use not authorized`);
      assert(["image/jpeg", "image/png", "image/webp"].includes(asset.mimeType), `${asset.id}: invalid portrait MIME`);
      assert(Number.isInteger(asset.width) && (asset.width ?? 0) > 0, `${asset.id}: invalid width`);
      assert(Number.isInteger(asset.height) && (asset.height ?? 0) > 0, `${asset.id}: invalid height`);
      assert(typeof asset.cropAllowed === "boolean", `${asset.id}: crop permission must be explicit`);
      for (const locale of ["zh-CN", "ja-JP", "en"] as const)
        assert(!!asset.alt?.[locale]?.trim(), `${asset.id}: missing alt ${locale}`);
    } else if (asset.kind === "audio") {
      assert(asset.rights?.allowedUse === "audio-stream", `${asset.id}: audio use not authorized`);
      assert(["audio/mpeg", "audio/ogg"].includes(asset.mimeType), `${asset.id}: invalid audio MIME`);
    } else {
      errors.push(`${asset.id}: unknown media kind`);
    }
    assert(isLicenseActive(asset, asset.rights?.startsAt), `${asset.id}: invalid license period`);
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
    const portrait = person.portraitAssetId && media.get(person.portraitAssetId);
    const voice = person.voiceAssetId && media.get(person.voiceAssetId);
    assert(
      portrait
        ? person.imageStatus === "LICENSED" && portrait.personId === person.id && portrait.kind === "portrait"
        : person.imageStatus === "IMAGE_LICENSE_TODO",
      `${person.id}: portrait authorization mismatch`,
    );
    if (person.voiceAssetId)
      assert(!!voice && voice.personId === person.id && voice.kind === "audio", `${person.id}: audio authorization mismatch`);
  }
  for (const asset of archive.media)
    assert(
      archive.seiyuu.some((person) =>
        asset.kind === "portrait"
          ? person.portraitAssetId === asset.id
          : person.voiceAssetId === asset.id,
      ),
      `${asset.id}: unreferenced media`,
    );
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
