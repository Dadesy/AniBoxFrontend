<script setup lang="ts">
import type { ScheduleRelease } from '~/types/metadata'
import { navigateToCard } from '~/composables/useMetadata'
import { useSwipe } from '~/composables/useSwipe'
import {
  formatDayMonthRu,
  formatWeekdayShortRu,
  weekDateKeysFromMonday,
} from '~/utils/schedule-dates'

const props = defineProps<{
  mondayDateKey: string
  timeZone: string
  selectedDateKey: string
  todayLocalDateKey: string
  releasesByDate: Map<string, ScheduleRelease[]>
}>()

const emit = defineEmits<{
  select: [dateKey: string]
  swipePrev: []
  swipeNext: []
}>()

const weekKeys = computed(() =>
  weekDateKeysFromMonday(props.mondayDateKey, props.timeZone),
)

const swipeRoot = ref<HTMLElement | null>(null)

useSwipe(
  swipeRoot,
  (dir) => {
    if (dir === 'left') emit('swipeNext')
    else if (dir === 'right') emit('swipePrev')
  },
  { axis: 'horizontal', threshold: 56, ratio: 1.15 },
)

function listFor(key: string): ScheduleRelease[] {
  return props.releasesByDate.get(key) ?? []
}
</script>

<template>
  <div ref="swipeRoot" class="touch-pan-y">
    <div
      class="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7"
      role="list"
    >
      <div
        v-for="key in weekKeys"
        :key="key"
        role="listitem"
        class="flex min-h-[10rem] flex-col rounded-xl border border-white/[0.06] bg-white/[0.02] p-2 sm:min-h-[12rem]"
        :class="
          key === selectedDateKey ? 'ring-1 ring-emerald-500/35' : ''
        "
      >
        <button
          type="button"
          class="mb-2 w-full rounded-lg px-1 py-1.5 text-left transition-colors hover:bg-white/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          :aria-pressed="key === selectedDateKey"
          :aria-current="key === todayLocalDateKey ? 'date' : undefined"
          @click="emit('select', key)"
        >
          <div class="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            {{ formatWeekdayShortRu(key, timeZone) }}
          </div>
          <div class="text-sm font-medium text-zinc-200">
            {{ formatDayMonthRu(key, timeZone) }}
          </div>
          <div
            v-if="listFor(key).length"
            class="mt-0.5 text-[10px] text-zinc-600"
          >
            {{ listFor(key).length }}
            {{ listFor(key).length === 1 ? 'релиз' : 'релиза' }}
          </div>
        </button>

        <ul class="flex flex-1 flex-col gap-1 overflow-y-auto pr-0.5">
          <li v-for="r in listFor(key)" :key="r.id + r.localDateKey">
            <button
              type="button"
              class="flex w-full items-center gap-2 rounded-lg bg-white/[0.03] px-1.5 py-1 text-left text-[11px] text-zinc-300 hover:bg-white/[0.06] focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500/50"
              @click="navigateToCard(r)"
            >
              <span class="line-clamp-2 flex-1">{{ r.titleRu || r.title }}</span>
              <span
                v-if="r.airTimeKnown && r.localTimeLabel"
                class="flex-shrink-0 tabular-nums text-zinc-500"
              >
                {{ r.localTimeLabel }}
              </span>
            </button>
          </li>
          <li
            v-if="!listFor(key).length"
            class="py-4 text-center text-[11px] text-zinc-600"
          >
            Нет релизов
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
