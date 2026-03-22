<template>
  <div class="min-h-screen bg-cinema-base">
    <div class="border-b border-white/6 px-4 py-3 sm:px-6 lg:px-8">
      <div class="mx-auto flex max-w-screen-xl items-center justify-between gap-3">
        <NuxtLink
          :to="detailLink"
          class="inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
        >
          <UIcon name="lucide:arrow-left" class="size-4" />
          К тайтлу
        </NuxtLink>
        <p v-if="watchData" class="truncate text-sm font-medium text-white">
          {{ watchData.anime.titleRu || watchData.anime.title }}
          <template v-if="currentSeason"> · Сезон {{ currentSeason }}</template>
          <template v-if="currentEpisode"> · Эпизод {{ currentEpisode }}</template>
        </p>
      </div>
    </div>

    <div v-if="pending" class="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="aspect-video rounded-[28px] skeleton-shine" />
    </div>

    <div v-else-if="!watchData" class="flex min-h-[60vh] items-center justify-center px-4 text-center">
      <div class="space-y-4">
        <UIcon name="lucide:alert-circle" class="mx-auto size-12 text-red-400" />
        <p class="text-slate-300">Не удалось подготовить просмотр</p>
      </div>
    </div>

    <div v-else class="mx-auto flex max-w-screen-xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <AnimePlayer
        :key="playerRenderKey"
        ref="playerRef"
        :title="watchData.anime.titleRu || watchData.anime.title"
        :player-url="watchData.playerUrl"
        :loading="pending"
        :error-message="playerError"
        :season="currentSeason"
        :episode="currentEpisode"
        :start-time="startTime"
        :next-episode-number="nextEpisodeNumber"
        @time-update="onTimeUpdate"
        @pause="onPause"
        @ended="onEnded"
        @episode-change="onPlayerEpisodeChange"
      />

      <Transition name="slide-up">
        <div
          v-if="resumePrompt"
          class="rounded-3xl border border-white/10 bg-white/[0.04] px-4 py-3"
        >
          <div class="flex flex-wrap items-center gap-3">
            <div class="flex min-w-0 flex-1 items-center gap-3">
              <UIcon name="lucide:clock-3" class="size-5 text-emerald-400" />
              <div class="min-w-0">
                <p class="text-sm font-medium text-white">Продолжить с {{ formatTime(startTime ?? 0) }}?</p>
                <p class="text-xs text-slate-400">Найдено сохранённое место просмотра</p>
              </div>
            </div>
            <div class="flex gap-2">
              <button
                type="button"
                class="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black"
                @click="applyResume"
              >
                Продолжить
              </button>
              <button
                type="button"
                class="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-slate-200"
                @click="resumeFromStart"
              >
                С начала
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div class="space-y-5">
          <section class="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
            <div class="space-y-3">
              <div>
                <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Источник видео</p>
                <PlayerSelector
                  class="mt-3"
                  :players="watchData.availablePlayers"
                  :active-external-id="watchData.selectedPlayer?.externalId"
                  @select="switchPlayer"
                />
              </div>

              <div v-if="watchData.blockedReason" class="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                {{ watchData.blockedReason }}
              </div>

              <div class="grid gap-3 sm:grid-cols-3">
                <div class="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                  <p class="text-xs text-slate-500">Плеер</p>
                  <p class="mt-1 text-sm font-semibold text-white">{{ watchData.selectedPlayer?.label || 'Недоступно' }}</p>
                </div>
                <div class="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                  <p class="text-xs text-slate-500">Статус</p>
                  <p class="mt-1 text-sm font-semibold text-white">{{ watchData.anime.status || '—' }}</p>
                </div>
                <div class="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                  <p class="text-xs text-slate-500">Доступно серий</p>
                  <p class="mt-1 text-sm font-semibold text-white">{{ watchData.anime.availableEpisodes || watchData.seasons.reduce((sum, season) => sum + season.episodes.length, 0) || '—' }}</p>
                </div>
              </div>
            </div>
          </section>

          <section v-if="watchData.seasons.length" class="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
            <div class="mb-4">
              <h2 class="text-lg font-bold text-white">Серии</h2>
              <p class="text-sm text-slate-400">Сезон, эпизод и активный источник управляются только через backend DTO</p>
            </div>
            <EpisodeList
              :seasons="watchData.seasons"
              :active-season="currentSeason"
              :active-episode="currentEpisode"
              @select-season="selectSeason"
              @select-episode="selectEpisode"
            />
          </section>
        </div>

        <aside class="space-y-4">
          <div class="overflow-hidden rounded-[28px] border border-white/8 bg-white/[0.03]">
            <img
              v-if="watchData.anime.poster"
              :src="watchData.anime.poster"
              :alt="watchData.anime.titleRu || watchData.anime.title"
              class="aspect-[2/3] w-full object-cover"
            >
            <div class="space-y-2 px-5 py-5">
              <NuxtLink
                :to="detailLink"
                class="block text-lg font-bold text-white transition-colors hover:text-emerald-300"
              >
                {{ watchData.anime.titleRu || watchData.anime.title }}
              </NuxtLink>
              <p class="text-sm text-slate-400">
                {{ [watchData.anime.year, watchData.anime.status].filter(Boolean).join(' · ') }}
              </p>
              <p v-if="watchData.anime.description" class="line-clamp-6 text-sm leading-6 text-slate-300">
                {{ watchData.anime.description }}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AnimePlayer from '~/components/anime/AnimePlayer.vue'
