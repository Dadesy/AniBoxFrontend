<template>
  <div class="min-h-screen bg-cinema-base pt-16">
    <!-- Top bar -->
    <div class="px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3 border-b border-white/5">
      <NuxtLink
        :to="`/title/${encodeURIComponent(externalId)}`"
        class="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm"
      >
        <UIcon name="lucide:arrow-left" class="size-4" />
        К тайтлу
      </NuxtLink>
      <span v-if="detail" class="text-slate-600 select-none">·</span>
      <span v-if="detail" class="text-sm text-white font-medium truncate">
        {{ detail.title }}
        <template v-if="currentSeason"> · Сезон {{ currentSeason }}</template>
        <template v-if="currentEpisode"> · Эпизод {{ currentEpisode }}</template>
      </span>
    </div>

    <!-- Main layout: player + sidebar -->
    <div class="flex flex-col xl:flex-row h-[calc(100vh-112px)] min-h-0">
      <!-- ── Player column ─────────────────────────────────────────────── -->
      <div class="flex-1 flex flex-col min-h-0 min-w-0">
        <!-- Player -->
        <div class="relative bg-black">
          <div v-if="playerUrl" class="w-full">
            <KodikPlayer
              ref="playerRef"
              :player-url="playerUrl"
              :title="detail?.title"
              :start-time="startTime"
              @time-update="onTimeUpdate"
              @pause="onPause"
              @ended="onEnded"
              @episode-change="onEpisodeChange"
            />
          </div>
          <div v-else-if="loadingPlayer" class="aspect-video w-full skeleton-shine" />
          <div v-else class="aspect-video w-full flex items-center justify-center bg-cinema-card">
            <div class="text-center space-y-3">
              <UIcon name="lucide:alert-circle" class="size-12 text-red-400 mx-auto" />
              <p class="text-slate-400 text-sm">Не удалось загрузить плеер</p>
            </div>
          </div>
        </div>

        <!-- Resume prompt -->
        <Transition name="slide-up">
          <div
            v-if="resumePrompt"
            class="mx-4 sm:mx-6 my-3 glass rounded-xl px-4 py-3 flex items-center gap-4"
          >
            <UIcon name="lucide:clock" class="size-5 text-green-400 shrink-0" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-white">Продолжить с {{ formatTime(startTime ?? 0) }}?</p>
              <p class="text-xs text-slate-400">Найдено сохранённое место</p>
            </div>
            <div class="flex gap-2 shrink-0">
              <button
                class="px-3 py-1.5 bg-green-500 hover:bg-green-400 text-black text-xs font-bold rounded-lg transition-colors"
                @click="applyResume"
              >
                Продолжить
              </button>
              <button
                class="px-3 py-1.5 bg-white/6 hover:bg-white/10 text-slate-300 text-xs font-medium rounded-lg transition-colors"
                @click="resumePrompt = false"
              >
                С начала
              </button>
            </div>
          </div>
        </Transition>

        <!-- Mobile: episode nav (below player) -->
        <div v-if="isSerial && detail" class="xl:hidden px-4 sm:px-6 py-4 space-y-4 flex-1 overflow-y-auto">
          <!-- Episode nav buttons -->
          <div class="flex gap-2">
            <button
              :disabled="!prevEpisode"
              :class="['flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                prevEpisode ? 'glass hover:bg-white/10 text-white' : 'bg-white/3 text-slate-600 cursor-not-allowed']"
              @click="prevEpisode && changeEpisode(prevEpisode.season, prevEpisode.episode)"
            >
              <UIcon name="lucide:skip-back" class="size-4" />
              Пред.
            </button>
            <button
              :disabled="!nextEpisode"
              :class="['flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                nextEpisode ? 'bg-green-500 hover:bg-green-400 text-black font-bold glow-green-sm' : 'bg-white/3 text-slate-600 cursor-not-allowed']"
              @click="nextEpisode && changeEpisode(nextEpisode.season, nextEpisode.episode)"
            >
              След.
              <UIcon name="lucide:skip-forward" class="size-4" />
            </button>
          </div>

          <!-- Translation -->
          <TranslationSelector
            v-if="detail.allTranslations.length > 1"
            :translations="detail.allTranslations"
            :active-id="activeTranslationId"
            @select="changeTranslation"
          />

          <!-- Episode list -->
          <EpisodeList
            :seasons="detail.seasons"
            :current-season="currentSeason ?? 1"
            :current-episode="currentEpisode ?? 1"
            :progress="titleProgress"
            @select="changeEpisode"
          />
        </div>
      </div>

      <!-- ── Sidebar (desktop) ─────────────────────────────────────────── -->
      <div
        v-if="detail && isSerial"
        class="hidden xl:flex flex-col w-80 shrink-0 border-l border-white/5 bg-cinema-surface overflow-hidden"
      >
        <!-- Sidebar header -->
        <div class="px-4 py-3 border-b border-white/5 space-y-3">
          <h3 class="text-sm font-bold text-white">Список серий</h3>

          <!-- Episode nav -->
          <div class="flex gap-2">
            <button
              :disabled="!prevEpisode"
              :class="['flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all',
                prevEpisode ? 'glass hover:bg-white/10 text-slate-300' : 'bg-white/3 text-slate-600 cursor-not-allowed']"
              @click="prevEpisode && changeEpisode(prevEpisode.season, prevEpisode.episode)"
            >
              <UIcon name="lucide:skip-back" class="size-3.5" />
              Пред.
            </button>
            <button
              :disabled="!nextEpisode"
              :class="['flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all',
                nextEpisode ? 'bg-green-500 hover:bg-green-400 text-black glow-green-sm' : 'bg-white/3 text-slate-600 cursor-not-allowed']"
              @click="nextEpisode && changeEpisode(nextEpisode.season, nextEpisode.episode)"
            >
              Следующая
              <UIcon name="lucide:skip-forward" class="size-3.5" />
            </button>
          </div>

          <!-- Translation selector -->
          <TranslationSelector
            v-if="detail.allTranslations.length > 1"
            :translations="detail.allTranslations"
            :active-id="activeTranslationId"
            compact
            @select="changeTranslation"
          />
        </div>

        <!-- Episode list scrollable -->
        <div class="flex-1 overflow-y-auto">
          <EpisodeList
            :seasons="detail.seasons"
            :current-season="currentSeason ?? 1"
            :current-episode="currentEpisode ?? 1"
            :progress="titleProgress"
            compact
            @select="changeEpisode"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ContentDetail, EpisodeProgress, Season } from '~/types/content';
