<script setup lang="ts">
import type { NormalizedAnimeCard } from '~/types/metadata'
import MetaCard from '~/components/home/MetaCard.vue'

const props = defineProps<{
  title: string
  items: NormalizedAnimeCard[]
  loading?: boolean
  /** Link for "see all" button */
  seeAllHref?: string
  cardSize?: 'sm' | 'md'
}>()

const track = ref<HTMLDivElement | null>(null)
const canScrollLeft  = ref(false)
const canScrollRight = ref(true)

function updateScrollState() {
  if (!track.value) return
  const { scrollLeft, scrollWidth, clientWidth } = track.value
  canScrollLeft.value  = scrollLeft > 4
  canScrollRight.value = scrollLeft < scrollWidth - clientWidth - 4
}

function scroll(dir: 'left' | 'right') {
  if (!track.value) return
  const amount = track.value.clientWidth * 0.75
  track.value.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
}

onMounted(() => {
  track.value?.addEventListener('scroll', updateScrollState, { passive: true })
  updateScrollState()
})

onUnmounted(() => {
  track.value?.removeEventListener('scroll', updateScrollState)
})

// Skeleton count
const SKELETON_COUNT = 8
</script>

<template>
  <section class="relative">
    <!-- Header -->
    <div class="mb-4 flex items-center justify-between px-4 sm:px-6">
      <h2 class="flex items-center gap-2 text-xl font-bold text-white">
        <span class="h-5 w-1 rounded-full bg-emerald-500" />
        {{ title }}
      </h2>

      <div class="flex items-center gap-2">
        <!-- Arrow controls -->
        <button
          v-if="!loading && items.length > 0"
          :disabled="!canScrollLeft"
          class="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 backdrop-blur-sm transition-all hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-400 disabled:cursor-not-allowed disabled:opacity-30"
          @click="scroll('left')"
        >
          <UIcon name="i-heroicons-chevron-left" class="h-4 w-4" />
        </button>
        <button
          v-if="!loading && items.length > 0"
          :disabled="!canScrollRight"
          class="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 backdrop-blur-sm transition-all hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-400 disabled:cursor-not-allowed disabled:opacity-30"
          @click="scroll('right')"
        >
          <UIcon name="i-heroicons-chevron-right" class="h-4 w-4" />
        </button>

        <NuxtLink
          v-if="seeAllHref && !loading"
          :to="seeAllHref"
          class="text-sm font-medium text-white/40 transition-colors hover:text-emerald-400"
        >
          Все →
        </NuxtLink>
      </div>
    </div>

    <!-- Track -->
    <div
      ref="track"
      class="scrollbar-hide flex gap-3 overflow-x-auto px-4 pb-2 sm:px-6"
      style="scroll-snap-type: x mandatory;"
    >
      <!-- Skeleton loading -->
      <template v-if="loading">
        <div
          v-for="n in SKELETON_COUNT"
          :key="n"
          class="flex-shrink-0"
          :class="cardSize === 'sm' ? 'w-[140px]' : 'w-[160px]'"
        >
          <div class="aspect-[2/3] animate-pulse rounded-xl bg-white/5" />
          <div class="mt-2 space-y-1.5">
            <div class="h-3 animate-pulse rounded bg-white/5" />
            <div class="h-2 w-2/3 animate-pulse rounded bg-white/5" />
          </div>
        </div>
      </template>

      <!-- Actual cards -->
      <template v-else>
        <div
          v-for="card in items"
          :key="`${card.source}-${card.id}`"
          style="scroll-snap-align: start;"
        >
          <MetaCard :card="card" :size="cardSize ?? 'md'" />
        </div>
      </template>
    </div>

    <!-- Edge fade gradients -->
    <div
      v-if="canScrollLeft"
      class="pointer-events-none absolute bottom-0 left-0 top-0 w-16 bg-gradient-to-r from-zinc-950 to-transparent"
      style="top: 40px;"
    />
    <div
      v-if="canScrollRight && !loading"
      class="pointer-events-none absolute bottom-0 right-0 top-0 w-16 bg-gradient-to-l from-zinc-950 to-transparent"
      style="top: 40px;"
    />
  </section>
</template>
