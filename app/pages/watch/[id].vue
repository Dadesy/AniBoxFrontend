<template>
  <div class="min-h-screen bg-cinema-base pt-16">
    <div class="flex items-center gap-3 border-b border-white/5 px-4 py-3 sm:px-6 lg:px-8">
      <NuxtLink
        :to="`/title/${encodeURIComponent(externalId)}`"
        class="flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <UIcon name="lucide:arrow-left" class="size-4" />
        К тайтлу
      </NuxtLink>
      <span v-if="detail" class="select-none text-slate-600">·</span>
      <span v-if="detail" class="truncate text-sm font-medium text-white">
        {{ detail.title }}
        <template v-if="currentSeason"> · Сезон {{ currentSeason }}</template>
        <template v-if="currentEpisode"> · Эпизод {{ currentEpisode }}</template>
      </span>
    </div>

    <div class="flex min-h-0 flex-col xl:flex-row xl:items-stretch">
      <div class="min-h-0 min-w-0 flex-1 p-4 sm:p-6">
        <PlayerContainer
          ref="playerContainerRef"
          :title="detail?.title"
          :player-url="playerSourceUrl"
          :start-time="startTime"
          :loading="loadingPlayer"
          :error-message="playerError"
          :season="currentSeason"
          :episode="currentEpisode"
          :next-episode-number="nextEpisodeNumber"
          @time-update="onTimeUpdate"
          @pause="onPause"
          @ended="onEnded"
          @episode-change="onPlayerEpisodeChange"
        />

        <Transition name="slide-up">
          <div
            v-if="resumePrompt"
            class="glass mx-auto mt-4 flex max-w-4xl items-center gap-4 rounded-2xl px-4 py-3"
          >
            <UIcon name="lucide:clock-3" class="size-5 shrink-0 text-green-400" />
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-white">Продолжить с {{ formatTime(startTime ?? 0) }}?</p>
              <p class="text-xs text-slate-400">Найдено сохранённое место</p>
            </div>
            <div class="flex shrink-0 gap-2">
              <button
                class="rounded-lg bg-green-500 px-3 py-1.5 text-xs font-bold text-black transition-colors hover:bg-green-400"
                @click="applyResume"
              >
                Продолжить
              </button>
              <button
                class="rounded-lg bg-white/6 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10"
                @click="resumePrompt = false"
              >
                С начала
              </button>
            </div>
          </div>
        </Transition>

      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import PlayerContainer from '~/components/player/PlayerContainer.vue'
import { loadAnimePreferences, saveAnimePreferences } from '~/composables/useAnimePreferences'
import { findSeason, getAnimeById } from '~/services/animeService'
import type { AnimeDetail, EpisodeProgress, SaveProgressPayload } from '~/types/content'

interface PlayerContainerExpose {
  seek?: (time: number) => void
  getState?: () => { currentTime?: number; duration?: number } | undefined
}

const route = useRoute()
const router = useRouter()
const externalId = computed(() => decodeURIComponent(route.params.id as string))
const qSeason = computed(() => (route.query.season ? Number(route.query.season) : undefined))
const qEpisode = computed(() => (route.query.episode ? Number(route.query.episode) : undefined))
const qTranslationId = computed(() => (route.query.translationId ? Number(route.query.translationId) : undefined))
const qTime = computed(() => (route.query.t ? Number(route.query.t) : undefined))

const detail = ref<AnimeDetail | null>(null)
const availableSeasons = ref<AnimeDetail['seasons']>([])
const playerError = ref<string | null>(null)
const loadingPlayer = ref(true)
const activeTranslationId = ref<number | null>(null)
const currentSeason = ref<number | undefined>(undefined)
const currentEpisode = ref<number | undefined>(undefined)
const startTime = ref<number | undefined>(undefined)
const resumePrompt = ref(false)
const titleProgress = ref<EpisodeProgress[]>([])
const playerContainerRef = ref<PlayerContainerExpose | null>(null)
const playerSourceUrl = ref('')

