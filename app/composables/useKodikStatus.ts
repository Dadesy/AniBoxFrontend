import type { ContentStatusResponse } from '~/types/content'

const POLL_INTERVAL_MS = 30_000
const STATUS_FETCH_TIMEOUT_MS = 4_000

/** Shared singleton state across the app */
const sourceStatus = ref<ContentStatusResponse>({
  available: true,
  degraded: false,
  anilibriaAvailable: true,
  kodikAvailable: true,
  shikimoriAvailable: true,
})
let pollTimer: ReturnType<typeof setInterval> | null = null

/** Первый запрос к API — один на сессию; ждёт лоадер и все вызовы useKodikStatus */
let firstFetchPromise: Promise<void> | null = null

async function fetchStatus(): Promise<void> {
  try {
    const apiUrl = useApiUrl()
    const data = await $fetch<ContentStatusResponse>(`${apiUrl}/content/status`, {
      timeout: STATUS_FETCH_TIMEOUT_MS,
    })
    sourceStatus.value = data
  } catch {
    // Ошибка сети / бэка — не считаем плеер принудительно недоступным
  }
}

function startPolling(): void {
  if (pollTimer !== null) return
  pollTimer = setInterval(() => {
    void fetchStatus()
  }, POLL_INTERVAL_MS)
}

/**
 * Гарантирует один первый запрос `/content/status` и запуск поллинга после него.
 * Все вызовы получают тот же Promise.
 */
export function ensureKodikStatusFetchedOnce(): Promise<void> {
  if (import.meta.server) return Promise.resolve()
  if (!firstFetchPromise) {
    firstFetchPromise = fetchStatus().finally(() => {
      startPolling()
    })
  }
  return firstFetchPromise
}

/**
 * Перед скрытием boot-лоадера: шрифты + этот await — чтобы модалка/баннер не вспыхивали «поверх».
 */
export async function whenBootBackendReady(): Promise<void> {
  await ensureKodikStatusFetchedOnce()
}

export function useKodikStatus() {
  if (import.meta.client) {
    void ensureKodikStatusFetchedOnce()
  }

  const isKodikDown = computed(() => !sourceStatus.value.kodikAvailable)
  const isAnilibriaDown = computed(() => !sourceStatus.value.anilibriaAvailable)
  const isShikimoriDown = computed(() => !sourceStatus.value.shikimoriAvailable)
  const hasMaintenance = computed(() => sourceStatus.value.degraded)

  return {
    sourceStatus: readonly(sourceStatus),
    hasMaintenance,
    isKodikDown,
    isAnilibriaDown,
    isShikimoriDown,
  }
}
