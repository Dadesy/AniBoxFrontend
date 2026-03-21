/**
 * SPA: дополнительные hit при клиентской навигации.
 * Загрузка tag.js и ym(..., 'init', ...) — в production в <head> (nuxt.config → metrika-snippet.ts).
 */
declare global {
  interface Window {
    ym?: (...args: unknown[]) => void
  }
}

export default defineNuxtPlugin({
  name: 'yandex-metrika-spa',
  enforce: 'pre',
  setup() {
    const id = useRuntimeConfig().public.yandexMetrikaId
    if (!id) return

    const counterId = Number(id)
    if (!Number.isFinite(counterId) || counterId <= 0) return

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
  },
})
