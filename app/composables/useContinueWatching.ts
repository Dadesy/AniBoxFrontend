/**
 * composables/useContinueWatching.ts
 *
 * Кэш Nuxt useAsyncData для блока «Продолжить просмотр» (без SSR: cookie-сессия).
 */

import type { EpisodeProgress } from '~/types/content'

export function useContinueWatching(options?: { limit?: number }) {
  const limit = options?.limit ?? 16
  const { isAuthenticated } = useAuth()
  const apiUrl = useApiUrl()

  const { data, pending, error, refresh } = useAsyncData(
    'continue-watching',
    async () => {
      if (!isAuthenticated.value) return [] as EpisodeProgress[]
      return $fetch<EpisodeProgress[]>(
        `${apiUrl}/progress/continue-watching?limit=${limit}`,
        { credentials: 'include' },
      )
    },
    {
      server: false,
      default: () => [] as EpisodeProgress[],
    },
  )

  watch(
    isAuthenticated,
    (ok) => {
      if (ok) void refresh()
      else if (data.value?.length) data.value = []
    },
    { flush: 'post', immediate: true },
  )

  const items = computed(() => data.value ?? [])

  return {
    items,
    pending,
    error,
    refresh,
  }
}
