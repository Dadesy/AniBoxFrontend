<script setup lang="ts">
import type { ScheduleViewMode } from '~/composables/useCalendarNavigation'

defineProps<{
  timezone: string
  sourceLabel: string
  filtersOpen: boolean
}>()

const emit = defineEmits<{
  'update:filtersOpen': [v: boolean]
  today: []
  prev: []
  next: []
  'update:viewMode': [m: ScheduleViewMode]
}>()

const viewMode = defineModel<ScheduleViewMode>('viewMode', { required: true })

const modes: { id: ScheduleViewMode; label: string }[] = [
  { id: 'day', label: 'День' },
  { id: 'week', label: 'Неделя' },
  { id: 'month', label: 'Месяц' },
]
</script>

<template>
  <header
    class="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-emerald-950/40 via-cinema-base to-zinc-950/80 px-4 py-8 sm:px-8 sm:py-10"
  >
    <div
      class="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl motion-reduce:opacity-50"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl motion-reduce:opacity-50"
      aria-hidden="true"
    />

    <div class="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p class="text-xs font-medium uppercase tracking-[0.2em] text-emerald-400/80">
          Календарь релизов
        </p>
        <h1 class="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
          Расписание
        </h1>
        <p class="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">
          Следите за выходом серий в вашей таймзоне. Данные обновляются с внешних расписаний;
          время и день недели считаются как
          <span class="font-mono text-zinc-300">{{ timezone }}</span>
          · источник: {{ sourceLabel }}.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <UButton
          color="primary"
          variant="soft"
          size="sm"
          class="font-semibold"
          @click="emit('today')"
        >
          Сегодня
        </UButton>
        <div class="flex rounded-lg border border-white/10 bg-black/20 p-0.5">
          <button
            v-for="m in modes"
            :key="m.id"
            type="button"
            class="rounded-md px-3 py-1.5 text-xs font-semibold transition-colors motion-safe:duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60"
            :class="
              viewMode === m.id
                ? 'bg-emerald-500/20 text-emerald-200'
                : 'text-zinc-500 hover:text-zinc-300'
            "
            :aria-pressed="viewMode === m.id"
            @click="viewMode = m.id"
          >
            {{ m.label }}
          </button>
        </div>
        <UButton
          color="neutral"
          variant="outline"
          size="sm"
          :aria-expanded="filtersOpen"
          aria-controls="schedule-filters-panel"
          @click="emit('update:filtersOpen', !filtersOpen)"
        >
          Фильтры
        </UButton>
        <div class="flex gap-1">
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            aria-label="Назад"
            @click="emit('prev')"
          >
            <UIcon name="i-lucide-chevron-left" class="h-4 w-4" />
          </UButton>
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            aria-label="Вперёд"
            @click="emit('next')"
          >
            <UIcon name="i-lucide-chevron-right" class="h-4 w-4" />
          </UButton>
        </div>
      </div>
    </div>
  </header>
</template>
