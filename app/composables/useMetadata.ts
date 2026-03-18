import type { HomePageData, NormalizedAnimeCard, ScheduleDay } from '~/types/metadata'

// ── Shikimori ID → Kodik ID resolver ─────────────────────────────────────

export async function resolveShikimoriId(
  shikimoriId: string,
): Promise<{ id: string; type: string } | null> {
  try {
    const apiUrl = useRuntimeConfig().public.apiUrl as string
    return await $fetch<{ id: string; type: string }>(
      `${apiUrl}/content/resolve-shikimori/${shikimoriId}`,
    )
  } catch {
    return null
  }
}

// ── Navigate to a metadata card ───────────────────────────────────────────

export async function navigateToCard(card: NormalizedAnimeCard): Promise<void> {
  // Both Shikimori IDs and Jikan/MAL IDs map to Kodik via shikimori_id
  // because Shikimori historically mirrors MAL IDs 1:1 for most anime.
  const resolved = await resolveShikimoriId(card.id)
  if (resolved) {
    await navigateTo(`/title/${encodeURIComponent(resolved.id)}`)
    return
  }
  // Fallback: search by title
  const q = card.titleRu || card.title
  await navigateTo(`/search?q=${encodeURIComponent(q)}`)
}

// ── Related anime composable ──────────────────────────────────────────────

export function useRelated(shikimoriId: Ref<string | undefined>) {
  const apiUrl = useApiUrl()

  const { data, status } = useAsyncData<NormalizedAnimeCard[]>(
    () => `related-${shikimoriId.value}`,
    () => {
      if (!shikimoriId.value) return Promise.resolve([])
      return $fetch<NormalizedAnimeCard[]>(`${apiUrl}/metadata/related/${shikimoriId.value}`)
    },
    {
      watch: [shikimoriId],
      default: () => [],
    },
  )

  return {
    related: computed(() => data.value ?? []),
    loading: computed(() => status.value === 'pending'),
  }
}

// ── Home page data composable ─────────────────────────────────────────────
// Uses $fetch in onMounted to avoid the useFetch 'idle' initial status bug
// with lazy:true + server:false (loading would be false on first render)

export function useHomeData() {
  const apiUrl = useApiUrl()

  const { data, status, error, refresh } = useAsyncData<HomePageData>(
    'metadata-home',
    () =>
      $fetch<HomePageData>(`${apiUrl}/metadata/home`, {
        cache: 'no-store',
        headers: {
          'cache-control': 'no-cache',
          pragma: 'no-cache',
        },
      }),
    {
      default: () => ({
        hero: null,
        sections: [],
      }),
    },
  )

  const hero = computed(() => data.value?.hero ?? null)
  const sections = computed(() => data.value?.sections ?? [])
  const loading = computed(() => status.value === 'pending')

  return { hero, sections, loading, error, refresh }
}

// ── Weekly schedule composable ────────────────────────────────────────────

export function useSchedule() {
  const apiUrl = useApiUrl()

  const todayDayKey = computed(() => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    return days[new Date().getDay()] ?? 'monday'
  })

  const { data, status, refresh } = useAsyncData<ScheduleDay[]>(
    'metadata-schedule',
    () =>
      $fetch<ScheduleDay[]>(`${apiUrl}/metadata/schedule`, {
        cache: 'no-store',
        headers: {
          'cache-control': 'no-cache',
          pragma: 'no-cache',
        },
      }),
    {
      default: () => [],
    },
  )

  const schedule = computed(() => data.value ?? [])
  const loading = computed(() => status.value === 'pending')

  return { schedule, loading, todayDayKey, refresh }
}