import EpisodeList from '~/components/anime/EpisodeList.vue'
import PlayerSelector from '~/components/anime/PlayerSelector.vue'
import { getAnimeWatch } from '~/services/animeService'
import type {
  AnimePlayerOption,
  AnimeWatchResponse,
  EpisodeProgress,
  SaveProgressPayload,
} from '~/types/content'

interface AnimePlayerExpose {
  seek?: (time: number) => void
  getState?: () => { currentTime?: number; duration?: number } | undefined
}

const route = useRoute()
const router = useRouter()

const identifier = computed(() => decodeURIComponent(route.params.slug as string))
const qPlayer = computed(() => (route.query.player as 'kodik' | 'anilibria' | undefined) ?? undefined)
const qSeason = computed(() => (route.query.season ? Number(route.query.season) : undefined))
const qEpisode = computed(() => (route.query.episode ? Number(route.query.episode) : undefined))
const qTranslationId = computed(() => (route.query.translationId ? Number(route.query.translationId) : undefined))
const qTime = computed(() => (route.query.t ? Number(route.query.t) : undefined))

const { data, pending, refresh } = await useAsyncData<AnimeWatchResponse | null>(
  () => `anime-watch:${identifier.value}:${JSON.stringify(route.query)}`,
  () => getAnimeWatch(identifier.value, {
    player: qPlayer.value,
    season: qSeason.value,
    episode: qEpisode.value,
    translationId: qTranslationId.value,
  }),
  {
    watch: [identifier, () => route.fullPath],
    default: () => null,
  },
)

const watchData = computed(() => data.value)
const playerRef = ref<AnimePlayerExpose | null>(null)
const playerError = ref<string | null>(null)
const startTime = ref<number | undefined>(undefined)
const resumePrompt = ref(false)
const titleProgress = ref<EpisodeProgress[]>([])
const lastKnownDuration = ref(0)

const currentSeason = computed(() =>
  watchData.value?.season
  ?? watchData.value?.seasons[0]?.number
  ?? 1,
)

const currentEpisode = computed(() =>
  watchData.value?.episode
  ?? watchData.value?.seasons.find((season) => season.number === currentSeason.value)?.episodes[0]?.number
  ?? 1,
)

const nextEpisodeNumber = computed(() => {
  const season = watchData.value?.seasons.find((item) => item.number === currentSeason.value)
  if (!season) return undefined
  const index = season.episodes.findIndex((item) => item.number === currentEpisode.value)
  return index >= 0 && index < season.episodes.length - 1
    ? season.episodes[index + 1]?.number
    : undefined
})

const playerRenderKey = computed(() =>
  [
    identifier.value,
    watchData.value?.selectedPlayer?.externalId,
    watchData.value?.playerUrl,
    currentSeason.value,
    currentEpisode.value,
  ].join('|'),
)

const detailLink = computed(() => {
  const slug = watchData.value?.selectedPlayer?.slug || watchData.value?.anime.slug || identifier.value
  return `/anime/${encodeURIComponent(slug)}`
})

const { scheduleSave, saveNow, loadProgress, loadTitleProgress } = useWatchProgress()

watch(
  () => watchData.value?.anime.externalId,
  async (externalId) => {
    titleProgress.value = externalId ? await loadTitleProgress(externalId) : []

    if (!externalId || !watchData.value?.selectedPlayer?.provider) {
      startTime.value = qTime.value
      resumePrompt.value = false
      return
    }

    const saved = await loadProgress(
      externalId,
      currentSeason.value,
      currentEpisode.value,
      watchData.value.translationId,
      watchData.value.selectedPlayer.provider,
    )

    if (saved && saved.currentTime > 5) {
      startTime.value = qTime.value ?? saved.currentTime
      resumePrompt.value = !qTime.value
      return
    }

    startTime.value = qTime.value
    resumePrompt.value = false
  },
  { immediate: true },
)

