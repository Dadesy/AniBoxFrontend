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
  <section class="rounded-lg border border-white/5 bg-white/[0.02] p-5">
    <h2 class="mb-4 text-[15px] font-semibold text-zinc-100 tracking-tight">
      Расписание выхода
    </h2>

    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-4">
      <div class="flex gap-2">
        <div
          v-for="d in DAYS_SKELETON"
          :key="d"
          class="h-9 w-12 animate-pulse rounded bg-white/5"
        />
      </div>
      <div class="space-y-3">
        <div v-for="n in 5" :key="n" class="flex items-center gap-3">
          <div class="h-14 w-10 animate-pulse rounded bg-white/5" />
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
          class="rounded px-3 py-1.5 text-[13px] font-medium transition-colors"
          :class="[
            idx === selectedIdx
              ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30'
              : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5',
            idx === activeDayIdx && idx !== selectedIdx
              ? 'text-zinc-300'
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
          class="group flex w-full items-center gap-3 rounded p-2 text-left transition-colors hover:bg-white/4"
          @click="navigateToCard(anime)"
        >
          <!-- Mini poster -->
          <div class="relative h-14 w-10 flex-shrink-0 overflow-hidden rounded bg-white/5">
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
            <p class="truncate text-[13px] font-medium text-zinc-300 transition-colors group-hover:text-white">
              {{ anime.titleRu || anime.title }}
            </p>
            <p class="text-[11px] text-zinc-600">
              {{ anime.broadcast?.time ?? '' }}
              <span v-if="anime.score" class="ml-2 text-zinc-500">★ {{ anime.score.toFixed(1) }}</span>
            </p>
          </div>

          <UIcon
            name="lucide:chevron-right"
            class="h-4 w-4 flex-shrink-0 text-zinc-700 transition-colors group-hover:text-zinc-400"
          />
        </button>
      </div>

      <p v-else class="py-6 text-center text-sm text-white/30">
        Нет данных о расписании
      </p>
    </template>
  </section>
</template>
