<template>
  <div class="min-h-screen bg-cinema-base">
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
      <div class="min-h-0 min-w-0 flex-1 px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
        <!-- Плеер: уже на мобилках на всю ширину, на ПК — компактная колонка по центру -->
        <div class="mx-auto w-full max-w-3xl lg:max-w-[52rem]">
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
        </div>

        <div
          v-if="detail?.watchSources && detail.watchSources.length > 1"
          class="mx-auto mt-4 w-full max-w-3xl lg:max-w-[52rem]"
        >
          <p class="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Источник видео
          </p>
          <div class="flex flex-wrap gap-2">
            <NuxtLink
              v-for="src in detail.watchSources"
              :key="src.externalId"
              :to="buildWatchUrlForSource(src)"
              class="inline-flex min-h-11 min-w-[5.5rem] items-center justify-center rounded-xl px-4 text-sm font-semibold transition-all active:scale-[0.98]"
              :class="
                src.externalId === externalId
                  ? 'bg-green-500 text-black shadow-[0_0_0_1px_rgba(255,255,255,0.12)]'
                  : 'border border-white/10 bg-white/[0.06] text-slate-200 hover:border-white/15 hover:bg-white/[0.1]'
              "
            >
              {{ src.label }}
            </NuxtLink>
          </div>
        </div>

        <div
          v-if="detail && isHlsSource && hlsSeasonForPicker"
          class="mx-auto mt-5 w-full max-w-3xl lg:max-w-[52rem]"
        >
          <div
            class="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] sm:p-5"
          >
            <!-- Шапка блока -->
            <div class="mb-4 flex items-start gap-3 sm:mb-5">
              <div
                class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-green-500/15 text-green-400 ring-1 ring-green-500/25 sm:size-11"
                aria-hidden="true"
              >
                <UIcon name="lucide:list-video" class="size-5 sm:size-[1.35rem]" />
              </div>
              <div class="min-w-0">
                <h2 class="text-base font-bold leading-tight text-white sm:text-lg">
                  Серии
                </h2>
                <p class="mt-0.5 text-sm text-slate-400">
                  <span class="text-slate-300">Сезон {{ hlsSeasonForPicker.number }}</span>
                  <span class="text-slate-600"> · </span>
                  <span>{{ hlsEpisodePickerSummary }}</span>
                </p>
              </div>
            </div>

            <!-- Несколько сезонов (редко у AniLibria) -->
            <div
              v-if="detail.seasonOptions.length > 1"
              class="mb-4 border-b border-white/[0.06] pb-4"
            >
              <p class="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Сезон
              </p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="opt in detail.seasonOptions"
                  :key="opt.number"
                  type="button"
                  class="min-h-10 rounded-xl px-4 text-sm font-semibold transition-all active:scale-[0.98]"
                  :class="
                    currentSeason === opt.number
                      ? 'bg-green-500 text-black'
                      : 'border border-white/10 bg-white/[0.06] text-slate-200 hover:border-white/15 hover:bg-white/[0.1]'
                  "
                  @click="onPlayerEpisodeChange(opt.number, currentEpisodeInSeason(opt.number) ?? 1)"
                >
                  {{ opt.title }}
                </button>
              </div>
            </div>

            <!-- Сетка / горизонтальный скролл; на ПК — ограниченная высота + вертикальный скролл -->
            <div>
              <p class="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 sm:mb-3">
                Выберите серию
              </p>

              <div
                v-if="showEpisodeQuickJump"
                class="mb-3 flex flex-col gap-2 rounded-xl border border-white/10 bg-black/30 p-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3"
              >
                <span class="text-xs font-medium text-slate-400">К серии</span>
                <div class="flex flex-wrap items-center gap-2">
                  <label class="sr-only" for="episode-jump-input">Номер серии</label>
                  <input
                    id="episode-jump-input"
                    v-model="episodeJumpInput"
                    type="number"
                    inputmode="numeric"
                    :min="hlsEpisodePickerBounds.min"
                    :max="hlsEpisodePickerBounds.max"
                    :placeholder="String(currentEpisode ?? hlsEpisodePickerBounds?.min ?? 1)"
                    class="h-10 w-[4.5rem] rounded-lg border border-white/15 bg-cinema-base px-2.5 text-center text-sm font-semibold text-white tabular-nums placeholder:text-slate-600 focus:border-green-500/50 focus:outline-none focus:ring-2 focus:ring-green-500/25"
                    @keydown.enter.prevent="submitEpisodeJump"
                    @input="episodeJumpError = ''"
                  />
                  <button
                    type="button"
                    class="h-10 rounded-lg bg-green-500 px-4 text-sm font-bold text-black transition-colors hover:bg-green-400 active:scale-[0.98]"
                    @click="submitEpisodeJump"
                  >
                    Перейти
                  </button>
                </div>
                <p v-if="episodeJumpError" class="w-full text-xs text-red-400">
                  {{ episodeJumpError }}
                </p>
              </div>

              <!-- Мобилка: карусель с градиентами по краям; ПК — сетка как раньше -->
              <div class="episode-carousel-shell relative -mx-4 sm:mx-0">
                <div
                  class="pointer-events-none absolute inset-y-0 left-0 z-[2] w-10 bg-linear-to-r from-cinema-card to-transparent sm:hidden"
                  aria-hidden="true"
                />
                <div
                  class="pointer-events-none absolute inset-y-0 right-0 z-[2] w-10 bg-linear-to-l from-cinema-card to-transparent sm:hidden"
                  aria-hidden="true"
                />
                <div
                  ref="episodePickerScrollRef"
                  class="episode-picker-scroll episode-carousel-rail flex snap-x snap-mandatory gap-2.5 overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-pl-4 scroll-pr-4 px-4 pb-2 pt-0.5 [-webkit-overflow-scrolling:touch] sm:max-h-[min(42vh,21rem)] sm:grid sm:grid-cols-7 sm:gap-2 sm:overflow-x-hidden sm:overflow-y-auto sm:overscroll-y-contain sm:scroll-smooth sm:rounded-xl sm:border sm:border-white/10 sm:bg-black/20 sm:px-2 sm:py-2.5 sm:pb-2 sm:pt-0 sm:scroll-p-0 md:max-h-[min(46vh,24rem)] md:grid-cols-9 lg:grid-cols-11"
                  role="list"
                  :aria-label="`Серии, всего ${hlsSeasonForPicker.episodes.length}`"
                >
                  <button
                    v-for="ep in hlsSeasonForPicker.episodes"
                    :key="ep.number"
                    type="button"
                    role="listitem"
                    :data-episode-active="currentEpisode === ep.number ? 'true' : undefined"
                    :title="ep.title ? `Серия ${ep.number}: ${ep.title}` : `Серия ${ep.number}`"
                    class="relative flex size-[2.875rem] shrink-0 snap-center snap-always items-center justify-center rounded-2xl text-sm font-bold transition-all duration-200 sm:size-10 sm:rounded-xl sm:snap-normal md:text-[15px]"
                    :class="episodePickerButtonClass(ep, true)"
                    :disabled="!ep.link"
                    @click="ep.link && onPlayerEpisodeChange(hlsSeasonForPicker.number, ep.number)"
                  >
                    {{ ep.number }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Transition name="slide-up">
          <div
            v-if="resumePrompt"
            class="glass mx-auto mt-4 flex max-w-3xl items-center gap-4 rounded-2xl px-4 py-3 lg:max-w-[52rem]"
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
                @click="onResumeFromStart"
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
import type { AnimeDetail, EpisodeProgress, SaveProgressPayload, WatchSourceOption } from '~/types/content'

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
/** HLS часто шлёт duration 0/Infinity между тиками — держим последнюю валидную для POST /progress и «продолжить» */
const lastKnownDuration = ref(0)

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

/** Сезон для сетки серий (AniLibria HLS) */
const hlsSeasonForPicker = computed(() => {
  if (!isHlsSource.value) return null
  return availableSeasons.value.find((s) => s.number === currentSeason.value)
    ?? availableSeasons.value[0]
    ?? null
})

const episodePickerScrollRef = ref<HTMLElement | null>(null)

/** Блок «К серии» только при длинном сезоне (> 30 серий) */
const EPISODE_QUICK_JUMP_MIN = 31

const showEpisodeQuickJump = computed(
  () => (hlsSeasonForPicker.value?.episodes.length ?? 0) >= EPISODE_QUICK_JUMP_MIN,
)

const hlsEpisodePickerBounds = computed(() => {
  const eps = hlsSeasonForPicker.value?.episodes ?? []
  if (!eps.length) return { min: 1, max: 1 }
  const nums = eps.map((e) => e.number)
  return { min: Math.min(...nums), max: Math.max(...nums) }
})

const episodeJumpInput = ref('')
const episodeJumpError = ref('')

function submitEpisodeJump(): void {
  episodeJumpError.value = ''
  const season = hlsSeasonForPicker.value
  if (!season?.episodes.length) return

  const raw = String(episodeJumpInput.value).trim()
  const n = parseInt(raw, 10)
  const { min, max } = hlsEpisodePickerBounds.value

  if (!Number.isFinite(n) || Number.isNaN(n)) {
    episodeJumpError.value = 'Введите номер серии'
    return
  }

  const ep = season.episodes.find((e) => e.number === n)
  if (!ep) {
    episodeJumpError.value = `Есть серии с ${min} по ${max}`
    return
  }
  if (!ep.link) {
    episodeJumpError.value = 'Эта серия пока недоступна'
    return
  }

  episodeJumpInput.value = String(n)
  onPlayerEpisodeChange(season.number, n)
}

const hlsEpisodePickerSummary = computed(() => {
  const season = hlsSeasonForPicker.value
  if (!season?.episodes.length) return ''
  const total = season.episodes.length
  const cur = currentEpisode.value
  if (cur != null) return `Серия ${cur} из ${total}`
  const n = total % 100
  const n1 = n % 10
  let word = 'серий'
  if (n >= 11 && n <= 14) word = 'серий'
  else if (n1 === 1) word = 'серия'
  else if (n1 >= 2 && n1 <= 4) word = 'серии'
  return `${total} ${word}`
})

function episodePickerButtonClass(
  ep: { number: number; link: string },
  carouselMobile = false,
): string {
  const active = currentEpisode.value === ep.number
  if (active) {
    const carousel = carouselMobile
      ? ' max-sm:scale-[1.06] max-sm:shadow-lg max-sm:shadow-black/50 max-sm:ring-2 max-sm:ring-green-300/45'
      : ''
    return `z-[1] bg-green-500 text-black shadow-[0_0_0_2px_rgba(34,197,94,0.4)]${carousel}`
  }
  if (!ep.link) {
    return 'cursor-not-allowed border border-white/[0.05] bg-white/[0.03] text-slate-600 max-sm:opacity-70'
  }
  const carousel = carouselMobile
    ? ' max-sm:border-white/12 max-sm:bg-cinema-elevated max-sm:shadow-md max-sm:shadow-black/40 max-sm:ring-1 max-sm:ring-white/10 active:max-sm:scale-[0.96]'
    : ''
  return `border border-white/10 bg-white/[0.06] text-slate-200 hover:border-green-500/35 hover:bg-white/[0.1] active:scale-95${carousel}`
}

watch([currentEpisode, () => hlsSeasonForPicker.value?.number], async () => {
  if (!import.meta.client || !isHlsSource.value) return
  await nextTick()
  const root = episodePickerScrollRef.value
  if (!root) return
  const active = root.querySelector<HTMLElement>('[data-episode-active]')
  active?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'center' })
}, { flush: 'post' })