function buildRouteQuery(input: {
  player?: 'kodik' | 'anilibria'
  season?: number
  episode?: number
  translationId?: number
  t?: number
} = {}): Record<string, string> {
  const query: Record<string, string> = {}
  const player = input.player ?? watchData.value?.selectedPlayer?.provider
  const season = input.season ?? currentSeason.value
  const episode = input.episode ?? currentEpisode.value
  const translationId = input.translationId ?? watchData.value?.translationId

  if (player) query.player = player
  if (season) query.season = String(season)
  if (episode) query.episode = String(episode)
  if (translationId) query.translationId = String(translationId)
  if (input.t && input.t > 5) query.t = String(Math.floor(input.t))

  return query
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainder = Math.floor(seconds % 60)
  return `${minutes}:${String(remainder).padStart(2, '0')}`
}

function getPlayerState(): { currentTime: number; duration: number } {
  const state = playerRef.value?.getState?.()
  return {
    currentTime: state?.currentTime ?? 0,
    duration: state?.duration ?? 0,
  }
}

function buildProgressPayload(currentTime: number, duration: number): SaveProgressPayload | null {
  const externalId = watchData.value?.anime.externalId
  const provider = watchData.value?.selectedPlayer?.provider
  if (!externalId || !provider || !watchData.value) return null

  const resolvedDuration = duration > 0 ? duration : lastKnownDuration.value
  if (resolvedDuration > 0) lastKnownDuration.value = resolvedDuration

  return {
    externalId,
    sourceProvider: provider,
    title: watchData.value.anime.titleRu || watchData.value.anime.title,
    posterUrl: watchData.value.anime.poster,
    season: currentSeason.value,
    episode: currentEpisode.value,
    translationId: watchData.value.translationId,
    translationName: watchData.value.translationName,
    currentTime,
    duration: resolvedDuration,
  }
}

function onTimeUpdate(time: number, duration: number): void {
  const payload = buildProgressPayload(time, duration)
  if (!payload) return
  scheduleSave(payload)
}

function onPause(): void {
  const state = getPlayerState()
  const payload = buildProgressPayload(state.currentTime, state.duration)
  if (!payload) return
  void saveNow(payload)
}

async function onEnded(): Promise<void> {
  const state = getPlayerState()
  const payload = buildProgressPayload(state.duration || state.currentTime, state.duration || state.currentTime)
  if (payload) {
    await saveNow(payload)
  }

  if (watchData.value?.selectedPlayer?.provider === 'anilibria' && nextEpisodeNumber.value) {
    await selectEpisode({ season: currentSeason.value, episode: nextEpisodeNumber.value })
  }
}

function applyResume(): void {
  resumePrompt.value = false
  playerRef.value?.seek?.(startTime.value ?? 0)
}

function resumeFromStart(): void {
  resumePrompt.value = false
  startTime.value = undefined
  playerRef.value?.seek?.(0)
}

async function switchPlayer(player: AnimePlayerOption): Promise<void> {
  await navigateTo({
    path: `/watch/${encodeURIComponent(player.slug)}`,
    query: buildRouteQuery({
      player: player.provider,
    }),
  })
}

async function selectSeason(season: number): Promise<void> {
  const episode = watchData.value?.seasons.find((item) => item.number === season)?.episodes[0]?.number ?? 1
  await selectEpisode({ season, episode })
}

async function selectEpisode(payload: { season: number; episode: number }): Promise<void> {
  await router.replace({
    path: route.path,
    query: buildRouteQuery({
      season: payload.season,
      episode: payload.episode,
    }),
  })
  await refresh()
}

async function onPlayerEpisodeChange(season: number, episode: number, translationId?: number): Promise<void> {
  await router.replace({
    path: route.path,
    query: buildRouteQuery({
      season,
      episode,
      translationId,
    }),
  })
}

onBeforeUnmount(() => {
  const state = getPlayerState()
  const payload = buildProgressPayload(state.currentTime, state.duration)
  if (!payload || state.currentTime <= 5) return
  void saveNow(payload)
})

const { pageTitle } = useSiteBranding()

useHead({
  title: computed(() =>
    watchData.value
      ? pageTitle(`${watchData.value.anime.titleRu || watchData.value.anime.title} — просмотр`)
      : pageTitle('Просмотр'),
  ),
})
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
