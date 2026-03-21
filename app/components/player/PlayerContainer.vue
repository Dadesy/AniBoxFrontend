<template>
  <section class="overflow-hidden rounded-[28px] border border-white/8 bg-black shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
    <div class="flex items-center justify-between border-b border-white/6 px-4 py-3">
      <div class="min-w-0">
        <p class="truncate text-sm font-semibold text-white">{{ title || 'Плеер' }}</p>
        <p v-if="metaLine" class="mt-0.5 text-xs text-slate-500">{{ metaLine }}</p>
      </div>
      <div
        v-if="loading"
        class="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-1 text-xs text-slate-300"
      >
        <UIcon name="lucide:loader-2" class="size-3.5 animate-spin" />
        Обновляем плеер
      </div>
    </div>

    <div class="relative bg-black">
      <div v-if="errorMessage" class="flex aspect-video items-center justify-center px-6 text-center">
        <div class="space-y-3">
          <UIcon name="lucide:alert-circle" class="mx-auto size-12 text-red-400" />
          <p class="text-sm text-slate-300">{{ errorMessage }}</p>
        </div>
      </div>

      <div v-else-if="playerUrl" class="w-full">
        <!-- HLS player for AniLibria (.m3u8 streams) -->
        <HlsPlayer
          v-if="isHls"
          ref="playerRef"
          :src="playerUrl"
          :title="title"
          :start-time="startTime"
          :current-season-prop="season"
          :current-episode-prop="episode"
          :next-episode-number="nextEpisodeNumber"
          @ready="emit('ready')"
          @play="emit('play', $event)"
          @pause="emit('pause', $event)"
          @time-update="(time, duration) => emit('timeUpdate', time, duration)"
          @ended="emit('ended')"
          @episode-change="(s, ep, tid) => emit('episodeChange', s, ep, tid)"
          @seeked="emit('seeked', $event)"
        />

        <!-- Iframe player for Kodik / Collaps -->
        <KodikPlayer
          v-else
          ref="playerRef"
          :player-url="playerUrl"
          :title="title"
          :season="season"
          :episode="episode"
          :start-time="startTime"
          @ready="emit('ready')"
          @play="emit('play', $event)"
          @pause="emit('pause', $event)"
          @time-update="(time, duration) => emit('timeUpdate', time, duration)"
          @ended="emit('ended')"
          @episode-change="(season, episode, translationId) => emit('episodeChange', season, episode, translationId)"
          @seeked="emit('seeked', $event)"
        />
      </div>

      <div v-else class="aspect-video w-full skeleton-shine" />
    </div>
  </section>
</template>

<script setup lang="ts">
import HlsPlayer from '~/components/player/HlsPlayer.vue'
import KodikPlayer from '~/components/player/KodikPlayer.vue'

const props = defineProps<{
  title?: string
  playerUrl?: string
  loading?: boolean
  errorMessage?: string | null
  startTime?: number
  season?: number
  episode?: number
  /** Next episode number for AniLibria auto-advance prompt */
  nextEpisodeNumber?: number
}>()

const emit = defineEmits<{
  (e: 'ready'): void
  (e: 'play', time: number): void
  (e: 'pause', time: number): void
  (e: 'timeUpdate', time: number, duration: number): void
  (e: 'ended'): void
  (e: 'episodeChange', season: number, episode: number, translationId?: number): void
  (e: 'seeked', time: number): void
}>()

const playerRef = ref<InstanceType<typeof KodikPlayer> | InstanceType<typeof HlsPlayer> | null>(null)

/** True when the URL is an HLS manifest (.m3u8) rather than an iframe embed */
const isHls = computed(() =>
  Boolean(props.playerUrl) && (
    props.playerUrl!.includes('.m3u8') ||
    props.playerUrl!.includes('cache.libria.fun') ||
    props.playerUrl!.includes('libria.fun')
  ),
)

const metaLine = computed(() => {
  const parts: string[] = []
  if (props.season) parts.push(`Сезон ${props.season}`)
  if (props.episode) parts.push(`Эпизод ${props.episode}`)
  return parts.join(' · ')
})

defineExpose({
  seek: (time: number) => playerRef.value?.seek(time),
  play: () => playerRef.value?.play(),
  pause: () => playerRef.value?.pause(),
  getState: () => playerRef.value?.state,
})
</script>
