/**
 * useAniLibria — fetches data from the public anilibria.top API (v1).
 * Used client-side only to enrich the homepage with fresh releases.
 * Errors are silently ignored; the section simply won't render.
 */

const ANILIBRIA_API = 'https://anilibria.top/api/v1'

export interface AniLibriaRelease {
  id: number
  name: { main: string; english: string | null; alternative: string | null }
  alias: string
  year: number
  poster: {
    src: string
    preview: string
    thumbnail: string
    optimized?: { src: string; thumbnail: string } | null
  }
  type: { value: string; description: string }
  season: { value: string; description: string }
  genres: Array<{ id: number; name: string }>
  fresh_at: string
  is_ongoing: boolean
  added_in_users_favorites: number
  description: string | null
  episodes_total: number | null
  average_duration_of_episode: number | null
}

export function useAniLibriaFresh(limit = 16) {
  const releases = ref<AniLibriaRelease[]>([])
  const loading  = ref(false)
  const error    = ref<string | null>(null)

  async function load() {
    loading.value = true
    error.value   = null
    try {
      const data = await $fetch<{ data: AniLibriaRelease[] }>(
        `${ANILIBRIA_API}/anime/catalog/releases`,
        {
          params: {
            limit,
            'f[sorting]': 'fresh',
          },
        },
      )
      releases.value = data.data ?? []
    } catch (e) {
      error.value = 'Не удалось загрузить'
      console.warn('[useAniLibria] fetch failed:', e)
    } finally {
      loading.value = false
    }
  }

  return { releases, loading, error, load }
}
