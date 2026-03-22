import type {
  Collection,
  HomePageData,
  NewsItem,
  NormalizedAnimeCard,
  SchedulePageResponse,
  WatchTarget,
} from '~/types/metadata'

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
  if (card.slug) {
    await navigateTo(`/anime/${encodeURIComponent(card.slug)}`)
    return
  }

  // Fast path: externalId already resolved by the backend (attachPlayableIds).
  // Navigate instantly — zero extra API calls, no spinner delay.
  if (card.externalId) {
    await navigateTo(`/title/${encodeURIComponent(card.externalId)}`)
    return
  }

  // Slow path: card came without externalId (rare) — ask backend to resolve it.
  const resolved = await resolveContentCard(card)
  if (resolved) {
    await navigateTo(`/title/${encodeURIComponent(resolved.id)}`)
    return
  }

  // Fallback: title search
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

// ── Schedule page (календарь + неделя + мета-таймзона с бэкенда) ─────────

function emptySchedulePage(tz: string): SchedulePageResponse {
  return {
    meta: {
      timezone: tz,
      todayDayKey: 'monday',
      todayLocalDateKey: '',
      generatedAt: '',
      source: 'shikimori',
    },
    week: [],
    releases: [],
    countsByDate: {},
  }
}

export function useSchedule() {
  const apiUrl = useApiUrl()

  const tzCookie = useCookie<string>('abx-schedule-tz', {
    default: () => 'Europe/Moscow',
    maxAge: 60 * 60 * 24 * 365,
  })

  onMounted(() => {
    try {
      const d = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (d && d !== tzCookie.value) tzCookie.value = d
    } catch {
      /* ignore */
    }
  })

  const { data, status, error, refresh } = useAsyncData<SchedulePageResponse>(
    () => `metadata-schedule-${tzCookie.value}`,
    () =>
      $fetch<SchedulePageResponse>(`${apiUrl}/metadata/schedule`, {
        query: { timezone: tzCookie.value },
      }),
    {
      watch: [tzCookie],
      default: () => emptySchedulePage(tzCookie.value),
    },
  )

  const page = computed(() => data.value ?? emptySchedulePage(tzCookie.value))
  const schedule = computed(() => page.value.week)
  const releases = computed(() => page.value.releases)
  const meta = computed(() => page.value.meta)
  const countsByDate = computed(() => page.value.countsByDate)
  const loading = computed(() => status.value === 'pending')
  const todayDayKey = computed(() => page.value.meta.todayDayKey)

  return {
    page,
    schedule,
    releases,
    meta,
    countsByDate,
    loading,
    error,
    refresh,
    todayDayKey,
    timezoneCookie: tzCookie,
  }
}

// ── Watch-target composable ───────────────────────────────────────────────

export function useWatchTarget() {
  const apiUrl = useApiUrl()
  const router = useRouter()

  async function navigateToWatch(externalId: string): Promise<void> {
    try {
      const target = await $fetch<WatchTarget>(`${apiUrl}/anime/${encodeURIComponent(externalId)}/watch-target`)
      if (target.hasAvailablePlayer) {
        await navigateTo(target.watchUrl)
      } else {
        await navigateTo(`/title/${encodeURIComponent(externalId)}`)
      }
    } catch {
      await navigateTo(`/title/${encodeURIComponent(externalId)}`)
    }
  }

  return { navigateToWatch }
}

// ── Collections composable ────────────────────────────────────────────────

export function useCollections() {
  const apiUrl = useApiUrl()

  const { data, status } = useAsyncData<Collection[]>(
    'metadata-collections',
    () => $fetch<Collection[]>(`${apiUrl}/metadata/collections`),
    { default: () => [] },
  )

  return {
    collections: computed(() => data.value ?? []),
    loading: computed(() => status.value === 'pending'),
  }
}

// ── News composable ───────────────────────────────────────────────────────

export function useNews(limit = 10) {
  const apiUrl = useApiUrl()

  const { data, status } = useAsyncData<NewsItem[]>(
    `metadata-news-${limit}`,
    () => $fetch<NewsItem[]>(`${apiUrl}/metadata/news?limit=${limit}`),
    { default: () => [] },
  )

  return {
    news: computed(() => data.value ?? []),
    loading: computed(() => status.value === 'pending'),
  }
}
