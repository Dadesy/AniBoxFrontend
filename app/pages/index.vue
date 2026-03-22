<script setup lang="ts">
import type { NormalizedAnimeCard } from '~/types/metadata'
import { useHomeData } from '~/composables/useMetadata'
import HeroSlider from '~/components/home/HeroSlider.vue'
import AnimeCarousel from '~/components/home/AnimeCarousel.vue'
import ContinueWatchingRow from '~/components/home/ContinueWatchingRow.vue'
import CollectionRow from '~/components/home/CollectionRow.vue'
import NewsCard from '~/components/content/NewsCard.vue'
import MaintenanceBanner from '~/components/MaintenanceBanner.vue'
import ReleaseHighlightBanner from '~/components/ReleaseHighlightBanner.vue'
import { upgradeAnimePosterUrl } from '~/utils/poster-url-upgrade'

// ── Auth ─────────────────────────────────────────────────────────────────
const { isAuthenticated } = useAuth()
const { items: continueItems, pending: continuePending } = useContinueWatching({
  limit: 16,
})
const { collections } = useCollections()
const { news } = useNews(10)

// ── Главная: подборки с API сайта ────
const { siteName } = useSiteBranding()
const { hero, sections, loading: metaLoading } = useHomeData()

// ── Hero slider: hero card + up to 4 high-rated ongoings ────────────────
// Prefer cards with externalId so navigation is instant (no resolve call)
function hasRenderablePoster(card: NormalizedAnimeCard | null | undefined): card is NormalizedAnimeCard {
  return !!upgradeAnimePosterUrl(card?.posterUrl)
}

function sameHeroCard(left: NormalizedAnimeCard, right: NormalizedAnimeCard): boolean {
  return (
    left.slug === right.slug ||
    left.externalId === right.externalId ||
    (left.source === right.source && left.id === right.id)
  )
}

const heroItems = computed<NormalizedAnimeCard[]>(() => {
  const items: NormalizedAnimeCard[] = []
  if (hasRenderablePoster(hero.value)) items.push(hero.value)

  for (const section of sections.value) {
    for (const card of section.items ?? []) {
      if (items.length >= 5) break
      // Only include cards with a poster so every hero slide shows an image
      if (!hasRenderablePoster(card)) continue
      if (!items.find((c) => sameHeroCard(c, card))) items.push(card)
    }
    if (items.length >= 5) break
  }

  return items
})

// ── Section metadata ─────────────────────────────────────────────────────
function sectionLink(sectionId: string): string {
  const map: Record<string, string> = {
    ongoings:      '/catalog?types=anime-serial',
    popular:       '/catalog',
    season:        '/catalog',
    announcements: '/catalog',
    fresh:         '/catalog?status=ongoing&order=aired_on',
    top_rated:     '/catalog',
  }
  return map[sectionId] ?? '/catalog'
}

const SKELETON_SECTIONS = ['Свежие релизы', 'Сейчас выходит', 'Топ по рейтингу', 'Популярное', 'Топ сезона', 'Скоро выйдет']

// ── SEO ──────────────────────────────────────────────────────────────────
const cfg     = useRuntimeConfig()
const siteUrl = cfg.public.siteUrl
const ogImage = `${siteUrl}/og-image.png`
const _desc = computed(
  () =>
    `Смотрите аниме онлайн бесплатно на ${siteName.value} — онгоинги, популярное, новинки сезона. Удобный плеер, история просмотров.`,
)

useSeoMeta({
  title: computed(
    () => `${siteName.value} — Смотрите аниме онлайн бесплатно`,
  ),
  description:        _desc,
  keywords:           'аниме онлайн, смотреть аниме бесплатно, онгоинги, аниме 2025, аниме 2026, новинки аниме',
  ogTitle:            computed(() => `${siteName.value} — Смотрите аниме онлайн`),
  ogDescription:      _desc,
  ogUrl:              siteUrl,
  ogImage:            ogImage,
  ogType:             'website',
  ogSiteName:         siteName,
  twitterCard:        'summary_large_image',
  twitterTitle:       computed(() => `${siteName.value} — Смотрите аниме онлайн`),
  twitterDescription: _desc,
  twitterImage:       ogImage,
  robots:             'index, follow, max-image-preview:large',
})

