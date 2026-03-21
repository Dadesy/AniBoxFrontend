<script setup lang="ts">
import type { EpisodeProgress } from '~/types/content'
import type { ScheduleRelease } from '~/types/metadata'
import { useSchedule } from '~/composables/useMetadata'
import { useCalendarNavigation } from '~/composables/useCalendarNavigation'
import { useScheduleFilters } from '~/composables/useScheduleFilters'
import ScheduleHeader from '~/components/schedule/ScheduleHeader.vue'
import ScheduleMonthView from '~/components/schedule/ScheduleMonthView.vue'
import ScheduleWeekView from '~/components/schedule/ScheduleWeekView.vue'
import ScheduleReleaseCard from '~/components/schedule/ScheduleReleaseCard.vue'
import ScheduleFiltersPanel from '~/components/schedule/ScheduleFiltersPanel.vue'
import ScheduleSkeleton from '~/components/schedule/ScheduleSkeleton.vue'
import { formatDayMonthRu } from '~/utils/schedule-dates'

const { page, releases, meta, loading, error, refresh } = useSchedule()
const filters = useScheduleFilters()

const tz = computed(() => meta.value.timezone)
const todayLocal = computed(() => meta.value.todayLocalDateKey)

const {
  viewMode,
  effectiveSelected,
  weekMondayKey,
  monthCursor,
  goToday,
  goPrev,
  goNext,
  selectDateKey,
} = useCalendarNavigation(tz, todayLocal)

const sourceLabel = computed(() =>
  meta.value.source === 'yanitv' ? 'Yani.tv' : 'Shikimori',
)

const filteredReleases = computed(() =>
  filters.filtered(releases.value, tz.value),
)

const countsFiltered = computed(() =>
  filters.buildCountsByDate(filteredReleases.value),
)

const releasesByDate = computed(() => {
  const m = new Map<string, ScheduleRelease[]>()
  for (const r of filteredReleases.value) {
    if (!m.has(r.localDateKey)) m.set(r.localDateKey, [])
    m.get(r.localDateKey)!.push(r)
  }
  for (const arr of m.values()) {
    arr.sort(
      (a, b) =>
        (a.nextAirAt ?? '').localeCompare(b.nextAirAt ?? ''),
    )
  }
  return m
})

const selectedList = computed(
  () => releasesByDate.value.get(effectiveSelected.value) ?? [],
)

const todayReleases = computed(() => {
  const t = todayLocal.value
  if (!t) return []
  return releasesByDate.value.get(t) ?? []
})

const upcomingReleases = computed(() => {
  const t = todayLocal.value
  if (!t) return []
  return filteredReleases.value
    .filter((r) => r.localDateKey > t)
    .sort((a, b) => (a.nextAirAt ?? '').localeCompare(b.nextAirAt ?? ''))
    .slice(0, 24)
})

const recentReleases = computed(() => {
  const t = todayLocal.value
  if (!t) return []
  return filteredReleases.value
    .filter((r) => r.localDateKey < t)
    .sort((a, b) => b.localDateKey.localeCompare(a.localDateKey))
    .slice(0, 16)
})

const monthYM = computed(() => {
  const mc = monthCursor.value
  if (mc) return mc
  const k = effectiveSelected.value
  const [y, m] = k.split('-').map(Number)
  return { year: y, month: m }
})

const filtersOpen = ref(false)

const { loadContinueWatching } = useWatchProgress()
const { isAuthenticated } = useAuth()

const progressByExt = ref(new Map<string, EpisodeProgress>())

async function syncProgress() {
  if (!import.meta.client || !isAuthenticated.value) {
    progressByExt.value = new Map()
    return
  }
  try {
    const list = await loadContinueWatching(80)
    const m = new Map<string, EpisodeProgress>()
    for (const p of list) {
      if (!m.has(p.externalId)) m.set(p.externalId, p)
    }
    progressByExt.value = m
  } catch {
    progressByExt.value = new Map()
  }
}

onMounted(syncProgress)
watch(isAuthenticated, syncProgress)

