import type { HomePageData, NormalizedAnimeCard, ScheduleDay } from '~/types/metadata'

// ── Metadata card → Kodik ID resolver ────────────────────────────────────

export async function resolveContentCard(
  card: NormalizedAnimeCard,
): Promise<{ id: string; type: string } | null> {
  try {
    const apiUrl = useApiUrl()
    const params = new URLSearchParams({
      id: card.id,
      source: card.source,
    })

    if (card.title) params.set('title', card.title)
    if (card.titleRu) params.set('titleRu', card.titleRu)
    if (card.year) params.set('year', String(card.year))
    if (card.kind) params.set('kind', card.kind)

    return await $fetch<{ id: string; type: string }>(
      `${apiUrl}/content/resolve?${params.toString()}`,
    )
  } catch {
    return null
  }
}

// ── Navigate to a metadata card ───────────────────────────────────────────

export async function navigateToCard(card: NormalizedAnimeCard): Promise<void> {
  const resolved = await resolveContentCard(card)
  if (resolved) {
    await navigateTo(`/title/${encodeURIComponent(resolved.id)}`)
    return
  }

  if (card.externalId) {
    await navigateTo(`/title/${encodeURIComponent(card.externalId)}`)
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
    () => $fetch<HomePageData>(`${apiUrl}/metadata/home`),
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
    () => $fetch<ScheduleDay[]>(`${apiUrl}/metadata/schedule`),
    {
      default: () => [],
    },
  )

  const schedule = computed(() => data.value ?? [])
  const loading = computed(() => status.value === 'pending')

  return { schedule, loading, todayDayKey, refresh }
}
