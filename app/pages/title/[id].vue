<template>
  <div class="-mt-16">
    <div v-if="pending" class="animate-pulse">
      <div class="h-[480px] w-full skeleton-shine" />
      <div class="mx-auto max-w-screen-xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <div class="h-8 w-1/2 rounded skeleton-shine" />
        <div class="h-4 w-1/3 rounded skeleton-shine" />
        <div class="h-20 w-2/3 rounded skeleton-shine" />
      </div>
    </div>

    <div v-else-if="error || !detail" class="flex items-center justify-center pt-32">
      <div class="space-y-4 text-center">
        <UIcon name="lucide:alert-circle" class="mx-auto size-14 text-red-400" />
        <p class="text-slate-400">Тайтл не найден</p>
        <UButton to="/catalog" color="primary" variant="soft">В каталог</UButton>
      </div>
    </div>

    <template v-else>
      <div class="relative w-full overflow-hidden" style="height: min(80vh, 560px)">
        <div class="absolute inset-0">
          <img
            v-if="detail.posterUrl"
            :src="detail.posterUrl"
            :alt="detail.title"
            class="h-full w-full scale-110 object-cover object-top"
            style="filter: blur(3px) brightness(0.45) saturate(0.75)"
          />
          <div v-else class="h-full w-full bg-cinema-surface" />
        </div>

        <div class="absolute inset-0 bg-gradient-to-r from-cinema-base via-cinema-base/70 to-transparent" />
        <div class="absolute inset-0 bg-gradient-to-t from-cinema-base via-transparent to-cinema-base/50" />

        <div class="absolute inset-0 flex items-end px-4 pb-12 sm:px-6 lg:px-8 xl:px-12">
          <div class="flex w-full max-w-screen-xl items-end gap-6">
            <div class="hidden w-32 shrink-0 overflow-hidden rounded-xl shadow-2xl shadow-black/70 ring-1 ring-white/10 sm:block md:w-44">
              <img
                v-if="detail.posterUrl"
                :src="detail.posterUrl"
                :alt="detail.title"
                class="aspect-[2/3] w-full object-cover"
              />
            </div>

            <div class="min-w-0 flex-1 space-y-3 pb-1 animate-fade-up">
              <div class="flex flex-wrap items-center gap-2">
                <span class="rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-1 text-xs font-bold uppercase tracking-widest text-green-400">
                  {{ typeLabel }}
                </span>
                <span v-if="detail.year" class="text-sm text-slate-400">{{ detail.year }}</span>
                <span v-if="detail.status" class="rounded-full bg-white/8 px-2 py-0.5 text-xs text-slate-400">
                  {{ detail.status }}
                </span>
              </div>

              <h1 class="text-2xl font-extrabold leading-tight text-white sm:text-4xl">{{ detail.titleRu || detail.title }}</h1>
              <p v-if="detail.originalTitle && detail.originalTitle !== (detail.titleRu || detail.title)" class="text-sm text-slate-400">
                {{ detail.originalTitle }}
              </p>

              <div v-if="detail.genres.length" class="flex flex-wrap gap-1.5">
                <span
                  v-for="genre in detail.genres"
                  :key="genre"
                  class="cursor-default rounded-full border border-white/6 bg-white/6 px-2.5 py-1 text-xs text-slate-300 transition-colors hover:bg-white/10"
                >
                  {{ genre }}
                </span>
              </div>

              <p v-if="detail.description" class="line-clamp-3 max-w-2xl text-sm leading-relaxed text-slate-300">
                {{ detail.description }}
              </p>

              <div class="flex items-center gap-3 pt-1">
                <button
                  class="glow-green-sm flex items-center gap-2 rounded-xl bg-green-500 px-6 py-2.5 text-sm font-bold text-black transition-all hover:bg-green-400"
                  @click="handleWatch"
                >
                  <UIcon name="lucide:play" class="ml-0.5 size-4" />
                  {{ continueProgress ? 'Продолжить' : 'Смотреть' }}
                </button>
                <a
                  v-if="detail.kinopoiskId"
                  :href="`https://www.kinopoisk.ru/film/${detail.kinopoiskId}/`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="glass flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-white/10 hover:text-white"
                >
                  КП ↗
                </a>
                <a
                  v-if="detail.shikimoriId"
                  :href="`https://shikimori.one/animes/${detail.shikimoriId}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="glass flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-white/10 hover:text-white"
                >
                  Shikimori ↗
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-cinema-base to-transparent" />
      </div>

      <div class="mx-auto max-w-screen-xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        <div v-if="detail.screenshots.length" class="space-y-3">
          <h2 class="flex items-center gap-2 text-base font-bold text-white">
            <UIcon name="lucide:image" class="size-4 text-green-400" />
            Кадры
          </h2>
          <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            <img
              v-for="(src, index) in detail.screenshots"
              :key="index"
              :src="src"
              loading="lazy"
              class="aspect-video w-full rounded-xl object-cover ring-1 ring-white/5 transition-transform hover:scale-[1.02]"
            />
          </div>
        </div>

        <div v-if="sortedRelated.length" class="space-y-3">
          <h2 class="flex items-center gap-2 text-base font-bold text-white">
            <UIcon name="lucide:layers" class="size-4 text-green-400" />
            Порядок просмотра
          </h2>

          <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <div
              v-for="card in sortedRelated"
              :key="`${card.source}-${card.id}`"
              class="flex-shrink-0"
            >
              <RelatedCard :card="card" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import RelatedCard from '~/components/content/RelatedCard.vue'
