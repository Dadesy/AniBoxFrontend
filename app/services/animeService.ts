import type {
  AnimeCardDto,
  AnimeCollectionDto,
  AnimeDetail,
  AnimeEpisodesResponse,
  AnimeListResponse,
  AnimeWatchResponse,
  Season,
  Translation,
} from '~/types/content'

const fetchOptions = {}

export async function getAnimeById(externalId: string): Promise<AnimeDetail> {
  const apiUrl = useApiUrl()
  return $fetch<AnimeDetail>(`${apiUrl}/anime/${encodeURIComponent(externalId)}`, fetchOptions)
}

export async function getAnimeCatalog(params: {
  page?: number
  limit?: number
  sort?: 'popular' | 'top_rated' | 'new_releases' | 'ongoing' | 'most_viewed'
  status?: string
  kind?: string
} = {}): Promise<AnimeListResponse> {
  const apiUrl = useApiUrl()
  return $fetch<AnimeListResponse>(`${apiUrl}/anime`, {
    ...fetchOptions,
    query: params,
  })
}

export async function searchAnime(query: string, limit = 20): Promise<AnimeCardDto[]> {
  const apiUrl = useApiUrl()
  return $fetch<AnimeCardDto[]>(`${apiUrl}/anime/search`, {
    ...fetchOptions,
    query: { q: query, limit },
  })
}

export async function getAnimeCollections(): Promise<AnimeCollectionDto[]> {
  const apiUrl = useApiUrl()
  return $fetch<AnimeCollectionDto[]>(`${apiUrl}/anime/collections`, fetchOptions)
}

export async function getAnimeWatch(
  identifier: string,
  params: {
    player?: 'kodik' | 'anilibria'
    season?: number
    episode?: number
    translationId?: number
  } = {},
): Promise<AnimeWatchResponse> {
  const apiUrl = useApiUrl()
  return $fetch<AnimeWatchResponse>(`${apiUrl}/anime/${encodeURIComponent(identifier)}/watch`, {
    ...fetchOptions,
    query: params,
  })
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
    fetchOptions,
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
    fetchOptions,
  )
}

export async function getTranslations(externalId: string): Promise<Translation[]> {
  const apiUrl = useApiUrl()
  return $fetch<Translation[]>(
    `${apiUrl}/anime/${encodeURIComponent(externalId)}/translations`,
    fetchOptions,
  )
}

export function findSeason(seasons: Season[], seasonNumber?: number): Season | undefined {
  if (!seasons.length) return undefined
  if (seasonNumber === undefined) return seasons[0]
  return seasons.find((season) => season.number === seasonNumber) ?? seasons[0]
}
