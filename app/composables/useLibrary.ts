import type {
  LibraryEntry,
  GroupedLibrary,
  AnimeStatus,
  UpsertLibraryPayload,
  ToggleLikePayload,
} from '~/types/library'
import { STATUS_LABELS } from '~/types/library'
import { useToast } from '~/composables/useToast'

// ── Module-level cache: one request, shared across instances ──────────────────
// Keyed by animeId for fast lookup on title pages.
const entryCache = reactive<Map<string, LibraryEntry | null>>(new Map())

// ── Main composable ───────────────────────────────────────────────────────────

export function useLibrary() {
  const apiUrl = useApiUrl()
  const { isAuthenticated } = useAuth()
  const { success } = useToast()

  const library     = ref<GroupedLibrary | null>(null)
  const libLoading  = ref(false)

  // ── Fetch grouped library ────────────────────────────────────────────────

  async function fetchLibrary() {
    if (!isAuthenticated.value) return
    libLoading.value = true
    try {
      library.value = await $fetch<GroupedLibrary>(`${apiUrl}/library`, {
        credentials: 'include',
      })
      // Populate entry cache from fetched data
      if (library.value) {
        const all = [
          ...library.value.planned,
          ...library.value.watching,
          ...library.value.completed,
          ...library.value.dropped,
        ]
        // Deduplicate by animeId
        const seen = new Set<string>()
        for (const e of all) {
          if (!seen.has(e.animeId)) {
            seen.add(e.animeId)
            entryCache.set(e.animeId, e)
          }
        }
        // Liked might not have a status — add those too
        for (const e of library.value.liked) {
          if (!seen.has(e.animeId)) {
            seen.add(e.animeId)
            entryCache.set(e.animeId, e)
          }
        }
      }
    } catch (e) {
      console.error('[useLibrary] fetchLibrary', e)
    } finally {
      libLoading.value = false
    }
  }

  // ── Fetch single entry (for title page) ──────────────────────────────────

  async function fetchEntry(animeId: string): Promise<LibraryEntry | null> {
    if (!isAuthenticated.value) return null
    // Return from cache if present
    if (entryCache.has(animeId)) return entryCache.get(animeId) ?? null

    try {
      const entry = await $fetch<LibraryEntry | null>(
        `${apiUrl}/library/${encodeURIComponent(animeId)}`,
        { credentials: 'include' },
      )
      entryCache.set(animeId, entry ?? null)
      return entry ?? null
    } catch {
      return null
    }
  }

  // ── Optimistic entry accessor ─────────────────────────────────────────────

  function getCachedEntry(animeId: string): LibraryEntry | null {
    return entryCache.get(animeId) ?? null
  }

  // ── Set / update status ───────────────────────────────────────────────────

  async function setStatus(payload: UpsertLibraryPayload): Promise<LibraryEntry> {
    // Optimistic update
    const prev = entryCache.get(payload.animeId) ?? null
    const optimistic: LibraryEntry = {
      id:          prev?.id ?? '',
      animeId:     payload.animeId,
      title:       payload.title,
      titleRu:     payload.titleRu ?? null,
      posterUrl:   payload.posterUrl ?? null,
      contentType: payload.contentType ?? null,
      year:        payload.year ?? null,
      status:      payload.status ?? null,
      isLiked:     prev?.isLiked ?? false,
      addedAt:     prev?.addedAt ?? new Date().toISOString(),
      updatedAt:   new Date().toISOString(),
    }
    entryCache.set(payload.animeId, optimistic)

    try {
      const updated = await $fetch<LibraryEntry>(`${apiUrl}/library`, {
        method:      'POST',
        body:        payload,
        credentials: 'include',
      })
      entryCache.set(payload.animeId, updated)
      _syncIntoLibraryGroups(updated)

      if (payload.status) {
        success(STATUS_LABELS[payload.status], payload.titleRu ?? payload.title)
      }

      return updated
    } catch (e) {
      // Rollback
      entryCache.set(payload.animeId, prev)
      throw e
    }
  }

  // ── Remove from library ───────────────────────────────────────────────────

  async function removeFromLibrary(animeId: string): Promise<void> {
    const prev = entryCache.get(animeId) ?? null
    entryCache.set(animeId, null)
    _removeFromLibraryGroups(animeId)

    try {
      await $fetch(`${apiUrl}/library`, {
        method:      'DELETE',
        body:        { animeId },
        credentials: 'include',
      })
      success('Удалено из библиотеки')
    } catch (e) {
      if (prev) entryCache.set(animeId, prev)
      throw e
    }
  }

  // ── Toggle like ───────────────────────────────────────────────────────────

  async function toggleLike(payload: ToggleLikePayload): Promise<LibraryEntry> {
    const prev = entryCache.get(payload.animeId) ?? null
    const newLiked = !(prev?.isLiked ?? false)

    // Optimistic
    const optimistic: LibraryEntry = {
      id:          prev?.id ?? '',
      animeId:     payload.animeId,
      title:       payload.title,
      titleRu:     payload.titleRu ?? null,
      posterUrl:   payload.posterUrl ?? null,
      contentType: payload.contentType ?? null,
      year:        payload.year ?? null,
      status:      prev?.status ?? null,
      isLiked:     newLiked,
      addedAt:     prev?.addedAt ?? new Date().toISOString(),
      updatedAt:   new Date().toISOString(),
    }
    entryCache.set(payload.animeId, optimistic)

    try {
      const updated = await $fetch<LibraryEntry>(`${apiUrl}/library/like`, {
        method:      'PATCH',
        body:        payload,
        credentials: 'include',
      })
      entryCache.set(payload.animeId, updated)
      _syncIntoLibraryGroups(updated)

      if (updated.isLiked) success('Добавлено в «Нравится»', payload.titleRu ?? payload.title, '❤️')

      return updated
    } catch (e) {
      entryCache.set(payload.animeId, prev)
      throw e
    }
  }

  // ── Private: sync entry into grouped library (no refetch) ────────────────

  function _syncIntoLibraryGroups(entry: LibraryEntry) {
    if (!library.value) return

    // Remove from all groups first
    _removeFromLibraryGroups(entry.animeId)

    // Add to correct group
    if (entry.status) {
      const key = entry.status.toLowerCase() as keyof Pick<GroupedLibrary, 'planned' | 'watching' | 'completed' | 'dropped'>
      if (library.value[key]) {
        library.value[key].unshift(entry)
        library.value.counts[key]++
        library.value.counts.total = Object.values({
          planned: library.value.counts.planned,
          watching: library.value.counts.watching,
          completed: library.value.counts.completed,
          dropped: library.value.counts.dropped,
        }).reduce((a, b) => a + b, 0)
      }
    }
    if (entry.isLiked) {
      if (!library.value.liked.some(e => e.animeId === entry.animeId)) {
        library.value.liked.unshift(entry)
        library.value.counts.liked++
      }
    }
  }

  function _removeFromLibraryGroups(animeId: string) {
    if (!library.value) return
    const sections: Array<keyof Pick<GroupedLibrary, 'planned'|'watching'|'completed'|'dropped'|'liked'>> =
      ['planned', 'watching', 'completed', 'dropped', 'liked']
    for (const key of sections) {
      const idx = library.value[key].findIndex(e => e.animeId === animeId)
      if (idx !== -1) {
        library.value[key].splice(idx, 1)
        if (key !== 'liked') {
          library.value.counts[key]--
        } else {
          library.value.counts.liked--
        }
      }
    }
  }

  return {
    library,
    libLoading,
    entryCache,
    fetchLibrary,
    fetchEntry,
    getCachedEntry,
    setStatus,
    removeFromLibrary,
    toggleLike,
  }
}
