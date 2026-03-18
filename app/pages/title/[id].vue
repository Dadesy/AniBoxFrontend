<template>
  <div class="-mt-16">
    <!-- Loading skeleton -->
    <div v-if="pending" class="animate-pulse">
      <div class="w-full h-[480px] skeleton-shine" />
      <div class="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div class="h-8 w-1/2 rounded skeleton-shine" />
        <div class="h-4 w-1/3 rounded skeleton-shine" />
        <div class="h-20 w-2/3 rounded skeleton-shine" />
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="pt-32 flex items-center justify-center">
      <div class="text-center space-y-4">
        <UIcon name="lucide:alert-circle" class="size-14 text-red-400 mx-auto" />
        <p class="text-slate-400">Тайтл не найден</p>
        <UButton to="/catalog" color="primary" variant="soft">В каталог</UButton>
      </div>
    </div>

    <!-- Content -->
    <template v-else-if="detail">
      <!-- ── Cinematic Hero ─────────────────────────────────────────────── -->
      <div class="relative w-full overflow-hidden" style="height: min(80vh, 560px)">
        <!-- Backdrop: blurred poster -->
        <div class="absolute inset-0">
          <img
            v-if="detail.posterUrl"
            :src="detail.posterUrl"
            :alt="detail.title"
            class="w-full h-full object-cover object-top scale-110"
            style="filter: blur(3px) brightness(0.45) saturate(0.75)"
          />
          <div v-else class="w-full h-full bg-cinema-surface" />
        </div>

        <!-- Gradient overlays -->
        <div class="absolute inset-0 bg-gradient-to-r from-cinema-base via-cinema-base/70 to-transparent" />
        <div class="absolute inset-0 bg-gradient-to-t from-cinema-base via-transparent to-cinema-base/50" />

        <!-- Hero content -->
        <div class="absolute inset-0 flex items-end pb-12 px-4 sm:px-6 lg:px-8 xl:px-12">
          <div class="flex gap-6 items-end max-w-screen-xl w-full">
            <!-- Poster -->
            <div class="hidden sm:block shrink-0 w-32 md:w-44 shadow-2xl shadow-black/70 rounded-xl overflow-hidden ring-1 ring-white/10">
              <img
                v-if="detail.posterUrl"
                :src="detail.posterUrl"
                :alt="detail.title"
                class="w-full aspect-[2/3] object-cover"
              />
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0 animate-fade-up space-y-3 pb-1">
              <div class="flex flex-wrap gap-2 items-center">
                <span class="text-xs font-bold uppercase tracking-widest text-green-400 border border-green-500/30 bg-green-500/10 px-2.5 py-1 rounded-full">
                  {{ typeLabel }}
                </span>
                <span v-if="detail.year" class="text-sm text-slate-400">{{ detail.year }}</span>
                <span v-if="detail.status" class="text-xs px-2 py-0.5 rounded-full bg-white/8 text-slate-400">
                  {{ detail.status }}
                </span>
              </div>

              <h1 class="text-2xl sm:text-4xl font-extrabold text-white leading-tight">{{ detail.title }}</h1>
              <p v-if="detail.originalTitle !== detail.title" class="text-slate-400 text-sm">
                {{ detail.originalTitle }}
              </p>

              <!-- Genres -->
              <div v-if="detail.genres.length" class="flex flex-wrap gap-1.5">
                <span
                  v-for="g in detail.genres"
                  :key="g"
                  class="text-xs px-2.5 py-1 rounded-full bg-white/6 text-slate-300 border border-white/6 hover:bg-white/10 transition-colors cursor-default"
                >
                  {{ g }}
                </span>
              </div>

              <p v-if="detail.description" class="text-slate-300 text-sm leading-relaxed line-clamp-3 max-w-2xl">
                {{ detail.description }}
              </p>

              <!-- Actions -->
              <div class="flex items-center gap-3 pt-1">
                <button
                  class="flex items-center gap-2 px-6 py-2.5 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl transition-all glow-green-sm hover:glow-green text-sm"
                  @click="handleWatch"
                >
                  <UIcon name="lucide:play" class="size-4 ml-0.5" />
                  {{ continueProgress ? 'Продолжить' : 'Смотреть' }}
                </button>
                <a
                  v-if="detail.kinopoiskId"
                  :href="`https://www.kinopoisk.ru/film/${detail.kinopoiskId}/`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-1.5 px-4 py-2.5 glass hover:bg-white/10 text-slate-300 hover:text-white rounded-xl transition-all text-sm font-medium"
                >
                  КП ↗
                </a>
                <a
                  v-if="detail.shikimoriId"
                  :href="`https://shikimori.one/animes/${detail.shikimoriId}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-1.5 px-4 py-2.5 glass hover:bg-white/10 text-slate-300 hover:text-white rounded-xl transition-all text-sm font-medium"
                >
                  Shikimori ↗
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-cinema-base to-transparent pointer-events-none" />
      </div>

      <!-- ── Below hero ──────────────────────────────────────────────────── -->
      <div class="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        <!-- ── Translation selector ───────────────────────────────────── -->
        <div v-if="detail.allTranslations.length > 0" class="space-y-3">
          <h2 class="text-base font-bold text-white flex items-center gap-2">
            <UIcon name="lucide:mic" class="size-4 text-green-400" />
            Озвучка
          </h2>
          <TranslationSelector
            :translations="detail.allTranslations"
            :active-id="selectedTranslationId"
            @select="onSelectTranslation"
          />
        </div>

        <!-- ── Episode list ────────────────────────────────────────────── -->
        <div v-if="isSerial" class="space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="text-base font-bold text-white flex items-center gap-2">
              <UIcon name="lucide:list" class="size-4 text-green-400" />
              Эпизоды
            </h2>
            <!-- loading spinner when re-fetching for translation -->
            <span v-if="episodesLoading" class="flex items-center gap-1.5 text-xs text-slate-400">
              <UIcon name="lucide:loader-2" class="size-3.5 animate-spin" />
              Загрузка...
            </span>
          </div>
          <EpisodeList
            v-if="displaySeasons.length"
            :seasons="displaySeasons"
            :current-season="currentSeason"
            :current-episode="currentEpisode"
            :progress="titleProgress"
            @select="goToEpisode"
          />
          <p v-else-if="!episodesLoading" class="text-sm text-slate-500">Эпизоды недоступны для этой озвучки</p>
        </div>

        <!-- ── Stats ──────────────────────────────────────────────────── -->
        <div v-if="detail.episodesCount || detail.lastSeason" class="flex gap-6 text-sm">
          <div v-if="detail.episodesCount" class="text-center">
            <div class="text-2xl font-bold text-white">{{ detail.episodesCount }}</div>
            <div class="text-slate-500 text-xs mt-0.5">Эпизодов</div>
          </div>
          <div v-if="detail.lastSeason" class="text-center">
            <div class="text-2xl font-bold text-white">{{ detail.lastSeason }}</div>
            <div class="text-slate-500 text-xs mt-0.5">Сезонов</div>
          </div>
          <div v-if="detail.year" class="text-center">
            <div class="text-2xl font-bold text-white">{{ detail.year }}</div>
            <div class="text-slate-500 text-xs mt-0.5">Год</div>
          </div>
        </div>

        <!-- ── Screenshots ────────────────────────────────────────────── -->
        <div v-if="detail.screenshots.length" class="space-y-3">
          <h2 class="text-base font-bold text-white flex items-center gap-2">
            <UIcon name="lucide:image" class="size-4 text-green-400" />
            Кадры
          </h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            <img
              v-for="(src, i) in detail.screenshots"
              :key="i"
              :src="src"
              loading="lazy"
              class="aspect-video w-full rounded-xl object-cover hover:scale-[1.02] transition-transform cursor-pointer ring-1 ring-white/5"
            />
          </div>
        </div>

        <!-- ── Related anime ──────────────────────────────────────────── -->
        <div v-if="relatedLoading || related.length" class="space-y-3">
          <h2 class="text-base font-bold text-white flex items-center gap-2">
            <UIcon name="lucide:layers" class="size-4 text-green-400" />
            Связанное
          </h2>

          <!-- Skeleton -->
          <div v-if="relatedLoading" class="flex gap-3 overflow-x-auto pb-2">
            <div
              v-for="n in 6"
              :key="n"
              class="flex-shrink-0 w-[140px]"
            >
              <div class="aspect-[2/3] animate-pulse rounded-xl bg-white/5" />
              <div class="mt-2 space-y-1.5">
                <div class="h-3 animate-pulse rounded bg-white/5" />
                <div class="h-2 w-2/3 animate-pulse rounded bg-white/5" />
              </div>
            </div>
          </div>

          <!-- Related cards -->
          <div v-else class="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <div
              v-for="card in related"
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
import type { ContentDetail, EpisodeProgress, Season } from '~/types/content';
import type { NormalizedAnimeCard } from '~/types/metadata';
import EpisodeList from '~/components/content/EpisodeList.vue';
import TranslationSelector from '~/components/content/TranslationSelector.vue';
import RelatedCard from '~/components/content/RelatedCard.vue';
import { useRelated } from '~/composables/useMetadata';

