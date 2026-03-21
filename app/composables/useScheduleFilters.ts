import type { ScheduleRelease } from '~/types/metadata'
import { weekdayMonFirstIndex } from '~/utils/schedule-dates'

export type ScheduleStatusFilter = 'all' | 'ongoing' | 'anons' | 'released'

function normalizeStatus(raw: string): string {
  const s = raw.toLowerCase()
  if (s.includes('air') || s === 'ongoing') return 'ongoing'
  if (s.includes('anon') || s === 'anons') return 'anons'
  if (s.includes('release') || s === 'released') return 'released'
  return s
}

export function useScheduleFilters() {
  const status = useState<ScheduleStatusFilter>(
    'schedule-filter-status',
    () => 'all',
  )
  /** '' | '0'..'6' — понедельник = 0 */
  const weekdayMon = useState<string>('schedule-filter-weekday', () => '')
  const genre = useState<string>('schedule-filter-genre', () => '')

  function filtered(
    releases: ScheduleRelease[],
    timeZone: string,
  ): ScheduleRelease[] {
    return releases.filter((r) => {
      if (status.value !== 'all') {
        const n = normalizeStatus(r.status)
        if (n !== status.value) return false
      }
      if (weekdayMon.value !== '') {
        const want = Number(weekdayMon.value)
        const idx = weekdayMonFirstIndex(r.localDateKey, timeZone)
        if (idx !== want) return false
      }
      if (genre.value !== '') {
        const g = r.genres ?? []
        if (!g.some((x) => x.toLowerCase() === genre.value.toLowerCase()))
          return false
      }
      return true
    })
  }

  function buildCountsByDate(releases: ScheduleRelease[]): Record<string, number> {
    const c: Record<string, number> = {}
    for (const r of releases) {
      c[r.localDateKey] = (c[r.localDateKey] ?? 0) + 1
    }
    return c
  }

  const weekdayOptions = [
    { value: 0, label: 'Пн' },
    { value: 1, label: 'Вт' },
    { value: 2, label: 'Ср' },
    { value: 3, label: 'Чт' },
    { value: 4, label: 'Пт' },
    { value: 5, label: 'Сб' },
    { value: 6, label: 'Вс' },
  ] as const

  return {
    status,
    weekdayMon,
    genre,
    filtered,
    buildCountsByDate,
    weekdayOptions,
    resetFilters() {
      status.value = 'all'
      weekdayMon.value = ''
      genre.value = ''
    },
  }
}
