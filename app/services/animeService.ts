import type {
  AnimeDetail,
  AnimeEpisodesResponse,
  Season,
  Translation,
} from '~/types/content'

const fetchOptions = {}

export async function getAnimeById(externalId: string): Promise<AnimeDetail> {
  const apiUrl = useApiUrl()
  return $fetch<AnimeDetail>(`${apiUrl}/anime/${encodeURIComponent(externalId)}`, fetchOptions)
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
