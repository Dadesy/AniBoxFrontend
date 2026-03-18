// Kodik postMessage event + command types

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
  | 'kodik_player_exit_pip';

export interface KodikPlayerEvent {
  event: KodikEventName;
  time?: number;
  duration?: number;
  volume?: number;
  speed?: number;
  season?: number;
  episode?: number;
  translation?: number;
  type?: string; // for skip_button: "opening" | "ending"
}

export type KodikCommandMethod =
  | 'play'
  | 'pause'
  | 'seek'
  | 'volume'
  | 'mute'
  | 'unmute'
  | 'change_episode'
  | 'speed'
  | 'enter_pip'
  | 'exit_pip'
  | 'get_time';

export interface KodikCommand {
  method: KodikCommandMethod;
  value?: number | string;
  season?: number;
  episode?: number;
}

export interface PlayerState {
  playing: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  speed: number;
  season: number | null;
  episode: number | null;
  translation: number | null;
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
