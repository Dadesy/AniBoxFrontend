<script setup lang="ts">
import type { ScheduleRelease } from '~/types/metadata'
import {
  useScheduleFilters,
  type ScheduleStatusFilter,
} from '~/composables/useScheduleFilters'

const props = defineProps<{
  releases: ScheduleRelease[]
  open: boolean
}>()

const { status, weekdayMon, genre, weekdayOptions, resetFilters } =
  useScheduleFilters()

const genreOptions = computed(() => {
  const s = new Set<string>()
  for (const r of props.releases) {
    for (const g of r.genres ?? []) {
      if (g) s.add(g)
    }
  }
  return [...s].sort((a, b) => a.localeCompare(b, 'ru'))
})

const statusOptions: { value: ScheduleStatusFilter; label: string }[] = [
  { value: 'all', label: 'Все статусы' },
  { value: 'ongoing', label: 'Онгоинг' },
  { value: 'anons', label: 'Анонсы' },
  { value: 'released', label: 'Завершён' },
]
</script>

<template>
  <Transition
    enter-active-class="motion-safe:transition motion-safe:duration-200"
    leave-active-class="motion-safe:transition motion-safe:duration-150"
    enter-from-class="opacity-0 -translate-y-1"
    leave-to-class="opacity-0 -translate-y-1"
  >
    <aside
      v-show="open"
      id="schedule-filters-panel"
      class="rounded-2xl border border-white/[0.06] bg-zinc-950/90 p-4 shadow-xl backdrop-blur-md sm:p-5"
      aria-label="Фильтры расписания"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-sm font-semibold text-zinc-200">Фильтры</h2>
        <button
          type="button"
          class="text-xs font-medium text-emerald-400 hover:text-emerald-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          @click="resetFilters"
        >
          Сбросить
        </button>
      </div>

      <div class="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-zinc-500">
            Статус
          </label>
          <select
            v-model="status"
            class="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <option v-for="o in statusOptions" :key="o.value" :value="o.value">
              {{ o.label }}
            </option>
          </select>
        </div>

        <div>
          <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-zinc-500">
            День недели
          </label>
          <select
            v-model="weekdayMon"
            class="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="">Любой</option>
            <option v-for="o in weekdayOptions" :key="o.value" :value="String(o.value)">
              {{ o.label }}
            </option>
          </select>
        </div>

        <div>
          <label class="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-zinc-500">
            Жанр
          </label>
          <select
            v-model="genre"
            class="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="">Любой</option>
            <option v-for="g in genreOptions" :key="g" :value="g">
              {{ g }}
            </option>
          </select>
        </div>
      </div>
    </aside>
  </Transition>
</template>
