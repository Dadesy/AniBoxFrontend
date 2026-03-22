/**
 * Базовый sitemap публичных разделов (без динамических /title/* — их можно
 * добавить отдельным фидом с бэкенда при необходимости).
 */
export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const base = String(config.public.siteUrl ?? 'https://example.com').replace(
    /\/$/,
    '',
  )

  const urls = [
    { loc: `${base}/`, changefreq: 'daily' as const, priority: '1.0' },
    { loc: `${base}/catalog`, changefreq: 'daily' as const, priority: '0.9' },
    { loc: `${base}/search`, changefreq: 'weekly' as const, priority: '0.8' },
    { loc: `${base}/schedule`, changefreq: 'daily' as const, priority: '0.85' },
    { loc: `${base}/updates`, changefreq: 'weekly' as const, priority: '0.5' },
  ]

  const lastmod = new Date().toISOString().slice(0, 10)

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(
      (u) =>
        `  <url><loc>${escapeXml(u.loc)}</loc><lastmod>${lastmod}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`,
    ),
    '</urlset>',
  ].join('\n')

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  return body
})

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
