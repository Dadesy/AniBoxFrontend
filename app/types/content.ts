import type { NormalizedAnimeCard } from '~/types/metadata'

// Mapped types — зеркалят backend kodik.types.ts, без import зависимости

export type ContentType =
  | 'anime-serial'
  | 'anime'
  | 'film'
  | 'foreign-serial'
  | string;

export interface Translation {
  id: number;
  title: string;
  type: 'voice' | 'subtitles';
  episodesCount?: number;
}

export interface Episode {
  number: number;
  link: string;
  title?: string;
  titleJapanese?: string;
  titleRomanji?: string;
  airedOn?: string;
  filler?: boolean;
  recap?: boolean;
}

export interface Season {
  number: number;
  episodes: Episode[];
  link: string;
  title?: string;
  episodesCount?: number;
}

export interface SeasonOption {
  number: number;
  title: string;
  episodesCount: number;
}

export interface ContentCard {
  externalId: string;
  sourceProvider: 'kodik' | 'anilibria';
  type: ContentType;
  title: string;
  originalTitle: string;
  otherTitle?: string;
  year?: number;
  posterUrl?: string;
  description?: string;
  genres: string[];
  countries: string[];
  status?: string;
  kinopoiskId?: string;
  shikimoriId?: string;
  imdbId?: string;
  episodesCount?: number;
  lastSeason?: number;
  lastEpisode?: number;
  score?: number;
  quality: string;
  playerUrl: string;
  translation: Translation;
  screenshots: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ContentDetail extends ContentCard {
  allTranslations: Translation[];
  seasons: Season[];
}

export interface AnimeDetail extends ContentCard {
  allTranslations: Translation[];
  seasons: Season[];
  seasonOptions: SeasonOption[];
  related: NormalizedAnimeCard[];
  titleRu?: string;
  /** When set — title served from AniLibria fallback. Link to watch on their site. */
  anilibriaUrl?: string;
}

export interface AnimeEpisodesResponse {
  translation: Translation | null;
  seasons: Season[];
  seasonOptions: SeasonOption[];
  playerUrl: string;
}

export interface CatalogResponse {
  items: ContentCard[];
  total: number;
  nextPage: string | null;
  prevPage: string | null;
}

export interface FilterOptions {
  genres: string[];
  years: number[];
  types: string[];
}

export interface CatalogFilters {
  types?: string;
  genres?: string;
  year?: string;
  country?: string;
  translationId?: string;
}

// ── Progress ──────────────────────────────────────────────────────────────────

export interface EpisodeProgress {
  id: string;
  userId: string;
  externalId: string;
  sourceProvider: string;
  title: string;
  posterUrl?: string;
  contentType?: string;
  season?: number;
  episode?: number;
  translationId?: number;
  translationName?: string;
  currentTime: number;
  duration: number;
  completed: boolean;
  lastWatchedAt: string;
}

export interface SaveProgressPayload {
  externalId: string;
  sourceProvider: string;
  title: string;
  posterUrl?: string;
  contentType?: string;
  season?: number;
  episode?: number;
  translationId?: number;
  translationName?: string;
  currentTime: number;
  duration: number;
}

export interface HistoryResponse {
  items: EpisodeProgress[];
  total: number;
}

export interface AnimePreferences {
  translationId?: number;
  season?: number;
  episode?: number;
  updatedAt: number;
}
