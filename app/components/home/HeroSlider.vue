<script setup lang="ts">
import AppImage from '~/components/common/AppImage.vue'
import type { NormalizedAnimeCard } from '~/types/metadata'
import { KIND_LABELS } from '~/types/metadata'
import { navigateToCard } from '~/composables/useMetadata'
import { upgradeAnimePosterUrl } from '~/utils/poster-url-upgrade'
import { useParallax } from '~/composables/useParallax'

const props = defineProps<{
  items: NormalizedAnimeCard[]
  loading?: boolean
}>()

interface HeroSlide {
  item: NormalizedAnimeCard
  posterSrc: string
}

function poster(item: NormalizedAnimeCard | null): string {
  if (!item?.posterUrl) return ''
  return upgradeAnimePosterUrl(item.posterUrl)
}

const slides = computed<HeroSlide[]>(() => {
  const out: HeroSlide[] = []
  for (const item of props.items) {
    const posterSrc = poster(item)
    if (!posterSrc) continue
    out.push({ item, posterSrc })
  }
  return out
})

// ── Slide state ────────────────────────────────────────────────────────────
const current   = ref(0)
const navigating = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

const SLIDE_DURATION = 999999999 // ms

function startTimer() {
  stopTimer()
  if (slides.value.length <= 1) return
  timer = setInterval(() => {
    current.value = (current.value + 1) % slides.value.length
  }, SLIDE_DURATION)
}

function stopTimer() {
  if (timer) { clearInterval(timer); timer = null }
}

onMounted(startTimer)
onUnmounted(stopTimer)

watch(
  () => slides.value.length,
  (length) => {
    if (!length) {
      current.value = 0
      stopTimer()
      return
    }
    if (current.value >= length) current.value = 0
    startTimer()
  },
)

function goTo(idx: number) {
  current.value = idx
  startTimer()
}

function next() {
  if (slides.value.length <= 1) return
  current.value = (current.value + 1) % slides.value.length
  startTimer()
}

function prev() {
  if (slides.value.length <= 1) return
  current.value = (current.value - 1 + slides.value.length) % slides.value.length
  startTimer()
}

// ── Current card computed ──────────────────────────────────────────────────
const currentSlide = computed(() => slides.value[current.value] ?? null)
const card = computed(() => currentSlide.value?.item ?? null)
const cardPoster = computed(() => currentSlide.value?.posterSrc ?? '')

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

const hasSharpPoster = computed(() => !!cardPoster.value)

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
const { scrollY: heroScrollY } = useParallax()
watch(current, () => { progressKey.value++ })
</script>

