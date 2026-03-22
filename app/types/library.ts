export type AnimeStatus = 'PLANNED' | 'WATCHING' | 'COMPLETED' | 'DROPPED'

export interface LibraryEntry {
  id: string
  animeId: string
  title: string
  titleRu: string | null
  posterUrl: string | null
  contentType: string | null
  year: number | null
  status: AnimeStatus | null
  isLiked: boolean
  addedAt: string
  updatedAt: string
}

/** Вкладки быстрых фильтров на `/library` и в профиле */
export const LIBRARY_SECTION_TAB_KEYS = [
  'watching',
  'planned',
  'completed',
  'liked',
  'dropped',
] as const

export type LibrarySectionTabKey = (typeof LIBRARY_SECTION_TAB_KEYS)[number]

export interface GroupedLibrary {
  planned:   LibraryEntry[]
  watching:  LibraryEntry[]
  completed: LibraryEntry[]
  dropped:   LibraryEntry[]
  liked:     LibraryEntry[]
  counts: {
    planned: number
    watching: number
    completed: number
    dropped: number
    liked: number
    total: number
  }
}

export interface UpsertLibraryPayload {
  animeId: string
  title: string
  titleRu?: string
  posterUrl?: string
  contentType?: string
  year?: number
  status?: AnimeStatus
}

export interface ToggleLikePayload {
  animeId: string
  title: string
  titleRu?: string
  posterUrl?: string
  contentType?: string
  year?: number
}

// ── Display helpers ──────────────────────────────────────────────────────────

export const STATUS_LABELS: Record<AnimeStatus, string> = {
  PLANNED:   'Буду смотреть',
  WATCHING:  'Смотрю',
  COMPLETED: 'Просмотрено',
  DROPPED:   'Брошено',
}

export const STATUS_ICONS: Record<AnimeStatus, string> = {
  PLANNED:   '📌',
  WATCHING:  '▶️',
  COMPLETED: '✅',
  DROPPED:   '🚫',
}

export const STATUS_ORDER: AnimeStatus[] = [
  'WATCHING',
  'PLANNED',
  'COMPLETED',
  'DROPPED',
]