const route  = useRoute();
const router = useRouter();
const apiUrl = useApiUrl();

const externalId = computed(() => decodeURIComponent(route.params.id as string));
const pagePending = ref(true);

const { data: detail, error, execute } = useLazyFetch<ContentDetail>(
  () => `${apiUrl}/content/${encodeURIComponent(externalId.value)}`,
  {
    key: `title-${externalId.value}`,
    immediate: false,
  },
);

const selectedTranslationId = ref<number | null>(null);
const titleProgress          = ref<EpisodeProgress[]>([]);
// Overridden seasons when user switches translation
const translationSeasons     = ref<Season[] | null>(null);
const episodesLoading        = ref(false);

// Seasons to display: override when translation selected, fallback to detail.seasons
const displaySeasons = computed((): Season[] => translationSeasons.value ?? detail.value?.seasons ?? []);

async function loadTitlePage(): Promise<void> {
  pagePending.value = true;
  await execute();
  pagePending.value = false;
}

if (import.meta.server) {
  await loadTitlePage();
} else {
  onMounted(() => {
    if (!detail.value) void loadTitlePage();
  });
}

watch(detail, async (value) => {
  if (!value) return;
  selectedTranslationId.value = value.translation.id;
  translationSeasons.value    = null; // reset override on new title
  const { loadTitleProgress } = useWatchProgress();
  titleProgress.value = await loadTitleProgress(externalId.value);
}, { immediate: true });