<template>
  <!-- ── Skeleton ──────────────────────────────────────────────────────── -->
  <div
    v-if="loading || !slides.length"
    class="hero-slider relative w-full overflow-hidden bg-[var(--cinema-base)]"
    style="min-height: clamp(400px, 60vh, 640px);"
  >
    <div
      class="absolute inset-0 opacity-90"
      style="background: radial-gradient(ellipse 100% 80% at 80% 20%, rgba(74,222,128,0.12), transparent 55%), linear-gradient(165deg, #12121a 0%, var(--cinema-base) 45%, #0a0a0e 100%);"
    />
    <div class="absolute inset-0 flex items-end px-4 pb-10 max-w-screen-2xl mx-auto sm:px-8 sm:pb-12 lg:px-10">
      <div class="space-y-3 max-w-lg w-full">
        <div class="flex gap-2">
          <div class="h-5 w-20 animate-pulse rounded bg-white/8" />
          <div class="h-5 w-14 animate-pulse rounded bg-white/5" />
        </div>
        <div class="h-9 w-4/5 max-w-sm animate-pulse rounded-lg bg-white/10" />
        <div class="h-4 w-48 animate-pulse rounded bg-white/5" />
        <div class="flex flex-wrap gap-2 pt-2">
          <div class="h-11 w-32 animate-pulse rounded-xl bg-emerald-500/20" />
          <div class="h-11 w-28 animate-pulse rounded-xl bg-white/5" />
        </div>
      </div>
    </div>
  </div>

  <!-- ── Hero ───────────────────────────────────────────────────────────── -->
  <div
    v-else
    class="hero-slider relative w-full overflow-hidden select-none bg-[var(--cinema-base)]"
    style="min-height: clamp(400px, 60vh, 640px);"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    <!-- Фон: не «просто чёрный» — радиальный зелёный акцент + лёгкий шум градиента -->
    <div class="pointer-events-none absolute inset-0 z-0">
      <TransitionGroup name="hero-bg">
        <div
          v-for="(slide, idx) in slides"
          v-show="idx === current"
          :key="slide.item.id"
          class="absolute inset-0"
        >
          <img
            :src="slide.posterSrc"
            alt=""
            referrerpolicy="no-referrer"
            class="absolute inset-0 h-full w-full object-cover opacity-[0.38] blur-3xl"
            aria-hidden="true"
            :style="`transform: scale(1.2) translateY(${(heroScrollY * 0.18).toFixed(1)}px); will-change: transform;`"
          />
        </div>
      </TransitionGroup>
      <div
        class="absolute inset-0"
        style="background:
          radial-gradient(ellipse 110% 85% at 95% 28%, rgba(74, 222, 128, 0.20), transparent 55%),
          radial-gradient(ellipse 70% 65% at 8% 75%, rgba(34, 197, 94, 0.09), transparent 50%),
          radial-gradient(ellipse 55% 75% at 50% 130%, rgba(34, 197, 94, 0.07), transparent 60%),
          linear-gradient(108deg, rgba(7,7,11,0.97) 0%, rgba(14,16,16,0.91) 40%, rgba(9,15,13,0.78) 100%);"
      />
      <div
        class="absolute inset-0"
        style="background: linear-gradient(to top, rgba(8,8,10,0.97) 0%, rgba(8,8,10,0.5) 38%, transparent 68%);"
      />
      <!-- Vignette: киношная кромка, не перебивает читаемость текста -->
      <div
        class="pointer-events-none absolute inset-0 z-[1]"
        style="background: radial-gradient(ellipse 85% 65% at 50% 100%, transparent 40%, rgba(0,0,0,0.45) 100%);"
      />
      <!-- SVG diamond pattern — subtle expressive texture (parallax × 0.30) -->
      <div
        class="pointer-events-none absolute inset-[-6%] opacity-[0.06]"
        aria-hidden="true"
        :style="{ transform: `translateY(${(heroScrollY * 0.30).toFixed(1)}px)` }"
      >
        <svg class="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-slider-diamonds" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M30 3 L57 30 L30 57 L3 30 Z" fill="none" stroke="white" stroke-width="0.8"/>
              <circle cx="30" cy="30" r="1.5" fill="white" opacity="0.5"/>
              <circle cx="0"  cy="0"  r="1"   fill="white" opacity="0.3"/>
              <circle cx="60" cy="0"  r="1"   fill="white" opacity="0.3"/>
              <circle cx="0"  cy="60" r="1"   fill="white" opacity="0.3"/>
              <circle cx="60" cy="60" r="1"   fill="white" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="112%" height="112%" fill="url(#hero-slider-diamonds)"/>
        </svg>
      </div>

      <!-- Noise grain — cinematic depth texture -->
      <div
        class="pointer-events-none absolute inset-0 opacity-[0.025]"
        aria-hidden="true"
        style="background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJuIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC42NSIgbnVtT2N0YXZlcz0iMyIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNuKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==);"
      />
    </div>

    <!--
      Один Transition на весь блок «текст + постер» (mode out-in) — колонки не пропадают
      из потока по отдельности, заголовок не «прыгает» к постеру между слайдами.
    -->
    <div
      class="relative z-20 mx-auto flex h-full min-h-[inherit] max-w-screen-2xl flex-col justify-end px-4 pb-14 pt-6 sm:px-8 sm:pb-16 sm:pt-8 lg:px-10 lg:pb-[4.25rem]"
    >
      <Transition name="hero-slide" mode="out-in">
        <div
          v-if="card"
          :key="card.id"
          class="flex w-full flex-col gap-5 sm:gap-6 lg:flex-row lg:items-end lg:gap-12 xl:gap-14"
        >
          <!-- Постер: на мобилке сверху (компакт), с sm — справа в ряду -->
          <div
            v-if="hasSharpPoster"
            class="order-first flex w-[38vw] min-w-[112px] max-w-[148px] shrink-0 justify-center sm:order-last sm:w-[220px] sm:min-w-[220px] sm:max-w-none sm:justify-end md:w-[235px] md:min-w-[235px] lg:w-[280px] lg:min-w-[280px]"
          >
            <div class="relative w-full">
              <!-- Poster glow orb behind the card -->
              <div
                class="pointer-events-none absolute -inset-4 rounded-2xl blur-2xl opacity-25"
                aria-hidden="true"
                style="background: radial-gradient(ellipse at center, rgba(34,197,94,0.4) 0%, transparent 70%);"
              />
              <AppImage
                :src="cardPoster"
                :alt="displayTitle"
                aspect-ratio="2/3"
                :priority="true"
                referrerpolicy="no-referrer"
                wrapper-class="w-full overflow-hidden rounded-[var(--app-radius-2xl)] shadow-2xl shadow-black/70 ring-1 ring-white/14"
              />
            </div>
          </div>

          <div class="min-w-0 flex-1 space-y-2.5 sm:space-y-3 lg:pb-0.5">
            <div class="flex flex-wrap items-center gap-2">
              <span
                v-if="isOngoing"
                class="app-chip app-chip--live"
              >
                <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent-green)] motion-reduce:animate-none" />
                Онгоинг
              </span>
              <span
                v-else-if="card.status === 'anons'"
                class="app-chip app-chip--sky"
              >
                Анонс
              </span>
              <span
                v-if="kindLabel"
                class="app-chip"
              >
                {{ kindLabel }}
              </span>
              <template v-if="card.score">
                <span class="app-chip app-chip--rating">
                  ★ {{ card.score.toFixed(1) }}
                </span>
              </template>
            </div>

            <h1 class="text-display-fluid line-clamp-3 text-white sm:line-clamp-2">
              {{ displayTitle }}
            </h1>

            <p class="text-xs font-medium text-white/50 sm:text-sm">
              {{ [card.year, episodeLabel].filter(Boolean).join(' · ') }}
            </p>

            <div v-if="card.genres?.length" class="flex flex-wrap gap-1.5">
              <span
                v-for="g in (card.genres ?? []).slice(0, 3)"
                :key="g"
                class="app-chip app-chip--genre"
              >
                {{ g }}
              </span>
            </div>

            <div class="flex flex-wrap items-stretch gap-2.5 pt-1 sm:gap-3 sm:pt-1.5">
              <button
                type="button"
                class="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[var(--app-radius-md)] bg-emerald-500 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 active:scale-[0.98] motion-reduce:active:scale-100 disabled:opacity-60 sm:flex-initial sm:px-7"
                :disabled="navigating"
                @click="handleWatch"
              >
                <UIcon v-if="!navigating" name="lucide:play" class="size-4 shrink-0" />
                <UIcon v-else name="lucide:loader-circle" class="size-4 shrink-0 animate-spin" />
                {{ navigating ? 'Загрузка...' : 'Смотреть' }}
              </button>

              <button
                type="button"
                class="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[var(--app-radius-md)] border border-white/18 bg-white/[0.04] px-4 text-sm font-medium text-white/80 backdrop-blur-[2px] transition-all hover:border-white/28 hover:bg-white/[0.07] hover:text-white disabled:opacity-60 sm:flex-initial sm:px-5"
                :disabled="navigating"
                @click="handleDetail"
              >
                <UIcon name="lucide:info" class="size-4 shrink-0" />
                Подробнее
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Навигация: на мобилке — выше прогресс-бара, не наезжает на текст -->
    <div
      v-if="slides.length > 1"
      class="absolute bottom-11 left-0 right-0 z-30 flex justify-center px-4 sm:bottom-[4.5rem] sm:justify-end sm:px-8 lg:bottom-[5.25rem] lg:px-10"
    >
      <div class="flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-2 py-1 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none sm:px-0 sm:py-0">
        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-full border border-white/18 text-white/55 transition-all hover:border-white/30 hover:bg-white/8 hover:text-white sm:h-8 sm:w-8"
          aria-label="Предыдущий слайд"
          @click="prev"
        >
          <UIcon name="lucide:chevron-left" class="size-4" />
        </button>
        <span class="min-w-[2.75rem] text-center font-mono text-[11px] tabular-nums text-white/40 sm:text-xs">{{ current + 1 }}/{{ slides.length }}</span>
        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-full border border-white/18 text-white/55 transition-all hover:border-white/30 hover:bg-white/8 hover:text-white sm:h-8 sm:w-8"
          aria-label="Следующий слайд"
          @click="next"
        >
          <UIcon name="lucide:chevron-right" class="size-4" />
        </button>
      </div>
    </div>

    <div
      v-if="slides.length > 1"
      class="absolute bottom-0 left-0 right-0 z-30 flex gap-1.5 px-4 pb-3 pt-1 safe-area-pb sm:px-8 sm:pb-4 lg:px-10"
    >
      <button
        v-for="(_, idx) in slides"
        :key="idx"
        type="button"
        class="relative h-1 flex-1 overflow-hidden rounded-full sm:h-[3px]"
        :class="idx === current ? 'bg-white/25' : 'bg-white/12'"
        :aria-label="`Слайд ${idx + 1}`"
        :aria-current="idx === current ? 'true' : undefined"
        @click="goTo(idx)"
      >
        <span
          v-if="idx === current"
          :key="progressKey"
          class="progress-fill absolute inset-y-0 left-0 rounded-full"
          style="background: linear-gradient(90deg, #22c55e 0%, #4ade80 60%, #86efac 100%); box-shadow: 0 0 8px rgba(74,222,128,0.5);"
        />
      </button>
    </div>
  </div>
</template>

<style scoped>
.hero-bg-enter-active,
.hero-bg-leave-active {
  transition: opacity 0.85s ease;
  position: absolute;
  inset: 0;
}
.hero-bg-enter-from,
.hero-bg-leave-to {
  opacity: 0;
}

/* Смена слайда: весь блок уходит/приходит целиком — без сдвига колонок */
.hero-slide-enter-active,
.hero-slide-leave-active {
  transition: opacity 0.32s ease, transform 0.32s ease;
}
.hero-slide-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.99);
}
.hero-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@keyframes progress-fill {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}
.progress-fill {
  animation: progress-fill 6s linear forwards;
}

.safe-area-pb {
  padding-bottom: max(0.75rem, env(safe-area-inset-bottom, 0px));
}

@media (prefers-reduced-motion: reduce) {
  .hero-slide-enter-active,
  .hero-slide-leave-active {
    transition: opacity 0.2s ease;
  }
  .hero-slide-enter-from,
  .hero-slide-leave-to {
    transform: none;
  }
}
</style>
