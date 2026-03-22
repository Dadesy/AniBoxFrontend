<template>
  <div class="min-h-screen bg-cinema-base">

    <!-- ── Skeleton ─────────────────────────────────────────────────────── -->
    <div v-if="pending" class="mx-auto max-w-screen-xl px-4 py-14 sm:px-6 lg:px-8">
      <div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div class="space-y-6">
          <div class="flex gap-2">
            <div v-for="n in 3" :key="n" class="h-7 w-20 rounded-full bg-white/[0.07] skeleton-shine" />
          </div>
          <div class="space-y-3">
            <div class="h-14 w-3/4 rounded-2xl bg-white/10 skeleton-shine" />
            <div class="h-5 w-1/2 rounded-xl bg-white/[0.06] skeleton-shine" />
          </div>
          <div class="space-y-2">
            <div v-for="n in 3" :key="n" class="h-4 rounded-lg bg-white/[0.07] skeleton-shine" :style="{ width: n === 3 ? '65%' : '100%' }" />
          </div>
          <div class="flex gap-2">
            <div class="h-12 w-36 rounded-2xl bg-white/10 skeleton-shine" />
            <div class="h-12 w-28 rounded-2xl bg-white/[0.06] skeleton-shine" />
          </div>
        </div>
        <div class="mx-auto hidden w-full max-w-[19rem] lg:block">
          <div class="aspect-[2/3] rounded-3xl bg-white/[0.07] skeleton-shine" />
        </div>
      </div>
    </div>

    <!-- ── Not found ─────────────────────────────────────────────────────── -->
    <div v-else-if="!detail" class="flex min-h-[60vh] items-center justify-center px-4 text-center">
      <div class="space-y-4">
        <UIcon name="lucide:alert-circle" class="mx-auto size-12 text-red-400" />
        <p class="text-slate-300">Тайтл не найден</p>
        <NuxtLink
          to="/"
          class="inline-flex min-h-11 items-center justify-center rounded-2xl bg-emerald-500 px-5 text-sm font-semibold text-black"
        >
          На главную
        </NuxtLink>
      </div>
    </div>

    <!-- ── Main content ──────────────────────────────────────────────────── -->
    <template v-else>

      <!-- ═══════════════════════════════════════════════════════════════
           HERO
      ════════════════════════════════════════════════════════════════ -->
      <section class="relative overflow-hidden" style="min-height: min(640px, 92vw);">

        <!-- Parallax poster backdrop -->
        <div class="pointer-events-none absolute inset-0 overflow-hidden">
          <img
            v-if="heroImage"
            :src="heroImage"
            :alt="detail.titleRu || detail.title"
            referrerpolicy="no-referrer"
            class="absolute left-0 top-0 h-[120%] w-full object-cover will-change-transform"
            :style="{ transform: `translateY(${parallaxY}px)`, filter: 'brightness(0.16) saturate(0.6) blur(1px)' }"
          />
        </div>

        <!-- Gradient vignettes -->
        <div class="pointer-events-none absolute inset-0 bg-gradient-to-r from-cinema-base via-cinema-base/85 to-cinema-base/40" />
        <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-cinema-base via-cinema-base/10 to-transparent" />

        <!-- Emerald top shimmer -->
        <div
          class="pointer-events-none absolute inset-x-0 top-0 h-px"
          style="background: linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.20) 50%, transparent 100%);"
          aria-hidden="true"
        />

        <!-- Grid -->
        <div class="relative mx-auto grid max-w-screen-xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:px-8 lg:py-20">

          <!-- ── Left: Info ── -->
          <div class="space-y-6">

            <!-- Meta badges -->
            <div class="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em]">
              <span
                v-if="detail.status"
                class="rounded-full border border-white/[0.09] bg-white/[0.05] px-3 py-1.5 text-slate-300/80"
              >
                {{ detail.status }}
              </span>
              <span
                v-if="detail.year"
                class="rounded-full border border-white/[0.09] bg-white/[0.05] px-3 py-1.5 text-slate-300/80"
              >
                {{ detail.year }}
              </span>
              <span
                v-if="detail.rating || detail.score"
                class="rounded-full border border-emerald-500/30 bg-emerald-500/12 px-3 py-1.5 text-emerald-300"
              >
                ★ {{ (detail.rating ?? detail.score)?.toFixed(1) }}
              </span>
            </div>

            <!-- Title -->
            <div class="space-y-1.5">
              <h1 class="max-w-3xl text-4xl font-black leading-[1.07] tracking-tight text-white sm:text-[3.25rem]">
                {{ detail.titleRu || detail.title }}
              </h1>
              <p
                v-if="detail.originalTitle && detail.originalTitle !== (detail.titleRu || detail.title)"
                class="text-sm text-slate-400/75"
              >
                {{ detail.originalTitle }}
              </p>
            </div>

            <!-- Description (collapsible) -->
            <div v-if="detail.description" class="max-w-2xl">
              <p
                class="text-[0.9375rem] leading-[1.78] text-slate-200/80"
                :class="descExpanded ? '' : 'line-clamp-3'"
              >
                {{ detail.description }}
              </p>
              <button
                v-if="!descExpanded && detail.description.length > 160"
                type="button"
                class="mt-1.5 text-sm text-emerald-400 transition-colors hover:text-emerald-300"
                @click="descExpanded = true"
              >
                Читать далее →
              </button>
            </div>

            <!-- Genres -->
            <div v-if="detail.genres.length" class="flex flex-wrap gap-1.5">
              <span
                v-for="genre in detail.genres"
                :key="genre"
                class="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1 text-[0.75rem] text-slate-300/70 transition-colors hover:border-emerald-500/22 hover:text-emerald-300/80"
              >
                {{ genre }}
              </span>
            </div>

            <!-- CTA -->
            <div class="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                class="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-7 text-sm font-semibold transition-all duration-200"
                :class="detail.player?.watchAvailable
                  ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.30)] hover:shadow-[0_0_36px_rgba(16,185,129,0.50)]'
                  : 'cursor-not-allowed border border-white/10 bg-white/[0.05] text-slate-500'"
                :disabled="!detail.player?.watchAvailable"
                @click="goWatch()"
              >
                <UIcon name="lucide:play" class="size-4" />
                {{ continueProgress ? 'Продолжить' : 'Смотреть' }}
              </button>

              <AddToListButton
                v-if="detail.externalId"
                :anime-id="detail.externalId"
                :title="detail.title"
                :title-ru="detail.titleRu"
                :poster-url="detail.poster || detail.posterUrl"
                :content-type="detail.type"
                :year="detail.year"
              />
            </div>

            <!-- Player selector -->
            <div v-if="detail.player?.availablePlayers?.length" class="space-y-2 pt-1">
              <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500/80">Источник видео</p>
              <PlayerSelector
                :players="detail.player.availablePlayers"
                :active-external-id="activePlayerExternalId"
                @select="goWatch($event.slug)"
              />
            </div>

            <!-- Blocked reason -->
            <div
              v-if="detail.watchBlockedReason"
              class="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
            >
              {{ detail.watchBlockedReason }}
            </div>
          </div>

          <!-- ── Right: Sticky poster card ── -->
          <div class="hidden lg:block">
            <div class="sticky top-6">
              <div
                class="overflow-hidden rounded-3xl border border-white/[0.08] bg-black/30"
                style="box-shadow: 0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04);"
              >
                <div class="relative overflow-hidden">
                  <img
                    v-if="detail.poster || detail.posterUrl"
                    :src="detail.poster || detail.posterUrl"
                    :alt="detail.titleRu || detail.title"
                    referrerpolicy="no-referrer"
                    class="aspect-[2/3] w-full object-cover"
                  />
                  <div class="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/55 to-transparent" />
                </div>
                <div class="divide-y divide-white/[0.05] px-5 py-2">
                  <div class="flex items-center justify-between py-2.5 text-sm">
                    <span class="text-slate-500">Источник</span>
                    <span class="font-medium text-white">{{ sourceLine }}</span>
                  </div>
                  <div class="flex items-center justify-between py-2.5 text-sm">
                    <span class="text-slate-500">Серий</span>
                    <span class="font-medium text-white">{{ detail.player?.availableEpisodes || detail.episodesCount || '—' }}</span>
                  </div>
                  <div class="flex items-center justify-between py-2.5 text-sm">
                    <span class="text-slate-500">Статус</span>
                    <span class="font-medium text-white">{{ detail.status || '—' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Mobile poster ── -->
      <div class="mx-auto max-w-xs px-4 pb-8 pt-2 lg:hidden">
        <div
          class="overflow-hidden rounded-3xl border border-white/[0.08] bg-black/30"
          style="box-shadow: 0 16px 40px rgba(0,0,0,0.45);"
        >
          <img
            v-if="detail.poster || detail.posterUrl"
            :src="detail.poster || detail.posterUrl"
            :alt="detail.titleRu || detail.title"
            referrerpolicy="no-referrer"
            class="aspect-[2/3] w-full object-cover"
          />
          <div class="divide-y divide-white/[0.05] px-5 py-2">
            <div class="flex items-center justify-between py-2.5 text-sm">
              <span class="text-slate-500">Источник</span>
              <span class="font-medium text-white">{{ sourceLine }}</span>
            </div>
            <div class="flex items-center justify-between py-2.5 text-sm">
              <span class="text-slate-500">Серий</span>
              <span class="font-medium text-white">{{ detail.player?.availableEpisodes || detail.episodesCount || '—' }}</span>
            </div>
            <div class="flex items-center justify-between py-2.5 text-sm">
              <span class="text-slate-500">Статус</span>
              <span class="font-medium text-white">{{ detail.status || '—' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Section divider -->
      <div class="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div
          class="h-px w-full"
          style="background: linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.14) 50%, transparent 100%);"
          aria-hidden="true"
        />
      </div>

      <!-- ═══════════════════════════════════════════════════════════════
           CONTENT BELOW HERO (reveal on scroll)
      ════════════════════════════════════════════════════════════════ -->
      <div
        ref="revealRef"
        class="mx-auto max-w-screen-xl space-y-14 px-4 py-12 transition-all duration-700 sm:px-6 lg:px-8"
        :class="revealVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
      >

        <!-- Related -->
        <section v-if="relatedCards.length">
          <div class="mb-5 flex items-center gap-2.5">
            <div class="h-[1.1em] w-[3px] shrink-0 rounded-full bg-emerald-500/65" aria-hidden="true" />
            <h2 class="text-xl font-bold text-white">Похожее и связанное</h2>
            <p class="text-sm text-slate-500">Переходы внутри единого каталога</p>
          </div>
          <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <AnimeCard v-for="card in relatedCards" :key="card.slug" :card="card" />
          </div>
        </section>

        <!-- Reviews -->
        <section v-if="detail.externalId">
          <div class="mb-5 flex items-center gap-2.5">
            <div class="h-[1.1em] w-[3px] shrink-0 rounded-full bg-emerald-500/65" aria-hidden="true" />
            <h2 class="text-xl font-bold text-white">Отзывы и оценки</h2>
          </div>
          <ReviewList :anime-id="detail.externalId" />
        </section>
      </div>

    </template>
  </div>
</template>

<script setup lang="ts">
import AddToListButton from '~/components/library/AddToListButton.vue'
import AnimeCard from '~/components/anime/AnimeCard.vue'
import PlayerSelector from '~/components/anime/PlayerSelector.vue'
import ReviewList from '~/components/anime/ReviewList.vue'
import { getAnimeById } from '~/services/animeService'
import type { AnimeCardDto, AnimeDetail, EpisodeProgress } from '~/types/content'

const route = useRoute()
const slug = computed(() => decodeURIComponent(route.params.slug as string))

const { data, pending } = await useAsyncData<AnimeDetail | null>(
  () => `anime-page:${slug.value}`,
  () => getAnimeById(slug.value),
  {
    watch: [slug],
    default: () => null,
  },
)

const detail = computed(() => data.value)
const { loadTitleProgress } = useWatchProgress()
const titleProgress = ref<EpisodeProgress[]>([])

watch(
  () => detail.value?.externalId,
  async (externalId) => {
    titleProgress.value = externalId ? await loadTitleProgress(externalId) : []
  },
  { immediate: true },
)

const continueProgress = computed(() =>
  titleProgress.value.find((item) => !item.completed && item.currentTime > 5)
  ?? titleProgress.value[0]
  ?? null,
)

const activePlayerExternalId = computed(() =>
  detail.value?.player?.availablePlayers.find((player) => player.provider === detail.value?.player?.defaultPlayer)?.externalId
  ?? detail.value?.externalId
  ?? null,
)

const relatedCards = computed<AnimeCardDto[]>(() =>
  (detail.value?.related ?? [])
    .filter((card) => Boolean(card.slug))
    .map((card) => ({
      id: card.id,
      slug: card.slug!,
      source: card.source === 'anilibria' ? 'anilibria' : 'shikimori_kodik',
      externalId: card.externalId,
      title: card.title,
      titleRu: card.titleRu,
      poster: card.posterUrl,
      status: card.status,
      rating: card.score,
      genres: card.genres ?? [],
      year: card.year,
      availableEpisodes: card.episodesAired ?? card.episodes,
      watchAvailable: Boolean(card.externalId),
    })),
)

const sourceLine = computed(() => {
  const players = detail.value?.player?.availablePlayers ?? []
  if (!players.length) return 'Недоступно'
  if (players.length === 1) return players[0]?.label ?? 'Плеер'
  return players.map((player) => player.label).join(' / ')
})

const heroImage = computed(() => detail.value?.poster || detail.value?.posterUrl || null)

// ── UI state ──────────────────────────────────────────────────────────
const descExpanded = ref(false)

// ── Parallax ─────────────────────────────────────────────────────────
const scrollY = ref(0)
const parallaxY = computed(() => Math.min(scrollY.value * 0.28, 130))

onMounted(() => {
  const handleScroll = () => { scrollY.value = window.scrollY }
  window.addEventListener('scroll', handleScroll, { passive: true })
  onUnmounted(() => window.removeEventListener('scroll', handleScroll))
})

// ── Reveal on scroll ─────────────────────────────────────────────────
const revealRef = ref<HTMLElement | null>(null)
const revealVisible = ref(false)

onMounted(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) {
        revealVisible.value = true
        observer.disconnect()
      }
    },
    { threshold: 0.04, rootMargin: '0px 0px -20px 0px' },
  )
  if (revealRef.value) observer.observe(revealRef.value)
})

// ── Navigation ───────────────────────────────────────────────────────
function buildWatchUrl(targetSlug?: string): string {
  const target = targetSlug ?? detail.value?.slug ?? slug.value
  const params = new URLSearchParams()
  const player = detail.value?.player?.availablePlayers.find((item) => item.slug === targetSlug)
  const season = continueProgress.value?.season ?? detail.value?.seasons[0]?.number
  const episode = continueProgress.value?.episode ?? detail.value?.seasons[0]?.episodes[0]?.number
  const translationId = continueProgress.value?.translationId

  if (player?.provider) params.set('player', player.provider)
  if (season) params.set('season', String(season))
  if (episode) params.set('episode', String(episode))
  if (translationId) params.set('translationId', String(translationId))

  const query = params.toString()
  return query
    ? `/watch/${encodeURIComponent(target)}?${query}`
    : `/watch/${encodeURIComponent(target)}`
}

function goWatch(targetSlug?: string): Promise<void> {
  return navigateTo(buildWatchUrl(targetSlug))
}

const { pageTitle } = useSiteBranding()

useHead({
  title: computed(() =>
    detail.value
      ? pageTitle(detail.value.titleRu || detail.value.title)
      : pageTitle('Anime'),
  ),
})
</script>
