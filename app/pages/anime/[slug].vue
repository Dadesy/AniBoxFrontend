<template>
  <div class="min-h-screen bg-cinema-base">
    <div v-if="pending" class="mx-auto max-w-screen-xl px-4 py-10 sm:px-6 lg:px-8">
      <div class="h-[32rem] rounded-[32px] skeleton-shine" />
    </div>

    <div v-else-if="!detail" class="flex min-h-[60vh] items-center justify-center px-4 text-center">
      <div class="space-y-4">
        <UIcon name="lucide:alert-circle" class="mx-auto size-12 text-red-400" />
        <p class="text-slate-300">Тайтл не найден</p>
        <NuxtLink to="/" class="inline-flex min-h-11 items-center justify-center rounded-2xl bg-emerald-500 px-5 text-sm font-semibold text-black">
          На главную
        </NuxtLink>
      </div>
    </div>

    <template v-else>
      <section class="relative overflow-hidden">
        <div class="absolute inset-0">
          <img
            v-if="detail.poster || detail.posterUrl"
            :src="detail.poster || detail.posterUrl"
            :alt="detail.titleRu || detail.title"
            class="h-full w-full object-cover blur-2xl"
            style="filter: brightness(0.3) saturate(0.8)"
          >
        </div>
        <div class="absolute inset-0 bg-linear-to-r from-cinema-base via-cinema-base/85 to-cinema-base/55" />
        <div class="absolute inset-0 bg-linear-to-t from-cinema-base via-cinema-base/30 to-black/30" />

        <div class="relative mx-auto grid max-w-screen-xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:px-8 lg:py-14">
          <div class="space-y-5">
            <div class="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-300/80">
              <span class="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">{{ detail.status || 'anime' }}</span>
              <span v-if="detail.year" class="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">{{ detail.year }}</span>
              <span v-if="detail.rating || detail.score" class="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1.5 text-emerald-300">
                ★ {{ (detail.rating ?? detail.score)?.toFixed(1) }}
              </span>
            </div>

            <div class="space-y-2">
              <h1 class="max-w-3xl text-3xl font-black tracking-tight text-white sm:text-5xl">
                {{ detail.titleRu || detail.title }}
              </h1>
              <p v-if="detail.originalTitle && detail.originalTitle !== (detail.titleRu || detail.title)" class="text-sm text-slate-400">
                {{ detail.originalTitle }}
              </p>
            </div>

            <p v-if="detail.description" class="max-w-3xl text-sm leading-7 text-slate-200/90 sm:text-base">
              {{ detail.description }}
            </p>

            <div v-if="detail.genres.length" class="flex flex-wrap gap-2">
              <span
                v-for="genre in detail.genres"
                :key="genre"
                class="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-xs text-slate-300"
              >
                {{ genre }}
              </span>
            </div>

            <div class="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                class="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-6 text-sm font-semibold transition-all"
                :class="detail.player?.watchAvailable ? 'bg-emerald-500 text-black hover:bg-emerald-400' : 'cursor-not-allowed border border-white/10 bg-white/[0.05] text-slate-500'"
                :disabled="!detail.player?.watchAvailable"
                @click="goWatch()"
              >
                <UIcon name="lucide:play" class="size-4" />
                {{ continueProgress ? 'Продолжить просмотр' : 'Смотреть' }}
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

            <div v-if="detail.player?.availablePlayers?.length" class="space-y-2 pt-2">
              <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Плеер</p>
              <PlayerSelector
                :players="detail.player.availablePlayers"
                :active-external-id="activePlayerExternalId"
                @select="goWatch($event.slug)"
              />
            </div>

            <div v-if="detail.watchBlockedReason" class="rounded-3xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              {{ detail.watchBlockedReason }}
            </div>
          </div>

          <div class="mx-auto w-full max-w-[18rem]">
            <div class="overflow-hidden rounded-[32px] border border-white/10 bg-black/30 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
              <img
                v-if="detail.poster || detail.posterUrl"
                :src="detail.poster || detail.posterUrl"
                :alt="detail.titleRu || detail.title"
                class="aspect-[2/3] w-full object-cover"
              >
              <div class="space-y-3 px-5 py-5">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-slate-400">Источник</span>
                  <span class="font-medium text-white">{{ sourceLine }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-slate-400">Серий</span>
                  <span class="font-medium text-white">{{ detail.player?.availableEpisodes || detail.episodesCount || '—' }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-slate-400">Статус</span>
                  <span class="font-medium text-white">{{ detail.status || '—' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section v-if="relatedCards.length" class="mx-auto max-w-screen-xl space-y-4 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h2 class="text-xl font-bold text-white">Похожее и связанное</h2>
          <p class="text-sm text-slate-400">Переходы остаются внутри единого каталога</p>
        </div>
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <AnimeCard v-for="card in relatedCards" :key="card.slug" :card="card" />
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import AddToListButton from '~/components/library/AddToListButton.vue'
import AnimeCard from '~/components/anime/AnimeCard.vue'
import PlayerSelector from '~/components/anime/PlayerSelector.vue'
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
