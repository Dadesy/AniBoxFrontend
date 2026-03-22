<script setup lang="ts">
import type { NormalizedAnimeCard } from '~/types/metadata'
import MetaCard from './MetaCard.vue'

const props = defineProps<{
  title:        string
  items:        NormalizedAnimeCard[]
  loading?:     boolean
  seeAllHref?:  string
  cardSize?:    'sm' | 'md'
  sourceBadge?: string
}>()

// ── Scroll track ──────────────────────────────────────────────────────────────

const track          = ref<HTMLDivElement | null>(null)
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
  const delta = track.value.clientWidth * 0.7
  track.value.scrollBy({ left: dir === 'left' ? -delta : delta, behavior: 'smooth' })
}

onMounted(() => {
  track.value?.addEventListener('scroll', updateScrollState, { passive: true })
  updateScrollState()
})
onUnmounted(() => track.value?.removeEventListener('scroll', updateScrollState))

// ── Section reveal via IntersectionObserver ───────────────────────────────────

const sectionRef = ref<HTMLElement | null>(null)
const revealed   = ref(false)

onMounted(() => {
  if (!sectionRef.value || typeof IntersectionObserver === 'undefined') {
    revealed.value = true
    return
  }
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) {
        revealed.value = true
        observer.disconnect()
      }
    },
    { rootMargin: '0px 0px -40px 0px', threshold: 0.05 },
  )
  observer.observe(sectionRef.value)
  onUnmounted(() => observer.disconnect())
})

const SKELETON_COUNT = 8
const cardWidth = computed(() => props.cardSize === 'sm' ? 'w-[138px]' : 'w-[162px]')
</script>

<template>
  <section
    ref="sectionRef"
    class="relative"
    :class="[
      'transition-[opacity,transform] duration-500 ease-out motion-reduce:duration-200',
      revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5 motion-reduce:translate-y-0',
    ]"
  >
    <!-- Section header -->
    <div class="mb-3 flex items-center justify-between gap-3 px-4 sm:px-6">
      <div class="flex min-w-0 items-center gap-2.5">
        <!-- Left accent bar -->
        <div class="h-[1.1em] w-[3px] shrink-0 rounded-full bg-emerald-500/65" aria-hidden="true" />
        <h2
          class="truncate text-[clamp(0.9rem,2.4vw,1.05rem)] font-bold tracking-tight text-white/90"
        >
          {{ title }}
        </h2>
        <span
          v-if="sourceBadge"
          class="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/8 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-400"
        >
          {{ sourceBadge }}
        </span>
      </div>

      <div class="flex items-center gap-1.5">
        <template v-if="!loading && items.length > 0">
          <button
            :disabled="!canScrollLeft"
            class="hidden sm:flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.07] text-white/30 hover:border-white/15 hover:text-white/70 hover:bg-white/5 transition-all disabled:opacity-20 disabled:cursor-default"
            aria-label="Прокрутить влево"
            @click="scroll('left')"
          >
            <UIcon name="lucide:chevron-left" class="h-4 w-4" />
          </button>
          <button
            :disabled="!canScrollRight"
            class="hidden sm:flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.07] text-white/30 hover:border-white/15 hover:text-white/70 hover:bg-white/5 transition-all disabled:opacity-20 disabled:cursor-default"
            aria-label="Прокрутить вправо"
            @click="scroll('right')"
          >
            <UIcon name="lucide:chevron-right" class="h-4 w-4" />
          </button>
        </template>

        <NuxtLink
          v-if="seeAllHref && !loading"
          :to="seeAllHref"
          class="shrink-0 inline-flex items-center gap-0.5 rounded-full border border-white/[0.09] px-2.5 py-0.5 text-[11px] font-semibold text-white/35 transition-all duration-200 hover:border-emerald-500/30 hover:bg-emerald-500/[0.07] hover:text-emerald-400"
        >
          Все
          <UIcon name="lucide:chevron-right" class="size-3" />
        </NuxtLink>
      </div>
    </div>

    <!-- Scroll track -->
    <div
      ref="track"
      class="scrollbar-hide flex gap-[var(--app-card-gap)] overflow-x-auto overscroll-x-contain px-4 pb-1 sm:px-6"
      style="scroll-snap-type: x mandatory; scroll-padding-inline: max(1rem, env(safe-area-inset-left));"
    >
      <!-- Skeleton cards: staggered shimmer while loading -->
      <template v-if="loading">
        <div
          v-for="n in SKELETON_COUNT"
          :key="n"
          :class="['shrink-0', cardWidth]"
        >
          <div
            class="aspect-[2/3] w-full rounded-[var(--app-radius-lg)] bg-cinema-card skeleton-shine"
            :style="{ animationDelay: `${(n - 1) * 80}ms` }"
          />
        </div>
      </template>

      <!-- Content cards -->
      <template v-else>
        <div
          v-for="card in items"
          :key="`${card.source}-${card.id}`"
          class="shrink-0"
          style="scroll-snap-align: start;"
        >
          <MetaCard :card="card" :size="cardSize ?? 'md'" />
        </div>
      </template>
    </div>
  </section>
</template>
