/**
 * Динамический robots.txt: Sitemap указывает на реальный домен из NUXT_PUBLIC_SITE_URL.
 */
export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const base = String(config.public.siteUrl ?? 'https://example.com').replace(
    /\/$/,
    '',
  )

  const lines = [
    'User-Agent: *',
    'Allow: /',
    'Disallow: /watch/',
    'Disallow: /profile',
    'Disallow: /authentication',
    'Disallow: /admin/',
    'Disallow: /api/',
    '',
    'Allow: /catalog',
    'Allow: /title/',
    'Allow: /search',
    'Allow: /schedule',
    '',
    `Sitemap: ${base}/sitemap.xml`,
    '',
  ]

  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  return lines.join('\n')
})