import type { SaveProgressPayload } from '~/types/content';
import EpisodeList from '~/components/content/EpisodeList.vue';
import TranslationSelector from '~/components/content/TranslationSelector.vue';
import KodikPlayer from '~/components/player/KodikPlayer.vue';

const route  = useRoute();
const apiUrl = useApiUrl();

const externalId = computed(() => decodeURIComponent(route.params.id as string));
const qSeason       = computed(() => route.query.season       ? parseInt(route.query.season as string, 10)       : undefined);
const qEpisode      = computed(() => route.query.episode      ? parseInt(route.query.episode as string, 10)      : undefined);
const qTranslationId = computed(() => route.query.translationId ? parseInt(route.query.translationId as string, 10) : undefined);
const qTime         = computed(() => route.query.t            ? parseInt(route.query.t as string, 10)            : undefined);

const detail          = ref<ContentDetail | null>(null);
const playerUrl       = ref('');
const loadingPlayer   = ref(true);
const activeTranslationId = ref<number | null>(null);
const currentSeason   = ref<number | undefined>(qSeason.value);
const currentEpisode  = ref<number | undefined>(qEpisode.value);
const startTime       = ref<number | undefined>(undefined);
const resumePrompt    = ref(false);
const titleProgress   = ref<EpisodeProgress[]>([]);
const playerRef       = ref<{ seek: (t: number) => void } | null>(null);

const { scheduleSave, saveNow, loadProgress, loadTitleProgress } = useWatchProgress();

onMounted(() => loadDetail());

async function loadDetail(): Promise<void> {
  loadingPlayer.value = true;
  try {
    detail.value = await $fetch<ContentDetail>(`${apiUrl}/content/${encodeURIComponent(externalId.value)}`);
    activeTranslationId.value = qTranslationId.value ?? detail.value.translation.id;
    titleProgress.value = await loadTitleProgress(externalId.value);

    const saved = await loadProgress(externalId.value, currentSeason.value, currentEpisode.value, activeTranslationId.value ?? undefined);
    if (saved && saved.currentTime > 5) {
      startTime.value = saved.currentTime;
      if (qTime.value) {
        startTime.value = qTime.value;
      } else {
        resumePrompt.value = true;
      }
    }

    await buildPlayerUrl();
  } finally {
    loadingPlayer.value = false;
  }
}

