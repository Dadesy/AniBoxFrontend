function normalizeApiUrl(rawValue: string): string {
  const trimmed = rawValue.trim().replace(/\/+$/, '')
  if (!trimmed) return 'http://localhost:8080/api'

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : /^\/(?!\/)/.test(trimmed)
      ? trimmed
      : `https://${trimmed}`

  if (withProtocol.startsWith('/')) {
    return withProtocol.endsWith('/api') ? withProtocol : `${withProtocol}/api`
  }

  try {
    const url = new URL(withProtocol)
    if (url.pathname === '/' || url.pathname === '') {
      url.pathname = '/api'
    }
    return url.toString().replace(/\/+$/, '')
  } catch {
    return trimmed
  }
}

/** localhost / 127.0.0.1 / ::1 — один и тот же хост, но для браузера это разные origin */
function isLoopbackHost(hostname: string): boolean {
  const h = hostname.toLowerCase()
  return (
    h === 'localhost' ||
    h === '127.0.0.1' ||
    h === '[::1]' ||
    h === '::1'
  )
}

/**
 * В браузере: если в .env указан http://localhost:3000/api, а страница открыта как
 * http://127.0.0.1:3000 — запрос уйдёт на другой origin и Safari/WebKit заблокирует
 * его («Fetch API cannot load … due to access control checks»).
 * В этом случае используем только путь `/api` — тот же origin, что и у страницы.
 */
function clientCoerceToRelativeIfDevHostMismatch(normalized: string): string {
  if (!import.meta.client || typeof window === 'undefined') return normalized
  if (!normalized.startsWith('http')) return normalized

  try {
    const u = new URL(normalized)
    const loc = window.location
    const apiPath = u.pathname.replace(/\/+$/, '') || '/api'

    if (u.origin === loc.origin) return apiPath

    const defP = (protocol: string) => (protocol === 'https:' ? '443' : '80')
    const apiPort = u.port || defP(u.protocol)
    const locPort = loc.port || defP(loc.protocol)

    if (
      u.protocol === loc.protocol &&
      apiPort === locPort &&
      isLoopbackHost(u.hostname) &&
      isLoopbackHost(loc.hostname)
    ) {
      return apiPath.startsWith('/') ? apiPath : `/${apiPath}`
    }
  } catch {
    /* keep normalized */
  }

  return normalized
}

export const useApiUrl = (): string => {
  const config = useRuntimeConfig()

  const rawValue = import.meta.server
    ? (config.apiUrlInternal as string)
    : (config.public.apiUrl as string)

  const base = normalizeApiUrl(rawValue)
  if (import.meta.server) return base
  return clientCoerceToRelativeIfDevHostMismatch(base)
}
