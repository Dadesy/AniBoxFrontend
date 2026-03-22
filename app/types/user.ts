export interface UserProfile {
  id: string
  email: string
  role: 'USER' | 'ADMIN'
  avatarUrl: string | null
  avatarType: 'preset' | 'custom'
  createdAt: string
  lastLoginAt: string | null
}

export interface UserStats {
  totalWatchTimeSeconds: number
  totalWatchTimeFormatted: string
  totalEpisodes: number
  totalTitles: number
  lastWatchedAt: string | null
}

export interface AvatarPreset {
  id: string
  url: string
}

// ── DiceBear preset seeds (mirrors backend avatar.constants.ts) ───────────
export const PRESET_AVATAR_SEEDS: Array<{ id: string; seed: string }> = [
  { id: 'rin',    seed: 'Rin' },
  { id: 'sakura', seed: 'Sakura' },
  { id: 'akira',  seed: 'Akira' },
  { id: 'yuki',   seed: 'Yuki' },
  { id: 'hana',   seed: 'Hana' },
  { id: 'sora',   seed: 'Sora' },
  { id: 'niko',   seed: 'Niko' },
  { id: 'rei',    seed: 'Rei' },
  { id: 'kazu',   seed: 'Kazu' },
  { id: 'miku',   seed: 'Miku' },
  { id: 'tora',   seed: 'Tora' },
  { id: 'zero',   seed: 'Zero' },
  { id: 'luna',   seed: 'Luna' },
  { id: 'kira',   seed: 'Kira' },
  { id: 'nami',   seed: 'Nami' },
  { id: 'ryu',    seed: 'Ryu'  },
]

export function presetAvatarUrl(seed: string): string {
  return `/avatars/${seed.toLowerCase()}.svg`
}
