<script setup lang="ts">
import type { ScheduleDay, ScheduleRelease } from '~/types/metadata'
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

// Animate in when section enters viewport
const sectionRef = ref<HTMLElement | null>(null)
const revealed   = ref(false)

onMounted(() => {
  if (!sectionRef.value || typeof IntersectionObserver === 'undefined') {
    revealed.value = true
    return
  }
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) {
        revealed.value = true
        observer.disconnect()
      }
    },
    { rootMargin: '0px 0px -40px 0px', threshold: 0.05 },
  )
  observer.observe(sectionRef.value)
  onUnmounted(() => observer.disconnect())
})
</script>

<template>
  <section
    ref="sectionRef"
    :class="[
      'transition-[opacity,transform] duration-500 ease-out motion-reduce:duration-200',
      revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5 motion-reduce:translate-y-0',
    ]"
  >
    <!-- Header: accent bar + title -->
    <div class="mb-4 flex items-center justify-between gap-3">
      <div class="flex min-w-0 items-center gap-2.5">
        <div class="h-[1.1em] w-[3px] shrink-0 rounded-full bg-emerald-500/65" aria-hidden="true" />
        <h2 class="truncate text-[clamp(0.9rem,2.4vw,1.05rem)] font-bold tracking-tight text-white/90">
          Расписание выхода
        </h2>
      </div>

      <!-- Today badge -->
      <div
        v-if="!loading && schedule.length"
        class="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/[0.07] px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400"
      >
        <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 motion-reduce:animate-none" />
        Сегодня
      </div>
    </div>

    <!-- Card shell -->
    <div
      class="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.022]"
      style="box-shadow: 0 4px 32px rgba(0,0,0,0.4);"
    >
      <!-- Subtle inner top accent -->
      <div
        class="pointer-events-none h-px w-full"
        style="background: linear-gradient(90deg, transparent 0%, rgba(34,197,94,0.18) 50%, transparent 100%);"
        aria-hidden="true"
      />

      <div class="p-4 sm:p-5">

        <!-- Loading skeleton -->
        <div v-if="loading" class="space-y-4">
          <div class="flex gap-1.5">
            <div
              v-for="d in DAYS_SKELETON"
              :key="d"
              class="h-8 w-11 animate-pulse rounded-lg bg-white/[0.05]"
            />
          </div>
          <div class="space-y-3 pt-1">
            <div
              v-for="n in 5"
              :key="n"
              class="flex items-center gap-3"
            >
              <div class="h-[56px] w-[40px] flex-shrink-0 animate-pulse rounded-lg bg-white/[0.05]" />
              <div class="flex-1 space-y-2">
                <div class="h-3 w-36 animate-pulse rounded bg-white/[0.06]" />
                <div class="h-2 w-20 animate-pulse rounded bg-white/[0.04]" />
              </div>
            </div>
          </div>
        </div>

        <template v-else>
          <!-- Day tabs -->
          <div class="mb-4 flex flex-wrap gap-1.5">
            <button
              v-for="(day, idx) in schedule"
              :key="day.dayKey"
              class="relative rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all duration-150"
              :class="[
                idx === selectedIdx
                  ? 'bg-emerald-500/12 text-emerald-400 ring-1 ring-emerald-500/30'
                  : 'text-white/35 hover:bg-white/[0.05] hover:text-white/65',
              ]"
              @click="selectedIdx = idx"
            >
              {{ day.day.slice(0, 2) }}
              <!-- Today dot -->
              <span
                v-if="idx === activeDayIdx"
                class="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400"
                :class="idx === selectedIdx ? 'opacity-100' : 'opacity-60'"
              />
            </button>
          </div>

          <!-- Selected day label -->
          <p class="mb-3 text-[11px] font-medium uppercase tracking-wider text-white/30">
            {{ selectedDay?.day }}
            <span v-if="selectedIdx === activeDayIdx" class="text-emerald-500/80"> · Сегодня</span>
          </p>

          <!-- Anime list -->
          <div
            v-if="selectedDay?.anime.length"
            class="space-y-1"
          >
            <button
              v-for="anime in selectedDay.anime"
              :key="anime.id"
              class="group flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-all duration-200 hover:bg-white/[0.04] hover:translate-x-0.5"
              @click="navigateToCard(anime)"
            >
              <!-- Mini poster -->
              <div
                class="relative h-[56px] w-[40px] flex-shrink-0 overflow-hidden rounded-lg bg-white/[0.04]"
                style="box-shadow: 0 2px 10px rgba(0,0,0,0.4);"
              >
                <img
                  v-if="anime.posterUrl"
                  :src="anime.posterUrl"
                  :alt="anime.titleRu || anime.title"
                  loading="lazy"
                  referrerpolicy="no-referrer"
                  class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div v-else class="h-full w-full bg-white/[0.04]" />
              </div>

              <!-- Info -->
              <div class="min-w-0 flex-1">
                <p class="truncate text-[13px] font-semibold text-white/80 transition-colors group-hover:text-white">
                  {{ anime.titleRu || anime.title }}
                </p>
                <div class="mt-0.5 flex items-center gap-2">
                  <template v-if="'localTimeLabel' in anime && (anime as ScheduleRelease).localTimeLabel">
                    <span class="text-[11px] tabular-nums text-white/30">
                      {{ (anime as ScheduleRelease).localTimeLabel }}
                    </span>
                    <span
                      v-if="(anime as ScheduleRelease).nextEpisode != null"
                      class="inline-flex items-center rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400/80"
                    >
                      с{{ (anime as ScheduleRelease).nextEpisode }}
                    </span>
                  </template>
                  <template v-else>
                    <span class="text-[11px] text-white/30">{{ anime.broadcast?.time ?? '' }}</span>
                  </template>
                  <span
                    v-if="anime.score"
                    class="ml-auto text-[10px] tabular-nums text-white/22"
                  >
                    ★ {{ anime.score.toFixed(1) }}
                  </span>
                </div>
              </div>

              <!-- Arrow -->
              <UIcon
                name="lucide:chevron-right"
                class="h-3.5 w-3.5 flex-shrink-0 text-white/18 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-white/45"
              />
            </button>
          </div>

          <p v-else class="py-8 text-center text-sm text-white/25">
            Нет данных о расписании
          </p>
        </template>
      </div>
    </div>
  </section>
</template>
