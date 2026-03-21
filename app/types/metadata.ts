export interface NormalizedAnimeCard {
  id: string
  /** AniLibria release alias (slug), e.g. "shingeki-no-kyojin". Used to build fallback externalId. */
  alias?: string
  source: 'shikimori' | 'anilibria' | 'yanitv'
  externalId?: string
  /** Relation label for related anime section (e.g. "Продолжение", "Приквел") */
  relation?: string
  title: string
  titleRu?: string
  posterUrl: string
  score?: number
  year?: number
  kind?: string
  status: string
  episodes?: number
  episodesAired?: number
  synopsis?: string
  genres?: string[]
  airedOn?: string
  broadcast?: { day: string; time: string }
}

export interface HomeSection {
  id: string
  title: string
  source: 'shikimori' | 'anilibria' | 'yanitv'
  items: NormalizedAnimeCard[]
}

export interface HomePageData {
  hero: NormalizedAnimeCard | null
  sections: HomeSection[]
}

export interface ScheduleDay {
  day: string
  dayKey: string
  anime: NormalizedAnimeCard[]
}

export type KindLabel = Record<string, string>

export const KIND_LABELS: KindLabel = {
  tv:      'TV',
  movie:   'Фильм',
  ova:     'OVA',
  ona:     'ONA',
  special: 'Спэшл',
  music:   'Клип',
}

export const STATUS_LABELS: Record<string, string> = {
  ongoing:  'Онгоинг',
  released: 'Вышел',
  anons:    'Анонс',
}

// ── Watch target ──────────────────────────────────────────────────────────

export interface WatchTarget {
  externalId: string
  sourceProvider: string
  /** e.g. /watch/anime-serial-1234?season=1&episode=1&translationId=610 */
  watchUrl: string
  season?: number
  episode?: number
  translationId?: number
  translationName?: string
  hasAvailablePlayer: boolean
}

// ── Collections ───────────────────────────────────────────────────────────

export interface Collection {
  id: string
  title: string
  subtitle?: string
  icon?: string
  items: NormalizedAnimeCard[]
  seeAllHref?: string
}

// ── News ──────────────────────────────────────────────────────────────────

export interface NewsItem {
  id: string
  title: string
  body: string
  createdAt: string
  commentsCount: number
  url: string
  linkedAnime?: {
    id: string
    title: string
    titleRu?: string
    url: string
    kind?: string
  }
  author: {
    nickname: string
    avatarUrl: string
  }
}
