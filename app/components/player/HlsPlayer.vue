<template>
  <div class="relative w-full" :class="containerClass">
    <!-- Loading overlay -->
    <div
      v-if="loading"
      class="absolute inset-0 z-10 flex items-center justify-center bg-black/80 rounded-xl"
    >
      <UIcon name="lucide:loader-2" class="size-10 text-white animate-spin" />
    </div>

    <!-- Error overlay -->
    <div
      v-else-if="loadError"
      class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/90 rounded-xl px-6 text-center"
    >
      <UIcon name="lucide:alert-circle" class="size-10 text-red-400" />
      <p class="text-sm text-slate-300">{{ loadError }}</p>
    </div>

    <!-- Video element -->
    <video
      ref="videoRef"
      class="absolute inset-0 h-full w-full rounded-xl bg-black"
      :class="{ 'opacity-0': loading }"
      playsinline
      controls
      preload="metadata"
      @timeupdate="onTimeUpdate"
      @pause="onPause"
      @play="onPlay"
      @ended="onEnded"
      @seeked="onSeeked"
      @waiting="loading = true"
      @canplay="loading = false"
      @error="onError"
    />

    <!-- Episode navigation overlay (shown briefly after episode ends) -->
    <Transition name="fade">
      <div
        v-if="showNextPrompt && nextEpisodeNumber"
        class="absolute bottom-14 left-1/2 z-20 -translate-x-1/2 flex items-center gap-3 rounded-2xl bg-cinema-surface/95 backdrop-blur-sm border border-white/10 px-5 py-3 shadow-2xl"
      >
        <span class="text-sm text-slate-300">Следующий эпизод {{ nextEpisodeNumber }}</span>
        <button
          class="rounded-lg bg-green-500 px-3 py-1.5 text-xs font-bold text-black transition-colors hover:bg-green-400"
          @click="emit('episodeChange', currentSeasonProp ?? 1, nextEpisodeNumber!, undefined)"
        >
          Смотреть
        </button>
        <button
          class="rounded-lg bg-white/8 px-2 py-1.5 text-xs text-slate-400 transition-colors hover:bg-white/15"
          @click="showNextPrompt = false"
        >
          ✕
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type Hls from 'hls.js'

// ── Props & emits ─────────────────────────────────────────────────────────────

const props = withDefaults(defineProps<{
  /** HLS .m3u8 URL for the current episode */
  src: string
  title?: string
  startTime?: number
  aspect?: 'video' | 'cinema'
  /** Season/episode numbers — used for "next episode" prompt */
  currentSeasonProp?: number
  currentEpisodeProp?: number
  nextEpisodeNumber?: number
}>(), {
  title: 'Плеер',
  aspect: 'video',
})

const emit = defineEmits<{
  (e: 'ready'): void
  (e: 'play', time: number): void
  (e: 'pause', time: number): void
  (e: 'timeUpdate', time: number, duration: number): void
  (e: 'ended'): void
  (e: 'episodeChange', season: number, episode: number, translationId?: number): void
  (e: 'seeked', time: number): void
}>()

// ── State ─────────────────────────────────────────────────────────────────────

const videoRef    = ref<HTMLVideoElement | null>(null)
const loading     = ref(true)
const loadError   = ref<string | null>(null)
const showNextPrompt = ref(false)
let   hlsInstance: Hls | null = null
let   startApplied = false

// ── Styling ───────────────────────────────────────────────────────────────────

const containerClass = computed(() =>
  props.aspect === 'cinema' ? 'aspect-[21/9]' : 'aspect-video',
)

// ── HLS setup ─────────────────────────────────────────────────────────────────

async function initHls(src: string): Promise<void> {
  const video = videoRef.value
  if (!video || !src) return

  destroyHls()
  loading.value = true
  loadError.value = null
  startApplied = false
  showNextPrompt.value = false

  // Native HLS (Safari / iOS)
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = src
    video.load()
    return
  }

  // hls.js path (Chrome, Firefox, etc.)
  try {
    const HlsModule = await import('hls.js')
    const HlsCtor = HlsModule.default as typeof Hls

    if (!HlsCtor.isSupported()) {
      loadError.value = 'Ваш браузер не поддерживает этот формат видео'
      loading.value = false
      return
    }

    hlsInstance = new HlsCtor({
      enableWorker: true,
      lowLatencyMode: false,
      maxBufferLength: 60,
    })

    hlsInstance.loadSource(src)
    hlsInstance.attachMedia(video)

    hlsInstance.on(HlsCtor.Events.MANIFEST_PARSED, () => {
      emit('ready')
    })

    hlsInstance.on(HlsCtor.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        loadError.value = 'Ошибка загрузки видео. Попробуйте позже.'
        loading.value = false
      }
    })
  } catch (err) {
    loadError.value = 'Не удалось загрузить плеер'
    loading.value = false
    console.warn('[HlsPlayer] init failed:', err)
  }
}

function destroyHls(): void {
  if (hlsInstance) {
    hlsInstance.destroy()
    hlsInstance = null
  }
  if (videoRef.value) {
    videoRef.value.src = ''
  }
}

// ── Video events ──────────────────────────────────────────────────────────────

function onPlay(): void {
  emit('play', videoRef.value?.currentTime ?? 0)
}

function onPause(): void {
  emit('pause', videoRef.value?.currentTime ?? 0)
}

function onTimeUpdate(): void {
  const video = videoRef.value
  if (!video) return

  // Apply startTime once after video is ready to play
  if (!startApplied && props.startTime && props.startTime > 5 && video.duration > 0) {
    startApplied = true
    video.currentTime = props.startTime
  }

  emit('timeUpdate', video.currentTime, video.duration)
}

function onEnded(): void {
  emit('ended')
  if (props.nextEpisodeNumber) {
    showNextPrompt.value = true
  }
}

function onSeeked(): void {
  emit('seeked', videoRef.value?.currentTime ?? 0)
}

function onError(): void {
  loadError.value = 'Ошибка воспроизведения. Попробуйте обновить страницу.'
  loading.value = false
}

// ── Exposed controls ──────────────────────────────────────────────────────────

function seek(time: number): void {
  if (videoRef.value) videoRef.value.currentTime = time
}

function play(): void {
  videoRef.value?.play()
}

function pause(): void {
  videoRef.value?.pause()
}

const state = reactive({
  currentTime: 0,
  duration: 0,
})

// Keep state in sync
watch(videoRef, (video) => {
  if (!video) return
  const update = () => {
    state.currentTime = video.currentTime
    state.duration = video.duration
  }
  video.addEventListener('timeupdate', update)
})

defineExpose({ seek, play, pause, state })

// ── Lifecycle ─────────────────────────────────────────────────────────────────

watch(() => props.src, (src) => {
  if (src) void initHls(src)
}, { immediate: false })

onMounted(() => {
  if (props.src) void initHls(props.src)
})

onBeforeUnmount(() => {
  destroyHls()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
