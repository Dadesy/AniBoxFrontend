<script setup lang="ts">
import type { NormalizedAnimeCard } from '~/types/metadata'
import { KIND_LABELS, STATUS_LABELS } from '~/types/metadata'
import { navigateToCard } from '~/composables/useMetadata'

const props = defineProps<{
  card: NormalizedAnimeCard
  size?: 'sm' | 'md'
}>()

const navigating = ref(false)
const posterFailed = ref(false)

async function handleClick() {
  if (navigating.value) return
  navigating.value = true
  await navigateToCard(props.card)
  navigating.value = false
}

const displayTitle = computed(() => props.card.titleRu || props.card.title)
const kindLabel    = computed(() => KIND_LABELS[props.card.kind ?? ''] ?? props.card.kind?.toUpperCase() ?? '')
const isOngoing    = computed(() => props.card.status === 'ongoing' || props.card.status === 'Currently Airing')
const scoreColor   = computed(() => {
  const s = props.card.score ?? 0
  if (s >= 8) return 'text-emerald-400'
  if (s >= 6) return 'text-yellow-400'
  return 'text-slate-400'
})

const cardW = computed(() => props.size === 'sm' ? 'w-[130px]' : 'w-[150px]')
</script>

<template>
  <div
    class="group relative cursor-pointer select-none flex-shrink-0"
    :class="cardW"
    @click="handleClick"
  >
    <!-- Poster -->
    <div class="relative overflow-hidden rounded bg-white/5 aspect-[2/3]">

      <!-- No poster fallback -->
      <div
        v-if="!card.posterUrl || posterFailed"
        class="absolute inset-0 flex items-center justify-center bg-cinema-card"
      >
        <UIcon name="lucide:image-off" class="size-8 text-zinc-700" />
      </div>

      <!-- Image -->
      <img
        v-else
        :src="card.posterUrl"
        :alt="displayTitle"
        loading="lazy"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        @error="posterFailed = true"
      />

      <!-- Hover overlay: subtle dark tint + play icon -->
      <div class="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors duration-200">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200"
          :class="{ 'animate-pulse opacity-100 scale-100': navigating }"
        >
          <UIcon
            v-if="!navigating"
            name="i-heroicons-play-solid"
            class="ml-0.5 h-4 w-4 text-zinc-900"
          />
          <UIcon v-else name="i-heroicons-arrow-path" class="h-4 w-4 text-zinc-900 animate-spin" />
        </div>
      </div>

      <!-- Top-left: kind badge -->
      <div class="absolute left-1.5 top-1.5 flex flex-col gap-1">
        <span
          v-if="kindLabel"
          class="rounded-sm bg-black/60 px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/80"
        >
          {{ kindLabel }}
        </span>
        <span
          v-if="isOngoing"
          class="flex items-center gap-0.5 rounded-sm bg-emerald-500/80 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white"
        >
          <span class="h-1 w-1 rounded-full bg-white animate-pulse" />
          Live
        </span>
      </div>

      <!-- Top-right: score -->
      <div
        v-if="card.score"
        class="absolute right-1.5 top-1.5 flex items-center gap-0.5 rounded-sm bg-black/65 px-1 py-0.5"
      >
        <UIcon name="i-heroicons-star-solid" class="h-2.5 w-2.5 text-yellow-400" />
        <span :class="['text-[10px] font-bold', scoreColor]">{{ card.score.toFixed(1) }}</span>
      </div>

      <!-- Episode progress bar -->
      <div
        v-if="card.episodesAired && card.episodes"
        class="absolute bottom-0 left-0 right-0 h-0.5 bg-black/30"
      >
        <div
          class="h-full bg-emerald-500"
          :style="{ width: `${Math.min((card.episodesAired / card.episodes) * 100, 100)}%` }"
        />
      </div>
    </div>

    <!-- Info -->
    <div class="mt-2 space-y-0.5 px-0.5">
      <p class="line-clamp-2 text-[12px] font-medium leading-snug text-zinc-200 group-hover:text-white transition-colors">
        {{ displayTitle }}
      </p>
      <p class="text-[11px] text-zinc-500">
        {{ [card.year, card.episodesAired && isOngoing ? `${card.episodesAired} эп.` : ''].filter(Boolean).join(' · ') || '\u00A0' }}
      </p>
    </div>
  </div>
</template>
