/**
 * Разбор CHANGELOG.md без markdown-библиотек.
 *
 * Заголовок релиза (после ##):
 * - ## [ [2.75.1](https://...) ] - 22.01.2026
 * - ## [2.75.1](https://...) - 22.01.2026
 * - ## [Unreleased]
 * - ## [1.0.0] - 2026-01-22
 * - ## 1.0.0 - 22.01.2026
 *
 * Дата: ДД.ММ.ГГГГ или ГГГГ-ММ-ДД
 */

import type { ChangelogRelease, ChangelogSection } from '../../types/changelog'

const SECTION_RE = /^###\s+(.+)$/
const ITEM_RE = /^[-*]\s+(.+)$/

/** Вложенные скобки: [ [версия](url) ] */
const HEADING_NESTED_LINK = /^\[\s*\[([^\]]+)\]\(([^)]+)\)\s*\]\s*(?:-\s*(.+))?$/
/** Обычная markdown-ссылка в заголовке */
const HEADING_SIMPLE_LINK = /^\[([^\]]+)\]\(([^)]+)\)\s*(?:-\s*(.+))?$/
/** [Версия] без ссылки */
const HEADING_BRACKET = /^\[([^\]]+)\]\s*(?:-\s*(.+))?$/

const DAY_MS = 24 * 60 * 60 * 1000

function parseDateTail(tail: string | undefined): {
  display: string | null
  dateTimeAttr: string | null
  /** Конец окна баннера: 3 суток с 00:00 даты релиза (локальное время) */
  bannerUntilMs: number | null
  dayStartMs: number | null
} {
  if (!tail) {
    return {
      display: null,
      dateTimeAttr: null,
      bannerUntilMs: null,
      dayStartMs: null,
    }
  }
  const t = tail.trim()

  const ddmmyyyy = t.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  if (ddmmyyyy) {
    const d = Number(ddmmyyyy[1])
    const m = Number(ddmmyyyy[2])
    const y = Number(ddmmyyyy[3])
    const dayStartMs = new Date(y, m - 1, d, 0, 0, 0, 0).getTime()
    const bannerUntilMs = dayStartMs + 3 * DAY_MS
    const dateTimeAttr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    return { display: t, dateTimeAttr, bannerUntilMs, dayStartMs }
  }

  const iso = t.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (iso) {
    const y = Number(iso[1])
    const m = Number(iso[2])
    const d = Number(iso[3])
    const dayStartMs = new Date(y, m - 1, d, 0, 0, 0, 0).getTime()
    const bannerUntilMs = dayStartMs + 3 * DAY_MS
    return { display: t, dateTimeAttr: t, bannerUntilMs, dayStartMs }
  }

  return {
    display: t,
    dateTimeAttr: null,
    bannerUntilMs: null,
    dayStartMs: null,
  }
}

interface ParsedHeading {
  version: string
  versionUrl: string | null
  date: string | null
  dateTimeAttr: string | null
}

function parseReleaseHeading(body: string): ParsedHeading {
  let version = body
  let versionUrl: string | null = null
  let dateTail: string | undefined

  const nested = body.match(HEADING_NESTED_LINK)
  if (nested) {
    version = nested[1]!.trim()
    versionUrl = nested[2]!.trim()
    dateTail = nested[3]
    const d = parseDateTail(dateTail)
    return {
      version,
      versionUrl,
      date: d.display,
      dateTimeAttr: d.dateTimeAttr,
    }
  }

  const simple = body.match(HEADING_SIMPLE_LINK)
  if (simple) {
    version = simple[1]!.trim()
    versionUrl = simple[2]!.trim()
    dateTail = simple[3]
    const d = parseDateTail(dateTail)
    return {
      version,
      versionUrl,
      date: d.display,
      dateTimeAttr: d.dateTimeAttr,
    }
  }

  const br = body.match(HEADING_BRACKET)
  if (br) {
    version = br[1]!.trim()
    dateTail = br[2]
    const d = parseDateTail(dateTail)
    return {
      version,
      versionUrl: null,
      date: d.display,
      dateTimeAttr: d.dateTimeAttr,
    }
  }

  const parts = body.split(/\s+-\s+/)
  version = parts[0]!.trim()
  if (parts.length >= 2) {
    const maybeDate = parts[parts.length - 1]!.trim()
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(maybeDate) || /^\d{4}-\d{2}-\d{2}$/.test(maybeDate)) {
      version = parts.slice(0, -1).join(' - ').trim()
      dateTail = maybeDate
    }
  }
  const d = parseDateTail(dateTail)
  return {
    version,
    versionUrl: null,
    date: d.display,
    dateTimeAttr: d.dateTimeAttr,
  }
}

export function parseChangelog(md: string): ChangelogRelease[] {
  const lines = md.replace(/\r\n/g, '\n').split('\n')
  const releases: ChangelogRelease[] = []

  let current: ChangelogRelease | null = null
  let section: ChangelogSection | null = null

  function ensureSection(title: string) {
    if (!current) return
    section = { title, items: [] }
    current.sections.push(section)
  }

  for (const raw of lines) {
    const trimmed = raw.trim()
    if (!trimmed) continue

    if (trimmed.startsWith('## ') && !trimmed.startsWith('###')) {
      const body = trimmed.slice(3).trim()
      const parsed = parseReleaseHeading(body)
      current = {
        version: parsed.version,
        versionUrl: parsed.versionUrl,
        date: parsed.date,
        dateTimeAttr: parsed.dateTimeAttr,
        sections: [],
      }
      releases.push(current)
      section = null
      continue
    }

    const sec = trimmed.match(SECTION_RE)
    if (sec && current) {
      ensureSection(sec[1]!.trim())
      continue
    }

    const item = trimmed.match(ITEM_RE)
    if (item && current) {
      if (!section) ensureSection('Изменения')
      if (section) section.items.push(item[1]!.trim())
      continue
    }
  }

  return releases
}

/**
 * Окно баннера: с 00:00 даты релиза до конца третьих суток (не включая 4-й день 00:00).
 * Совпадает с parseDateTail: bannerUntilMs = dayStart + 3 * DAY_MS.
 */
export function pickFreshRelease(
  entries: ChangelogRelease[],
  nowMs: number = Date.now(),
): ChangelogRelease | null {
  for (const e of entries) {
    if (/^unreleased$/i.test(e.version.trim())) continue
    if (e.date == null) continue
    const ddmmyyyy = e.date.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
    const iso = e.date.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    let dayStartMs: number | null = null
    let bannerUntilMs: number | null = null
    if (ddmmyyyy) {
      const d = Number(ddmmyyyy[1])
      const m = Number(ddmmyyyy[2])
      const y = Number(ddmmyyyy[3])
      dayStartMs = new Date(y, m - 1, d, 0, 0, 0, 0).getTime()
      bannerUntilMs = dayStartMs + 3 * DAY_MS
    } else if (iso) {
      const y = Number(iso[1])
      const m = Number(iso[2])
      const d = Number(iso[3])
      dayStartMs = new Date(y, m - 1, d, 0, 0, 0, 0).getTime()
      bannerUntilMs = dayStartMs + 3 * DAY_MS
    }
    if (bannerUntilMs == null || dayStartMs == null) continue
    if (nowMs >= dayStartMs && nowMs < bannerUntilMs) return e
  }
  return null
}