function progressFor(r: ScheduleRelease): EpisodeProgress | null {
  if (!r.externalId) return null
  return progressByExt.value.get(r.externalId) ?? null
}

const dayTitle = computed(() => {
  const k = effectiveSelected.value
  if (!k || !tz.value) return ''
  return formatDayMonthRu(k, tz.value)
})

useHead({
  title: 'Расписание выхода аниме — AniBox',
  meta: [
    {
      name: 'description',
      content:
        'Календарь и расписание выхода новых серий аниме с учётом вашей таймзоны',
    },
  ],
})
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
    <ScheduleSkeleton v-if="loading && !page.meta.generatedAt" />

    <template v-else>
      <div v-if="error" class="mb-6 rounded-xl border border-red-500/25 bg-red-500/10 p-4">
        <p class="text-sm text-red-200">
          Не удалось загрузить расписание.
        </p>
        <UButton class="mt-3" size="sm" color="primary" @click="() => refresh()">
          Повторить
        </UButton>
      </div>

      <ScheduleHeader
        v-model:view-mode="viewMode"
        :timezone="meta.timezone"
        :source-label="sourceLabel"
        :filters-open="filtersOpen"
        @update:filters-open="filtersOpen = $event"
        @today="goToday"
        @prev="goPrev"
        @next="goNext"
      />

      <div class="mt-6 space-y-6">
        <ScheduleFiltersPanel
          :releases="releases"
          :open="filtersOpen"
        />

        <section
          v-if="todayReleases.length && !loading"
          class="sticky top-[calc(104px+0.5rem)] z-20 -mx-4 border-y border-white/[0.06] bg-cinema-base/95 px-4 py-3 backdrop-blur-md sm:top-[calc(4rem+0.5rem)] sm:mx-0 sm:rounded-xl sm:border"
          aria-label="Сегодня выходит"
        >
          <div class="mb-2 flex items-center justify-between gap-2">
            <h2 class="text-xs font-bold uppercase tracking-wider text-emerald-400/90">
              Сегодня выходит
            </h2>
            <span class="text-[11px] text-zinc-500">{{ meta.todayLocalDateKey }}</span>
          </div>
          <div
            class="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <ScheduleReleaseCard
              v-for="r in todayReleases"
              :key="r.id + r.nextAirAt"
              :release="r"
              :continue-progress="progressFor(r)"
              class="min-w-[min(100%,20rem)] flex-shrink-0 sm:min-w-[22rem]"
            />
          </div>
        </section>

        <div class="grid gap-8 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px]">
          <div class="min-w-0 space-y-6">
            <ScheduleMonthView
              v-if="viewMode === 'month'"
              :year="monthYM.year"
              :month="monthYM.month"
              :time-zone="tz"
              :counts-by-date="countsFiltered"
              :selected-date-key="effectiveSelected"
              :today-local-date-key="todayLocal"
              @select="selectDateKey"
            />

            <ScheduleWeekView
              v-else-if="viewMode === 'week'"
              :monday-date-key="weekMondayKey"
              :time-zone="tz"
              :selected-date-key="effectiveSelected"
              :today-local-date-key="todayLocal"
              :releases-by-date="releasesByDate"
              @select="selectDateKey"
              @swipe-prev="goPrev"
              @swipe-next="goNext"
            />

            <div
              v-else
              class="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <h2 class="text-sm font-semibold text-zinc-200">
                {{ dayTitle }}
              </h2>
              <p class="mt-0.5 text-xs text-zinc-500">
                {{ effectiveSelected === todayLocal ? 'Сегодня' : 'Выбранный день' }}
              </p>
            </div>

            <section :aria-busy="loading">
              <div class="mb-3 flex items-center justify-between gap-2">
                <h2 class="text-lg font-bold text-white">
                  <template v-if="viewMode === 'day'">
                    Релизы · {{ dayTitle }}
                  </template>
                  <template v-else>
                    Релизы · выбранный день
                  </template>
                </h2>
                <span class="text-xs text-zinc-500 tabular-nums">
                  {{ selectedList.length }}
                </span>
              </div>

              <div v-if="loading" class="space-y-2">
                <div
                  v-for="n in 4"
                  :key="n"
                  class="h-24 animate-pulse rounded-xl bg-white/[0.04] motion-reduce:animate-none"
                />
              </div>

              <div v-else-if="!selectedList.length" class="py-16 text-center">
                <UIcon
                  name="i-lucide-calendar-off"
                  class="mx-auto mb-3 h-10 w-10 text-zinc-600"
                />
                <p class="text-sm font-medium text-zinc-400">
                  На эту дату нет релизов
                </p>
                <p class="mt-1 text-xs text-zinc-600">
                  Смените фильтры или выберите другой день в календаре.
                </p>
              </div>

              <div v-else class="space-y-3">
                <ScheduleReleaseCard
                  v-for="r in selectedList"
                  :key="r.id + r.nextAirAt"
                  :release="r"
                  :continue-progress="progressFor(r)"
                  :highlight="r.localDateKey === todayLocal"
                />
              </div>
            </section>
          </div>

          <aside class="space-y-6 lg:pt-0" aria-label="Дополнительно">
            <section
              v-if="upcomingReleases.length"
              class="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <h3 class="text-sm font-semibold text-zinc-200">
                Скоро выйдет
              </h3>
              <ul class="mt-3 space-y-2">
                <li
                  v-for="r in upcomingReleases.slice(0, 8)"
                  :key="r.id + r.localDateKey"
                >
                  <button
                    type="button"
                    class="flex w-full gap-2 rounded-lg p-1.5 text-left transition-colors hover:bg-white/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                    @click="selectDateKey(r.localDateKey)"
                  >
                    <div class="h-12 w-8 flex-shrink-0 overflow-hidden rounded bg-white/5">
                      <img
                        v-if="r.posterUrl"
                        :src="r.posterUrl"
                        alt=""
                        loading="lazy"
                        class="h-full w-full object-cover"
                      />
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="line-clamp-2 text-xs font-medium text-zinc-200">
                        {{ r.titleRu || r.title }}
                      </p>
                      <p class="mt-0.5 text-[10px] text-zinc-500">
                        {{ r.localDateKey }}
                        <span v-if="r.localTimeLabel"> · {{ r.localTimeLabel }}</span>
                      </p>
                    </div>
                  </button>
                </li>
              </ul>
            </section>

            <section
              v-if="recentReleases.length"
              class="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <h3 class="text-sm font-semibold text-zinc-200">
                Недавно по дате релиза
              </h3>
              <p class="mt-1 text-[11px] leading-relaxed text-zinc-600">
                Эпизоды с датой в прошлом (по данным расписания). Не все сервисы отдают прошлые слоты.
              </p>
              <ul class="mt-3 space-y-2">
                <li
                  v-for="r in recentReleases.slice(0, 6)"
                  :key="r.id + r.localDateKey"
                >
                  <button
                    type="button"
                    class="flex w-full gap-2 rounded-lg p-1.5 text-left transition-colors hover:bg-white/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                    @click="selectDateKey(r.localDateKey)"
                  >
                    <div class="min-w-0 flex-1">
                      <p class="line-clamp-2 text-xs font-medium text-zinc-200">
                        {{ r.titleRu || r.title }}
                      </p>
                      <p class="mt-0.5 text-[10px] text-zinc-500">
                        {{ r.localDateKey }}
                      </p>
                    </div>
                  </button>
                </li>
              </ul>
            </section>

            <section
              v-if="!filteredReleases.length && !loading"
              class="rounded-2xl border border-dashed border-white/10 p-6 text-center"
            >
              <p class="text-sm text-zinc-500">
                Расписание пустое для текущих фильтров или источник временно недоступен.
              </p>
              <UButton
                class="mt-4"
                size="sm"
                variant="soft"
                @click="filters.resetFilters(); refresh()"
              >
                Сбросить и обновить
              </UButton>
            </section>
          </aside>
        </div>
      </div>
    </template>
  </div>
</template>
