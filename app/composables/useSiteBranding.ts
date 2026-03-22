/**
 * Единое имя сайта из runtime config (NUXT_PUBLIC_SITE_NAME).
 * Меняйте только .env — не дублируйте строку в компонентах.
 */
export function useSiteBranding() {
  const config = useRuntimeConfig()

  const siteName = computed(() => String(config.public.siteName ?? 'AnimeScope'))

  /** Суффикс для document title: «Страница — Имя» */
  function pageTitle(part: string): string {
    return `${part} — ${siteName.value}`
  }

  return { siteName, pageTitle }
}
