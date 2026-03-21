const POLL_INTERVAL_MS = 30_000

/** Shared singleton state across the app */
const isKodikDown = ref(false)
let pollTimer: ReturnType<typeof setInterval> | null = null
let initialized = false

async function fetchStatus(): Promise<void> {
  try {
    const apiUrl = useApiUrl()
    const data = await $fetch<{ available: boolean }>(`${apiUrl}/content/status`)
    isKodikDown.value = !data.available
  } catch {
    // If the status endpoint itself fails, don't assume Kodik is down
  }
}

export function useKodikStatus() {
  if (import.meta.client && !initialized) {
    initialized = true
    void fetchStatus()

    pollTimer = setInterval(() => {
      void fetchStatus()
    }, POLL_INTERVAL_MS)
  }

  return { isKodikDown: readonly(isKodikDown) }
}
