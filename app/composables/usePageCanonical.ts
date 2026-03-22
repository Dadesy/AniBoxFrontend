/**
 * Канонический URL страницы без query/hash — меньше дублей в поиске
 * (фильтры каталога и строка поиска не попадают в canonical).
 */
export function usePageCanonical(path?: MaybeRef<string>) {
  const config = useRuntimeConfig()
  const route = useRoute()

  const canonicalUrl = computed(() => {
    const base = String(config.public.siteUrl ?? '')
      .replace(/\/$/, '')
      .trim()
    const origin = base || 'https://example.com'
    const raw = path != null ? unref(path) : route.path
    const p = raw.startsWith('/') ? raw : `/${raw}`
    if (p === '/') return `${origin}/`
    return `${origin}${p}`
  })

  useHead({
    link: () => [{ rel: 'canonical', href: canonicalUrl.value }],
  })
}