function currentEpisodeInSeason(seasonNumber: number): number {
  const season = findSeason(availableSeasons.value, seasonNumber)
  if (!season?.episodes.length) return 1
  const same = season.episodes.find((e) => e.number === currentEpisode.value && e.link)
  if (same) return same.number
  const first = season.episodes.find((e) => e.link)
  return first?.number ?? season.episodes[0]!.number
}

function buildWatchUrlForSource(src: WatchSourceOption): string {
  const params = new URLSearchParams()
  if (currentSeason.value) params.set('season', String(currentSeason.value))
  if (currentEpisode.value) params.set('episode', String(currentEpisode.value))
  if (activeTranslationId.value) params.set('translationId', String(activeTranslationId.value))
  const q = params.toString()
  return q
    ? `/watch/${encodeURIComponent(src.externalId)}?${q}`
    : `/watch/${encodeURIComponent(src.externalId)}`
}

// Sync HLS source URL when episode/season changes (immediate — изначальный URL не брать только из seasons[0])
watch(
  currentEpisodeLink,
  (link) => {
    if (isHlsSource.value && link) playerSourceUrl.value = link
  },
  { immediate: true },
)

// ── Progress payload ──────────────────────────────────────────────────────────

function buildProgressPayload(time: number, duration: number): SaveProgressPayload {
  const activeTranslation = detail.value?.allTranslations.find((item) => item.id === activeTranslationId.value)

  const currentTime = Number.isFinite(time) && time >= 0 ? time : 0
  /** HLS: между timeupdate duration часто 0 или Infinity — не затираем последнее валидное значение */
  if (Number.isFinite(duration) && duration > 0 && duration !== Number.POSITIVE_INFINITY) {
    lastKnownDuration.value = duration
  }
  const dur =
    Number.isFinite(duration) && duration > 0 && duration !== Number.POSITIVE_INFINITY
      ? duration
      : lastKnownDuration.value > 0
        ? lastKnownDuration.value
        : 0

  let tid =
    activeTranslationId.value !== null && activeTranslationId.value !== undefined
      ? activeTranslationId.value
      : detail.value?.translation.id
  if (
    (tid === undefined || tid === null)
    && detail.value?.sourceProvider === 'anilibria'
  ) {
    tid = 0
  }

  return {
    externalId: externalId.value,
    sourceProvider: detail.value?.sourceProvider ?? 'kodik',
    title: detail.value?.title ?? '',
    posterUrl: detail.value?.posterUrl,
    contentType: detail.value?.type,
    season: currentSeason.value,
    episode: currentEpisode.value,
    translationId: tid !== null && tid !== undefined ? tid : undefined,
    translationName: activeTranslation?.title ?? detail.value?.translation.title,
    currentTime,
    duration: dur,
  }
}

