<template>
  <div class="pt-24 pb-12 px-4 sm:px-6 lg:px-8 xl:px-12 mx-auto max-w-screen-2xl space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
      <div>
        <h1 class="text-3xl font-extrabold text-white">Каталог</h1>
        <p v-if="!loading" class="text-slate-400 text-sm mt-1">
          <span class="text-white font-medium">{{ total.toLocaleString('ru') }}</span> тайтлов
        </p>
      </div>
      <NuxtLink
        to="/search"
        class="flex items-center gap-2 px-4 py-2.5 glass hover:bg-white/8 text-slate-300 hover:text-white rounded-xl text-sm font-medium transition-all self-start sm:self-auto"
      >
        <UIcon name="lucide:search" class="size-4" />
        Поиск
      </NuxtLink>
    </div>

    <!-- Filters -->
    <CatalogFilters
      :model-value="filters"
      :options="filterOptions"
      @change="applyFilters"
      @reset="resetFilters"
    />

    <!-- Error -->
    <div v-if="error" class="py-8 text-center">
      <UIcon name="lucide:alert-circle" class="size-10 text-red-400 mx-auto mb-3" />
      <p class="text-slate-400">{{ error }}</p>
    </div>

    <!-- Skeleton -->
    <div v-else-if="loading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
      <div v-for="i in 21" :key="i" class="space-y-2">
        <div class="aspect-[2/3] w-full skeleton-shine rounded-xl" />
        <div class="h-3 w-3/4 rounded skeleton-shine" />
        <div class="h-2.5 w-1/2 rounded skeleton-shine" />
      </div>
    </div>

    <!-- Grid -->
    <div
      v-else-if="items.length"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4 animate-fade-in"
    >
      <TitleCard v-for="item in items" :key="item.externalId" :content="item" />
    </div>

    <!-- Empty -->
    <div v-else class="py-24 text-center space-y-4">
      <UIcon name="lucide:search-x" class="size-16 text-slate-700 mx-auto" />
      <p class="text-xl font-semibold text-white">Ничего не найдено</p>
      <p class="text-slate-500 text-sm">Попробуйте изменить фильтры</p>
      <button
        class="mt-2 px-5 py-2.5 glass hover:bg-white/8 text-slate-300 rounded-xl text-sm font-medium transition-all"
        @click="resetFilters"
      >
        Сбросить фильтры
      </button>
    </div>

    <!-- Infinite load trigger -->
    <div v-if="nextPage && !loading" ref="loadMoreTrigger" class="flex justify-center pt-4">
      <div class="flex items-center gap-2 px-6 py-3 text-sm text-slate-500">
        <UIcon v-if="loadingMore" name="lucide:loader-circle" class="size-4 animate-spin text-green-400" />
        <span>{{ loadingMore ? 'Загружаем ещё…' : 'Подгрузка при прокрутке' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CatalogFilters from '~/components/content/CatalogFilters.vue';
import TitleCard from '~/components/content/TitleCard.vue';

const route = useRoute();

const {
  items, total, nextPage, loading, loadingMore, error,
  filters, filterOptions,
  fetchCatalog, loadMore, applyFilters, resetFilters, fetchFilterOptions,
} = useCatalog();
const loadMoreTrigger = useInfiniteTrigger(
  () => !!nextPage.value && !loading.value && !loadingMore.value,
  loadMore,
);

if (route.query.types && ['anime-serial', 'anime'].includes(route.query.types as string)) {
  filters.types = route.query.types as string;
}
if (route.query.genres) filters.genres = route.query.genres as string;
if (route.query.year)   filters.year   = route.query.year as string;

async function loadCatalogPage(): Promise<void> {
  await Promise.all([fetchCatalog(), fetchFilterOptions()]);
}

if (import.meta.server) {
  await loadCatalogPage();
} else {
  onMounted(() => {
    if (!items.value.length && !filterOptions.value.genres.length) {
      void loadCatalogPage();
    }
  });
}

useHead({ title: 'Каталог — AniBox' });
</script>
