<script setup lang="ts">
import type { NormalizedAnimeCard } from '~/types/metadata'
import { KIND_LABELS, STATUS_LABELS } from '~/types/metadata'
import { navigateToCard } from '~/composables/useMetadata'

const props = defineProps<{
  card: NormalizedAnimeCard
  /** Show bigger card (for hero carousel context) */
  size?: 'sm' | 'md'
}>()

const navigating = ref(false)

async function handleClick() {
  if (navigating.value) return
  navigating.value = true
  await navigateToCard(props.card)
  navigating.value = false
}

const displayTitle = computed(() => props.card.titleRu || props.card.title)
const kindLabel    = computed(() => KIND_LABELS[props.card.kind ?? ''] ?? props.card.kind?.toUpperCase() ?? '')
const statusLabel  = computed(() => STATUS_LABELS[props.card.status] ?? props.card.status)
const scoreColor   = computed(() => {
  const s = props.card.score ?? 0
  if (s >= 8) return 'text-emerald-400'
  if (s >= 6) return 'text-yellow-400'
  return 'text-red-400'
})
</script>

<template>
  <div
    class="meta-card group relative flex-shrink-0 cursor-pointer select-none"
    :class="size === 'sm' ? 'w-[140px]' : 'w-[160px]'"
    @click="handleClick"
  >
    <!-- Poster -->
    <div
      class="relative overflow-hidden rounded-xl bg-white/5"
      :class="size === 'sm' ? 'aspect-[2/3]' : 'aspect-[2/3]'"
    >
      <!-- Skeleton shimmer when no poster -->
      <div
        v-if="!card.posterUrl"
        class="absolute inset-0 animate-pulse bg-gradient-to-br from-white/5 to-white/10"
      />

      <img
        v-else
        :src="card.posterUrl"
        :alt="displayTitle"
        loading="lazy"
        class="h-full w-full object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-110"
      />

      <!-- Gradient overlay (always) -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <!-- Hover: Play button -->
      <div class="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div
          class="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/90 shadow-lg shadow-emerald-500/30 backdrop-blur-sm transition-transform duration-200 group-hover:scale-110"
          :class="{ 'animate-pulse': navigating }"
        >
          <UIcon
            v-if="!navigating"
            name="i-heroicons-play-solid"
            class="ml-0.5 h-5 w-5 text-white"
          />
          <UIcon v-else name="i-heroicons-arrow-path" class="h-4 w-4 animate-spin text-white" />
        </div>
      </div>

      <!-- Top badges -->
      <div class="absolute left-2 top-2 flex flex-col gap-1">
        <span
          v-if="kindLabel"
          class="rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm"
        >
          {{ kindLabel }}
        </span>
        <span
          v-if="card.status === 'ongoing' || card.status === 'Currently Airing'"
          class="flex items-center gap-1 rounded-md bg-emerald-500/80 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm"
        >
          <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
          LIVE
        </span>
      </div>

      <!-- Score badge -->
      <div
        v-if="card.score"
        class="absolute right-2 top-2 flex items-center gap-0.5 rounded-md bg-black/70 px-1.5 py-0.5 backdrop-blur-sm"
      >
        <UIcon name="i-heroicons-star-solid" class="h-3 w-3 text-yellow-400" />
        <span :class="['text-[11px] font-bold', scoreColor]">{{ card.score.toFixed(1) }}</span>
      </div>

      <!-- Ongoing progress bar (episodesAired / episodes) -->
      <div
        v-if="card.episodesAired && card.episodes"
        class="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10"
      >
        <div
          class="h-full bg-emerald-500 transition-all"
          :style="{ width: `${Math.min((card.episodesAired / card.episodes) * 100, 100)}%` }"
        />
      </div>
    </div>

    <!-- Info below poster -->
    <div class="mt-2 space-y-0.5 px-0.5">
      <p class="line-clamp-2 text-[13px] font-semibold leading-snug text-white transition-colors group-hover:text-emerald-400">
        {{ displayTitle }}
      </p>
      <p class="text-[11px] text-white/40">
        {{ [card.year, statusLabel].filter(Boolean).join(' · ') }}
        <span v-if="card.episodesAired && card.status === 'ongoing'">
          · {{ card.episodesAired }} эп.
        </span>
      </p>
    </div>
  </div>
</template>