import { loadAnimePreferences, saveAnimePreferences } from '~/composables/useAnimePreferences'
import { getAnimeById, getEpisodes, findSeason } from '~/services/animeService'
import type { AnimeDetail, EpisodeProgress, SeasonOption } from '~/types/content'

// Viewing order relation priority: prequels first, then main, then sequels/OVAs
const RELATION_ORDER: Record<string, number> = {
  'Приквел': 1,
  'Prequel': 1,
  'Полнометражный приквел': 2,
  'Продолжение': 4,
  'Sequel': 4,
  'Полнометражное продолжение': 5,
  'Побочная история': 6,
  'Side story': 6,
  'Альтернативная версия': 7,
  'Alternative version': 7,
  'Спин-офф': 8,
  'Spin-off': 8,
  'Дополнение': 9,
  'OVA': 9,
}

const route = useRoute()
const router = useRouter()
const externalId = computed(() => decodeURIComponent(route.params.id as string))

const detail = ref<AnimeDetail | null>(null)
const pagePending = ref(true)
const error = ref<unknown | null>(null)
const titleProgress = ref<EpisodeProgress[]>([])
const displaySeasons = ref<AnimeDetail['seasons']>([])
const seasonOptions = ref<SeasonOption[]>([])
const selectedTranslationId = ref<number | null>(null)
const selectedSeason = ref(1)
const selectedEpisode = ref(1)

const { loadTitleProgress } = useWatchProgress()

const pending = computed(() => pagePending.value)
const sortedRelated = computed(() => {
  if (!detail.value?.related.length) return []
  return [...detail.value.related].sort((a, b) => {
    const oa = RELATION_ORDER[a.relation ?? ''] ?? 3
    const ob = RELATION_ORDER[b.relation ?? ''] ?? 3
    if (oa !== ob) return oa - ob
    return (a.year ?? 0) - (b.year ?? 0)
  })
})
const latestProgress = computed(() =>
  titleProgress.value.find((item) => !item.completed) ?? titleProgress.value[0] ?? null,
)
const continueProgress = computed(() =>
  titleProgress.value.find((item) => !item.completed && item.currentTime > 5) ?? latestProgress.value,
)

const typeLabel = computed(() => {
  const map: Record<string, string> = {
    'anime-serial': 'Аниме-сериал',
    anime: 'Аниме-фильм',
  }

  return map[detail.value?.type ?? ''] ?? 'Аниме'
})

function resolveEpisodeNumber(
  seasonNumber: number | undefined,
  episodeNumber: number | undefined,
): number {
  const season = findSeason(displaySeasons.value, seasonNumber)
  if (!season?.episodes.length) return 1
  return season.episodes.find((episode) => episode.number === episodeNumber)?.number ?? season.episodes[0]?.number ?? 1
}

function persistSelection(): void {
  saveAnimePreferences(externalId.value, {
    translationId: selectedTranslationId.value ?? undefined,
    season: selectedSeason.value,
    episode: selectedEpisode.value,
  })
}

function applySeasonEpisodeSelection(
  preferredSeason?: number,
  preferredEpisode?: number,
): void {
  const season = findSeason(displaySeasons.value, preferredSeason)
  selectedSeason.value = season?.number ?? 1
  selectedEpisode.value = resolveEpisodeNumber(selectedSeason.value, preferredEpisode)
  persistSelection()
}

