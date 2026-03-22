/**
 * utils/streaming-card-model.ts
 *
 * Единая модель карточки для Netflix-style hover preview (карусель + каталог).
 */

import type { CatalogCard } from '~/types/content'
import type { NormalizedAnimeCard } from '~/types/metadata'

export interface StreamingCardModel {
  /** Уникальный ключ для координатора видео / Vue key */
  key: string
  /** ID в источнике метаданных (Shikimori / AniLibria / YaniTv) */
  idFromSource: string
  source: NormalizedAnimeCard['source']
  title: string
  titleRu?: string
  posterUrl?: string
  backdropUrl?: string
  /** Реальный URL превью-ролика с CDN; без фейков — если нет, показываем только постер */
  previewVideoUrl?: string
  score?: number
  year?: number
  kind?: string
  type?: string
  status?: string
  genres?: string[]
  episodes?: number
  episodesAired?: number
  externalId?: string
}

export function fromNormalizedAnimeCard(card: NormalizedAnimeCard): StreamingCardModel {
  return {
    key: `${card.source}-${card.id}`,
    idFromSource: card.id,
    source: card.source,
    title: card.title,
    titleRu: card.titleRu,
    posterUrl: card.posterUrl,
    backdropUrl: card.backdropUrl,
    previewVideoUrl: card.previewVideoUrl,
    score: card.score,
    year: card.year,
    kind: card.kind,
    status: card.status,
    genres: card.genres,
    episodes: card.episodes,
    episodesAired: card.episodesAired,
    externalId: card.externalId,
  }
}

export function fromCatalogCard(card: CatalogCard): StreamingCardModel {
  const idFromSource = String(card.shikimoriId ?? card.id ?? '').trim()
  const ext = card as CatalogCard & { source?: NormalizedAnimeCard['source'] }
  return {
    key: card.externalId || (idFromSource ? `sm-${idFromSource}` : `cat-${hashTitle(card.title)}`),
    idFromSource,
    source: ext.source ?? 'shikimori',
    title: card.title,
    titleRu: card.titleRu,
    posterUrl: card.posterUrl,
    backdropUrl: ext.backdropUrl,
    previewVideoUrl: ext.previewVideoUrl,
    score: card.score,
    year: card.year,
    kind: card.kind,
    type: card.type,
    status: card.status,
    genres: ext.genres,
    episodes: ext.episodes,
    episodesAired: ext.episodesAired,
    externalId: card.externalId,
  }
}

function hashTitle(title: string): string {
  let h = 0
  for (let i = 0; i < title.length; i++) h = (Math.imul(31, h) + title.charCodeAt(i)) | 0
  return String(Math.abs(h))
}

/** Минимальный NormalizedAnimeCard для navigateToCard / resolve */
export function streamingModelToNormalized(model: StreamingCardModel): NormalizedAnimeCard {
  return {
    id: model.idFromSource || model.key,
    source: model.source,
    title: model.title,
    titleRu: model.titleRu,
    posterUrl: model.posterUrl || '',
    status: model.status || 'released',
    score: model.score,
    year: model.year,
    kind: model.kind,
    episodes: model.episodes,
    episodesAired: model.episodesAired,
    genres: model.genres,
    externalId: model.externalId,
    previewVideoUrl: model.previewVideoUrl,
    backdropUrl: model.backdropUrl,
  }
}
