<template>
  <div class="mx-auto max-w-screen-2xl px-4 pb-12 pt-8 sm:px-6 lg:px-8 xl:px-12">
    <!-- Header -->
    <div class="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 class="text-3xl font-extrabold text-white">Каталог</h1>
        <p class="mt-1 text-sm text-slate-400">
          <template v-if="loading">Загружаем…</template>
          <template v-else-if="items.length">
            <span class="font-medium text-white">{{ items.length.toLocaleString('ru') }}</span>
            тайтлов{{ hasMore ? '+' : '' }}
          </template>
          <template v-else>Ничего не найдено</template>
        </p>
      </div>
      <div class="flex items-center gap-2 self-start sm:self-auto">
        <!-- Mobile filter button -->
        <button
          class="glass flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-white/8 hover:text-white lg:hidden"
          @click="drawerOpen = true"
        >
          <UIcon name="lucide:sliders-horizontal" class="size-4" />
          Фильтры
          <span
            v-if="activeFilterCount > 0"
            class="flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-black"
          >{{ activeFilterCount }}</span>
        </button>

        <NuxtLink
          to="/search"
          class="glass flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-white/8 hover:text-white"
        >
          <UIcon name="lucide:search" class="size-4" />
          Поиск
        </NuxtLink>
      </div>
    </div>

    <!-- Active chips (mobile summary) -->
    <div v-if="activeFilterCount > 0" class="mb-4 flex flex-wrap gap-2 lg:hidden">
      <template v-for="chip in activeChips" :key="chip.key + chip.value">
        <span class="flex items-center gap-1 rounded-full border border-green-500/40 bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-400">
          {{ chip.label }}
          <button class="ml-0.5 hover:text-white" @click="removeChip(chip)">
            <UIcon name="lucide:x" class="size-3" />
          </button>
        </span>
      </template>
      <button
        class="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-400 hover:text-white"
        @click="resetFilters"
      >
        Сбросить все
      </button>
    </div>

    <div class="flex gap-6">
      <!-- ── Sidebar (desktop) ──────────────────────────────────────── -->
      <div class="hidden w-56 shrink-0 lg:block xl:w-64">
        <div class="sticky top-4 overflow-y-auto" style="max-height: calc(100dvh - 5rem)">
          <FilterSidebar
            :model-value="filters"
            :options="filterOptions"
            @change="applyFilters"
            @reset="resetFilters"
          />
        </div>
      </div>

      <!-- ── Main column ────────────────────────────────────────────── -->
      <div class="min-w-0 flex-1">
        <!-- Error -->
        <div v-if="error" class="py-8 text-center">
          <UIcon name="lucide:alert-circle" class="mx-auto mb-3 size-10 text-red-400" />
          <p class="text-slate-400">{{ error }}</p>
        </div>

        <!-- Skeleton grid — aspect-[2/3] matches real cards exactly → no layout shift -->
        <div
          v-else-if="loading"
          class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
        >
          <div
            v-for="i in 28"
            :key="i"
            class="overflow-hidden rounded-xl"
          >
            <div
              class="aspect-[2/3] w-full bg-cinema-card skeleton-shine"
              :style="{ animationDelay: `${Math.min((i - 1) * 25, 350)}ms` }"
            />
          </div>
        </div>

        <!-- Grid -->
        <div
          v-else-if="items.length"
          class="animate-fade-in grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
        >
          <!--
            First 6 cards are above the fold on most screens.
            priority=true → fetchpriority="high" + loading="eager" for LCP.
          -->
          <TitleCard
            v-for="(item, idx) in items"
            :key="item.externalId || item.id || item.title"
            :content="item"
            :priority="idx < 6"
          />
        </div>

        <!-- Empty -->
        <div v-else class="space-y-4 py-24 text-center">
          <UIcon name="lucide:search-x" class="mx-auto size-16 text-slate-700" />
          <p class="text-xl font-semibold text-white">Ничего не найдено</p>
          <p class="text-sm text-slate-500">Попробуйте изменить фильтры</p>
          <button
            class="glass mt-2 rounded-xl px-5 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-white/8"
            @click="resetFilters"
          >
            Сбросить фильтры
          </button>
        </div>

        <!-- Infinite scroll trigger -->
        <div v-if="hasMore && !loading" ref="loadMoreTrigger" class="flex justify-center pt-4">
          <div class="flex items-center gap-2 px-6 py-3 text-sm text-slate-500">
            <UIcon
              v-if="loadingMore"
              name="lucide:loader-circle"
              class="size-4 animate-spin text-green-400"
            />
            <span>{{ loadingMore ? 'Загружаем ещё…' : 'Подгрузка при прокрутке' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile filter drawer -->
    <FilterDrawer
      v-model="drawerOpen"
      :filters="filters"
      :options="filterOptions"
      @change="applyFilters"
      @reset="resetFilters"
    />
  </div>
</template>

<script setup lang="ts">
import FilterSidebar from '~/components/content/FilterSidebar.vue'
import FilterDrawer from '~/components/content/FilterDrawer.vue'
import TitleCard from '~/components/content/TitleCard.vue'
import type { CatalogFilters } from '~/types/content'

const { pageTitle } = useSiteBranding()
const cfg = useRuntimeConfig()
const siteUrl = cfg.public.siteUrl as string
const ogImage = `${siteUrl}/og-image.png`
const catalogDesc =
  'Каталог аниме онлайн: фильтры по жанру, году, студии и статусу. Онгоинги, фильмы и новинки сезона.'

usePageCanonical('/catalog')

const catalogTitle = computed(() => pageTitle('Каталог'))

useSeoMeta({
  title: catalogTitle,
  description: catalogDesc,
  ogTitle: catalogTitle,
  ogDescription: catalogDesc,
  ogUrl: `${siteUrl}/catalog`,
  ogImage,
  twitterCard: 'summary_large_image',
  twitterTitle: catalogTitle,
  twitterDescription: catalogDesc,
  twitterImage: ogImage,
  robots: 'index, follow, max-image-preview:large',
})

const {
  items, hasMore, loading, loadingMore, error,
  filters, filterOptions,
  fetchCatalog,
  loadMore,
  applyFilters,
  resetFilters,
  fetchFilterOptions,
  hydrateFiltersFromRoute,
} = useCatalog()

const drawerOpen = ref(false)

const loadMoreTrigger = useInfiniteTrigger(
  () => hasMore.value && !loading.value && !loadingMore.value,
  loadMore,
)

// ── Active chips ──────────────────────────────────────────────────────────

interface ActiveChip {
  key: keyof CatalogFilters
  value: string
  label: string
}

const LABEL_MAPS: Partial<Record<keyof CatalogFilters, Record<string, string>>> = {
  order: {
    popularity: 'Популярность', ranked: 'Рейтинг',
    aired_on: 'Дата выхода', name: 'Название', random: 'Случайно',
  },
  status: { ongoing: 'Выходит', released: 'Вышло', anons: 'Анонс' },
  kind: {
    tv: 'TV', movie: 'Фильм', ova: 'OVA',
    ona: 'ONA', special: 'Спешл', music: 'Клип',
  },
  ageRating: {
    g: 'G', pg: 'PG', pg_13: 'PG-13', r: 'R', r_plus: 'R+',
  },
}

const MULTI_FIELDS: Array<keyof CatalogFilters> = [
  'kind', 'status', 'genre', 'demographic', 'ageRating', 'studio',
]

const activeChips = computed<ActiveChip[]>(() => {
  const chips: ActiveChip[] = []

  for (const [key, value] of Object.entries(filters)) {
    if (!value) continue
    const k = key as keyof CatalogFilters

    if (k === 'hasPlayer' && value) {
      chips.push({ key: k, value: 'true', label: 'Только с плеером' })
      continue
    }
    if (k === 'yearFrom')   { chips.push({ key: k, value: String(value), label: `От ${value}` }); continue }
    if (k === 'yearTo')     { chips.push({ key: k, value: String(value), label: `До ${value}` }); continue }
    if (k === 'score')      { chips.push({ key: k, value: String(value), label: `${value}+ рейтинг` }); continue }
    if (k === 'season')     { chips.push({ key: k, value: String(value), label: String(value).replace('_', ' ') }); continue }
    if (k === 'search')     { chips.push({ key: k, value: String(value), label: `«${value}»` }); continue }
    if (k === 'order')      {
      const map = LABEL_MAPS.order ?? {}
      chips.push({ key: k, value: String(value), label: map[String(value)] ?? String(value) })
      continue
    }

    if (MULTI_FIELDS.includes(k)) {
      const parts = String(value).split(',').map((s) => s.trim()).filter(Boolean)
      for (const part of parts) {
        const map = (LABEL_MAPS as Record<string, Record<string, string>>)[k] ?? {}

        // Genre / studio label: try to find in options
        let label = map[part] ?? part
        if (k === 'genre') {
          const found = filterOptions.value.genres.find((g) => String(g.id) === part)
          if (found) label = found.russian || found.name
        }
        if (k === 'studio') {
          const found = (filterOptions.value.studios ?? []).find((s) => String(s.id) === part)
          if (found) label = found.name
        }
        if (k === 'demographic') {
          const found = (filterOptions.value.demographics ?? []).find((d) => d.value === part)
          if (found) label = found.label
        }
        chips.push({ key: k, value: part, label })
      }
    }
  }

  return chips
})

const activeFilterCount = computed(() => activeChips.value.length)

function removeChip(chip: ActiveChip): void {
  const current = (filters as Record<string, unknown>)[chip.key]
  if (!current) return

  if (MULTI_FIELDS.includes(chip.key)) {
    const parts = String(current)
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s !== chip.value)
    ;(filters as Record<string, unknown>)[chip.key] = parts.length ? parts.join(',') : undefined
  } else {
    ;(filters as Record<string, unknown>)[chip.key] = undefined
  }

  void fetchCatalog(true)
}

// ── Init ──────────────────────────────────────────────────────────────────

async function init(): Promise<void> {
  hydrateFiltersFromRoute()
  await Promise.all([fetchCatalog(), fetchFilterOptions()])
}

if (import.meta.server) {
  await init()
} else {
  onMounted(() => {
    if (!items.value.length) void init()
  })
}

</script>
