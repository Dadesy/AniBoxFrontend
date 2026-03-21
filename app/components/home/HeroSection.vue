<script setup lang="ts">
import type { NormalizedAnimeCard } from '~/types/metadata'
import { KIND_LABELS } from '~/types/metadata'
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

const displayTitle = computed(() => props.card?.titleRu || props.card?.title || '')
const kindLabel    = computed(() => KIND_LABELS[props.card?.kind ?? ''] ?? '')
const isOngoing    = computed(() =>
  props.card?.status === 'ongoing' || props.card?.status === 'Currently Airing',
)
const episodeLabel = computed(() => {
  if (!props.card) return ''
  if (props.card.episodesAired && props.card.episodes)
    return `${props.card.episodesAired} / ${props.card.episodes} эп.`
  if (props.card.episodesAired) return `${props.card.episodesAired} эп.`
  if (props.card.episodes)      return `${props.card.episodes} эп.`
  return ''
})
</script>

<template>
  <!-- ── Skeleton ─────────────────────────────────────────────────────── -->
  <div
    v-if="loading || !card"
    class="hero-wrap relative h-[300px] sm:h-[340px] w-full overflow-hidden rounded-lg"
  >
    <div class="skeleton-shine absolute inset-0" style="background: #1c1c1f;" />
    <div class="absolute inset-0 flex items-end p-6 sm:p-8">
      <div class="space-y-3 w-full max-w-md">
        <div class="flex gap-2">
          <div class="h-5 w-16 animate-pulse rounded bg-white/8" />
          <div class="h-5 w-12 animate-pulse rounded bg-white/8" />
        </div>
        <div class="h-7 w-64 animate-pulse rounded bg-white/10 sm:w-80" />
        <div class="h-4 w-40 animate-pulse rounded bg-white/6" />
        <div class="flex gap-2 pt-1">
          <div class="h-9 w-28 animate-pulse rounded bg-emerald-500/20" />
          <div class="h-9 w-24 animate-pulse rounded bg-white/6" />
        </div>
      </div>
    </div>
  </div>

  <!-- ── Hero ─────────────────────────────────────────────────────────── -->
  <div
    v-else
    class="hero-wrap group relative h-[300px] sm:h-[360px] w-full overflow-hidden rounded-lg"
  >
    <!-- Background poster -->
    <img
      :src="card.posterUrl"
      :alt="displayTitle"
      class="absolute inset-0 h-full w-full object-cover scale-[1.04] transition-transform duration-[6s] group-hover:scale-100"
      style="filter: blur(2px);"
    />

    <!-- Gradient overlay — left-heavy, minimal -->
    <div class="absolute inset-0" style="background: linear-gradient(to right, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.18) 100%)" />
    <div class="absolute inset-0" style="background: linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 50%)" />

    <!-- Content -->
    <div class="relative h-full flex items-end justify-between p-6 sm:p-8">

      <!-- Left: info -->
      <div class="max-w-sm space-y-2.5">

        <!-- Badges -->
        <div class="flex items-center gap-1.5">
          <span
            v-if="isOngoing"
            class="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 uppercase tracking-wide"
          >
            <span class="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Онгоинг
          </span>
          <span
            v-else-if="card.status === 'anons'"
            class="text-[11px] font-semibold text-blue-400 uppercase tracking-wide"
          >
            Анонс
          </span>
          <span v-if="isOngoing || card.status === 'anons'" class="text-white/20 text-xs">·</span>
          <span v-if="kindLabel" class="text-[11px] text-white/50 uppercase tracking-wide">
            {{ kindLabel }}
          </span>
          <template v-if="card.score">
            <span class="text-white/20 text-xs">·</span>
            <span class="text-[11px] text-yellow-400/90 font-semibold">★ {{ card.score.toFixed(1) }}</span>
          </template>
        </div>

        <!-- Title -->
        <h1 class="text-xl sm:text-2xl font-bold text-white leading-snug">
          {{ displayTitle }}
        </h1>

        <!-- Year / episodes -->
        <p class="text-[13px] text-white/45 leading-none">
          {{ [card.year, episodeLabel].filter(Boolean).join(' · ') }}
        </p>

        <!-- Buttons -->
        <div class="flex items-center gap-2 pt-1">
          <button
            class="inline-flex items-center gap-1.5 h-9 px-4 rounded bg-emerald-500 hover:bg-emerald-400 text-[13px] font-semibold text-white transition-colors disabled:opacity-60"
            :disabled="navigating"
            @click="handleWatch"
          >
            <UIcon
              v-if="!navigating"
              name="lucide:play"
              class="size-3.5"
            />
            <UIcon v-else name="lucide:loader-circle" class="size-3.5 animate-spin" />
            {{ navigating ? 'Загрузка...' : 'Смотреть' }}
          </button>

          <NuxtLink
            to="/catalog"
            class="inline-flex items-center gap-1.5 h-9 px-4 rounded border border-white/15 text-[13px] font-medium text-white/70 hover:text-white hover:border-white/30 transition-colors"
          >
            Каталог
          </NuxtLink>
        </div>
      </div>

      <!-- Right: poster (desktop only) -->
      <div class="hidden md:block flex-shrink-0 self-center ml-6">
        <img
          :src="card.posterUrl"
          :alt="displayTitle"
          class="w-[120px] rounded shadow-2xl ring-1 ring-white/10"
        />
      </div>
    </div>
  </div>
</template>
