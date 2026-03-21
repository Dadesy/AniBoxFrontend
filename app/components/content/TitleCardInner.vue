<template>
  <div
    class="relative overflow-hidden rounded-xl bg-cinema-card transition-transform duration-300 ease-out"
    :class="!noPlay && 'group-hover:scale-[1.04] group-hover:z-10 group-hover:shadow-2xl group-hover:shadow-black/70'"
  >
    <!-- Poster -->
    <div class="aspect-[2/3] w-full overflow-hidden bg-cinema-card">
      <img
        v-if="content.posterUrl && !posterFailed"
        :src="content.posterUrl"
        :alt="content.title"
        class="h-full w-full object-cover transition-transform duration-500"
        :class="!noPlay && 'group-hover:scale-105'"
        loading="lazy"
        @error="posterFailed = true"
      />
      <div v-else class="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/5 to-white/10">
        <UIcon name="lucide:image-off" class="size-12 text-slate-700" />
      </div>
    </div>

    <!-- Bottom gradient -->
    <div class="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

    <!-- Type badge -->
    <div class="absolute left-2 top-2">
      <span :class="['rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide', badgeClass]">
        {{ kindLabel }}
      </span>
    </div>

    <!-- Score badge -->
    <div
      v-if="content.score"
      class="absolute right-2 top-2 flex items-center gap-0.5 rounded-sm bg-black/65 px-1 py-0.5"
    >
      <UIcon name="lucide:star" class="h-2.5 w-2.5 fill-current text-yellow-400" />
      <span :class="['text-[10px] font-bold', scoreColor]">{{ content.score.toFixed(1) }}</span>
    </div>

    <!-- Bottom title -->
    <div class="pointer-events-none absolute inset-x-0 bottom-0 p-2.5">
      <p class="line-clamp-2 text-xs font-semibold leading-tight text-white">{{ displayTitle }}</p>
      <p v-if="content.year" class="mt-0.5 text-[10px] text-slate-400">{{ content.year }}</p>
    </div>

    <!-- Play overlay (only when playable) -->
    <div
      v-if="!noPlay"
      class="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-250 group-hover:opacity-100"
    >
      <div
        class="flex h-12 w-12 transform scale-75 items-center justify-center rounded-full bg-green-500 shadow-lg shadow-green-500/40 transition-transform duration-250 group-hover:scale-100"
      >
        <UIcon name="lucide:play" class="ml-0.5 size-5 text-black" />
      </div>
    </div>

    <!-- Hover border glow -->
    <div
      v-if="!noPlay"
      class="pointer-events-none absolute inset-0 rounded-xl opacity-0 ring-1 ring-green-500/40 transition-opacity duration-300 group-hover:opacity-100"
    />

    <!-- "Нет плеера" overlay for non-playable cards -->
    <div
      v-if="noPlay"
      class="pointer-events-none absolute inset-0 flex items-end justify-end rounded-xl p-2"
    >
      <span class="rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] text-slate-400">
        нет плеера
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CatalogCard } from '~/types/content'
import { KIND_LABELS } from '~/types/metadata'

const props = defineProps<{ content: CatalogCard; noPlay?: boolean }>()

const posterFailed = ref(false)

// Prefer Russian title for display
const displayTitle = computed(() =>
  props.content.titleRu || props.content.title,
)

// Normalise kind — Kodik uses 'anime-serial'/'anime', Shikimori uses 'tv'/'movie'/etc.
const normKind = computed(() => {
  const t = props.content.kind || props.content.type || ''
  if (t === 'anime-serial') return 'tv'
  if (t === 'anime')        return 'movie'
  return t
})

const kindLabel = computed(() => KIND_LABELS[normKind.value] ?? 'Аниме')

const badgeClass = computed((): string => {
  const map: Record<string, string> = {
    tv:      'bg-green-500/80 text-black backdrop-blur-sm',
    movie:   'bg-emerald-400/80 text-black backdrop-blur-sm',
    ova:     'bg-sky-500/80 text-black backdrop-blur-sm',
    ona:     'bg-violet-500/80 text-white backdrop-blur-sm',
    special: 'bg-amber-500/80 text-black backdrop-blur-sm',
  }
  return map[normKind.value] ?? 'bg-white/20 text-white backdrop-blur-sm'
})

const scoreColor = computed(() => {
  const s = props.content.score ?? 0
  if (s >= 8) return 'text-emerald-400'
  if (s >= 6) return 'text-yellow-400'
  return 'text-slate-400'
})
</script>