async function buildPlayerUrl(): Promise<void> {
  if (!detail.value) return;
  const isSerial = detail.value.type === 'anime-serial' || detail.value.type === 'foreign-serial';
  if (isSerial && (currentSeason.value || currentEpisode.value || activeTranslationId.value)) {
    try {
      const data = await $fetch<{ seasons: Season[]; playerUrl: string }>(
        `${apiUrl}/content/${encodeURIComponent(externalId.value)}/episodes?translationId=${activeTranslationId.value}`,
      );
      const season  = data.seasons.find(s => s.number === (currentSeason.value ?? 1));
      const episode = season?.episodes.find(e => e.number === (currentEpisode.value ?? 1));
      playerUrl.value = episode?.link ?? data.playerUrl;
    } catch {
      playerUrl.value = detail.value.playerUrl;
    }
  } else {
    playerUrl.value = detail.value.playerUrl;
  }
}

// ── Computed ──────────────────────────────────────────────────────────────
const isSerial = computed(() =>
  detail.value?.type === 'anime-serial' || detail.value?.type === 'foreign-serial',
);

const allEpisodes = computed(() => {
  const result: { season: number; episode: number }[] = [];
  for (const s of detail.value?.seasons ?? []) {
    for (const e of s.episodes) {
      result.push({ season: s.number, episode: e.number });
    }
  }
  return result;
});

const currentIndex = computed(() =>
  allEpisodes.value.findIndex(e => e.season === currentSeason.value && e.episode === currentEpisode.value),
);
const prevEpisode = computed(() => currentIndex.value > 0 ? allEpisodes.value[currentIndex.value - 1] : null);
const nextEpisode = computed(() =>
  currentIndex.value >= 0 && currentIndex.value < allEpisodes.value.length - 1
    ? allEpisodes.value[currentIndex.value + 1]
    : null,
);

// ── Progress handlers ─────────────────────────────────────────────────────
function buildProgressPayload(time: number, duration: number): SaveProgressPayload {
  return {
    externalId: externalId.value,
    sourceProvider: 'kodik',
    title: detail.value?.title ?? '',
    posterUrl: detail.value?.posterUrl,
    contentType: detail.value?.type,
    season: currentSeason.value,
    episode: currentEpisode.value,
    translationId: activeTranslationId.value ?? undefined,
    translationName: detail.value?.allTranslations.find(t => t.id === activeTranslationId.value)?.title,
    currentTime: time,
    duration,
  };
}

function onTimeUpdate(time: number, duration: number): void { scheduleSave(buildProgressPayload(time, duration)); }
function onPause(time: number): void {
  const dur = (playerRef.value as unknown as { state?: { duration: number } })?.state?.duration ?? 0;
  saveNow(buildProgressPayload(time, dur));
}
function onEnded(): void {
  const dur = (playerRef.value as unknown as { state?: { duration: number } })?.state?.duration ?? 0;
  saveNow(buildProgressPayload(dur, dur));
}
function onEpisodeChange(season: number, episode: number): void {
  currentSeason.value = season;
  currentEpisode.value = episode;
}

// ── Controls ──────────────────────────────────────────────────────────────
async function changeEpisode(season: number, episode: number): Promise<void> {
  const curDur = (playerRef.value as unknown as { state?: { duration: number } })?.state?.duration ?? 0;
  const curTime = (playerRef.value as unknown as { state?: { currentTime: number } })?.state?.currentTime ?? 0;
  if (curTime > 5) await saveNow(buildProgressPayload(curTime, curDur));

  currentSeason.value  = season;
  currentEpisode.value = episode;
  startTime.value      = undefined;
  resumePrompt.value   = false;

  const saved = await loadProgress(externalId.value, season, episode, activeTranslationId.value ?? undefined);
  if (saved && saved.currentTime > 5) {
    startTime.value  = saved.currentTime;
    resumePrompt.value = true;
  }
  await buildPlayerUrl();
}

async function changeTranslation(id: number): Promise<void> {
  activeTranslationId.value = id;
  startTime.value    = undefined;
  resumePrompt.value = false;
  await buildPlayerUrl();
}

function applyResume(): void {
  resumePrompt.value = false;
  playerRef.value?.seek(startTime.value ?? 0);
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

onBeforeUnmount(() => {
  const dur  = (playerRef.value as unknown as { state?: { duration: number } })?.state?.duration ?? 0;
  const time = (playerRef.value as unknown as { state?: { currentTime: number } })?.state?.currentTime ?? 0;
  if (time > 5 && detail.value) saveNow(buildProgressPayload(time, dur));
});

useHead({
  title: computed(() =>
    detail.value
      ? `${detail.value.title}${currentEpisode.value ? ` — Эп. ${currentEpisode.value}` : ''} — AniBox`
      : 'Просмотр — AniBox',
  ),
});
</script>

<style scoped>
.slide-up-enter-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.slide-up-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.slide-up-enter-from  { opacity: 0; transform: translateY(8px); }
.slide-up-leave-to    { opacity: 0; transform: translateY(8px); }
</style>
