/**
 * composables/useCatalog.ts
 *
 * Управляет состоянием каталога: фильтры, пагинация, загрузка.
 */

import type { CatalogFilters, CatalogResponse, ContentCard, FilterOptions } from '~/types/content';

export const useCatalog = () => {
  const apiUrl = useApiUrl();

  const items = ref<ContentCard[]>([]);
  const total = ref(0);
  const nextPage = ref<string | null>(null);
  const loading = ref(false);
  const loadingMore = ref(false);
  const error = ref<string | null>(null);
  const filters = reactive<CatalogFilters>({});
  const filterOptions = ref<FilterOptions>({ genres: [], years: [], types: [] });

  async function fetchCatalog(reset = true): Promise<void> {
    if (reset) {
      loading.value = true;
      items.value = [];
      nextPage.value = null;
    } else {
      loadingMore.value = true;
    }
    error.value = null;

    try {
      const params = new URLSearchParams();
      if (filters.types) params.set('types', filters.types);
      if (filters.genres) params.set('genres', filters.genres);
      if (filters.year) params.set('year', filters.year);
      if (filters.country) params.set('country', filters.country);
      if (filters.translationId) params.set('translationId', filters.translationId);
      if (!reset && nextPage.value) params.set('nextPage', nextPage.value);

      const data = await $fetch<CatalogResponse>(
        `${apiUrl}/content/catalog?${params}`,
      );

      if (reset) {
        items.value = data.items;
      } else {
        items.value.push(...data.items);
      }
      total.value = data.total;
      nextPage.value = data.nextPage;
    } catch {
      error.value = 'Не удалось загрузить каталог';
    } finally {
      loading.value = false;
      loadingMore.value = false;
    }
  }

  async function loadMore(): Promise<void> {
    if (!nextPage.value || loadingMore.value) return;
    await fetchCatalog(false);
  }

  async function applyFilters(newFilters: CatalogFilters): Promise<void> {
    Object.assign(filters, newFilters);
    await fetchCatalog(true);
  }

  async function resetFilters(): Promise<void> {
    Object.keys(filters).forEach((k) => delete (filters as Record<string, unknown>)[k]);
    await fetchCatalog(true);
  }

  async function fetchFilterOptions(): Promise<void> {
    try {
      filterOptions.value = await $fetch<FilterOptions>(`${apiUrl}/content/filters`);
    } catch {
      // non-critical, keep empty defaults
    }
  }

  return {
    items,
    total,
    nextPage,
    loading,
    loadingMore,
    error,
    filters,
    filterOptions,
    fetchCatalog,
    loadMore,
    applyFilters,
    resetFilters,
    fetchFilterOptions,
  };
};
