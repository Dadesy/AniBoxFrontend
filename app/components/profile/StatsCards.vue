<script setup lang="ts">
import type { UserStats } from '~/types/user'
import { useCountUp }    from '~/composables/useProfile'

const props = defineProps<{
  stats:   UserStats | null
  loading: boolean
}>()

const totalSeconds  = computed(() => props.stats?.totalWatchTimeSeconds ?? 0)
const totalEpisodes = computed(() => props.stats?.totalEpisodes ?? 0)
const totalTitles   = computed(() => props.stats?.totalTitles ?? 0)

const animSec  = useCountUp(totalSeconds)
const animEp   = useCountUp(totalEpisodes)
const animTitl = useCountUp(totalTitles)

const episodeCount = computed(() => animEp.value.toLocaleString('ru-RU'))
const titleCount   = computed(() => animTitl.value.toLocaleString('ru-RU'))

const formattedWatchTime = computed(() => {
  const s = animSec.value
  if (s === 0 && props.loading) return '—'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (h >= 24) { const d = Math.floor(h / 24); return `${d}д ${h % 24}ч` }
  if (h > 0)   return `${h}ч ${m}м`
  return `${m}м`
})

const cards = computed(() => [
  {
    icon:      'lucide:clock',
    value:     formattedWatchTime.value,
    label:     'Время просмотра',
    iconColor: 'text-sky-400',
    iconBg:    'bg-sky-500/10',
    accent:    'rgba(56,189,248,0.15)',
  },
  {
    icon:      'lucide:play-circle',
    value:     episodeCount.value,
    label:     'Эпизодов',
    iconColor: 'text-emerald-400',
    iconBg:    'bg-emerald-500/10',
    accent:    'rgba(34,197,94,0.15)',
  },
  {
    icon:      'lucide:library',
    value:     titleCount.value,
    label:     'Аниме начато',
    iconColor: 'text-violet-400',
    iconBg:    'bg-violet-500/10',
    accent:    'rgba(167,139,250,0.15)',
  },
])
</script>

<template>
  <!-- Skeleton -->
  <div v-if="loading" class="grid grid-cols-3 gap-3">
    <div
      v-for="i in 3"
      :key="i"
      class="h-[90px] animate-pulse rounded-2xl bg-white/4"
      :style="`animation-delay: ${(i - 1) * 80}ms`"
    />
  </div>

  <!-- Data -->
  <div v-else class="grid grid-cols-3 gap-3">
    <div
      v-for="card in cards"
      :key="card.label"
      class="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 transition-all duration-300 hover:border-white/14 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30"
    >
      <!-- Accent glow corner -->
      <div
        class="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100"
        :style="`background: ${card.accent};`"
        aria-hidden="true"
      />

      <div class="relative flex flex-col gap-3">
        <!-- Icon -->
        <div
          class="flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
          :class="[card.iconBg, card.iconColor]"
        >
          <UIcon :name="card.icon" class="size-4.5" />
        </div>

        <!-- Value -->
        <div>
          <p class="text-xl font-black tabular-nums leading-none tracking-tight text-white sm:text-2xl">
            {{ card.value }}
          </p>
          <p class="mt-1 text-[11px] text-white/35">{{ card.label }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
