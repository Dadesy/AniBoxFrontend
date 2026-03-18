<template>
  <div class="pt-24 pb-12 px-4 sm:px-6 lg:px-8 xl:px-12 mx-auto max-w-screen-2xl">
    <!-- Header -->
    <div class="mb-8 space-y-4">
      <div>
        <h1 class="text-3xl font-extrabold text-white">Поиск</h1>
        <p v-if="query && !searching && items.length" class="mt-1 text-slate-400 text-sm">
          Найдено: <span class="text-white font-medium">{{ total }}</span>
        </p>
      </div>

      <!-- Search input -->
      <div class="relative max-w-2xl">
        <UIcon name="lucide:search" class="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-500 pointer-events-none" />
        <input
          ref="inputRef"
          v-model="query"
          type="text"
          placeholder="Введите название..."
          class="w-full h-12 pl-12 pr-12 rounded-2xl bg-cinema-card border border-white/8 text-white placeholder:text-slate-500
                 focus:outline-none focus:border-green-500/40 focus:bg-cinema-elevated text-base transition-all"
          @keydown.escape="query = ''"
        />
        <button
          v-if="query"
          class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          @click="query = ''"
        >
          <UIcon name="lucide:x" class="size-5" />
        </button>
      </div>
    </div>

    <!-- Skeleton -->
    <div v-if="searching" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
      <div v-for="i in 14" :key="i" class="space-y-2">
        <div class="aspect-[2/3] w-full skeleton-shine rounded-xl" />
        <div class="h-3 w-3/4 rounded skeleton-shine" />
        <div class="h-2.5 w-1/2 rounded skeleton-shine" />
      </div>
    </div>

    <!-- Results -->
    <div
      v-else-if="items.length"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4 animate-fade-in"
    >
      <TitleCard v-for="item in items" :key="item.externalId" :content="item" />
    </div>

    <!-- No results -->
    <div v-else-if="query.length >= 2 && !searching" class="py-24 text-center space-y-4">
      <UIcon name="lucide:search-x" class="size-16 text-slate-700 mx-auto" />
      <p class="text-xl font-semibold text-white">Ничего не найдено</p>
      <p class="text-slate-500 text-sm">По запросу «{{ query }}» нет результатов</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="!query" class="py-24 text-center space-y-4">
      <UIcon name="lucide:search" class="size-16 text-slate-700 mx-auto" />
      <p class="text-lg text-slate-500">Начните вводить название аниме</p>
    </div>

    <!-- Infinite load trigger -->
    <div v-if="nextPageUrl && items.length && !searching" ref="loadMoreTrigger" class="mt-8 flex justify-center">
      <div class="flex items-center gap-2 px-6 py-3 text-sm text-slate-500">
        <UIcon v-if="loadingMore" name="lucide:loader-circle" class="size-4 animate-spin text-green-400" />
        <span>{{ loadingMore ? 'Загружаем ещё…' : 'Подгрузка при прокрутке' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ContentCard } from '~/types/content';
import TitleCard from '~/components/content/TitleCard.vue';

const route    = useRoute();
const apiUrl   = useApiUrl();
const inputRef = ref<HTMLInputElement | null>(null);

const query       = ref((route.query.q as string) ?? '');
const items       = ref<ContentCard[]>([]);
const total       = ref(0);
const nextPageUrl = ref<string | null>(null);
const searching   = ref(false);
const loadingMore = ref(false);
const loadMoreTrigger = useInfiniteTrigger(
  () => !!nextPageUrl.value && !!items.value.length && !searching.value && !loadingMore.value,
  loadMore,
);

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

watch(query, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer);
  if (val.length < 2) { items.value = []; total.value = 0; nextPageUrl.value = null; return; }
  debounceTimer = setTimeout(() => doSearch(true), 400);
});

async function doSearch(reset = true): Promise<void> {
  if (reset) { searching.value = true; items.value = []; nextPageUrl.value = null; }
  else loadingMore.value = true;
  try {
    const params = new URLSearchParams({ q: query.value });
    if (!reset && nextPageUrl.value) params.set('nextPage', nextPageUrl.value);
    params.set('types', 'anime-serial,anime');
    const data = await $fetch<{ items: ContentCard[]; total: number; nextPage: string | null }>(
      `${apiUrl}/content/search?${params}`,
    );
    if (reset) items.value = data.items; else items.value.push(...data.items);
    total.value = data.total;
    nextPageUrl.value = data.nextPage;
  } finally { searching.value = false; loadingMore.value = false; }
}

async function loadMore(): Promise<void> {
  if (!nextPageUrl.value || loadingMore.value) return;
  await doSearch(false);
}

// Trigger immediately if opened with ?q=
if (query.value.length >= 2) onMounted(() => doSearch(true));
// Focus input on mount
onMounted(() => nextTick(() => inputRef.value?.focus()));

useHead({ title: computed(() => query.value ? `Поиск: ${query.value} — AniBox` : 'Поиск — AniBox') });
</script>
