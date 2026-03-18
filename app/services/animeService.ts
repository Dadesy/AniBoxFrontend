import type {
  AnimeDetail,
  AnimeEpisodesResponse,
  Season,
  Translation,
} from '~/types/content'

const noStoreOptions = {
  cache: 'no-store' as const,
  headers: {
    'cache-control': 'no-cache',
    pragma: 'no-cache',
  },
}

export async function getAnimeById(externalId: string): Promise<AnimeDetail> {
  const apiUrl = useApiUrl()
  return $fetch<AnimeDetail>(`${apiUrl}/anime/${encodeURIComponent(externalId)}`, noStoreOptions)
}

export async function getSeasons(
  externalId: string,
  translationId?: number,
): Promise<AnimeEpisodesResponse> {
  const apiUrl = useApiUrl()
  const params = new URLSearchParams()
  if (translationId !== undefined) params.set('translationId', String(translationId))

  return $fetch<AnimeEpisodesResponse>(
    `${apiUrl}/anime/${encodeURIComponent(externalId)}/seasons${params.size ? `?${params}` : ''}`,
    noStoreOptions,
  )
}

export async function getEpisodes(
  externalId: string,
  translationId?: number,
): Promise<AnimeEpisodesResponse> {
  const apiUrl = useApiUrl()
  const params = new URLSearchParams()
  if (translationId !== undefined) params.set('translationId', String(translationId))

  return $fetch<AnimeEpisodesResponse>(
    `${apiUrl}/anime/${encodeURIComponent(externalId)}/episodes${params.size ? `?${params}` : ''}`,
    noStoreOptions,
  )
}

export async function getTranslations(externalId: string): Promise<Translation[]> {
  const apiUrl = useApiUrl()
  return $fetch<Translation[]>(
    `${apiUrl}/anime/${encodeURIComponent(externalId)}/translations`,
    noStoreOptions,
  )
}

export function findSeason(seasons: Season[], seasonNumber?: number): Season | undefined {
  if (!seasons.length) return undefined
  if (seasonNumber === undefined) return seasons[0]
  return seasons.find((season) => season.number === seasonNumber) ?? seasons[0]
}
