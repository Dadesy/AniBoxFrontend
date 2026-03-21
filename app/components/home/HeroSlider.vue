<script setup lang="ts">
import type { NormalizedAnimeCard } from '~/types/metadata'
import { KIND_LABELS } from '~/types/metadata'
import { navigateToCard } from '~/composables/useMetadata'

const props = defineProps<{
  items: NormalizedAnimeCard[]
  loading?: boolean
}>()

// ── Slide state ────────────────────────────────────────────────────────────
const current   = ref(0)
const navigating = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

const SLIDE_DURATION = 6000 // ms

function startTimer() {
  stopTimer()
  if (props.items.length <= 1) return
  timer = setInterval(() => {
    current.value = (current.value + 1) % props.items.length
  }, SLIDE_DURATION)
}

function stopTimer() {
  if (timer) { clearInterval(timer); timer = null }
}

onMounted(startTimer)
onUnmounted(stopTimer)

watch(() => props.items.length, () => {
  current.value = 0
  startTimer()
})

function goTo(idx: number) {
  current.value = idx
  startTimer()
}

function next() {
  current.value = (current.value + 1) % props.items.length
  startTimer()
}

function prev() {
  current.value = (current.value - 1 + props.items.length) % props.items.length
  startTimer()
}

// ── Current card computed ──────────────────────────────────────────────────
const card = computed(() => props.items[current.value] ?? null)

const displayTitle = computed(() => card.value?.titleRu || card.value?.title || '')
const kindLabel    = computed(() => KIND_LABELS[card.value?.kind ?? ''] ?? '')
const isOngoing    = computed(
  () => card.value?.status === 'ongoing' || card.value?.status === 'Currently Airing',
)
const episodeLabel = computed(() => {
  if (!card.value) return ''
  if (card.value.episodesAired && card.value.episodes)
    return `${card.value.episodesAired} / ${card.value.episodes} эп.`
  if (card.value.episodesAired) return `${card.value.episodesAired} эп.`
  if (card.value.episodes)      return `${card.value.episodes} эп.`
  return ''
})

async function handleWatch() {
  if (!card.value || navigating.value) return
  navigating.value = true
  await navigateToCard(card.value)
  navigating.value = false
}

async function handleDetail() {
  if (!card.value || navigating.value) return
  navigating.value = true
  await navigateToCard(card.value)
  navigating.value = false
}

// ── Touch swipe ────────────────────────────────────────────────────────────
let touchStartX = 0
function onTouchStart(e: TouchEvent) { touchStartX = e.touches[0]?.clientX ?? 0 }
function onTouchEnd(e: TouchEvent) {
  const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX
  if (Math.abs(dx) > 50) { dx < 0 ? next() : prev() }
}

// ── Progress bar key — resets animation on each slide change ───────────────
const progressKey = ref(0)
watch(current, () => { progressKey.value++ })
</script>

