/**
 * composables/useActiveTab.ts
 *
 * Синхронизация вкладки с query-параметром (deep link, обмен ссылкой).
 */

import { computed } from 'vue'
import {
  LIBRARY_SECTION_TAB_KEYS,
  type LibrarySectionTabKey,
} from '~/types/library'

export function useActiveTabQuery<T extends string>(
  queryKey: string,
  valid: readonly T[],
  defaultValue: T,
) {
  const route = useRoute()
  const router = useRouter()

  const allowed = new Set<string>(valid as readonly string[])

  return computed({
    get(): T {
      const raw = route.query[queryKey]
      const v = Array.isArray(raw) ? raw[0] : raw
      if (typeof v === 'string' && allowed.has(v)) return v as T
      return defaultValue
    },
    set(next: T) {
      router.replace({
        path: route.path,
        query: { ...route.query, [queryKey]: next },
      })
    },
  })
}

export function useLibraryActiveTab() {
  const activeTab = useActiveTabQuery<LibrarySectionTabKey>(
    'tab',
    LIBRARY_SECTION_TAB_KEYS,
    'watching',
  )
  return { activeTab }
}
