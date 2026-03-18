/**
 * composables/useKodikPlayer.ts
 *
 * Абстракция над Kodik iframe Player API.
 * Обрабатывает входящие postMessage-события и предоставляет методы управления.
 *
 * Использование:
 *   const player = useKodikPlayer(iframeRef)
 *   player.on('kodik_player_play', handler)
 *   player.play()
 *   player.seek(120)
 */

import type {
  KodikCommand,
  KodikCommandMethod,
  KodikEventName,
  KodikPlayerEvent,
  PlayerEventHandler,
  PlayerState,
} from '~/types/player';

import { KODIK_ORIGINS } from '~/types/player';

export const useKodikPlayer = (iframeRef: Ref<HTMLIFrameElement | null>) => {
  // ── State ─────────────────────────────────────────────────────────────────
  const state = reactive<PlayerState>({
    playing: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    speed: 1,
    season: null,
    episode: null,
    translation: null,
    ended: false,
    pip: false,
  });

  // ── Event listeners ───────────────────────────────────────────────────────
  const listeners = new Map<KodikEventName, Set<PlayerEventHandler>>();

  function on(event: KodikEventName, handler: PlayerEventHandler): () => void {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event)!.add(handler);
    return () => off(event, handler);
  }

  function off(event: KodikEventName, handler: PlayerEventHandler): void {
    listeners.get(event)?.delete(handler);
  }

  function emit(event: KodikPlayerEvent): void {
    listeners.get(event.event)?.forEach((fn) => fn(event));
  }

  // ── postMessage handler ───────────────────────────────────────────────────
  function handleMessage(messageEvent: MessageEvent): void {
    // Security: validate origin
    const origin = messageEvent.origin;
    const isKodik = KODIK_ORIGINS.some(
      (o) => origin === o || origin.endsWith('.kodik.info') || origin.endsWith('.kodik.cc'),
    );
    if (!isKodik) return;

    let data: KodikPlayerEvent | null = null;

    try {
      if (typeof messageEvent.data === 'string') {
        data = JSON.parse(messageEvent.data) as KodikPlayerEvent;
      } else if (typeof messageEvent.data === 'object' && messageEvent.data !== null) {
        data = messageEvent.data as KodikPlayerEvent;
      }
    } catch {
      return;
    }

    if (!data?.event) return;

    // Update internal state
    switch (data.event) {
      case 'kodik_player_play':
        state.playing = true;
        state.ended = false;
        if (data.time !== undefined) state.currentTime = data.time;
        break;
      case 'kodik_player_pause':
        state.playing = false;
        if (data.time !== undefined) state.currentTime = data.time;
        break;
      case 'kodik_player_time_update':
        if (data.time !== undefined) state.currentTime = data.time;
        if (data.duration !== undefined) state.duration = data.duration;
        break;
      case 'kodik_player_duration_update':
        if (data.duration !== undefined) state.duration = data.duration;
        break;
      case 'kodik_player_seek':
        if (data.time !== undefined) state.currentTime = data.time;
        break;
      case 'kodik_player_video_started':
        state.playing = true;
        state.ended = false;
        break;
      case 'kodik_player_video_ended':
        state.playing = false;
        state.ended = true;
        break;
      case 'kodik_player_volume_change':
        if (data.volume !== undefined) state.volume = data.volume;
        break;
      case 'kodik_player_current_episode':
        if (data.season !== undefined) state.season = data.season;
        if (data.episode !== undefined) state.episode = data.episode;
        if (data.translation !== undefined) state.translation = data.translation;
        break;
      case 'kodik_player_speed_change':
        if (data.speed !== undefined) state.speed = data.speed;
        break;
      case 'kodik_player_enter_pip':
        state.pip = true;
        break;
      case 'kodik_player_exit_pip':
        state.pip = false;
        break;
    }

    emit(data);
  }

  // ── Commands ──────────────────────────────────────────────────────────────
  function send(command: KodikCommand): void {
    const iframe = iframeRef.value;
    if (!iframe?.contentWindow) return;

    // Determine target origin — try to get from iframe src
    let targetOrigin = '*';
    try {
      const src = iframe.src || iframe.getAttribute('src') || '';
      if (src) {
        const url = new URL(src.startsWith('//') ? `https:${src}` : src);
        targetOrigin = url.origin;
      }
    } catch {
      targetOrigin = '*';
    }

    iframe.contentWindow.postMessage(JSON.stringify(command), targetOrigin);
  }

  const play = () => send({ method: 'play' });
  const pause = () => send({ method: 'pause' });
  const seek = (seconds: number) => send({ method: 'seek', value: seconds });
  const setVolume = (volume: number) => send({ method: 'volume', value: Math.max(0, Math.min(1, volume)) });
  const mute = () => send({ method: 'mute' });
  const unmute = () => send({ method: 'unmute' });
  const setSpeed = (speed: number) => send({ method: 'speed', value: speed });
  const enterPip = () => send({ method: 'enter_pip' });
  const exitPip = () => send({ method: 'exit_pip' });
  const getTime = () => send({ method: 'get_time' });

  function changeEpisode(season: number, episode: number): void {
    // Guard: prevent rapid switching races
    if (isChangingEpisode.value) return;
    isChangingEpisode.value = true;
    send({ method: 'change_episode', season, episode });
    setTimeout(() => { isChangingEpisode.value = false; }, 1500);
  }

  const isChangingEpisode = ref(false);

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  onMounted(() => window.addEventListener('message', handleMessage));
  onBeforeUnmount(() => window.removeEventListener('message', handleMessage));

  return {
    state: readonly(state),
    on,
    off,
    play,
    pause,
    seek,
    setVolume,
    mute,
    unmute,
    setSpeed,
    enterPip,
    exitPip,
    getTime,
    changeEpisode,
    isChangingEpisode: readonly(isChangingEpisode),
  };
};
