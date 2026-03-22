/**
 * Global singleton that ensures only one card video preview is active at a time.
 *
 * Usage per card:
 *   const { scheduleActivate, deactivate } = useActivePreview()
 *   const isActive = computed(() => activeId.value === myId)
 *
 * The 700 ms delay prevents accidental triggers while the user scrolls past cards.
 * Each card instance owns its own timer reference — global state is only `activeId`.
 */

const HOVER_DELAY_MS = 700

export function useActivePreview() {
  // useState ensures SSR hydration safety (singleton per app instance)
  const activeId = useState<string | null>('preview:active-id', () => null)

  // Timer lives in the composable call scope — one per component instance
  let timer: ReturnType<typeof setTimeout> | null = null

  function scheduleActivate(id: string, delayMs = HOVER_DELAY_MS): void {
    _clearTimer()
    timer = setTimeout(() => {
      activeId.value = id
    }, delayMs)
  }

  function deactivate(id: string): void {
    _clearTimer()
    if (activeId.value === id) {
      activeId.value = null
    }
  }

  function isActive(id: string): ComputedRef<boolean> {
    return computed(() => activeId.value === id)
  }

  function _clearTimer(): void {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
  }

  onUnmounted(_clearTimer)

  return {
    activeId: readonly(activeId),
    scheduleActivate,
    deactivate,
    isActive,
  }
}
