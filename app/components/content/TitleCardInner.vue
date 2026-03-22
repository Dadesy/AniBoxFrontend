<template>
  <div
    class="relative overflow-hidden rounded-xl bg-cinema-card transition-transform duration-300 ease-out"
    :class="!noPlay && 'group-hover:scale-[1.04] group-hover:z-10 group-hover:shadow-2xl group-hover:shadow-black/70'"
  >
    <!--
      Poster — replaced raw <img> with AppImage.
      AppImage handles:
        · skeleton shimmer while loading
        · smooth opacity fade-in on load
        · error fallback (icon)
        · native lazy loading (SSR-safe)
      The imgClass applies the zoom-on-hover scale only for playable cards.
    -->
    <AppImage
      :src="posterSrc"
      :alt="displayTitle"
      aspect-ratio="2/3"
      :priority="priority"
      :img-class="!noPlay ? 'group-hover:scale-105 transition-transform duration-500' : undefined"
    >
      <!-- ── Overlays (slot) ── -->

      <!-- Video preview — YouTube trailer, desktop only, after hover delay -->
      <AppVideoPreview
        v-if="!noPlay && trailerUrl"
        :trailer-url="trailerUrl"
        :active="previewActive"
      />

      <!-- Bottom gradient — always on top of poster / video -->
      <div
        class="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/90 via-black/40 to-transparent"
      />

      <!-- Type badge -->
      <div class="absolute left-2 top-2">
        <span
          :class="[
            'rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
            badgeClass,
          ]"
        >
          {{ kindLabel }}
        </span>
      </div>

      <!-- Score badge -->
      <div
        v-if="scoreValue !== null"
        class="absolute right-2 top-2 flex items-center gap-0.5 rounded-sm bg-black/65 px-1 py-0.5"
      >
        <UIcon name="lucide:star" class="h-2.5 w-2.5 fill-current text-yellow-400" />
        <span :class="['text-[10px] font-bold', scoreColor]">
          {{ scoreValue.toFixed(1) }}
        </span>
      </div>

      <!-- Bottom title + year -->
      <div class="pointer-events-none absolute inset-x-0 bottom-0 p-2.5">
        <p class="line-clamp-2 text-xs font-semibold leading-tight text-white">
          {{ displayTitle }}
        </p>
        <p v-if="yearLabel !== null" class="mt-0.5 text-[10px] text-slate-400">
          {{ yearLabel }}
        </p>
      </div>

      <!-- Play overlay — visible on hover for watchable cards -->
      <div
        v-if="!noPlay"
        class="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      >
        <div
          class="flex h-12 w-12 scale-75 items-center justify-center rounded-full bg-green-500 shadow-lg shadow-green-500/40 transition-transform duration-200 group-hover:scale-100"
        >
          <UIcon name="lucide:play" class="ml-0.5 size-5 text-black" />
        </div>
      </div>

      <!-- Hover border glow -->
      <div
        v-if="!noPlay"
        class="pointer-events-none absolute inset-0 rounded-xl opacity-0 ring-1 ring-green-500/40 transition-opacity duration-300 group-hover:opacity-100"
      />

      <!-- "Нет плеера" label for non-playable catalogue entries -->
      <div
        v-if="noPlay"
        class="pointer-events-none absolute inset-0 flex items-end justify-end rounded-xl p-2"
      >
        <span class="rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] text-slate-400">
          нет плеера
        </span>
      </div>
    </AppImage>
  </div>
</template>

<script setup lang="ts">
import AppImage from '../common/AppImage.vue'
import AppVideoPreview from '../common/AppVideoPreview.vue'
import type { CatalogCard } from '~/types/content'
import { KIND_LABELS } from '~/types/metadata'
import { upgradeAnimePosterUrl } from '~/utils/poster-url-upgrade'

const props = defineProps<{
  content:       CatalogCard
  noPlay?:       boolean
  /** Pass true for the first 4–6 above-fold cards to skip lazy loading (LCP) */
  priority?:     boolean
  /** YouTube URL returned by /metadata/trailer/:id */
  trailerUrl?:   string | null
  /** Driven by TitleCard hover timer via useActivePreview */
  previewActive?: boolean
}>()

function pickNonEmptyString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value !== 'string') continue
    const trimmed = value.trim()
    if (trimmed.length > 0) return trimmed
  }
  return null
}

const displayTitle = computed(() => pickNonEmptyString(props.content.titleRu, props.content.title) ?? 'Без названия')

const posterSrc = computed(() => {
  const raw = pickNonEmptyString(props.content.posterUrl)
  if (!raw) return null
  const up = upgradeAnimePosterUrl(raw)
  return up || null
})

const scoreValue = computed<number | null>(() => {
  const raw = props.content.score
  if (typeof raw === 'number') {
    return Number.isFinite(raw) && raw > 0 ? raw : null
  }
  if (typeof raw === 'string') {
    const parsed = Number(raw)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null
  }
  return null
})

const yearLabel = computed<number | null>(() => {
  const raw = props.content.year
  if (typeof raw === 'number') {
    return Number.isFinite(raw) && raw > 0 ? raw : null
  }
  if (typeof raw === 'string') {
    const parsed = Number(raw)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null
  }
  return null
})

// Normalise kind — Kodik uses 'anime-serial'/'anime', Shikimori uses 'tv'/'movie'/etc.
const normKind = computed(() => {
  const t = pickNonEmptyString(props.content.kind, props.content.type) ?? ''
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
  const s = scoreValue.value ?? 0
  if (s >= 8) return 'text-emerald-400'
  if (s >= 6) return 'text-yellow-400'
  return 'text-slate-400'
})
</script>
