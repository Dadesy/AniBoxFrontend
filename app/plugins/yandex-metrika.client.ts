/**
 * Yandex.Metrika — загрузка tag.js и init (клиент только).
 * Счётчик: https://metrika.yandex.ru/
 */
declare global {
  interface Window {
    ym?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

export default defineNuxtPlugin(() => {
  const id = useRuntimeConfig().public.yandexMetrikaId
  if (!id) return

  const counterId = Number(id)
  if (!Number.isFinite(counterId) || counterId <= 0) return

  const tagUrl = `https://mc.yandex.ru/metrika/tag.js?id=${counterId}`

  // Официальный сниппет: очередь вызовов до загрузки tag.js
  ;(function (
    m: Window & { ym?: (...args: unknown[]) => void },
    e: Document,
    t: string,
    r: string,
    i: string,
  ) {
    m[i] =
      m[i] ||
      function (...args: unknown[]) {
        ;((m[i] as { a?: unknown[] }).a = (m[i] as { a?: unknown[] }).a || []).push(args)
      }
    ;(m[i] as { l?: number }).l = 1 * Date.now()
    for (let j = 0; j < e.scripts.length; j++) {
      if (e.scripts[j]!.src === r) return
    }
    const k = e.createElement(t)
    const a = e.getElementsByTagName(t)[0]
    k.async = true
    k.src = r
    a?.parentNode?.insertBefore(k, a)
  })(window, document, 'script', tagUrl, 'ym')

  window.dataLayer = window.dataLayer ?? []

  window.ym?.(counterId, 'init', {
    ssr: true,
    webvisor: true,
    clickmap: true,
    ecommerce: 'dataLayer',
    referrer: document.referrer,
    url: location.href,
    accurateTrackBounce: true,
    trackLinks: true,
  })

  // SPA: hit при клиентских переходах (первый просмотр уже в init)
  const router = useRouter()
  let isFirstNavigation = true
  router.afterEach((to) => {
    if (isFirstNavigation) {
      isFirstNavigation = false
      return
    }
    if (typeof window.ym === 'function') {
      window.ym(counterId, 'hit', to.fullPath)
    }
  })
})
