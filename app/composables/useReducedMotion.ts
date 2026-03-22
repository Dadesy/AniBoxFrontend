/**
 * SSR-safe composable that tracks prefers-reduced-motion.
 * Returns false on server (safe default) and syncs with the OS setting on the client.
 * Listens for runtime changes (e.g., user toggles setting while page is open).
 */
export function useReducedMotion() {
  const reduced = ref(false)

  if (import.meta.client) {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    reduced.value = mq.matches

    const handler = (e: MediaQueryListEvent) => {
      reduced.value = e.matches
    }
    mq.addEventListener('change', handler)
    onUnmounted(() => mq.removeEventListener('change', handler))
  }

  return { reducedMotion: readonly(reduced) }
}
