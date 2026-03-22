import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { ChangelogApiResponse } from '../../types/changelog'
import { parseChangelog, pickFreshRelease } from '../utils/parseChangelog'

/**
 * Читаем CHANGELOG.md с диска в рантайме — так надёжно в Docker/Nitro
 * (импорт *.md?raw в server-сборке даёт ENOENT вида .../CHANGELOG.md?raw).
 *
 * Docker: в runner кладите файл как /app/CHANGELOG.md (см. Dockerfile).
 */
async function readChangelogMarkdown(): Promise<string> {
  const cwd = process.cwd()
  const candidates = [
    join(cwd, 'CHANGELOG.md'),
    // если процесс запущен из подпапки
    join(cwd, '..', 'CHANGELOG.md'),
  ]

  for (const p of candidates) {
    try {
      return await readFile(p, 'utf-8')
    } catch {
      /* try next */
    }
  }
  return ''
}

export default defineEventHandler(async (): Promise<ChangelogApiResponse> => {
  try {
    const md = await readChangelogMarkdown()
    if (!md) {
      return { entries: [], planned: null, freshRelease: null }
    }
    const { entries, planned } = parseChangelog(md)
    const fresh = pickFreshRelease(entries)
    const freshRelease = fresh
      ? {
          version: fresh.version,
          versionUrl: fresh.versionUrl,
          date: fresh.date,
        }
      : null
    return { entries, planned, freshRelease }
  } catch {
    return { entries: [], planned: null, freshRelease: null }
  }
})
