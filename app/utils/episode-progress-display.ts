/**
 * utils/episode-progress-display.ts
 * Общая логика карточек «продолжить просмотр» (плеер, прогресс, подпись времени).
 */

import type { EpisodeProgress } from '~/types/content'

export function episodeProgressPercent(p: EpisodeProgress): number {
  if (!p.duration) return 0
  return Math.min(100, (p.currentTime / p.duration) * 100)
}

export function episodeWatchLink(p: EpisodeProgress): string {
  const params = new URLSearchParams()
  if (p.season) params.set('season', String(p.season))
  if (p.episode) params.set('episode', String(p.episode))
  if (p.translationId) params.set('translationId', String(p.translationId))
  if (!p.completed && p.currentTime > 5) params.set('t', String(Math.floor(p.currentTime)))
  return `/watch/${encodeURIComponent(p.externalId)}?${params}`
}

export function episodeTimeLabelRu(p: EpisodeProgress): string {
  const diff = Math.floor(
    (Date.now() - new Date(p.lastWatchedAt).getTime()) / 86_400_000,
  )
  if (diff === 0) return 'Сегодня'
  if (diff === 1) return 'Вчера'
  return `${diff} дн. назад`
}
