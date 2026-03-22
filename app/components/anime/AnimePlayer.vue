<template>
  <PlayerContainer
    ref="playerRef"
    :title="title"
    :player-url="playerUrl"
    :loading="loading"
    :error-message="errorMessage"
    :season="season"
    :episode="episode"
    :start-time="startTime"
    :next-episode-number="nextEpisodeNumber"
    @time-update="(time, duration) => $emit('time-update', time, duration)"
    @pause="(time) => $emit('pause', time)"
    @ended="$emit('ended')"
    @episode-change="(seasonNumber, episodeNumber, translationId) => $emit('episode-change', seasonNumber, episodeNumber, translationId)"
  />
</template>

<script setup lang="ts">
import PlayerContainer from '~/components/player/PlayerContainer.vue'

interface PlayerExpose {
  seek?: (time: number) => void
  getState?: () => { currentTime?: number; duration?: number } | undefined
}

defineProps<{
  title?: string
  playerUrl?: string
  loading?: boolean
  errorMessage?: string | null
  season?: number
  episode?: number
  startTime?: number
  nextEpisodeNumber?: number
}>()

defineEmits<{
  (e: 'time-update', time: number, duration: number): void
  (e: 'pause', time: number): void
  (e: 'ended'): void
  (e: 'episode-change', season: number, episode: number, translationId?: number): void
}>()

const playerRef = ref<PlayerExpose | null>(null)

defineExpose({
  seek: (time: number) => playerRef.value?.seek?.(time),
  getState: () => playerRef.value?.getState?.(),
})
</script>
