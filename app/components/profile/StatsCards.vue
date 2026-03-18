<template>
  <!-- Skeleton -->
  <div v-if="loading" class="stats-grid">
    <div v-for="i in 3" :key="i" class="stat-card">
      <div class="skel-icon" />
      <div class="stat-body">
        <div class="skel-line wide" />
        <div class="skel-line narrow" />
      </div>
    </div>
  </div>

  <!-- Data -->
  <div v-else class="stats-grid">
    <!-- Watch time -->
    <div class="stat-card">
      <div class="stat-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      </div>
      <div class="stat-body">
        <span class="stat-value">{{ formattedWatchTime }}</span>
        <span class="stat-label">Время просмотра</span>
      </div>
    </div>

    <!-- Episodes -->
    <div class="stat-card">
      <div class="stat-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
        </svg>
      </div>
      <div class="stat-body">
        <span class="stat-value">{{ episodeCount }}</span>
        <span class="stat-label">Эпизодов просмотрено</span>
      </div>
    </div>

    <!-- Titles -->
    <div class="stat-card">
      <div class="stat-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      </div>
      <div class="stat-body">
        <span class="stat-value">{{ titleCount }}</span>
        <span class="stat-label">Аниме начато</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserStats } from '~/types/user'
import { useCountUp } from '~/composables/useProfile'

const props = defineProps<{
  stats: UserStats | null
  loading: boolean
}>()

const totalSeconds = computed(() => props.stats?.totalWatchTimeSeconds ?? 0)
const totalEpisodes = computed(() => props.stats?.totalEpisodes ?? 0)
const totalTitles   = computed(() => props.stats?.totalTitles ?? 0)

const animatedSeconds  = useCountUp(totalSeconds)
const animatedEpisodes = useCountUp(totalEpisodes)
const animatedTitles   = useCountUp(totalTitles)

const episodeCount = computed(() => animatedEpisodes.value.toLocaleString('ru-RU'))
const titleCount   = computed(() => animatedTitles.value.toLocaleString('ru-RU'))

const formattedWatchTime = computed(() => {
  const s = animatedSeconds.value
  if (s === 0 && props.loading) return '—'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (h >= 24) {
    const d = Math.floor(h / 24)
    const rh = h % 24
    return `${d}д ${rh}ч`
  }
  if (h > 0) return `${h}ч ${m}м`
  return `${m}м`
})
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 640px) {
  .stats-grid { grid-template-columns: 1fr; }
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: var(--surface-2, #141418);
  border: 1px solid var(--border, rgba(255,255,255,.06));
  border-radius: 16px;
  transition: border-color .2s;
}

.stat-card:hover {
  border-color: rgba(var(--color-primary-rgb, 34 197 94) / .35);
}

.stat-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(var(--color-primary-rgb, 34 197 94) / .12);
  color: var(--color-primary, #22c55e);
}

.stat-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -.02em;
  line-height: 1.15;
  color: #fff;
}

.stat-label {
  font-size: .75rem;
  color: var(--text-muted, rgba(255,255,255,.5));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Skeleton */
.skel-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(90deg, #1e1e24 25%, #25252d 50%, #1e1e24 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

.skel-line {
  height: 14px;
  border-radius: 6px;
  background: linear-gradient(90deg, #1e1e24 25%, #25252d 50%, #1e1e24 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

.skel-line.wide { width: 60%; margin-bottom: 6px; }
.skel-line.narrow { width: 80%; height: 10px; }

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