<template>
  <!-- ── Skeleton ──────────────────────────────────────────────────────── -->
  <div
    v-if="loading || !items.length"
    class="hero-slider relative w-full overflow-hidden bg-zinc-950"
    style="height: clamp(360px, 52vw, 540px);"
  >
    <div class="absolute inset-0 animate-pulse" style="background: linear-gradient(135deg, #111115 0%, #0d0d10 100%)" />
    <div class="absolute inset-0 flex items-end px-6 pb-10 sm:px-14 sm:pb-14 max-w-screen-2xl mx-auto">
      <div class="space-y-3 max-w-lg w-full">
        <div class="flex gap-2">
          <div class="h-5 w-20 animate-pulse rounded bg-white/8" />
          <div class="h-5 w-14 animate-pulse rounded bg-white/5" />
        </div>
        <div class="h-10 w-80 animate-pulse rounded-lg bg-white/10" />
        <div class="h-4 w-48 animate-pulse rounded bg-white/5" />
        <div class="flex gap-2 pt-2">
          <div class="h-11 w-36 animate-pulse rounded-xl bg-emerald-500/20" />
          <div class="h-11 w-28 animate-pulse rounded-xl bg-white/5" />
        </div>
      </div>
    </div>
  </div>

  <!-- ── Hero Slider ───────────────────────────────────────────────────── -->
  <div
    v-else
    class="hero-slider relative w-full overflow-hidden select-none"
    style="height: clamp(360px, 52vw, 540px);"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    <!-- Background images — absolute, crossfade transition -->
    <div class="absolute inset-0">
      <TransitionGroup name="hero-bg">
        <div
          v-for="(item, idx) in items"
          v-show="idx === current"
          :key="item.id"
          class="absolute inset-0"
        >
          <img
            :src="item.posterUrl"
            :alt="item.titleRu || item.title"
            class="hero-bg-img absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </TransitionGroup>
    </div>

    <!-- Cinematic gradients (always on top of backgrounds) -->
    <div
      class="absolute inset-0 z-10 pointer-events-none"
      style="background: linear-gradient(to right, rgba(5,5,8,0.93) 0%, rgba(5,5,8,0.72) 40%, rgba(5,5,8,0.28) 70%, rgba(5,5,8,0.08) 100%)"
    />
    <div
      class="absolute inset-0 z-10 pointer-events-none"
      style="background: linear-gradient(to top, rgba(5,5,8,0.95) 0%, rgba(5,5,8,0.45) 35%, transparent 65%)"
    />

    <!-- Foreground content -->
    <div class="relative z-20 h-full flex flex-col justify-end px-6 pb-12 sm:px-14 sm:pb-14 max-w-screen-2xl mx-auto">

      <!-- Slide content — transitions in -->
      <TransitionGroup name="hero-content">
        <div
          v-if="card"
          :key="card.id"
          class="max-w-xl space-y-3"
        >
          <!-- Badges -->
          <div class="flex items-center gap-2 flex-wrap">
            <span
              v-if="isOngoing"
              class="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-400 uppercase tracking-widest"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Онгоинг
            </span>
            <span
              v-else-if="card.status === 'anons'"
              class="text-[11px] font-bold text-sky-400 uppercase tracking-widest"
            >
              Анонс
            </span>
            <span v-if="kindLabel" class="text-[11px] font-semibold uppercase tracking-widest text-[rgba(255,255,255,0.45)]">
              {{ kindLabel }}
            </span>
            <template v-if="card.score">
              <span class="text-xs text-[rgba(255,255,255,0.22)]">·</span>
              <span class="text-[12px] font-bold text-yellow-400">★ {{ card.score.toFixed(1) }}</span>
            </template>
          </div>

          <!-- Title -->
          <h1 class="text-2xl sm:text-[2.4rem] font-extrabold leading-tight tracking-tight line-clamp-2 text-[#fff]">
            {{ displayTitle }}
          </h1>

          <!-- Meta row -->
          <p class="text-sm font-medium text-[rgba(255,255,255,0.45)]">
            {{ [card.year, episodeLabel].filter(Boolean).join(' · ') }}
          </p>

          <!-- Genres -->
          <div v-if="card.genres?.length" class="flex gap-1.5 flex-wrap">
            <span
              v-for="g in (card.genres ?? []).slice(0, 3)"
              :key="g"
              class="rounded-full border border-[rgba(255,255,255,0.12)] px-2.5 py-0.5 text-[11px] text-[rgba(255,255,255,0.45)]"
            >
              {{ g }}
            </span>
          </div>

          <!-- Action buttons -->
          <div class="flex items-center gap-3 pt-1.5">
            <button
              class="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-500 px-7 text-sm font-bold text-[#fff] shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 active:scale-95 disabled:opacity-60"
              :disabled="navigating"
              @click="handleWatch"
            >
              <UIcon v-if="!navigating" name="lucide:play" class="size-4" />
              <UIcon v-else name="lucide:loader-circle" class="size-4 animate-spin" />
              {{ navigating ? 'Загрузка...' : 'Смотреть' }}
            </button>

            <button
              class="inline-flex h-11 items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.14)] px-5 text-sm font-medium text-[rgba(255,255,255,0.72)] transition-all hover:border-[rgba(255,255,255,0.28)] hover:text-[#fff] disabled:opacity-60"
              :disabled="navigating"
              @click="handleDetail"
            >
              <UIcon name="lucide:info" class="size-4" />
              Подробнее
            </button>
          </div>
        </div>
      </TransitionGroup>

      <!-- ── Slide controls (bottom-right) ────────────────────────── -->
      <div
        v-if="items.length > 1"
        class="absolute right-6 bottom-12 sm:right-14 sm:bottom-14 flex items-center gap-2"
      >
        <button
          class="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(255,255,255,0.18)] text-[rgba(255,255,255,0.55)] transition-all hover:border-[rgba(255,255,255,0.32)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#fff]"
          @click="prev"
        >
          <UIcon name="lucide:chevron-left" class="size-4" />
        </button>
        <span class="font-mono text-xs tabular-nums text-[rgba(255,255,255,0.38)]">{{ current + 1 }}/{{ items.length }}</span>
        <button
          class="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(255,255,255,0.18)] text-[rgba(255,255,255,0.55)] transition-all hover:border-[rgba(255,255,255,0.32)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#fff]"
          @click="next"
        >
          <UIcon name="lucide:chevron-right" class="size-4" />
        </button>
      </div>
    </div>

    <!-- ── Progress bars ─────────────────────────────────────────────── -->
    <div
      v-if="items.length > 1"
      class="absolute bottom-0 left-0 right-0 z-30 flex gap-1.5 px-6 sm:px-14 pb-4"
    >
      <button
        v-for="(_, idx) in items"
        :key="idx"
        class="relative h-[3px] flex-1 rounded-full overflow-hidden transition-all"
        :class="idx === current ? 'bg-[rgba(255,255,255,0.22)]' : 'bg-[rgba(255,255,255,0.12)]'"
        @click="goTo(idx)"
      >
        <!-- animated fill for active slide -->
        <div
          v-if="idx === current"
          :key="progressKey"
          class="absolute inset-y-0 left-0 bg-emerald-400 rounded-full progress-fill"
        />
      </button>
    </div>
  </div>
</template>

<style scoped>
/* ── Background cross-fade ───────────────────────────────────────────── */
.hero-bg-enter-active,
.hero-bg-leave-active {
  transition: opacity 0.9s ease;
  position: absolute;
  inset: 0;
}
.hero-bg-enter-from,
.hero-bg-leave-to { opacity: 0; }

.hero-bg-img {
  transform: scale(1.06);
  transition: transform 8s ease;
}
.hero-bg-enter-active .hero-bg-img { transform: scale(1.06); }
.hero-bg-leave-active .hero-bg-img { transform: scale(1.02); }

/* ── Content slide-up transition ────────────────────────────────────── */
.hero-content-enter-active {
  transition: opacity 0.5s ease 0.25s, transform 0.5s ease 0.25s;
}
.hero-content-leave-active {
  transition: opacity 0.2s ease;
  position: absolute;
}
.hero-content-enter-from { opacity: 0; transform: translateY(14px); }
.hero-content-leave-to   { opacity: 0; }

/* ── Progress bar fill animation ────────────────────────────────────── */
@keyframes progress-fill {
  from { width: 0%; }
  to   { width: 100%; }
}
.progress-fill {
  animation: progress-fill 6s linear forwards;
}
</style>
