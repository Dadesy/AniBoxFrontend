<template>
  <div class="pt-24 pb-12 px-4 sm:px-6 lg:px-8 xl:px-12 mx-auto max-w-screen-xl space-y-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-extrabold text-white">История просмотров</h1>
        <p v-if="!loading && total" class="text-slate-400 text-sm mt-1">
          <span class="text-white font-medium">{{ total }}</span> записей
        </p>
      </div>
    </div>

    <!-- Not authenticated -->
    <div v-if="!isAuthenticated" class="py-24 text-center space-y-4">
      <UIcon name="lucide:lock" class="size-16 text-slate-700 mx-auto" />
      <p class="text-xl font-semibold text-white">Войдите, чтобы видеть историю</p>
      <NuxtLink to="/authentication">
        <button class="mt-2 px-6 py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl transition-all glow-green-sm text-sm">
          Войти
        </button>
      </NuxtLink>
    </div>

    <template v-else>
      <!-- Skeleton -->
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 6" :key="i" class="h-24 rounded-2xl skeleton-shine" />
      </div>

      <!-- Empty -->
      <div v-else-if="!items.length" class="py-24 text-center space-y-4">
        <UIcon name="lucide:clock" class="size-16 text-slate-700 mx-auto" />
        <p class="text-xl font-semibold text-white">Вы ещё ничего не смотрели</p>
        <NuxtLink to="/catalog">
          <button class="mt-2 px-6 py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl transition-all glow-green-sm text-sm">
            Перейти в каталог
          </button>
        </NuxtLink>
      </div>

      <!-- List -->
      <div v-else class="space-y-2 animate-fade-in">
        <div
          v-for="item in items"
          :key="item.id"
          class="group flex items-center gap-4 p-4 rounded-2xl bg-cinema-card border border-white/5 hover:border-white/10 hover:bg-cinema-elevated transition-all"
        >
          <!-- Poster -->
          <NuxtLink :to="`/title/${encodeURIComponent(item.externalId)}`" class="shrink-0">
            <div class="w-14 h-20 rounded-xl overflow-hidden bg-cinema-surface ring-1 ring-white/8">
              <img
                v-if="item.posterUrl"
                :src="item.posterUrl"
                :alt="item.title"
                class="h-full w-full object-cover"
                loading="lazy"
              />
              <div v-else class="flex h-full items-center justify-center">
                <UIcon name="lucide:film" class="size-5 text-slate-700" />
              </div>
            </div>
          </NuxtLink>

          <!-- Info -->
          <div class="flex-1 min-w-0 space-y-2">
            <NuxtLink
              :to="`/title/${encodeURIComponent(item.externalId)}`"
              class="block text-sm font-semibold text-white hover:text-green-400 transition-colors line-clamp-1"
            >
              {{ item.title }}
            </NuxtLink>
            <p class="text-xs text-slate-500">
              <template v-if="item.season">Сезон {{ item.season }} · </template>
              <template v-if="item.episode">Эп. {{ item.episode }} · </template>
              <template v-if="item.translationName">{{ item.translationName }}</template>
            </p>
            <!-- Progress -->
            <div class="flex items-center gap-3 max-w-sm">
              <div class="flex-1 h-1 rounded-full bg-white/6 overflow-hidden">
                <div
                  class="h-full rounded-full transition-all"
                  :class="item.completed ? 'bg-green-500' : 'bg-green-500/60'"
                  :style="{ width: `${progressPercent(item)}%` }"
                />
              </div>
              <span class="text-[11px] text-slate-500 shrink-0 font-mono">
                {{ formatTime(item.currentTime) }} / {{ formatTime(item.duration) }}
              </span>
              <span
                v-if="item.completed"
                class="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-green-500/15 text-green-400 border border-green-500/25"
              >
                ✓ Просмотрено
              </span>
            </div>
          </div>

          <!-- Date + action -->
          <div class="shrink-0 text-right space-y-2">
            <p class="text-xs text-slate-600">{{ formatDate(item.lastWatchedAt) }}</p>
            <NuxtLink :to="watchLink(item)">
              <button class="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-lg text-xs font-medium transition-all">
                <UIcon name="lucide:play" class="size-3" />
                {{ item.completed ? 'Пересмотреть' : 'Продолжить' }}
              </button>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Infinite load trigger -->
      <div v-if="hasMore" ref="loadMoreTrigger" class="flex justify-center">
        <div class="flex items-center gap-2 px-6 py-3 text-sm text-slate-500">
          <UIcon v-if="loadingMore" name="lucide:loader-circle" class="size-4 animate-spin text-green-400" />
          <span>{{ loadingMore ? 'Загружаем ещё…' : 'Подгрузка при прокрутке' }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { EpisodeProgress, HistoryResponse } from '~/types/content';

definePageMeta({ middleware: 'auth' });

const { pageTitle } = useSiteBranding();
useHead({ title: pageTitle('История') });

const apiUrl = useApiUrl();
const { isAuthenticated } = useAuth();

const items       = ref<EpisodeProgress[]>([]);
const total       = ref(0);
const loading     = ref(true);
const loadingMore = ref(false);
const PAGE_SIZE   = 20;
const loadMoreTrigger = useInfiniteTrigger(
  () => hasMore.value && !loading.value && !loadingMore.value,
  () => fetchHistory(items.value.length),
);

const hasMore = computed(() => items.value.length < total.value);

onMounted(() => fetchHistory());

async function fetchHistory(skip = 0): Promise<void> {
  if (skip === 0) loading.value = true;
  else loadingMore.value = true;
  try {
    const data = await $fetch<HistoryResponse>(
      `${apiUrl}/progress/history?limit=${PAGE_SIZE}&skip=${skip}`,
      { credentials: 'include' },
    );
    if (skip === 0) items.value = data.items;
    else items.value.push(...data.items);
    total.value = data.total;
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
}

function progressPercent(p: EpisodeProgress): number {
  return p.duration ? Math.min(100, (p.currentTime / p.duration) * 100) : 0;
}

function watchLink(p: EpisodeProgress): string {
  const params = new URLSearchParams();
  if (p.season) params.set('season', String(p.season));
  if (p.episode) params.set('episode', String(p.episode));
  if (p.translationId) params.set('translationId', String(p.translationId));
  if (!p.completed && p.currentTime > 5) params.set('t', String(Math.floor(p.currentTime)));
  return `/watch/${encodeURIComponent(p.externalId)}?${params}`;
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  return `${m}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

</script>
