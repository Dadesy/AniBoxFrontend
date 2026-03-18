<script setup lang="ts">
import type { ScheduleDay } from '~/types/metadata'
import { navigateToCard } from '~/composables/useMetadata'

const props = defineProps<{
  schedule: ScheduleDay[]
  loading?: boolean
  todayDayKey?: string
}>()

// Today's index in our schedule array
const activeDayIdx = computed(() => {
  if (!props.todayDayKey) return 0
  const idx = props.schedule.findIndex((d) => d.dayKey === props.todayDayKey)
  return idx >= 0 ? idx : 0
})

const selectedIdx = ref(0)

watch(activeDayIdx, (val) => { selectedIdx.value = val }, { immediate: true })

const selectedDay = computed(() => props.schedule[selectedIdx.value] ?? null)

const DAYS_SKELETON = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
</script>

<template>
  <section class="rounded-2xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur-sm">
    <h2 class="mb-5 flex items-center gap-2 text-xl font-bold text-white">
      <span class="h-5 w-1 rounded-full bg-emerald-500" />
      Расписание выхода
    </h2>

    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-4">
      <div class="flex gap-2">
        <div
          v-for="d in DAYS_SKELETON"
          :key="d"
          class="h-9 w-12 animate-pulse rounded-lg bg-white/5"
        />
      </div>
      <div class="space-y-3">
        <div v-for="n in 5" :key="n" class="flex items-center gap-3">
          <div class="h-14 w-10 animate-pulse rounded-lg bg-white/5" />
          <div class="flex-1 space-y-2">
            <div class="h-3 w-40 animate-pulse rounded bg-white/5" />
            <div class="h-2 w-24 animate-pulse rounded bg-white/5" />
          </div>
        </div>
      </div>
    </div>

    <template v-else>
      <!-- Day tabs -->
      <div class="mb-5 flex flex-wrap gap-2">
        <button
          v-for="(day, idx) in schedule"
          :key="day.dayKey"
          class="rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200"
          :class="[
            idx === selectedIdx
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
              : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80',
            idx === activeDayIdx && idx !== selectedIdx
              ? 'ring-1 ring-emerald-500/40'
              : '',
          ]"
          @click="selectedIdx = idx"
        >
          {{ day.day.slice(0, 2) }}
          <span
            v-if="idx === activeDayIdx"
            class="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-current align-middle opacity-70"
          />
        </button>
      </div>

      <!-- Day title -->
      <p class="mb-3 text-sm font-medium text-white/40">
        {{ selectedDay?.day }}
        <span v-if="selectedIdx === activeDayIdx" class="text-emerald-500"> · Сегодня</span>
      </p>

      <!-- Anime list -->
      <div
        v-if="selectedDay?.anime.length"
        class="space-y-2"
      >
        <button
          v-for="anime in selectedDay.anime"
          :key="anime.id"
          class="group flex w-full items-center gap-3 rounded-xl p-2 text-left transition-all duration-200 hover:bg-white/5"
          @click="navigateToCard(anime)"
        >
          <!-- Mini poster -->
          <div class="relative h-14 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-white/5">
            <img
              v-if="anime.posterUrl"
              :src="anime.posterUrl"
              :alt="anime.titleRu || anime.title"
              loading="lazy"
              class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div v-else class="absolute inset-0 animate-pulse bg-white/5" />
          </div>

          <!-- Info -->
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-white/90 transition-colors group-hover:text-emerald-400">
              {{ anime.titleRu || anime.title }}
            </p>
            <p class="text-xs text-white/40">
              {{ anime.broadcast?.time ?? '' }}
              <span v-if="anime.score" class="ml-2 text-yellow-400">★ {{ anime.score.toFixed(1) }}</span>
            </p>
          </div>

          <UIcon
            name="i-heroicons-chevron-right"
            class="h-4 w-4 flex-shrink-0 text-white/20 transition-all group-hover:text-emerald-500 group-hover:translate-x-0.5"
          />
        </button>
      </div>

      <p v-else class="py-6 text-center text-sm text-white/30">
        Нет данных о расписании
      </p>
    </template>
  </section>
</template>