async function loadDetail(): Promise<void> {
  loadingPlayer.value = true
  playerError.value = null
  lastKnownDuration.value = 0

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
      // HLS: брать сезон из currentSeason (прогресс/персист), а не всегда seasons[0] — иначе у авторизованных неверный m3u8
      const seasonBlock = findSeason(data.seasons, currentSeason.value) ?? data.seasons[0]
      const ep =
        seasonBlock?.episodes.find((e) => e.number === currentEpisode.value)
        ?? seasonBlock?.episodes[0]
      playerSourceUrl.value = ep?.link ?? ''
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

    let translationForProgress =
      activeTranslationId.value !== null && activeTranslationId.value !== undefined
        ? activeTranslationId.value
        : data.translation.id
    if (
      (translationForProgress === undefined || translationForProgress === null)
      && data.sourceProvider === 'anilibria'
    ) {
      translationForProgress = 0
    }

    const saved = await loadProgress(
      externalId.value,
      currentSeason.value,
      currentEpisode.value,
      translationForProgress !== null && translationForProgress !== undefined
        ? translationForProgress
        : undefined,
      data.sourceProvider,
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
  if (translationId !== undefined) {
    activeTranslationId.value = translationId
  }
  lastKnownDuration.value = 0
  startTime.value = undefined
  resumePrompt.value = false
  syncRouteState()
  persistSelection()
}

function applyResume(): void {
  resumePrompt.value = false
  playerContainerRef.value?.seek(startTime.value ?? 0)
}

function onResumeFromStart(): void {
  resumePrompt.value = false
  startTime.value = undefined
  playerContainerRef.value?.seek(0)
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
  episodeJumpInput.value = ''
  episodeJumpError.value = ''
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
