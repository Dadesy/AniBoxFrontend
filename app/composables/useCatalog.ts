/**
 * composables/useCatalog.ts
 *
 * Manages catalog state: filters, page-based pagination, loading.
 * Backed by Shikimori via /metadata/catalog with Kodik availability enrichment.
 */

import type { CatalogCard, CatalogFilters, CatalogPageResult, FilterOptions } from '~/types/content'

const EMPTY_OPTIONS: FilterOptions = {
  genres: [],
  kinds: [],
  statuses: [],
  sorts: [],
  seasons: [],
  ageRatings: [],
  studios: [],
  demographics: [],
}

export const useCatalog = () => {
  const apiUrl = useApiUrl()

  const items = ref<CatalogCard[]>([])
  const page = ref(1)
  const hasMore = ref(false)
  const loading = ref(false)
  const loadingMore = ref(false)
  const error = ref<string | null>(null)
  const filters = reactive<CatalogFilters>({})
  const filterOptions = ref<FilterOptions>({ ...EMPTY_OPTIONS })

  // Legacy-compat aliases used by catalog page
  const total = computed(() => items.value.length)
  const nextPage = computed(() => hasMore.value ? String(page.value + 1) : null)

  function buildParams(isLoadMore: boolean): URLSearchParams {
    const p = new URLSearchParams()
    if (filters.kind)        p.set('kind',        filters.kind)
    if (filters.status)      p.set('status',      filters.status)
    if (filters.genre)       p.set('genre',       filters.genre)
    if (filters.season)      p.set('season',      filters.season)
    if (filters.score)       p.set('score',       filters.score)
    if (filters.order)       p.set('order',       filters.order)
    if (filters.search)      p.set('search',      filters.search)
    if (filters.hasPlayer)   p.set('hasPlayer',   'true')
    if (filters.yearFrom)    p.set('yearFrom',    filters.yearFrom)
    if (filters.yearTo)      p.set('yearTo',      filters.yearTo)
    if (filters.ageRating)   p.set('ageRating',   filters.ageRating)
    if (filters.studio)      p.set('studio',      filters.studio)
    if (filters.demographic) p.set('demographic', filters.demographic)
    p.set('page',  isLoadMore ? String(page.value + 1) : '1')
    p.set('limit', '28')
    return p
  }

  async function fetchCatalog(reset = true): Promise<void> {
    if (reset) {
      loading.value = true
      items.value = []
      page.value = 1
    } else {
      loadingMore.value = true
    }
    error.value = null

    try {
      const data = await $fetch<CatalogPageResult>(
        `${apiUrl}/metadata/catalog?${buildParams(!reset)}`,
      )

      if (reset) {
        items.value = data.items
        page.value = 1
      } else {
        items.value.push(...data.items)
        page.value = data.page
      }
      hasMore.value = data.hasMore
    } catch {
      error.value = 'Не удалось загрузить каталог'
    } finally {
      loading.value = false
      loadingMore.value = false
    }
  }

  async function loadMore(): Promise<void> {
    if (!hasMore.value || loadingMore.value) return
    await fetchCatalog(false)
  }

  async function applyFilters(newFilters: CatalogFilters): Promise<void> {
    Object.keys(filters).forEach((k) => delete (filters as Record<string, unknown>)[k])
    Object.assign(filters, newFilters)
    await fetchCatalog(true)
  }

  async function resetFilters(): Promise<void> {
    Object.keys(filters).forEach((k) => delete (filters as Record<string, unknown>)[k])
    await fetchCatalog(true)
  }

  async function fetchFilterOptions(): Promise<void> {
    try {
      filterOptions.value = await $fetch<FilterOptions>(`${apiUrl}/metadata/catalog/filters`)
    } catch {
      // non-critical
    }
  }

  return {
    items,
    total,
    nextPage,
    hasMore,
    page,
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
  }
}
