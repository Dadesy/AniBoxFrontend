import type {
  LevelProgressDto,
  AchievementDto,
  ExpGrantResult,
  UnlockedAchievementDto,
} from '~/types/gamification'

// ── Level-up event bus (module-level, shared across composable instances) ─────

type LevelUpPayload = { newLevel: number; levelTitle: string }
type AchievementPayload = UnlockedAchievementDto
type ExpGainPayload = { amount: number }

const levelUpListeners = new Set<(p: LevelUpPayload) => void>()
const achListeners     = new Set<(p: AchievementPayload) => void>()
const expListeners     = new Set<(p: ExpGainPayload) => void>()

export const gamificationBus = {
  onLevelUp(fn: (p: LevelUpPayload) => void)     { levelUpListeners.add(fn);  return () => levelUpListeners.delete(fn) },
  onAchievement(fn: (p: AchievementPayload) => void) { achListeners.add(fn);  return () => achListeners.delete(fn) },
  onExpGain(fn: (p: ExpGainPayload) => void)     { expListeners.add(fn);      return () => expListeners.delete(fn) },
  emitLevelUp(p: LevelUpPayload)     { levelUpListeners.forEach(fn => fn(p)) },
  emitAchievement(p: AchievementPayload) { achListeners.forEach(fn => fn(p)) },
  emitExpGain(p: ExpGainPayload)     { expListeners.forEach(fn => fn(p)) },
}

// ── Main composable ───────────────────────────────────────────────────────────

export function useGamification() {
  const apiUrl = useApiUrl()

  const levelProgress  = ref<LevelProgressDto | null>(null)
  const achievements   = ref<AchievementDto[]>([])
  const loading        = ref(false)
  const achievLoading  = ref(false)

  async function fetchLevelProgress() {
    loading.value = true
    try {
      levelProgress.value = await $fetch<LevelProgressDto>(
        `${apiUrl}/gamification/level`,
        { credentials: 'include' },
      )
    } catch (e) {
      console.error('[useGamification] fetchLevelProgress', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchAchievements() {
    achievLoading.value = true
    try {
      achievements.value = await $fetch<AchievementDto[]>(
        `${apiUrl}/gamification/achievements`,
        { credentials: 'include' },
      )
    } catch (e) {
      console.error('[useGamification] fetchAchievements', e)
    } finally {
      achievLoading.value = false
    }
  }

  // Called by useWatchProgress after a save returns expResult
  function processExpResult(result: ExpGrantResult) {
    if (!result) return

    if (result.expGained > 0) {
      gamificationBus.emitExpGain({ amount: result.expGained })
    }

    if (result.leveledUp) {
      const { getLevelTitle } = useLevelHelpers()
      gamificationBus.emitLevelUp({
        newLevel: result.newLevel,
        levelTitle: getLevelTitle(result.newLevel),
      })
      // Refresh level data after level-up
      fetchLevelProgress()
    } else if (result.expGained > 0 && levelProgress.value) {
      // Optimistic local update to avoid a round-trip
      levelProgress.value = {
        ...levelProgress.value,
        exp:         result.newExp,
        expToNext:   result.expToNext,
        progressPct: result.progressPct,
        level:       result.newLevel,
      }
    }

    for (const ach of result.unlockedAchievements) {
      gamificationBus.emitAchievement(ach)
      // Mark locally
      const found = achievements.value.find(a => a.key === ach.key)
      if (found) {
        found.unlocked = true
        found.unlockedAt = new Date().toISOString()
      }
    }
  }

  return {
    levelProgress,
    achievements,
    loading,
    achievLoading,
    fetchLevelProgress,
    fetchAchievements,
    processExpResult,
  }
}

// ── Small helper composable used inside useGamification ───────────────────────

function useLevelHelpers() {
  return {
    getLevelTitle(level: number): string {
      if (level <= 5)  return 'Новичок'
      if (level <= 15) return 'Любитель'
      if (level <= 30) return 'Фанат'
      if (level <= 50) return 'Отаку'
      if (level <= 75) return 'Сенпай'
      return 'Мастер аниме'
    },
  }
}
