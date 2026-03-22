import type { AnimePreferences } from '~/types/content'

/** Префикс без имени бренда — настройки переживают смену названия сайта */
const STORAGE_PREFIX = 'app:anime:preferences:'

function getStorageKey(externalId: string): string {
  return `${STORAGE_PREFIX}${externalId}`
}

export function loadAnimePreferences(externalId: string): AnimePreferences | null {
  if (!import.meta.client) return null

  try {
    const raw = window.localStorage.getItem(getStorageKey(externalId))
    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<AnimePreferences>
    return {
      translationId: typeof parsed.translationId === 'number' ? parsed.translationId : undefined,
      season: typeof parsed.season === 'number' ? parsed.season : undefined,
      episode: typeof parsed.episode === 'number' ? parsed.episode : undefined,
      updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : Date.now(),
    }
  } catch {
    return null
  }
}

export function saveAnimePreferences(
  externalId: string,
  patch: Partial<Omit<AnimePreferences, 'updatedAt'>>,
): void {
  if (!import.meta.client) return

  const current = loadAnimePreferences(externalId)
  const next: AnimePreferences = {
    translationId: patch.translationId ?? current?.translationId,
    season: patch.season ?? current?.season,
    episode: patch.episode ?? current?.episode,
    updatedAt: Date.now(),
  }

  window.localStorage.setItem(getStorageKey(externalId), JSON.stringify(next))
}

export function clearAnimePreferences(externalId: string): void {
  if (!import.meta.client) return
  window.localStorage.removeItem(getStorageKey(externalId))
}

