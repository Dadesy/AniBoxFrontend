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

/** Альтернативный плеер (Кодик / AniLibria), если бэкенд смог сопоставить релиз */
export interface WatchSourceOption {
  provider: 'kodik' | 'anilibria';
  externalId: string;
  label: string;
}

export interface AnimeDetail extends ContentCard {
  allTranslations: Translation[];
  seasons: Season[];
  seasonOptions: SeasonOption[];
  related: NormalizedAnimeCard[];
  titleRu?: string;
  /** When set — title served from AniLibria fallback. Link to watch on their site. */
  anilibriaUrl?: string;
  watchSources?: WatchSourceOption[];
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

export interface CatalogPageResult {
  items: CatalogCard[];
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Minimal card shape returned by the Shikimori-backed catalog.
 * NormalizedAnimeCard maps directly to this shape.
 */
export interface CatalogCard {
  /** Kodik externalId — present only when the title is playable */
  externalId?: string;
  /** Shikimori numeric id (always present from Shikimori source) */
  shikimoriId?: string;
  /** Used as fallback id in Shikimori-sourced cards */
  id?: string;
  title: string;
  titleRu?: string;
  posterUrl?: string;
  score?: number;
  year?: number;
  /** Shikimori kind: 'tv' | 'movie' | 'ova' | 'ona' | 'special' */
  kind?: string;
  /** Kodik/legacy type: 'anime-serial' | 'anime' */
  type?: string;
  status?: string;
}

export interface GenreOption {
  id: number;
  name: string;
  russian: string;
}

export interface StudioOption {
  id: number;
  name: string;
}

export interface FilterOptions {
  genres: GenreOption[];
  kinds: Array<{ value: string; label: string }>;
  statuses: Array<{ value: string; label: string }>;
  sorts: Array<{ value: string; label: string }>;
  seasons: Array<{ value: string; label: string }>;
  ageRatings: Array<{ value: string; label: string }>;
  studios: StudioOption[];
  demographics: Array<{ value: string; label: string }>;
}

export interface CatalogFilters {
  /** comma-separated: 'tv,movie,ova' */
  kind?: string;
  /** comma-separated: 'ongoing,released,anons' */
  status?: string;
  /** comma-separated Shikimori genre IDs */
  genre?: string;
  /** e.g. 'winter_2025' */
  season?: string;
  /** minimum score 1-9 */
  score?: string;
  /** popularity | ranked | aired_on | name | random */
  order?: string;
  /** text search */
  search?: string;
  /** page number */
  page?: number;
  /** show only titles with a player */
  hasPlayer?: boolean;
  /** year range — from */
  yearFrom?: string;
  /** year range — to */
  yearTo?: string;
  /** age rating: g,pg,pg_13,r,r_plus (comma-separated) */
  ageRating?: string;
  /** comma-separated Shikimori studio IDs */
  studio?: string;
  /** comma-separated demographic genre IDs */
  demographic?: string;
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
