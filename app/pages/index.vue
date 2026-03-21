<script setup lang="ts">
import type { EpisodeProgress } from '~/types/content'
import type { NormalizedAnimeCard } from '~/types/metadata'
import { useHomeData } from '~/composables/useMetadata'
import HeroSlider from '~/components/home/HeroSlider.vue'
import AnimeCarousel from '~/components/home/AnimeCarousel.vue'
import GenreRow from '~/components/home/GenreRow.vue'
import ContinueWatchingBlock from '~/components/content/ContinueWatchingBlock.vue'

// ── Auth ─────────────────────────────────────────────────────────────────
const { isAuthenticated } = useAuth()

// ── Home data — all sections including AniLibria fresh (from backend) ────
const { hero, sections, loading: metaLoading } = useHomeData()

// ── Hero slider: hero card + up to 4 high-rated ongoings ────────────────
// Prefer cards with externalId so navigation is instant (no resolve call)
const heroItems = computed<NormalizedAnimeCard[]>(() => {
  const items: NormalizedAnimeCard[] = []
  if (hero.value) items.push(hero.value)

  const ongoings = sections.value.find((s) => s.id === 'ongoings')
  if (ongoings?.items) {
    for (const card of ongoings.items) {
      if (items.length >= 5) break
      if (!items.find((c) => c.id === card.id)) items.push(card)
    }
  }
  return items
})

// ── Continue watching ─────────────────────────────────────────────────
const continueItems = ref<EpisodeProgress[]>([])
onMounted(async () => {
  if (!isAuthenticated.value) return
  try {
    const { loadContinueWatching } = useWatchProgress()
    continueItems.value = await loadContinueWatching()
  } catch { /* silent */ }
})

// ── Section metadata ─────────────────────────────────────────────────────
function sectionLink(sectionId: string): string {
  const map: Record<string, string> = {
    ongoings:      '/catalog?types=anime-serial',
    popular:       '/catalog',
    season:        '/catalog',
    announcements: '/catalog',
    fresh:         '/catalog',
    top_rated:     '/catalog',
  }
  return map[sectionId] ?? '/catalog'
}

/** Source badges shown in carousel headers for third-party sections */
function sectionBadge(sectionId: string): string | undefined {
  if (sectionId === 'fresh')     return 'AniLibria'
  if (sectionId === 'top_rated') return 'Yani.tv'
  return undefined
}

const SKELETON_SECTIONS = ['Свежие релизы', 'Сейчас выходит', 'Топ по рейтингу', 'Популярное', 'Топ сезона', 'Скоро выйдет']

// ── SEO ──────────────────────────────────────────────────────────────────
const cfg     = useRuntimeConfig()
const siteUrl = cfg.public.siteUrl
const ogImage = `${siteUrl}/og-image.png`
const _desc   = 'Смотрите аниме онлайн бесплатно на AniBox — онгоинги, популярное, новинки сезона. Удобный плеер, история просмотров.'

useSeoMeta({
  title:              'AniBox — Смотрите аниме онлайн бесплатно',
  description:        _desc,
  keywords:           'аниме онлайн, смотреть аниме бесплатно, онгоинги, аниме 2025, аниме 2026, новинки аниме',
  ogTitle:            'AniBox — Смотрите аниме онлайн',
  ogDescription:      _desc,
  ogUrl:              siteUrl,
  ogImage:            ogImage,
  ogType:             'website',
  ogSiteName:         'AniBox',
  twitterCard:        'summary_large_image',
  twitterTitle:       'AniBox — Смотрите аниме онлайн',
  twitterDescription: _desc,
  twitterImage:       ogImage,
  robots:             'index, follow, max-image-preview:large',
})

useHead({
  link: [{ rel: 'canonical', href: siteUrl }],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'AniBox',
      url: siteUrl,
      description: _desc,
      inLanguage: 'ru',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteUrl}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    }),
  }],
})
</script>

<template>
  <div class="min-h-screen">

    <!-- ── Hero Slider (full-width) ──────────────────────────────────── -->
    <HeroSlider :items="heroItems" :loading="metaLoading" />

    <div class="max-w-screen-2xl mx-auto">

      <!-- ── Genre quick-access row ─────────────────────────────────── -->
      <div class="px-4 py-5 sm:px-6 sm:py-6">
        <GenreRow />
      </div>

      <!-- ── Continue Watching (auth only) ──────────────────────────── -->
      <div
        v-if="isAuthenticated && continueItems.length"
        class="mb-8 px-4 sm:px-6"
      >
        <ContinueWatchingBlock :items="continueItems" />
      </div>

      <!-- ── Sections: AniLibria fresh + Shikimori carousels ────────── -->
      <div class="space-y-8 pb-16">

        <!-- Skeleton while loading -->
        <template v-if="metaLoading">
          <AnimeCarousel
            v-for="title in SKELETON_SECTIONS"
            :key="title"
            :title="title"
            :items="[]"
            :loading="true"
          />
        </template>

        <!-- Loaded sections -->
        <template v-else>
          <AnimeCarousel
            v-for="section in sections"
            :key="section.id"
            :title="section.title"
            :items="section.items"
            :loading="false"
            :see-all-href="sectionLink(section.id)"
            :source-badge="sectionBadge(section.id)"
          />

          <!-- Nothing loaded fallback -->
          <div
            v-if="!sections.length"
            class="flex flex-col items-center gap-4 py-16 text-center"
          >
            <UIcon name="lucide:wifi-off" class="h-12 w-12 text-white/20" />
            <p class="text-base text-white/40">Не удалось загрузить подборки</p>
            <p class="text-sm text-white/25">Проверьте соединение с бэкендом</p>
            <NuxtLink
              to="/catalog"
              class="mt-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-400 transition-colors"
            >
              Открыть каталог
            </NuxtLink>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
