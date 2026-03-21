<script setup lang="ts">
import { useAniLibriaFresh } from '~/composables/useAniLibria'
import AniLibriaCard from '~/components/home/AniLibriaCard.vue'

const { releases, loading, error, load } = useAniLibriaFresh(16)

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
  track.value.scrollBy({
    left: dir === 'left' ? -(track.value.clientWidth * 0.7) : track.value.clientWidth * 0.7,
    behavior: 'smooth',
  })
}

onMounted(() => {
  load()
  track.value?.addEventListener('scroll', updateScrollState, { passive: true })
  updateScrollState()
})
onUnmounted(() => track.value?.removeEventListener('scroll', updateScrollState))

const SKELETON_COUNT = 8
</script>

<template>
  <!-- Hide entire section on unrecoverable error (CORS etc.) -->
  <section v-if="!error || loading || releases.length" class="relative">

    <!-- Section header -->
    <div class="mb-3 flex items-center justify-between px-4 sm:px-6">
      <div class="flex items-center gap-2.5">
        <h2 class="text-[15px] font-semibold text-zinc-100 tracking-tight">Свежие релизы</h2>
        <span class="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/8 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-400">
          AniLibria
        </span>
      </div>

      <div class="flex items-center gap-1.5">
        <template v-if="!loading && releases.length">
          <button
            :disabled="!canScrollLeft"
            class="hidden sm:flex h-7 w-7 items-center justify-center rounded text-zinc-500 hover:text-zinc-200 hover:bg-white/6 transition-all disabled:opacity-25 disabled:cursor-default"
            @click="scroll('left')"
          >
            <UIcon name="lucide:chevron-left" class="h-4 w-4" />
          </button>
          <button
            :disabled="!canScrollRight"
            class="hidden sm:flex h-7 w-7 items-center justify-center rounded text-zinc-500 hover:text-zinc-200 hover:bg-white/6 transition-all disabled:opacity-25 disabled:cursor-default"
            @click="scroll('right')"
          >
            <UIcon name="lucide:chevron-right" class="h-4 w-4" />
          </button>
        </template>
        <a
          href="https://anilibria.top"
          target="_blank"
          rel="noopener noreferrer"
          class="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          anilibria.top ↗
        </a>
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
          class="flex-shrink-0 w-[140px] sm:w-[155px]"
        >
          <div class="aspect-[2/3] animate-pulse rounded-lg bg-white/5" />
          <div class="mt-2 space-y-1.5">
            <div class="h-3 animate-pulse rounded bg-white/5" />
            <div class="h-2 w-2/3 animate-pulse rounded bg-white/5" />
          </div>
        </div>
      </template>

      <!-- Cards -->
      <template v-else>
        <div
          v-for="release in releases"
          :key="release.id"
          style="scroll-snap-align: start;"
        >
          <AniLibriaCard :release="release" />
        </div>
      </template>
    </div>

    <!-- Small disclaimer -->
    <p v-if="!loading && releases.length" class="mt-2 px-4 sm:px-6 text-[10px] text-zinc-700">
      Нажмите на карточку, чтобы найти аниме в нашем каталоге
    </p>
  </section>
</template>
