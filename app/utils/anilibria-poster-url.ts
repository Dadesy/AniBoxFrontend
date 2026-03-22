const ANILIBRIA_ORIGIN = 'https://anilibria.top'

/** AniLibria API returns site-relative poster paths; browsers would load them from your origin without this. */
export function absolutizeAnilibriaApiPosterUrl(
  raw: string | null | undefined,
): string {
  const u = (raw ?? '').trim()
  if (!u) return ''
  if (/^https?:\/\//i.test(u)) return u
  if (u.startsWith('//')) return `https:${u}`
  if (u.startsWith('/')) return `${ANILIBRIA_ORIGIN}${u}`
  return u
}

/** Same priority as backend: best-quality AniLibria poster field first. */
export function resolveBestAnilibriaPosterUrl(poster: {
  src?: string | null
  preview?: string | null
  thumbnail?: string | null
  optimized?: { src?: string | null; thumbnail?: string | null } | null
} | null | undefined): string {
  if (!poster) return ''
  const candidates = [
    poster.optimized?.src,
    poster.src,
    poster.preview,
    poster.optimized?.thumbnail,
    poster.thumbnail,
  ]
  for (const c of candidates) {
    const t = (c ?? '').trim()
    if (t) return absolutizeAnilibriaApiPosterUrl(t)
  }
  return ''
}