useHead({
  link: [{ rel: 'canonical', href: siteUrl }],
  script: computed(() => {
    const webSite = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName.value,
      url: siteUrl,
      description: _desc.value,
      inLanguage: 'ru-RU',
      publisher: { '@id': `${siteUrl}#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteUrl}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    }
    const organization = {
      '@context': 'https://schema.org',
      '@id': `${siteUrl}#organization`,
      '@type': 'Organization',
      name: siteName.value,
      url: siteUrl,
      logo: `${siteUrl}/og-image.png`,
    }
    return [
      {
        type: 'application/ld+json' as const,
        innerHTML: JSON.stringify(webSite),
      },
      {
        type: 'application/ld+json' as const,
        innerHTML: JSON.stringify(organization),
      },
    ]
  }),
})
</script>

<template>
  <div class="min-h-screen">

    <!-- ── Hero Slider (full-width) ──────────────────────────────────── -->
    <HeroSlider :items="heroItems" :loading="metaLoading" />

    <!-- Техработы — карточка; тег релиза в шапке с lg — здесь только до lg -->
    <div class="mx-auto max-w-screen-2xl px-4 pt-4 sm:px-6">
      <MaintenanceBanner />
      <div class="-mt-0.5 pt-1 lg:hidden">
        <ReleaseHighlightBanner placement="page" />
      </div>
    </div>

    <div class="mx-auto max-w-screen-2xl px-0 pt-4 sm:pt-6">

      <!-- ── Continue Watching (auth only) ──────────────────────────── -->
      <div
        v-if="isAuthenticated && (continuePending || continueItems.length)"
        class="mb-8 px-4 sm:px-6"
      >
        <ContinueWatchingRow
          :items="continueItems"
          :loading="continuePending"
        />
      </div>

      <!-- ── Collections grid ────────────────────────────────────────── -->
      <div
        v-if="collections.length"
        class="mb-8 px-4 sm:px-6"
      >
        <div class="mb-4 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="h-[1.1em] w-[3px] shrink-0 rounded-full bg-emerald-500/65" aria-hidden="true" />
            <h2 class="text-base font-bold text-white/90">Подборки</h2>
          </div>
          <NuxtLink
            to="/catalog"
            class="inline-flex items-center gap-0.5 rounded-full border border-white/[0.09] px-2.5 py-0.5 text-[11px] font-semibold text-white/35 transition-all hover:border-emerald-500/30 hover:bg-emerald-500/[0.07] hover:text-emerald-400"
          >
            Каталог
            <UIcon name="lucide:chevron-right" class="size-3" />
          </NuxtLink>
        </div>
        <CollectionRow :collections="collections" />
      </div>

      <!-- ── Подборки на главной ────────── -->
      <div class="space-y-[var(--app-section-gap-y)] pb-16">

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
          />

          <!-- Nothing loaded fallback -->
          <div
            v-if="!sections.length"
            class="flex flex-col items-center gap-4 py-16 text-center"
          >
            <UIcon name="lucide:wifi-off" class="h-12 w-12 text-white/20" />
            <p class="text-base text-white/40">Не удалось загрузить подборки</p>
            <p class="text-sm text-white/25">Проверьте подключение к сети или зайдите позже</p>
            <NuxtLink
              to="/catalog"
              class="mt-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-400 transition-colors"
            >
              Открыть каталог
            </NuxtLink>
          </div>
        </template>
      </div>

      <!-- ── Новости ─────────────────────────────────────── -->
      <div v-if="news.length" class="px-4 pb-8 sm:px-6">
        <div class="mb-4 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="h-[1.1em] w-[3px] shrink-0 rounded-full bg-emerald-500/65" aria-hidden="true" />
            <h2 class="text-base font-bold text-white/90">Новости аниме</h2>
          </div>
          <a
            href="https://shikimori.one/forum/animanga"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-0.5 rounded-full border border-white/[0.09] px-2.5 py-0.5 text-[11px] font-semibold text-white/35 transition-all hover:border-emerald-500/30 hover:bg-emerald-500/[0.07] hover:text-emerald-400"
          >
            Обсуждения
            <UIcon name="lucide:external-link" class="size-3" />
          </a>
        </div>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <NewsCard v-for="item in news.slice(0, 8)" :key="item.id" :item="item" />
        </div>
      </div>
    </div>
  </div>
</template>