const { scheduleSave, saveNow, loadProgress, loadTitleProgress } = useWatchProgress()

function getPlayerState(): { currentTime: number; duration: number } {
  const state = playerContainerRef.value?.getState?.()
  return {
    currentTime: state?.currentTime ?? 0,
    duration: state?.duration ?? 0,
  }
}

function persistSelection(): void {
  saveAnimePreferences(externalId.value, {
    translationId: activeTranslationId.value ?? undefined,
    season: currentSeason.value,
    episode: currentEpisode.value,
  })
}

function resolveEpisodeNumber(
  seasonNumber: number | undefined,
  episodeNumber: number | undefined,
): number {
  const season = findSeason(availableSeasons.value, seasonNumber)
  if (!season?.episodes.length) return 1

  return season.episodes.find((episode) => episode.number === episodeNumber)?.number
    ?? season.episodes[0]?.number
    ?? 1
}

function syncRouteState(extraTime?: number): void {
  const query: Record<string, string> = {}
  if (currentSeason.value) query.season = String(currentSeason.value)
  if (currentEpisode.value) query.episode = String(currentEpisode.value)
  if (activeTranslationId.value) query.translationId = String(activeTranslationId.value)
  if (extraTime && extraTime > 5) query.t = String(Math.floor(extraTime))

  if (!import.meta.client) return

  const params = new URLSearchParams(query)
  const nextUrl = params.toString()
    ? `/watch/${encodeURIComponent(externalId.value)}?${params.toString()}`
    : `/watch/${encodeURIComponent(externalId.value)}`

  window.history.replaceState(window.history.state, '', nextUrl)
}

// ── AniLibria HLS helpers ─────────────────────────────────────────────────────

const isHlsSource = computed(() => detail.value?.sourceProvider === 'anilibria')

/** HLS URL for the currently selected episode (AniLibria only) */
const currentEpisodeLink = computed((): string => {
  if (!isHlsSource.value) return ''
  const season = availableSeasons.value.find((s) => s.number === currentSeason.value)
    ?? availableSeasons.value[0]
  const ep = season?.episodes.find((e) => e.number === currentEpisode.value)
    ?? season?.episodes[0]
  return ep?.link ?? ''
})

/** Next episode number in the current season (for auto-advance prompt) */
const nextEpisodeNumber = computed((): number | undefined => {
  if (!isHlsSource.value) return undefined
  const season = availableSeasons.value.find((s) => s.number === currentSeason.value)
  if (!season) return undefined
  const idx = season.episodes.findIndex((e) => e.number === currentEpisode.value)
  return idx >= 0 && idx < season.episodes.length - 1
    ? season.episodes[idx + 1]!.number
    : undefined
})

// Sync HLS source URL when episode changes
watch(currentEpisodeLink, (link) => {
  if (isHlsSource.value && link) playerSourceUrl.value = link
})

// ── Progress payload ──────────────────────────────────────────────────────────

function buildProgressPayload(time: number, duration: number): SaveProgressPayload {
  const activeTranslation = detail.value?.allTranslations.find((item) => item.id === activeTranslationId.value)

  return {
    externalId: externalId.value,
    sourceProvider: detail.value?.sourceProvider ?? 'kodik',
    title: detail.value?.title ?? '',
    posterUrl: detail.value?.posterUrl,
    contentType: detail.value?.type,
    season: currentSeason.value,
    episode: currentEpisode.value,
    translationId: activeTranslationId.value ?? undefined,
    translationName: activeTranslation?.title ?? detail.value?.translation.title,
    currentTime: time,
    duration,
  }
}

