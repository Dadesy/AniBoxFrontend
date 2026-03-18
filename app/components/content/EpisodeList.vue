<template>
  <div class="space-y-4">
    <SeasonSelector
      v-if="seasonItems.length > 1"
      :seasons="seasonItems"
      :active-season="activeSeason"
      @change="emit('selectSeason', $event)"
    />

    <div
      v-if="episodes.length"
      :class="compact ? 'grid grid-cols-5 gap-2 sm:grid-cols-6' : 'grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10'"
    >
      <EpisodeCard
        v-for="episode in episodes"
        :key="`${activeSeason}-${episode.number}`"
        :episode="episode"
        :active="isActiveEpisode(episode.number)"
        :completed="isCompleted(activeSeason, episode.number)"
        :in-progress="hasProgress(activeSeason, episode.number)"
        :progress-percent="getProgressPercent(activeSeason, episode.number)"
        @select="emit('selectEpisode', activeSeason, episode.number)"
      />
    </div>

    <div
      v-else
      class="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center text-sm text-slate-500"
    >
      Нет доступных серий
    </div>
  </div>
</template>

<script setup lang="ts">
import EpisodeCard from '~/components/content/EpisodeCard.vue'
import SeasonSelector from '~/components/content/SeasonSelector.vue'
import type { EpisodeProgress, Season, SeasonOption } from '~/types/content'

const props = defineProps<{
  seasons: Season[]
  seasonOptions?: SeasonOption[]
  activeSeason: number
  activeEpisode?: number
  progress: EpisodeProgress[]
  compact?: boolean
}>()

const emit = defineEmits<{
  (e: 'selectSeason', season: number): void
  (e: 'selectEpisode', season: number, episode: number): void
}>()

const seasonItems = computed<SeasonOption[]>(() => {
  if (props.seasonOptions?.length) return props.seasonOptions

  return props.seasons.map((season) => ({
    number: season.number,
    title: season.title || `Сезон ${season.number}`,
    episodesCount: season.episodesCount ?? season.episodes.length,
  }))
})

const episodes = computed(() =>
  props.seasons.find((season) => season.number === props.activeSeason)?.episodes ?? [],
)

function getEpisodeProgress(season: number, episode: number): EpisodeProgress | undefined {
  return props.progress.find((item) => item.season === season && item.episode === episode)
}

function isActiveEpisode(episode: number): boolean {
  return props.activeEpisode === episode
}

function isCompleted(season: number, episode: number): boolean {
  return Boolean(getEpisodeProgress(season, episode)?.completed)
}

function hasProgress(season: number, episode: number): boolean {
  const progress = getEpisodeProgress(season, episode)
  return Boolean(progress && progress.currentTime > 5 && !progress.completed)
}

function getProgressPercent(season: number, episode: number): number {
  const progress = getEpisodeProgress(season, episode)
  if (!progress || progress.duration <= 0) return 0
  return Math.min(Math.round((progress.currentTime / progress.duration) * 100), 100)
}
</script>
