/**
 * Работа с календарными датами YYYY-MM-DD в заданной IANA-таймзоне (как на бэкенде).
 * Без внешних зависимостей; для DST возможны пограничные кейсы — для расписания приемлемо.
 */

export function localDateKeyFromUtc(ms: number, tz: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(ms))
}

/** UTC-момент, попадающий в указанную гражданскую дату в tz (поиск по часам вокруг полудня UTC) */
export function utcMillisForCivilDate(dateKey: string, tz: string): number {
  const [y, m, d] = dateKey.split('-').map(Number)
  const anchor = Date.UTC(y, m - 1, d, 12, 0, 0)
  for (let delta = -48; delta <= 48; delta++) {
    const ms = anchor + delta * 3600 * 1000
    if (localDateKeyFromUtc(ms, tz) === dateKey) return ms
  }
  return anchor
}

export function calendarDaysInMonth(year: number, month1to12: number): number {
  return new Date(Date.UTC(year, month1to12, 0)).getUTCDate()
}

export function monthDateKeys(year: number, month1to12: number): string[] {
  const n = calendarDaysInMonth(year, month1to12)
  const pad = (x: number) => String(x).padStart(2, '0')
  const keys: string[] = []
  for (let day = 1; day <= n; day++) {
    keys.push(`${year}-${pad(month1to12)}-${pad(day)}`)
  }
  return keys
}

/** Понедельник = 0 … воскресенье = 6 */
export function weekdayMonFirstIndex(dateKey: string, tz: string): number {
  const ms = utcMillisForCivilDate(dateKey, tz)
  const wd = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'short',
  }).format(new Date(ms))
  const sun0 = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(wd)
  if (sun0 < 0) return 0
  return (sun0 + 6) % 7
}

export function addCalendarDays(dateKey: string, delta: number, tz: string): string {
  const ms = utcMillisForCivilDate(dateKey, tz) + delta * 24 * 60 * 60 * 1000
  return localDateKeyFromUtc(ms, tz)
}

export function startOfIsoWeekMonday(dateKey: string, tz: string): string {
  const idx = weekdayMonFirstIndex(dateKey, tz)
  return addCalendarDays(dateKey, -idx, tz)
}

export function weekDateKeysFromMonday(mondayKey: string, tz: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addCalendarDays(mondayKey, i, tz))
}

export function parseYearMonthFromDateKey(dateKey: string): {
  year: number
  month: number
} {
  const [y, m] = dateKey.split('-').map(Number)
  return { year: y, month: m }
}

export function shiftMonth(year: number, month: number, delta: number): {
  year: number
  month: number
} {
  const d = new Date(Date.UTC(year, month - 1 + delta, 1))
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 }
}

export function formatWeekdayShortRu(dateKey: string, tz: string): string {
  const ms = utcMillisForCivilDate(dateKey, tz)
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: tz,
    weekday: 'short',
  }).format(new Date(ms))
}

export function formatDayMonthRu(dateKey: string, tz: string): string {
  const ms = utcMillisForCivilDate(dateKey, tz)
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: tz,
    day: 'numeric',
    month: 'long',
  }).format(new Date(ms))
}
