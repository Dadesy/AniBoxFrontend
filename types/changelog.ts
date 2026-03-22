export interface ChangelogSection {
  title: string
  items: string[]
}

export interface ChangelogRelease {
  /** Текст версии (без markdown) */
  version: string
  /** Ссылка на релиз / тег, если указана в заголовке */
  versionUrl: string | null
  /** Дата как в файле (например 22.01.2026 или 2026-01-22) */
  date: string | null
  /** Атрибут datetime для <time> (ISO YYYY-MM-DD) */
  dateTimeAttr: string | null
  sections: ChangelogSection[]
}

/** Для баннера «свежий релиз» (ответ API) */
export interface ChangelogFreshRelease {
  version: string
  versionUrl: string | null
  date: string | null
}

export interface ChangelogApiResponse {
  entries: ChangelogRelease[]
  /**
   * Блок «Запланировано» из конца CHANGELOG.md — не версия и не участвует в баннере релиза.
   * Секции и пункты как у релизов (### и -).
   */
  planned: ChangelogSection[] | null
  /** Первый в списке релиз с датой: показывать баннер 3 суток с 00:00 этой даты; не Unreleased */
  freshRelease: ChangelogFreshRelease | null
}
