import type { UserProfile, UserStats } from '~/types/user'
import type { EpisodeProgress } from '~/types/content'

// ── Count-up animation helper ─────────────────────────────────────────────
export function useCountUp(target: Ref<number>, duration = 1400) {
  const current = ref(0)
  let rafId: number | null = null

  watch(
    target,
    (val) => {
      if (!import.meta.client || val <= 0) {
        current.value = val
        return
      }
      const start     = performance.now()
      const startVal  = current.value
      const delta     = val - startVal

      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1)
        // ease-out cubic
        const eased = 1 - Math.pow(1 - t, 3)
        current.value = Math.round(startVal + delta * eased)
        if (t < 1) rafId = requestAnimationFrame(tick)
        else current.value = val
      }
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(tick)
    },
    { immediate: true },
  )

  onUnmounted(() => { if (rafId) cancelAnimationFrame(rafId) })

  return current
}

// ── Profile composable ────────────────────────────────────────────────────

export function useProfile() {
  const apiUrl  = useApiUrl()

  const profile  = ref<UserProfile | null>(null)
  const stats    = ref<UserStats | null>(null)
  const history  = ref<EpisodeProgress[]>([])
  const historyTotal = ref(0)
  const continueWatching = ref<EpisodeProgress[]>([])

  const loading        = ref(true)
  const statsLoading   = ref(true)
  const historyLoading = ref(false)
  const error          = ref<string | null>(null)

  async function fetchProfile() {
    loading.value = true
    error.value   = null
    try {
      profile.value = await $fetch<UserProfile>(`${apiUrl}/user/profile`, {
        credentials: 'include',
      })
    } catch (e) {
      error.value = 'Не удалось загрузить профиль'
      console.error('[useProfile] fetchProfile', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchStats() {
    statsLoading.value = true
    try {
      stats.value = await $fetch<UserStats>(`${apiUrl}/user/stats`, {
        credentials: 'include',
      })
    } catch (e) {
      console.error('[useProfile] fetchStats', e)
    } finally {
      statsLoading.value = false
    }
  }

  async function fetchContinueWatching() {
    try {
      continueWatching.value = await $fetch<EpisodeProgress[]>(`${apiUrl}/user/continue-watching`, {
        credentials: 'include',
      })
    } catch (e) {
      console.error('[useProfile] fetchContinueWatching', e)
    }
  }

  async function fetchHistory(limit = 20, skip = 0) {
    historyLoading.value = true
    try {
      const data = await $fetch<{ items: EpisodeProgress[]; total: number }>(
        `${apiUrl}/user/history?limit=${limit}&skip=${skip}`,
        { credentials: 'include' },
      )
      if (skip === 0) history.value = data.items
      else history.value = [...history.value, ...data.items]
      historyTotal.value = data.total
    } catch (e) {
      console.error('[useProfile] fetchHistory', e)
    } finally {
      historyLoading.value = false
    }
  }

  async function setPresetAvatar(presetId: string): Promise<void> {
    const updated = await $fetch<UserProfile>(`${apiUrl}/user/avatar`, {
      method:      'PATCH',
      body:        { presetId },
      credentials: 'include',
    })
    profile.value = updated
  }

  async function uploadAvatar(file: File): Promise<void> {
    const form = new FormData()
    form.append('file', file)
    const updated = await $fetch<UserProfile>(`${apiUrl}/user/avatar/upload`, {
      method:      'POST',
      body:        form,
      credentials: 'include',
    })
    profile.value = updated
  }

  async function init() {
    await Promise.all([fetchProfile(), fetchStats(), fetchContinueWatching(), fetchHistory()])
  }

  return {
    profile,
    stats,
    history,
    historyTotal,
    continueWatching,
    loading,
    statsLoading,
    historyLoading,
    error,
    init,
    fetchHistory,
    setPresetAvatar,
    uploadAvatar,
  }
}
