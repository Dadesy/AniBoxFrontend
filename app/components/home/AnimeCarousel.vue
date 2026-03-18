<script setup lang="ts">
import type { NormalizedAnimeCard } from '~/types/metadata'
import MetaCard from '~/components/home/MetaCard.vue'

const props = defineProps<{
  title: string
  items: NormalizedAnimeCard[]
  loading?: boolean
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
  track.value.scrollBy({ left: dir === 'left' ? -(track.value.clientWidth * 0.7) : track.value.clientWidth * 0.7, behavior: 'smooth' })
}

onMounted(() => {
  track.value?.addEventListener('scroll', updateScrollState, { passive: true })
  updateScrollState()
})
onUnmounted(() => track.value?.removeEventListener('scroll', updateScrollState))

const SKELETON_COUNT = 8
</script>

<template>
  <section class="relative">

    <!-- Section header -->
    <div class="mb-3 flex items-center justify-between px-4 sm:px-6">
      <h2 class="text-[15px] font-semibold text-zinc-100 tracking-tight">{{ title }}</h2>

      <div class="flex items-center gap-1.5">
        <!-- Scroll arrows (desktop) -->
        <template v-if="!loading && items.length > 0">
          <button
            :disabled="!canScrollLeft"
            class="hidden sm:flex h-7 w-7 items-center justify-center rounded text-zinc-500 hover:text-zinc-200 hover:bg-white/6 transition-all disabled:opacity-25 disabled:cursor-default"
            @click="scroll('left')"
          >
            <UIcon name="i-heroicons-chevron-left" class="h-4 w-4" />
          </button>
          <button
            :disabled="!canScrollRight"
            class="hidden sm:flex h-7 w-7 items-center justify-center rounded text-zinc-500 hover:text-zinc-200 hover:bg-white/6 transition-all disabled:opacity-25 disabled:cursor-default"
            @click="scroll('right')"
          >
            <UIcon name="i-heroicons-chevron-right" class="h-4 w-4" />
          </button>
        </template>

        <NuxtLink
          v-if="seeAllHref && !loading"
          :to="seeAllHref"
          class="text-[12px] text-zinc-500 hover:text-emerald-400 transition-colors"
        >
          Все →
        </NuxtLink>
      </div>
    </div>

    <!-- Scroll track -->
    <div
      ref="track"
      class="scrollbar-hide flex gap-2.5 overflow-x-auto px-4 pb-1 sm:px-6"
      style="scroll-snap-type: x mandatory;"
    >
      <!-- Skeleton -->
      <template v-if="loading">
        <div
          v-for="n in SKELETON_COUNT"
          :key="n"
          class="flex-shrink-0"
          :class="cardSize === 'sm' ? 'w-[130px]' : 'w-[150px]'"
        >
          <div class="aspect-[2/3] animate-pulse rounded bg-white/5" />
          <div class="mt-2 space-y-1.5">
            <div class="h-3 animate-pulse rounded bg-white/5" />
            <div class="h-2 w-2/3 animate-pulse rounded bg-white/5" />
          </div>
        </div>
      </template>

      <!-- Cards -->
      <template v-else>
        <div
          v-for="card in items"
          :key="`${card.source}-${card.id}`"
          class="flex-shrink-0"
          style="scroll-snap-align: start;"
        >
          <MetaCard :card="card" :size="cardSize ?? 'md'" />
        </div>
      </template>
    </div>

  </section>
</template>
