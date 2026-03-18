<script setup lang="ts">
import { useSchedule } from '~/composables/useMetadata'
import WeekSchedule from '~/components/home/WeekSchedule.vue'

const { schedule, loading, todayDayKey } = useSchedule()

useHead({
  title: 'Расписание выхода аниме — AniBox',
  meta: [
    {
      name: 'description',
      content: 'Расписание выхода новых серий аниме по дням недели',
    },
  ],
})
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-10 sm:px-6">
    <div class="mb-8">
      <h1 class="text-3xl font-extrabold text-white">Расписание</h1>
      <p class="mt-1.5 text-sm text-slate-500">Новые серии по дням недели</p>
    </div>

    <WeekSchedule
      :schedule="schedule"
      :loading="loading"
      :today-day-key="todayDayKey"
    />
  </div>
</template>
