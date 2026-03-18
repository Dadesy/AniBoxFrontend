// ── Raw Kodik postMessage format ──────────────────────────────────────────────
// Kodik sends:  { key: 'kodik_player_time_update', value: 14 }
// Commands to:  { key: 'kodik_player_api', value: { method: 'seek', seconds: 64 } }

export type KodikEventName =
  | 'kodik_player_play'
  | 'kodik_player_pause'
  | 'kodik_player_seek'
  | 'kodik_player_time_update'
  | 'kodik_player_duration_update'
  | 'kodik_player_video_started'
  | 'kodik_player_video_ended'
  | 'kodik_player_volume_change'
  | 'kodik_player_current_episode'
  | 'kodik_player_speed_change'
  | 'kodik_player_skip_button'
  | 'kodik_player_enter_pip'
  | 'kodik_player_exit_pip'
  | 'kodik_player_time'; // response to get_time command

// Raw incoming postMessage from Kodik iframe
export interface KodikRawEvent {
  key: KodikEventName;
  // value depends on the event:
  // kodik_player_time_update      → number (seconds, rounded)
  // kodik_player_duration_update  → number (seconds, may be fractional)
  // kodik_player_seek             → { time: number }
  // kodik_player_time             → number (fractional, response to get_time)
  // kodik_player_current_episode  → { episode: number|null, season: number|null, translation: { id: number, title: string } }
  // kodik_player_volume_change    → { muted: boolean, volume: number }
  // kodik_player_speed_change     → { speed: number }
  // all others                    → undefined
  value?: number | KodikRawEventValue;
}

export interface KodikRawEventValue {
  time?: number;
  episode?: number | null;
  season?: number | null;
  translation?: { id: number; title: string };
  muted?: boolean;
  volume?: number;
  speed?: number;
  title?: string; // skip_button title
}

// ── Normalised internal event (after parsing raw) ─────────────────────────────
export interface KodikPlayerEvent {
  event: KodikEventName;
  time?: number;
  duration?: number; // populated from state.duration for time_update events
  volume?: number;
  muted?: boolean;
  speed?: number;
  season?: number | null;
  episode?: number | null;
  translation?: { id: number; title: string } | null;
  skipTitle?: string;
}

// ── Commands sent TO the player ───────────────────────────────────────────────
// Kodik expects: postMessage({ key: "kodik_player_api", value: { method, ...params } }, '*')
export type KodikCommand =
  | { method: 'play' }
  | { method: 'pause' }
  | { method: 'mute' }
  | { method: 'unmute' }
  | { method: 'enter_pip' }
  | { method: 'exit_pip' }
  | { method: 'get_time' }
  | { method: 'seek'; seconds: number }
  | { method: 'volume'; volume: number }
  | { method: 'speed'; speed: number }
  | { method: 'change_episode'; episode: number; season?: number };

export type KodikCommandMethod = KodikCommand['method'];

export interface PlayerState {
  playing: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  speed: number;
  season: number | null;
  episode: number | null;
  translation: { id: number; title: string } | null;
  ended: boolean;
  pip: boolean;
}

export type PlayerEventHandler = (event: KodikPlayerEvent) => void;

// Allowed postMessage origins from Kodik player
export const KODIK_ORIGINS = [
  'https://kodik.info',
  'https://kodik.cc',
  'https://kodik.biz',
  'https://aniqit.com',
] as const;
