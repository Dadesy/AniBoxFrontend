<template>
  <div v-if="seasons.length" class="space-y-4">
    <div v-if="seasons.length > 1" class="flex flex-wrap gap-2">
      <button
        v-for="season in seasons"
        :key="season.number"
        type="button"
        class="min-h-10 rounded-2xl px-4 text-sm font-semibold transition-all"
        :class="season.number === activeSeason ? 'bg-emerald-500 text-black' : 'border border-white/10 bg-white/[0.05] text-slate-200 hover:border-white/20 hover:bg-white/[0.08]'"
        @click="$emit('select-season', season.number)"
      >
        {{ season.title || `Сезон ${season.number}` }}
      </button>
    </div>

    <div class="grid grid-cols-5 gap-2 sm:grid-cols-7 lg:grid-cols-9">
      <button
        v-for="episode in activeSeasonEpisodes"
        :key="`${activeSeason}-${episode.number}`"
        type="button"
        class="flex min-h-11 items-center justify-center rounded-2xl text-sm font-semibold transition-all"
        :class="episodeButtonClass(episode.number, Boolean(episode.link))"
        :disabled="!episode.link"
        @click="$emit('select-episode', { season: activeSeason, episode: episode.number })"
      >
        {{ episode.number }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Season } from '~/types/content'

const props = defineProps<{
  seasons: Season[]
  activeSeason: number
  activeEpisode?: number
}>()

defineEmits<{
  (e: 'select-season', season: number): void
  (e: 'select-episode', payload: { season: number; episode: number }): void
}>()

const activeSeasonEpisodes = computed(() =>
  props.seasons.find((season) => season.number === props.activeSeason)?.episodes
  ?? props.seasons[0]?.episodes
  ?? [],
)

function episodeButtonClass(episodeNumber: number, enabled: boolean): string {
  if (!enabled) {
    return 'cursor-not-allowed border border-white/10 bg-white/[0.03] text-slate-600'
  }

  if (episodeNumber === props.activeEpisode) {
    return 'bg-emerald-500 text-black'
  }

  return 'border border-white/10 bg-black/30 text-slate-200 hover:border-white/20 hover:bg-white/[0.08]'
}
</script>
