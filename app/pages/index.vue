<script setup lang="ts">
import type { EpisodeProgress } from '~/types/content'
import type { HomeSection, NormalizedAnimeCard, ScheduleDay } from '~/types/metadata'
import { useHomeData, useSchedule } from '~/composables/useMetadata'
import HeroSection from '~/components/home/HeroSection.vue'
import AnimeCarousel from '~/components/home/AnimeCarousel.vue'
import WeekSchedule from '~/components/home/WeekSchedule.vue'
import ContinueWatchingBlock from '~/components/content/ContinueWatchingBlock.vue'

// ── Auth ──────────────────────────────────────────────────────────────────
const { isAuthenticated } = useAuth()

// ── Metadata (Shikimori) ──────────────────────────────────────────────────
const { hero, sections, loading: metaLoading } = useHomeData()
const { schedule, loading: scheduleLoading, todayDayKey } = useSchedule()

// ── Continue watching ─────────────────────────────────────────────────────
const continueItems = ref<EpisodeProgress[]>([])
onMounted(async () => {
  if (!isAuthenticated.value) return
  try {
    const { loadContinueWatching } = useWatchProgress()
    continueItems.value = await loadContinueWatching()
  } catch { /* silent */ }
})

// Placeholder sections shown while loading (to avoid empty page flash)
const SKELETON_SECTIONS = [
  'Сейчас выходит',
  'Популярное',
  'Топ сезона',
  'Скоро выйдет',
]

// Section → catalog link map
function sectionLink(sectionId: string): string {
  const map: Record<string, string> = {
    ongoings:      '/catalog?types=anime-serial',
    popular:       '/catalog',
    season:        '/catalog',
    announcements: '/catalog',
  }
  return map[sectionId] ?? '/catalog'
}

// ── SEO ───────────────────────────────────────────────────────────────────
useHead({
  title: 'AniBox — Смотрите аниме онлайн',
  meta: [
    {
      name: 'description',
      content: 'Бесплатный стриминг аниме онлайн. Онгоинги, популярное, новинки сезона — всё в одном месте.',
    },
  ],
})
</script>

<template>
  <div class="min-h-screen">

    <!-- ── Hero ─────────────────────────────────────────────────────────── -->
    <div class="px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <HeroSection :card="hero" :loading="metaLoading" />
    </div>

    <!-- ── Continue watching (auth only) ──────────────────────────────── -->
    <div
      v-if="isAuthenticated && continueItems.length"
      class="mb-10 px-4 sm:px-6 lg:px-8"
    >
      <ContinueWatchingBlock :items="continueItems" />
    </div>

    <!-- ── Carousels ──────────────────────────────────────────────────── -->
    <div class="space-y-10 pb-16">

      <!-- Loading: always show 4 skeleton carousels -->
      <template v-if="metaLoading">
        <AnimeCarousel
          v-for="title in SKELETON_SECTIONS"
          :key="title"
          :title="title"
          :items="[]"
          :loading="true"
        />
      </template>

      <!-- Loaded: real sections -->
      <template v-else>
        <AnimeCarousel
          v-for="section in sections"
          :key="section.id"
          :title="section.title"
          :items="section.items"
          :loading="false"
          :see-all-href="sectionLink(section.id)"
        />

        <!-- Fallback: nothing came back from API -->
        <div
          v-if="!sections.length"
          class="flex flex-col items-center gap-4 py-16 text-center"
        >
          <UIcon name="i-heroicons-signal-slash" class="h-12 w-12 text-white/20" />
          <p class="text-base text-white/40">Не удалось загрузить подборки</p>
          <p class="text-sm text-white/25">Проверьте, что бэкенд запущен</p>
          <NuxtLink
            to="/catalog"
            class="mt-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-400"
          >
            Открыть каталог
          </NuxtLink>
        </div>
      </template>
    </div>

    <!-- ── Bottom: Schedule ───────────────────────────────────────────── -->
    <div class="px-4 pb-16 sm:px-6 lg:px-8">
      <WeekSchedule
        :schedule="schedule"
        :loading="scheduleLoading"
        :today-day-key="todayDayKey"
      />
    </div>

  </div>
</template>