async function loadDetail(): Promise<void> {
  loadingPlayer.value = true
  playerError.value = null

  try {
    const data = await getAnimeById(externalId.value)
    detail.value = data
    availableSeasons.value = data.seasons

    titleProgress.value = await loadTitleProgress(externalId.value)
    const latestProgress = titleProgress.value.find((item) => !item.completed) ?? titleProgress.value[0] ?? null
    const persisted = loadAnimePreferences(externalId.value)

    activeTranslationId.value = qTranslationId.value
      ?? persisted?.translationId
      ?? latestProgress?.translationId
      ?? data.translation.id

    currentSeason.value = findSeason(
      data.seasons,
      qSeason.value ?? persisted?.season ?? latestProgress?.season,
    )?.number ?? data.seasons[0]?.number

    currentEpisode.value = resolveEpisodeNumber(
      currentSeason.value,
      qEpisode.value ?? persisted?.episode ?? latestProgress?.episode,
    )

    if (data.sourceProvider === 'anilibria') {
      // HLS mode: use current episode's m3u8 link as player source
      const firstSeason = data.seasons[0]
      const firstEp = firstSeason?.episodes.find((e) => e.number === currentEpisode.value)
        ?? firstSeason?.episodes[0]
      playerSourceUrl.value = firstEp?.link ?? ''
      if (!playerSourceUrl.value) {
        playerError.value = 'Видеофайл недоступен'
      }
    } else {
      if (!data.seasons.length && !data.playerUrl) {
        playerError.value = 'Серии для этого тайтла пока недоступны'
      }
      playerSourceUrl.value = data.playerUrl
    }
    syncRouteState()
    persistSelection()

    const saved = await loadProgress(
      externalId.value,
      currentSeason.value,
      currentEpisode.value,
      activeTranslationId.value ?? undefined,
    )

    if (saved && saved.currentTime > 5) {
      startTime.value = qTime.value ?? saved.currentTime
      if (!qTime.value) resumePrompt.value = true
    } else if (qTime.value) {
      startTime.value = qTime.value
    }
  } catch (err) {
    console.warn('[watch] load detail failed:', err)
    playerError.value = 'Не удалось загрузить данные просмотра'
  } finally {
    loadingPlayer.value = false
  }
}

function onTimeUpdate(time: number, duration: number): void {
  scheduleSave(buildProgressPayload(time, duration))
}

function onPause(_time: number): void {
  // kodik_player_pause carries no time value; read from player state instead
  const { currentTime, duration } = getPlayerState()
  void saveNow(buildProgressPayload(currentTime, duration))
}

function onEnded(): void {
  const { currentTime, duration } = getPlayerState()
  const t = duration > 0 ? duration : currentTime
  void saveNow(buildProgressPayload(t, t > 0 ? t : currentTime))

  // AniLibria HLS: auto-advance to next episode
  if (isHlsSource.value && nextEpisodeNumber.value) {
    onPlayerEpisodeChange(currentSeason.value ?? 1, nextEpisodeNumber.value)
  }
}

function onPlayerEpisodeChange(season: number, episode: number, translationId?: number): void {
  currentSeason.value = season
  currentEpisode.value = episode
  if (translationId) {
    activeTranslationId.value = translationId
  }
  startTime.value = undefined
  resumePrompt.value = false
  syncRouteState()
  persistSelection()
}

function applyResume(): void {
  resumePrompt.value = false
  playerContainerRef.value?.seek(startTime.value ?? 0)
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainder = Math.floor(seconds % 60)
  return `${minutes}:${remainder.toString().padStart(2, '0')}`
}

// No redirects — AniLibria content is played via built-in HLS player

onMounted(() => {
  void loadDetail()
})

watch(externalId, () => {
  void loadDetail()
})

onBeforeUnmount(() => {
  const { currentTime, duration } = getPlayerState()

  if (currentTime > 5 && detail.value) {
    void saveNow(buildProgressPayload(currentTime, duration))
  }
})

const { pageTitle } = useSiteBranding()

useHead({
  title: computed(() =>
    detail.value
      ? pageTitle(
          `${detail.value.title}${currentEpisode.value ? ` — Эп. ${currentEpisode.value}` : ''}`,
        )
      : pageTitle('Просмотр'),
  ),
})
</script>

<style scoped>
.slide-up-enter-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.slide-up-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.slide-up-enter-from { opacity: 0; transform: translateY(8px); }
.slide-up-leave-to { opacity: 0; transform: translateY(8px); }
</style>
