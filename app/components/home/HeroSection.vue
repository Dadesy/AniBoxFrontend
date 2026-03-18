<script setup lang="ts">
import type { NormalizedAnimeCard } from '~/types/metadata'
import { KIND_LABELS, STATUS_LABELS } from '~/types/metadata'
import { navigateToCard } from '~/composables/useMetadata'

const props = defineProps<{
  card: NormalizedAnimeCard | null
  loading?: boolean
}>()

const navigating = ref(false)

async function handleWatch() {
  if (!props.card || navigating.value) return
  navigating.value = true
  await navigateToCard(props.card)
  navigating.value = false
}

const displayTitle  = computed(() => props.card?.titleRu || props.card?.title || '')
const kindLabel     = computed(() => KIND_LABELS[props.card?.kind ?? ''] ?? '')
const statusLabel   = computed(() => STATUS_LABELS[props.card?.status ?? ''] ?? '')
const genreList     = computed(() => (props.card?.genres ?? []).slice(0, 4).join(' · '))
const episodeLabel  = computed(() => {
  if (!props.card) return ''
  if (props.card.episodesAired && props.card.episodes) {
    return `${props.card.episodesAired} / ${props.card.episodes} эп.`
  }
  if (props.card.episodesAired) return `${props.card.episodesAired} эп.`
  if (props.card.episodes)      return `${props.card.episodes} эп.`
  return ''
})
</script>

<template>
  <!-- Skeleton -->
  <div
    v-if="loading || !card"
    class="relative h-[480px] w-full overflow-hidden rounded-2xl sm:h-[560px]"
    style="background: linear-gradient(135deg, #0f1a14 0%, #111827 50%, #0a0f0a 100%);"
  >
    <!-- Animated shimmer overlay -->
    <div class="skeleton-shine absolute inset-0 opacity-60" />
    <!-- Fake green glow blob -->
    <div class="pointer-events-none absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl" />

    <div class="absolute bottom-10 left-8 space-y-4 sm:left-12">
      <!-- Badge row -->
      <div class="flex gap-2">
        <div class="h-6 w-20 animate-pulse rounded-full bg-white/10" />
        <div class="h-6 w-14 animate-pulse rounded-full bg-white/10" />
      </div>
      <!-- Title -->
      <div class="space-y-2">
        <div class="h-9 w-72 animate-pulse rounded-lg bg-white/10 sm:w-96" />
        <div class="h-9 w-48 animate-pulse rounded-lg bg-white/10" />
      </div>
      <!-- Meta -->
      <div class="flex gap-3">
        <div class="h-4 w-12 animate-pulse rounded bg-white/8" />
        <div class="h-4 w-20 animate-pulse rounded bg-white/8" />
        <div class="h-4 w-28 animate-pulse rounded bg-white/8" />
      </div>
      <!-- Buttons -->
      <div class="flex gap-3 pt-2">
        <div class="h-12 w-36 animate-pulse rounded-xl bg-emerald-500/20" />
        <div class="h-12 w-28 animate-pulse rounded-xl bg-white/8" />
      </div>
    </div>

    <!-- Right thumbnail skeleton -->
    <div class="absolute right-8 top-1/2 hidden -translate-y-1/2 md:block"
      style="width:160px;">
      <div class="aspect-[2/3] w-full animate-pulse rounded-xl bg-white/10" />
    </div>
  </div>

  <!-- Hero card -->
  <div
    v-else
    class="group relative h-[480px] w-full overflow-hidden rounded-2xl sm:h-[560px]"
  >
    <!-- Background poster -->
    <img
      :src="card.posterUrl"
      :alt="displayTitle"
      class="absolute inset-0 h-full w-full scale-105 object-cover transition-transform duration-[8s] ease-out group-hover:scale-100"
    />

    <!-- Gradient overlays for cinematic feel -->
    <div class="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
    <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

    <!-- Soft overlay texture -->
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.10),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.05),transparent_30%)]" />

    <!-- Content -->
    <div class="absolute inset-0 flex items-end p-8 sm:p-12">
      <div class="max-w-xl space-y-4">
        <!-- Badges row -->
        <div class="flex flex-wrap items-center gap-2">
          <span
            v-if="card.status === 'ongoing' || card.status === 'Currently Airing'"
            class="flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-emerald-500/30"
          >
            <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            Онгоинг
          </span>
          <span
            v-else-if="card.status === 'anons' || card.status === 'Not yet aired'"
            class="rounded-full bg-blue-500/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white"
          >
            Анонс
          </span>
          <span
            v-if="kindLabel"
            class="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm"
          >
            {{ kindLabel }}
          </span>
          <span
            v-if="card.score"
            class="flex items-center gap-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-400"
          >
            <UIcon name="i-heroicons-star-solid" class="h-3 w-3" />
            {{ card.score.toFixed(1) }}
          </span>
        </div>

        <!-- Title -->
        <h1 class="text-3xl font-extrabold leading-tight tracking-tight text-white drop-shadow-lg sm:text-4xl">
          {{ displayTitle }}
        </h1>

        <!-- Meta info -->
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/60">
          <span v-if="card.year">{{ card.year }}</span>
          <span v-if="episodeLabel" class="flex items-center gap-1">
            <UIcon name="i-heroicons-film" class="h-3.5 w-3.5" />
            {{ episodeLabel }}
          </span>
          <span v-if="genreList" class="hidden sm:inline">{{ genreList }}</span>
        </div>

        <!-- Synopsis -->
        <p
          v-if="card.synopsis"
          class="line-clamp-3 text-sm leading-relaxed text-white/70"
        >
          {{ card.synopsis }}
        </p>

        <!-- CTA -->
        <div class="flex items-center gap-3 pt-2">
          <button
            class="group/btn flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:bg-emerald-400 hover:shadow-emerald-400/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="navigating"
            @click="handleWatch"
          >
            <UIcon
              v-if="!navigating"
              name="i-heroicons-play-solid"
              class="h-4 w-4 transition-transform group-hover/btn:scale-110"
            />
            <UIcon v-else name="i-heroicons-arrow-path" class="h-4 w-4 animate-spin" />
            {{ navigating ? 'Загрузка...' : 'Смотреть' }}
          </button>

          <NuxtLink
            to="/catalog"
            class="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/10 hover:text-white"
          >
            <UIcon name="i-heroicons-squares-2x2" class="h-4 w-4" />
            Каталог
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Right side: poster thumbnail for small screens hidden on large -->
    <div
      class="absolute right-8 top-1/2 hidden -translate-y-1/2 md:block"
      style="width:160px;"
    >
      <img
        :src="card.posterUrl"
        :alt="displayTitle"
        class="h-auto w-full rounded-xl shadow-2xl ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-105"
      />
    </div>
  </div>
</template>
