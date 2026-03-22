<template>
  <div class="min-h-screen bg-cinema-base">

    <!-- ═══════════════════════════════════════════════════════════════
         CINEMA TOPBAR
    ════════════════════════════════════════════════════════════════ -->
    <header class="sticky top-0 z-30 border-b border-white/[0.06] bg-black/60 backdrop-blur-xl">
      <div class="mx-auto flex max-w-screen-xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <NuxtLink
          :to="detailLink"
          class="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-1.5 text-sm text-slate-400 transition-all hover:border-white/14 hover:bg-white/[0.07] hover:text-white"
        >
          <UIcon name="lucide:arrow-left" class="size-3.5" />
          К тайтлу
        </NuxtLink>

        <div v-if="watchData" class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-white/90">
            {{ watchData.anime.titleRu || watchData.anime.title }}
          </p>
          <p v-if="currentSeason || currentEpisode" class="text-xs text-slate-500">
            <template v-if="currentSeason">Сезон {{ currentSeason }}</template>
            <template v-if="currentEpisode"> · Эпизод {{ currentEpisode }}</template>
          </p>
        </div>

        <!-- Episode quick-jump badge (shows current) -->
        <div
          v-if="currentEpisode"
          class="hidden shrink-0 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 sm:block"
        >
          эп. {{ currentEpisode }}
        </div>
      </div>
    </header>

    <!-- ── Loading ── -->
    <div v-if="pending" class="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="aspect-video rounded-[28px] skeleton-shine" />
    </div>

    <!-- ── Error ── -->
    <div v-else-if="!watchData" class="flex min-h-[60vh] items-center justify-center px-4 text-center">
      <div class="space-y-4">
        <UIcon name="lucide:alert-circle" class="mx-auto size-12 text-red-400" />
        <p class="text-slate-300">Не удалось подготовить просмотр</p>
        <NuxtLink
          to="/"
          class="inline-flex min-h-11 items-center justify-center rounded-2xl bg-emerald-500 px-5 text-sm font-semibold text-black"
        >
          На главную
        </NuxtLink>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════
         MAIN WATCH LAYOUT
    ════════════════════════════════════════════════════════════════ -->
    <div v-else class="mx-auto flex max-w-screen-xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">

        <!-- ═══════════════════════════════════════════════════════════════
           PLAYER + SIDEBAR (same row on xl)
      ════════════════════════════════════════════════════════════════ -->
      <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">

        <!-- ── Left: player + controls ── -->
        <div class="space-y-5">

          <!-- Player -->
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

          <!-- Resume prompt -->
          <Transition name="slide-up">
            <div
              v-if="resumePrompt"
              class="overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.07]"
              style="box-shadow: 0 0 0 1px rgba(16,185,129,0.08);"
            >
              <div class="flex flex-wrap items-center gap-3 px-4 py-3.5">
                <div class="flex min-w-0 flex-1 items-center gap-3">
                  <div class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15">
                    <UIcon name="lucide:clock-3" class="size-4 text-emerald-400" />
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-white">Продолжить с {{ formatTime(startTime ?? 0) }}?</p>
                    <p class="text-xs text-slate-400">Найдено сохранённое место просмотра</p>
                  </div>
                </div>
                <div class="flex shrink-0 gap-2">
                  <button
                    type="button"
                    class="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-emerald-400"
                    @click="applyResume"
                  >
                    Продолжить
                  </button>
                  <button
                    type="button"
                    class="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/[0.08]"
                    @click="resumeFromStart"
                  >
                    С начала
                  </button>
                </div>
              </div>
            </div>
          </Transition>

          <!-- Source selector -->
          <section
            class="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025]"
            style="box-shadow: 0 4px 24px rgba(0,0,0,0.30);"
          >
            <div
              class="h-px w-full"
              style="background: linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.18) 50%, transparent 100%);"
              aria-hidden="true"
            />
            <div class="space-y-4 p-5">
              <div class="flex items-center gap-2">
                <div class="h-[1em] w-[3px] shrink-0 rounded-full bg-emerald-500/55" aria-hidden="true" />
                <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Источник видео</p>
              </div>
              <PlayerSelector
                :players="watchData.availablePlayers"
                :active-external-id="watchData.selectedPlayer?.externalId"
                @select="switchPlayer"
              />
              <div
                v-if="watchData.blockedReason"
                class="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
              >
                {{ watchData.blockedReason }}
              </div>
              <div class="grid grid-cols-3 gap-3">
                <div class="rounded-xl border border-white/[0.07] bg-black/20 px-4 py-3">
                  <p class="text-[10px] text-slate-500">Плеер</p>
                  <p class="mt-1 text-sm font-semibold text-white">{{ watchData.selectedPlayer?.label || '—' }}</p>
                </div>
                <div class="rounded-xl border border-white/[0.07] bg-black/20 px-4 py-3">
                  <p class="text-[10px] text-slate-500">Статус</p>
                  <p class="mt-1 text-sm font-semibold text-white">{{ watchData.anime.status || '—' }}</p>
                </div>
                <div class="rounded-xl border border-white/[0.07] bg-black/20 px-4 py-3">
                  <p class="text-[10px] text-slate-500">Серий</p>
                  <p class="mt-1 text-sm font-semibold text-white">
                    {{ watchData.anime.availableEpisodes || watchData.seasons.reduce((s, season) => s + season.episodes.length, 0) || '—' }}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <!-- Episode list -->
          <section
            v-if="watchData.seasons.length"
            class="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025]"
            style="box-shadow: 0 4px 24px rgba(0,0,0,0.30);"
          >
            <div
              class="h-px w-full"
              style="background: linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.18) 50%, transparent 100%);"
              aria-hidden="true"
            />
            <div class="p-5">
              <div class="mb-4 flex items-center gap-2">
                <div class="h-[1em] w-[3px] shrink-0 rounded-full bg-emerald-500/55" aria-hidden="true" />
                <h2 class="text-base font-bold text-white">Серии</h2>
              </div>
              <EpisodeList
                :seasons="watchData.seasons"
                :active-season="currentSeason"
                :active-episode="currentEpisode"
                @select-season="selectSeason"
                @select-episode="selectEpisode"
              />
            </div>
          </section>
        </div>

        <!-- ── Right: Anime info sidebar (same level as player) ── -->
        <aside>
          <div class="sticky top-[4.5rem] space-y-4">
            <div
              class="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025]"
              style="box-shadow: 0 4px 32px rgba(0,0,0,0.38);"
            >
              <div class="relative overflow-hidden">
                <img
                  v-if="watchData.anime.poster"
                  :src="watchData.anime.poster"
                  :alt="watchData.anime.titleRu || watchData.anime.title"
                  referrerpolicy="no-referrer"
                  class="aspect-[2/3] w-full object-cover"
                />
                <div
                  v-if="watchData.anime.poster"
                  class="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[rgba(10,12,18,0.9)] to-transparent"
                />
              </div>
              <div class="space-y-3 px-5 py-5">
                <NuxtLink
                  :to="detailLink"
                  class="block text-base font-bold leading-snug text-white transition-colors hover:text-emerald-300"
                >
                  {{ watchData.anime.titleRu || watchData.anime.title }}
                </NuxtLink>
                <p class="text-xs text-slate-500">
                  {{ [watchData.anime.year, watchData.anime.status].filter(Boolean).join(' · ') }}
                </p>
                <p
                  v-if="watchData.anime.description"
                  class="line-clamp-5 text-sm leading-[1.7] text-slate-400"
                >
                  {{ watchData.anime.description }}
                </p>
                <NuxtLink
                  :to="detailLink"
                  class="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-xs text-slate-400 transition-all hover:border-emerald-500/25 hover:bg-emerald-500/[0.07] hover:text-emerald-400"
                >
                  Страница тайтла
                  <UIcon name="lucide:arrow-right" class="size-3" />
                </NuxtLink>
              </div>
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
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
