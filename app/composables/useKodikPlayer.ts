/**
 * composables/useKodikPlayer.ts
 *
 * Abstraction over the Kodik iframe Player API.
 *
 * Kodik sends events as:   { key: 'kodik_player_time_update', value: 14 }
 * We send commands as:     { key: 'kodik_player_api', value: { method: 'seek', seconds: 64 } }
 *
 * Docs: https://kodik.info (player API section)
 */

import type {
  KodikCommand,
  KodikEventName,
  KodikPlayerEvent,
  KodikRawEvent,
  KodikRawEventValue,
  PlayerEventHandler,
  PlayerState,
} from '~/types/player';

import { KODIK_ORIGINS } from '~/types/player';

export const useKodikPlayer = (iframeRef: Ref<HTMLIFrameElement | null>) => {
  // ── Internal state ────────────────────────────────────────────────────────
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

  // ── Event bus ─────────────────────────────────────────────────────────────
  const listeners = new Map<KodikEventName, Set<PlayerEventHandler>>();

  function on(event: KodikEventName, handler: PlayerEventHandler): () => void {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event)!.add(handler);
    return () => off(event, handler);
  }

  function off(event: KodikEventName, handler: PlayerEventHandler): void {
    listeners.get(event)?.delete(handler);
  }

  function dispatchEvent(ev: KodikPlayerEvent): void {
    listeners.get(ev.event)?.forEach((fn) => fn(ev));
  }

  // ── postMessage handler ───────────────────────────────────────────────────
  function handleMessage(messageEvent: MessageEvent): void {
    // Origin check — guard against non-Kodik messages
    const origin = messageEvent.origin;
    const isKodik =
      KODIK_ORIGINS.some((o) => origin === o) ||
      origin.endsWith('.kodik.info') ||
      origin.endsWith('.kodik.cc') ||
      origin.endsWith('.kodik.biz');
    if (!isKodik) return;

    // Parse raw message — Kodik sends plain objects, but stringify defensively
    let raw: KodikRawEvent | null = null;
    try {
      if (typeof messageEvent.data === 'string') {
        raw = JSON.parse(messageEvent.data) as KodikRawEvent;
      } else if (typeof messageEvent.data === 'object' && messageEvent.data !== null) {
        raw = messageEvent.data as KodikRawEvent;
      }
    } catch {
      return;
    }

    // Kodik events use `key` (not `event`) ← this was the critical bug
    if (!raw?.key) return;

    const key = raw.key;
    const val = raw.value;

    // ── Normalise into KodikPlayerEvent ───────────────────────────────────
    const ev: KodikPlayerEvent = { event: key };

    switch (key) {
      // value: number (seconds, integer)
      case 'kodik_player_time_update':
        ev.time = typeof val === 'number' ? val : undefined;
        ev.duration = state.duration; // attach current known duration
        break;

      // value: number (seconds, may be fractional) — response to get_time
      case 'kodik_player_time':
        ev.time = typeof val === 'number' ? val : undefined;
        break;

      // value: number (total duration in seconds, fractional)
      case 'kodik_player_duration_update':
        ev.duration = typeof val === 'number' ? val : undefined;
        break;

      // value: { time: number }
      case 'kodik_player_seek': {
        const v = val as KodikRawEventValue | undefined;
        ev.time = v?.time;
        break;
      }

      // value: { episode, season, translation: { id, title } }
      case 'kodik_player_current_episode': {
        const v = val as KodikRawEventValue | undefined;
        ev.episode = v?.episode ?? null;
        ev.season = v?.season ?? null;
        ev.translation = v?.translation ?? null;
        break;
      }

      // value: { muted: boolean, volume: number }
      case 'kodik_player_volume_change': {
        const v = val as KodikRawEventValue | undefined;
        ev.volume = v?.volume;
        ev.muted = v?.muted;
        break;
      }

      // value: { speed: number }
      case 'kodik_player_speed_change': {
        const v = val as KodikRawEventValue | undefined;
        ev.speed = v?.speed;
        break;
      }

      // value: { title: string }
      case 'kodik_player_skip_button': {
        const v = val as KodikRawEventValue | undefined;
        ev.skipTitle = v?.title;
        break;
      }

      // Events with no value payload — nothing to extract
      case 'kodik_player_play':
      case 'kodik_player_pause':
      case 'kodik_player_video_started':
      case 'kodik_player_video_ended':
      case 'kodik_player_enter_pip':
      case 'kodik_player_exit_pip':
        break;
    }

    // ── Update internal state ─────────────────────────────────────────────
    switch (key) {
      case 'kodik_player_play':
      case 'kodik_player_video_started':
        state.playing = true;
        state.ended = false;
        break;
      case 'kodik_player_pause':
        state.playing = false;
        break;
      case 'kodik_player_video_ended':
        state.playing = false;
        state.ended = true;
        break;
      case 'kodik_player_time_update':
        if (ev.time !== undefined) state.currentTime = ev.time;
        break;
      case 'kodik_player_time':
        if (ev.time !== undefined) state.currentTime = ev.time;
        break;
      case 'kodik_player_duration_update':
        if (ev.duration !== undefined) state.duration = ev.duration;
        break;
      case 'kodik_player_seek':
        if (ev.time !== undefined) state.currentTime = ev.time;
        break;
      case 'kodik_player_volume_change':
        if (ev.volume !== undefined) state.volume = ev.volume;
        break;
      case 'kodik_player_speed_change':
        if (ev.speed !== undefined) state.speed = ev.speed;
        break;
      case 'kodik_player_current_episode':
        state.season = ev.season ?? null;
        state.episode = ev.episode ?? null;
        state.translation = ev.translation ?? null;
        break;
      case 'kodik_player_enter_pip':
        state.pip = true;
        break;
      case 'kodik_player_exit_pip':
        state.pip = false;
        break;
    }

    dispatchEvent(ev);
  }

  // ── Commands ──────────────────────────────────────────────────────────────
  // Kodik requires: { key: "kodik_player_api", value: { method: "...", ...params } }
  function send(command: KodikCommand): void {
    const iframe = iframeRef.value;
    if (!iframe?.contentWindow) return;

    // Build the value object — parameter names depend on the method
    const value: Record<string, unknown> = { method: command.method };

    if (command.method === 'seek') {
      value.seconds = command.seconds; // Kodik uses `seconds`, not `value`
    } else if (command.method === 'volume') {
      value.volume = Math.max(0, Math.min(1, command.volume));
    } else if (command.method === 'speed') {
      value.speed = command.speed;
    } else if (command.method === 'change_episode') {
      value.episode = command.episode;
      if (command.season !== undefined) value.season = command.season;
    }

    // Send as plain object (Kodik docs show plain objects, not JSON strings)
    iframe.contentWindow.postMessage({ key: 'kodik_player_api', value }, '*');
  }

  // ── Guard: prevent rapid episode switching ────────────────────────────────
  const isChangingEpisode = ref(false);

  // ── Public API ────────────────────────────────────────────────────────────
  const play = () => send({ method: 'play' });
  const pause = () => send({ method: 'pause' });
  const seek = (seconds: number) => send({ method: 'seek', seconds });
  const setVolume = (volume: number) => send({ method: 'volume', volume });
  const mute = () => send({ method: 'mute' });
  const unmute = () => send({ method: 'unmute' });
  const setSpeed = (speed: number) => send({ method: 'speed', speed });
  const enterPip = () => send({ method: 'enter_pip' });
  const exitPip = () => send({ method: 'exit_pip' });
  const getTime = () => send({ method: 'get_time' });

  function changeEpisode(season: number, episode: number): void {
    if (isChangingEpisode.value) return;
    isChangingEpisode.value = true;
    send({ method: 'change_episode', season, episode });
    setTimeout(() => { isChangingEpisode.value = false; }, 1500);
  }

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
