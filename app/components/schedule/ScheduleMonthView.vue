<script setup lang="ts">
import { monthDateKeys, weekdayMonFirstIndex } from '~/utils/schedule-dates'

const props = defineProps<{
  year: number
  month: number
  timeZone: string
  countsByDate: Record<string, number>
  selectedDateKey: string
  todayLocalDateKey: string
}>()

const emit = defineEmits<{ select: [dateKey: string] }>()

const WEEK_HEAD = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const

const firstKey = computed(
  () =>
    `${props.year}-${String(props.month).padStart(2, '0')}-01`,
)

const leadBlank = computed(() => weekdayMonFirstIndex(firstKey.value, props.timeZone))

const gridCells = computed(() => {
  const keys = monthDateKeys(props.year, props.month)
  const cells: Array<{ dateKey: string | null }> = []
  for (let i = 0; i < leadBlank.value; i++) cells.push({ dateKey: null })
  for (const k of keys) cells.push({ dateKey: k })
  while (cells.length % 7 !== 0) cells.push({ dateKey: null })
  while (cells.length < 42) cells.push({ dateKey: null })
  return cells
})

const monthTitle = computed(() => {
  const d = new Date(Date.UTC(props.year, props.month - 1, 1))
  const raw = new Intl.DateTimeFormat('ru-RU', {
    month: 'long',
    year: 'numeric',
  }).format(d)
  return raw.charAt(0).toUpperCase() + raw.slice(1)
})

function countFor(key: string | null): number {
  if (!key) return 0
  return props.countsByDate[key] ?? 0
}
</script>

<template>
  <div class="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 sm:p-4">
    <p class="mb-3 text-center text-sm font-medium capitalize text-zinc-300">
      {{ monthTitle }}
    </p>

    <div
      role="grid"
      :aria-label="`Календарь ${monthTitle}`"
      class="grid grid-cols-7 gap-1 text-center text-[11px] text-zinc-500 sm:text-xs"
    >
      <div
        v-for="h in WEEK_HEAD"
        :key="h"
        role="columnheader"
        class="py-1 font-semibold text-zinc-600"
      >
        {{ h }}
      </div>

      <button
        v-for="(cell, idx) in gridCells"
        :key="idx"
        type="button"
        role="gridcell"
        :disabled="!cell.dateKey"
        :tabindex="cell.dateKey ? 0 : -1"
        class="relative flex min-h-[2.35rem] flex-col items-center justify-center rounded-lg text-xs font-medium transition-colors motion-safe:duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 disabled:cursor-default disabled:opacity-0 sm:min-h-[2.75rem]"
        :class="[
          cell.dateKey
            ? 'text-zinc-200 hover:bg-white/[0.06]'
            : '',
          cell.dateKey === selectedDateKey
            ? 'bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-500/40'
            : '',
          cell.dateKey === todayLocalDateKey && cell.dateKey !== selectedDateKey
            ? 'ring-1 ring-white/15'
            : '',
        ]"
        :aria-selected="cell.dateKey === selectedDateKey"
        :aria-current="cell.dateKey === todayLocalDateKey ? 'date' : undefined"
        @click="cell.dateKey && emit('select', cell.dateKey)"
      >
        <template v-if="cell.dateKey">
          <span>{{ Number(cell.dateKey.slice(8, 10)) }}</span>
          <span
            v-if="countFor(cell.dateKey) > 0"
            class="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-0.5"
            aria-hidden="true"
          >
            <span
              v-for="n in Math.min(countFor(cell.dateKey), 3)"
              :key="n"
              class="h-1 w-1 rounded-full bg-emerald-400/80"
            />
          </span>
        </template>
      </button>
    </div>
  </div>
</template>
