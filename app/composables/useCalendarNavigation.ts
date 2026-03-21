import type { Ref } from 'vue'
import {
  addCalendarDays,
  parseYearMonthFromDateKey,
  shiftMonth,
  startOfIsoWeekMonday,
} from '~/utils/schedule-dates'

export type ScheduleViewMode = 'day' | 'week' | 'month'

export function useCalendarNavigation(
  timeZone: Ref<string>,
  todayLocalDateKey: Ref<string>,
) {
  const viewMode = useCookie<ScheduleViewMode>('abx-schedule-view', {
    default: () => 'week',
    maxAge: 60 * 60 * 24 * 365,
  })

  const selectedDateKey = useState<string | null>(
    'schedule-selected-dk',
    () => null,
  )

  const monthCursor = useState<{ year: number; month: number } | null>(
    'schedule-month-cursor',
    () => null,
  )

  watch(
    todayLocalDateKey,
    (t) => {
      if (t && !selectedDateKey.value) selectedDateKey.value = t
      if (t && !monthCursor.value) monthCursor.value = parseYearMonthFromDateKey(t)
    },
    { immediate: true },
  )

  const effectiveSelected = computed(
    () => selectedDateKey.value ?? todayLocalDateKey.value,
  )

  const weekMondayKey = computed(() =>
    startOfIsoWeekMonday(effectiveSelected.value, timeZone.value),
  )

  function goToday() {
    selectedDateKey.value = todayLocalDateKey.value
    monthCursor.value = parseYearMonthFromDateKey(todayLocalDateKey.value)
  }

  function goPrev() {
    const tz = timeZone.value
    const cur = effectiveSelected.value
    if (viewMode.value === 'day') {
      selectedDateKey.value = addCalendarDays(cur, -1, tz)
    } else if (viewMode.value === 'week') {
      selectedDateKey.value = addCalendarDays(cur, -7, tz)
    } else {
      const mc = monthCursor.value ?? parseYearMonthFromDateKey(cur)
      monthCursor.value = shiftMonth(mc.year, mc.month, -1)
    }
  }

  function goNext() {
    const tz = timeZone.value
    const cur = effectiveSelected.value
    if (viewMode.value === 'day') {
      selectedDateKey.value = addCalendarDays(cur, 1, tz)
    } else if (viewMode.value === 'week') {
      selectedDateKey.value = addCalendarDays(cur, 7, tz)
    } else {
      const mc = monthCursor.value ?? parseYearMonthFromDateKey(cur)
      monthCursor.value = shiftMonth(mc.year, mc.month, 1)
    }
  }

  function selectDateKey(key: string) {
    selectedDateKey.value = key
    monthCursor.value = parseYearMonthFromDateKey(key)
  }

  return {
    viewMode,
    selectedDateKey,
    effectiveSelected,
    weekMondayKey,
    monthCursor,
    goToday,
    goPrev,
    goNext,
    selectDateKey,
  }
}
