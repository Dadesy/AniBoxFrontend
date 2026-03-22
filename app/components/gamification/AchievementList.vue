<script setup lang="ts">
import type { AchievementDto } from '~/types/gamification'
import AchievementCard from '~/components/gamification/AchievementCard.vue'

const props = defineProps<{
  achievements: AchievementDto[]
  loading?: boolean
}>()

const unlockedCount = computed(() => props.achievements.filter((a) => a.unlocked).length)
const total         = computed(() => props.achievements.length)
const pct           = computed(() => total.value ? Math.round((unlockedCount.value / total.value) * 100) : 0)

// Unlocked first (newest first), then locked
const sorted = computed(() => {
  const unlocked = props.achievements
    .filter((a) => a.unlocked)
    .sort((a, b) => {
      const da = a.unlockedAt ? new Date(a.unlockedAt).getTime() : 0
      const db = b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0
      return db - da
    })
  const locked = props.achievements.filter((a) => !a.unlocked)
  return [...unlocked, ...locked]
})
</script>

<template>
  <!-- Loading skeletons -->
  <div v-if="loading" class="space-y-3">
    <!-- Summary skeleton -->
    <div class="h-16 animate-pulse rounded-2xl bg-white/4" />
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div v-for="i in 4" :key="i" class="h-[78px] animate-pulse rounded-2xl bg-white/4" :style="`animation-delay: ${i * 60}ms`" />
    </div>
  </div>

  <div v-else class="space-y-5">

    <!-- ── Progress summary bar ──────────────────────────────────── -->
    <div class="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
      <!-- Progress ring (CSS) -->
      <div class="relative h-12 w-12 shrink-0">
        <svg class="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
          <circle
            cx="24" cy="24" r="20"
            fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="4"
          />
          <circle
            cx="24" cy="24" r="20"
            fill="none" stroke="#22c55e" stroke-width="4"
            stroke-linecap="round"
            :stroke-dasharray="`${2 * Math.PI * 20}`"
            :stroke-dashoffset="`${2 * Math.PI * 20 * (1 - pct / 100)}`"
            style="transition: stroke-dashoffset 0.8s cubic-bezier(0.22,1,0.36,1);"
          />
        </svg>
        <span class="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-white">
          {{ pct }}%
        </span>
      </div>

      <div class="min-w-0 flex-1 space-y-1.5">
        <div class="flex items-baseline gap-1">
          <span class="text-xl font-black tabular-nums text-white">{{ unlockedCount }}</span>
          <span class="text-sm text-white/30">/ {{ total }}</span>
          <span class="ml-1 text-xs text-white/30">получено</span>
        </div>
        <!-- Progress bar -->
        <div class="h-1.5 overflow-hidden rounded-full bg-white/8">
          <div
            class="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-[width] duration-700"
            :style="`width: ${pct}%`"
          />
        </div>
      </div>
    </div>

    <!-- ── Achievement grid ──────────────────────────────────────── -->
    <div v-if="achievements.length" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <AchievementCard
        v-for="(ach, i) in sorted"
        :key="ach.key"
        :achievement="ach"
        :index="i"
      />
    </div>

    <div v-else class="flex flex-col items-center gap-3 py-12 text-center">
      <UIcon name="lucide:trophy" class="size-10 text-white/10" />
      <p class="text-sm text-white/30">Достижений пока нет</p>
    </div>
  </div>
</template>
