export type Locale = "zh-CN" | "ja-JP" | "en";
export type Localized = Record<Locale, string>;
export type SourceType =
  | "official-person"
  | "official-agency"
  | "official-anime"
  | "official-award"
  | "media"
  | "wikipedia"
  | "database"
  | "community";
export interface Source {
  id: string;
  title: string;
  source_url: string;
  public_url?: string;
  source_type: SourceType;
  retrieved_at: string;
  verified: boolean;
  confidence: "high" | "medium" | "low";
}
export interface Evidence {
  sourceIds: string[];
  verified: boolean;
  confidence: "high" | "medium" | "low";
}
export interface TimelineEntry {
  year: number;
  title: Localized;
  description?: Localized;
  sourceIds: string[];
}
export interface Activity {
  id: string;
  kind: "music" | "radio" | "stage" | "game" | "narration" | "award";
  title: string;
  detail: Localized;
  sourceIds: string[];
}
export interface Seiyuu {
  id: string;
  slug: string;
  names: { ja: string; kana: string; romaji: string; zh: string };
  aliases: string[];
  agencyId: string;
  birth?: { month: number; day: number; year?: number };
  birthplace?: string;
  debutYear?: number;
  gender?: "female" | "male";
  kanaGroup: string;
  color: string;
  introduction: Localized;
  tagline: Localized;
  evidence: Record<string, Evidence>;
  timeline: TimelineEntry[];
  activities: Activity[];
  sourceIds: string[];
  officialUrl: string;
  voiceUrl?: string;
  imageStatus: "IMAGE_LICENSE_TODO";
  socialLinks: { platform: string; url: string; verifiedBySourceId: string }[];
}
export interface Agency {
  id: string;
  name: string;
  url: string;
}
export interface Anime {
  id: string;
  slug: string;
  title: Localized;
  format: "TV" | "Film";
  year?: number;
  sourceIds: string[];
  url: string;
}
export interface Character {
  id: string;
  names: Localized;
  aliases: string[];
  animeId: string;
}
export interface Role {
  id: string;
  seiyuuId: string;
  characterId: string;
  animeId: string;
  roleType?: "lead" | "supporting";
  sourceIds: string[];
}
export interface Archive {
  sources: Source[];
  seiyuu: Seiyuu[];
  agencies: Agency[];
  anime: Anime[];
  characters: Character[];
  roles: Role[];
  conflicts: {
    entityId: string;
    field: string;
    assertions: { value: unknown; sourceId: string }[];
    status: string;
  }[];
}
