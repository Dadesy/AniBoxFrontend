export interface NormalizedAnimeCard {
  id: string
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