// ── Translation change → re-fetch episodes ───────────────────────────────
async function onSelectTranslation(id: number) {
  if (id === selectedTranslationId.value) return;
  selectedTranslationId.value = id;
  translationSeasons.value    = null;

  // If same as detail's default translation, no extra fetch needed
  if (id === detail.value?.translation.id) return;

  episodesLoading.value = true;
  try {
    const data = await $fetch<{ seasons: Season[] }>(
      `${apiUrl}/content/${encodeURIComponent(externalId.value)}/episodes?translationId=${id}`,
    );
    translationSeasons.value = data.seasons ?? [];
  } catch {
    translationSeasons.value = [];
  } finally {
    episodesLoading.value = false;
  }
}

// ── Related anime ─────────────────────────────────────────────────────────
const shikimoriId = computed(() => detail.value?.shikimoriId as string | undefined);
const { related, loading: relatedLoading } = useRelated(shikimoriId);

// ── Derived state ─────────────────────────────────────────────────────────
const isSerial  = computed(() => detail.value?.type === 'anime-serial');
const pending   = computed(() => pagePending.value);

const currentSeason = computed(() => {
  const last = titleProgress.value.find(p => !p.completed);
  return last?.season ?? 1;
});
const currentEpisode = computed(() => {
  const last = titleProgress.value.find(p => p.season === currentSeason.value && !p.completed);
  return last?.episode ?? 1;
});
const continueProgress = computed(() =>
  titleProgress.value.find(p => !p.completed && p.currentTime > 5),
);

const typeLabel = computed(() => {
  const map: Record<string, string> = {
    'anime-serial': 'Аниме-сериал',
    'anime':        'Аниме-фильм',
  };
  return map[detail.value?.type ?? ''] ?? 'Аниме';
});

function buildWatchUrl(season?: number, episode?: number, time?: number): string {
  const params = new URLSearchParams();
  if (season)                      params.set('season',        String(season));
  if (episode)                     params.set('episode',       String(episode));
  if (selectedTranslationId.value) params.set('translationId', String(selectedTranslationId.value));
  if (time)                        params.set('t',             String(Math.floor(time)));
  return `/watch/${encodeURIComponent(externalId.value)}?${params}`;
}

function handleWatch(): void {
  if (continueProgress.value) {
    const p = continueProgress.value;
    router.push(buildWatchUrl(p.season ?? undefined, p.episode ?? undefined, p.currentTime));
  } else {
    const seasons = displaySeasons.value;
    const s = isSerial.value ? (seasons[0]?.number ?? 1) : undefined;
    const e = isSerial.value ? (seasons[0]?.episodes[0]?.number ?? 1) : undefined;
    router.push(buildWatchUrl(s, e));
  }
}

function goToEpisode(season: number, episode: number): void {
  const p = titleProgress.value.find(ep => ep.season === season && ep.episode === episode && ep.currentTime > 5);
  router.push(buildWatchUrl(season, episode, p?.currentTime));
}

useHead({ title: computed(() => detail.value ? `${detail.value.title} — AniBox` : 'AniBox') });
</script>
