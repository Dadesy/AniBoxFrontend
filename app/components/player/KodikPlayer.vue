<template>
  <div class="relative w-full" :class="containerClass">
    <!-- Loading overlay -->
    <div
      v-if="loading"
      class="absolute inset-0 z-10 flex items-center justify-center bg-black/60 rounded-xl"
    >
      <UIcon name="lucide:loader-2" class="size-10 text-white animate-spin" />
    </div>

    <!-- Player iframe -->
    <iframe
      v-if="currentSrc"
      ref="iframeRef"
      :src="currentSrc"
      :title="title"
      allow="autoplay; fullscreen; picture-in-picture"
      allowfullscreen
      class="absolute inset-0 h-full w-full rounded-xl"
      @load="onLoad"
    />
  </div>
</template>

<script setup lang="ts">
import { useKodikPlayer } from '~/composables/useKodikPlayer';

interface Props {
  /** Base player URL (https://kodik.info/serial/...) */
  playerUrl: string;
  title?: string;
  /** For serials: season number */
  season?: number;
  /** For serials: episode number */
  episode?: number;
  /** Start position in seconds */
  startTime?: number;
  /** Aspect ratio class */
  aspect?: 'video' | 'cinema';
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Плеер',
  aspect: 'video',
});

const emit = defineEmits<{
  (e: 'ready'): void;
  (e: 'play', time: number): void;
  (e: 'pause', time: number): void;
  (e: 'timeUpdate', time: number, duration: number): void;
  (e: 'ended'): void;
  (e: 'episodeChange', season: number, episode: number, translationId?: number): void;
  (e: 'seeked', time: number): void;
}>();

const iframeRef = ref<HTMLIFrameElement | null>(null);
const loading = ref(true);
const initializedSrc = ref<string | null>(null);

const player = useKodikPlayer(iframeRef);

// ── Build iframe src ─────────────────────────────────────────────────────────
const currentSrc = computed(() => {
  let url = props.playerUrl;
  if (!url) return '';
  if (url.startsWith('//')) url = `https:${url}`;
  return url;
});

// ── Seek to startTime after iframe loads ─────────────────────────────────────
function onLoad(): void {
  loading.value = false;
  emit('ready');

  if (initializedSrc.value !== currentSrc.value) {
    initializedSrc.value = currentSrc.value;

    if (props.season != null && props.episode != null) {
      setTimeout(() => {
        player.changeEpisode(props.season!, props.episode!);
      }, 1200);
    }

    if (props.startTime && props.startTime > 5) {
      // Wait for player to initialize before seeking
      setTimeout(() => {
        player.seek(props.startTime!);
      }, 2000);
    }
  }
}

// ── Forward events ────────────────────────────────────────────────────────────
const unsubscribers: Array<() => void> = [];

onMounted(() => {
  unsubscribers.push(
    player.on('kodik_player_play', (ev) => emit('play', ev.time ?? 0)),
    player.on('kodik_player_pause', (ev) => emit('pause', ev.time ?? 0)),
    player.on('kodik_player_time_update', (ev) =>
      // ev.duration is populated from state.duration (set by kodik_player_duration_update)
      emit('timeUpdate', ev.time ?? 0, ev.duration ?? player.state.duration),
    ),
    player.on('kodik_player_video_ended', () => emit('ended')),
    player.on('kodik_player_current_episode', (ev) => {
      // season/episode can be null for movies — only emit if both are numbers
      if (ev.season != null && ev.episode != null) {
        emit('episodeChange', ev.season, ev.episode, ev.translation?.id);
      }
    }),
    player.on('kodik_player_seek', (ev) => emit('seeked', ev.time ?? 0)),
  );
});

onBeforeUnmount(() => unsubscribers.forEach((fn) => fn()));

// ── Watch for prop changes ────────────────────────────────────────────────────
watch(
  () => props.playerUrl,
  () => {
    loading.value = true;
    initializedSrc.value = null;
  },
);

// ── Expose player controls ────────────────────────────────────────────────────
defineExpose({
  play: player.play,
  pause: player.pause,
  seek: player.seek,
  setVolume: player.setVolume,
  mute: player.mute,
  unmute: player.unmute,
  changeEpisode: player.changeEpisode,
  state: player.state,
});

// ── Styling ───────────────────────────────────────────────────────────────────
const containerClass = computed(() =>
  props.aspect === 'cinema'
    ? 'aspect-[21/9]'
    : 'aspect-video',
);
</script>
