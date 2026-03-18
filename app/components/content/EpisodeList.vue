<template>
  <div class="space-y-3">
    <!-- Season tabs -->
    <div v-if="seasons.length > 1" class="flex flex-wrap gap-1.5">
      <button
        v-for="season in seasons"
        :key="season.number"
        :class="[
          'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
          activeSeason === season.number
            ? 'bg-green-500 text-black font-bold glow-green-sm'
            : 'bg-white/5 text-slate-400 hover:bg-white/8 hover:text-white border border-white/6',
        ]"
        @click="activeSeason = season.number"
      >
        Сезон {{ season.number }}
      </button>
    </div>

    <!-- Compact list mode (sidebar) -->
    <div v-if="compact && currentSeasonEpisodes.length" class="space-y-0.5">
      <button
        v-for="ep in currentSeasonEpisodes"
        :key="ep.number"
        :class="[
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-all',
          isActive(ep.number)
            ? 'bg-green-500/15 text-green-400 border border-green-500/25'
            : 'text-slate-400 hover:bg-white/5 hover:text-white',
        ]"
        @click="emit('select', activeSeason, ep.number)"
      >
        <!-- Progress indicator -->
        <span class="shrink-0 w-5 text-center">
          <span
            v-if="isActive(ep.number)"
            class="inline-block w-2 h-2 rounded-full bg-green-500"
          />
          <span
            v-else-if="isCompleted(activeSeason, ep.number)"
            class="inline-block w-2 h-2 rounded-full bg-green-500/50"
          />
          <span
            v-else-if="hasProgress(activeSeason, ep.number)"
            class="inline-block w-2 h-2 rounded-full bg-amber-400"
          />
          <span v-else class="text-xs text-slate-600">{{ ep.number }}</span>
        </span>
        <span class="flex-1 truncate font-medium">Эпизод {{ ep.number }}</span>
        <UIcon v-if="isActive(ep.number)" name="lucide:play" class="size-3.5 text-green-400 shrink-0" />
      </button>
    </div>

    <!-- Grid mode (title page) -->
    <div
      v-else-if="!compact && currentSeasonEpisodes.length"
      class="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1.5"
    >
      <button
        v-for="ep in currentSeasonEpisodes"
        :key="ep.number"
        :title="`Эпизод ${ep.number}`"
        :class="[
          'relative flex h-10 items-center justify-center rounded-xl text-sm font-semibold transition-all border',
          episodeClass(ep.number),
        ]"
        @click="emit('select', activeSeason, ep.number)"
      >
        {{ ep.number }}
        <!-- Status dot -->
        <span
          v-if="isCompleted(activeSeason, ep.number) && !isActive(ep.number)"
          class="absolute right-1 top-1 w-1.5 h-1.5 rounded-full bg-green-500"
        />
        <span
          v-else-if="hasProgress(activeSeason, ep.number) && !isActive(ep.number)"
          class="absolute right-1 top-1 w-1.5 h-1.5 rounded-full bg-amber-400"
        />
      </button>
    </div>

    <p v-else class="text-sm text-slate-500 py-4 text-center">Эпизоды не найдены</p>
  </div>
</template>

<script setup lang="ts">
import type { EpisodeProgress, Season } from '~/types/content';

const props = defineProps<{
  seasons: Season[];
  currentSeason: number;
  currentEpisode: number;
  progress: EpisodeProgress[];
  compact?: boolean;
}>();

const emit = defineEmits<{ (e: 'select', season: number, episode: number): void }>();

const activeSeason = ref(props.currentSeason);
watch(() => props.currentSeason, v => { activeSeason.value = v; });

const currentSeasonEpisodes = computed(() =>
  props.seasons.find(s => s.number === activeSeason.value)?.episodes ?? [],
);

function isActive(episode: number): boolean {
  return activeSeason.value === props.currentSeason && episode === props.currentEpisode;
}
function isCompleted(season: number, episode: number): boolean {
  return props.progress.some(p => p.season === season && p.episode === episode && p.completed);
}
function hasProgress(season: number, episode: number): boolean {
  return props.progress.some(p => p.season === season && p.episode === episode && p.currentTime > 5);
}

function episodeClass(episode: number): string {
  if (isActive(episode)) {
    return 'bg-green-500 text-black border-green-500 cursor-default glow-green-sm scale-105';
  }
  if (isCompleted(activeSeason.value, episode)) {
    return 'bg-green-500/8 text-green-400 border-green-500/20 hover:bg-green-500/15 cursor-pointer';
  }
  if (hasProgress(activeSeason.value, episode)) {
    return 'bg-amber-400/8 text-amber-400 border-amber-400/20 hover:bg-amber-400/15 cursor-pointer';
  }
  return 'bg-white/4 text-slate-400 border-white/6 hover:bg-white/8 hover:text-white cursor-pointer';
}
</script>