async function applyTranslation(translationId: number, usePersistedSelection = true): Promise<void> {
  if (!detail.value) return

  const previousTranslationId = selectedTranslationId.value
  const previousSeasons = displaySeasons.value
  const previousSeasonOptions = seasonOptions.value

  try {
    const response = await getEpisodes(externalId.value, translationId)
    const nextTranslationId = response.translation?.id ?? translationId

    displaySeasons.value = response.seasons
    seasonOptions.value = response.seasonOptions
    selectedTranslationId.value = nextTranslationId
    detail.value = {
      ...detail.value,
      seasons: response.seasons,
      seasonOptions: response.seasonOptions,
      playerUrl: response.playerUrl,
      translation: response.translation ?? detail.value.translation,
    }
  } catch (err) {
    console.warn('[title] failed to load seasons for translation:', err)
    selectedTranslationId.value = previousTranslationId
    displaySeasons.value = previousSeasons
    seasonOptions.value = previousSeasonOptions
  }

  const persisted = loadAnimePreferences(externalId.value)
  const progress = latestProgress.value
  applySeasonEpisodeSelection(
    usePersistedSelection ? (persisted?.season ?? progress?.season) : selectedSeason.value,
    usePersistedSelection ? (persisted?.episode ?? progress?.episode) : selectedEpisode.value,
  )
}

async function hydrateClientState(): Promise<void> {
  if (!detail.value) return

  titleProgress.value = await loadTitleProgress(externalId.value)
  const persisted = loadAnimePreferences(externalId.value)
  const progress = latestProgress.value
  const preferredTranslationId = persisted?.translationId ?? progress?.translationId ?? detail.value.translation.id

  if (preferredTranslationId !== detail.value.translation.id) {
    await applyTranslation(preferredTranslationId, true)
  } else {
    selectedTranslationId.value = detail.value.translation.id
    displaySeasons.value = detail.value.seasons
    seasonOptions.value = detail.value.seasonOptions
    applySeasonEpisodeSelection(persisted?.season ?? progress?.season, persisted?.episode ?? progress?.episode)
  }
}

async function loadTitlePage(): Promise<void> {
  pagePending.value = true
  error.value = null

  try {
    const data = await getAnimeById(externalId.value)
    detail.value = data
    displaySeasons.value = data.seasons
    seasonOptions.value = data.seasonOptions
    selectedTranslationId.value = data.translation.id
    selectedSeason.value = data.seasons[0]?.number ?? 1
    selectedEpisode.value = data.seasons[0]?.episodes[0]?.number ?? 1

    if (import.meta.client) {
      await hydrateClientState()
    }
  } catch (err) {
    error.value = err
    detail.value = null
    displaySeasons.value = []
    seasonOptions.value = []
  } finally {
    pagePending.value = false
  }
}

function buildWatchUrl(
  season?: number,
  episode?: number,
  time?: number,
  translationId?: number,
): string {
  const params = new URLSearchParams()
  if (season) params.set('season', String(season))
  if (episode) params.set('episode', String(episode))
  if (translationId) params.set('translationId', String(translationId))
  if (time) params.set('t', String(Math.floor(time)))

  const query = params.toString()
  return query
    ? `/watch/${encodeURIComponent(externalId.value)}?${query}`
    : `/watch/${encodeURIComponent(externalId.value)}`
}

function handleWatch(): void {
  if (continueProgress.value) {
    router.push(
      buildWatchUrl(
        continueProgress.value.season ?? selectedSeason.value,
        continueProgress.value.episode ?? selectedEpisode.value,
        continueProgress.value.currentTime,
        continueProgress.value.translationId ?? selectedTranslationId.value ?? undefined,
      ),
    )
    return
  }

  router.push(
    buildWatchUrl(
      selectedSeason.value,
      selectedEpisode.value,
      undefined,
      selectedTranslationId.value ?? undefined,
    ),
  )
}

if (import.meta.server) {
  await loadTitlePage()
} else {
  onMounted(() => {
    void loadTitlePage()
  })
}

watch(externalId, () => {
  if (import.meta.client) {
    void loadTitlePage()
  }
})

useHead({
  title: computed(() => (detail.value ? `${detail.value.titleRu || detail.value.title} — AniBox` : 'AniBox')),
})
</script>
