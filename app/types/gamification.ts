export type LevelTier = 'bronze' | 'silver' | 'gold' | 'neon'

export interface LevelProgressDto {
  level: number
  levelTitle: string
  tier: LevelTier
  exp: number
  expToNext: number
  totalExp: number
  progressPct: number
}

export interface AchievementDto {
  key: string
  title: string
  description: string
  icon: string
  expReward: number
  unlocked: boolean
  unlockedAt: string | null
}

export interface UnlockedAchievementDto {
  key: string
  title: string
  description: string
  icon: string
  expReward: number
}

export interface ExpGrantResult {
  expGained: number
  leveledUp: boolean
  newLevel: number
  newExp: number
  expToNext: number
  progressPct: number
  unlockedAchievements: UnlockedAchievementDto[]
}

export interface SaveProgressResponse {
  expResult: ExpGrantResult | null
}

// ── Level helpers (mirrors backend logic) ─────────────────────────────────────

export function getLevelTitle(level: number): string {
  if (level <= 5)  return 'Новичок'
  if (level <= 15) return 'Любитель'
  if (level <= 30) return 'Фанат'
  if (level <= 50) return 'Отаку'
  if (level <= 75) return 'Сенпай'
  return 'Мастер аниме'
}

export function getLevelTier(level: number): LevelTier {
  if (level <= 20) return 'bronze'
  if (level <= 50) return 'silver'
  if (level <= 75) return 'gold'
  return 'neon'
}

export const TIER_COLORS: Record<LevelTier, { text: string; glow: string; border: string }> = {
  bronze: { text: '#cd7f32', glow: 'rgba(205,127,50,0.4)',  border: 'rgba(205,127,50,0.35)' },
  silver: { text: '#a8b8c8', glow: 'rgba(168,184,200,0.4)', border: 'rgba(168,184,200,0.35)' },
  gold:   { text: '#ffd700', glow: 'rgba(255,215,0,0.45)',   border: 'rgba(255,215,0,0.35)' },
  neon:   { text: '#22c55e', glow: 'rgba(34,197,94,0.55)',   border: 'rgba(34,197,94,0.4)' },
}
