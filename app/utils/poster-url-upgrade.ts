/**
 * Синхронно с backend/src/common/poster-url-upgrade.ts:
 * preview/x96 → original для Shikimori CDN.
 */
export function upgradeAnimePosterUrl(raw: string | number | null | undefined): string {
  if (raw === null || raw === undefined) {
    return ''
  }
  let u = String(raw).trim()
  if (!u) return ''

  if (u.startsWith('//')) u = `https:${u}`

  const isShikimoriHost =
    /shikimori\.(one|me)(:\d+)?\//i.test(u) ||
    /nyaa\.shikimori\.(one|me)/i.test(u) ||
    /desu-useruploads\.s3[.-]/i.test(u)

  if (isShikimoriHost || (u.startsWith('/') && /\/system\/animes\//i.test(u))) {
    const abs = u.startsWith('/') ? `https://shikimori.one${u}` : u
    u = abs
      .replace(/\/system\/animes\/preview\//gi, '/system/animes/original/')
      .replace(/\/system\/animes\/x\d+\//gi, '/system/animes/original/')
  }

  return u
}
