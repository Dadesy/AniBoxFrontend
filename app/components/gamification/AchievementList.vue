<template>
  <div class="ach-list">
    <!-- Loading skeleton -->
    <template v-if="loading">
      <div v-for="i in 4" :key="i" class="ach-skeleton" />
    </template>

    <!-- Achievement grid -->
    <template v-else>
      <!-- Summary line -->
      <p class="ach-list__summary">
        <span class="ach-list__count">{{ unlockedCount }}</span>
        <span class="ach-list__count-total"> / {{ achievements.length }}</span>
        <span class="ach-list__count-label"> получено</span>
      </p>

      <!-- Mobile: horizontal scroll; Desktop: 2-col grid -->
      <div class="ach-grid">
        <AchievementCard
          v-for="ach in sortedAchievements"
          :key="ach.key"
          :achievement="ach"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { AchievementDto } from '~/types/gamification'
import AchievementCard from '~/components/gamification/AchievementCard.vue'

const props = defineProps<{
  achievements: AchievementDto[]
  loading?: boolean
}>()

const unlockedCount = computed(() =>
  props.achievements.filter(a => a.unlocked).length,
)

// Unlocked first (sorted by date desc), then locked
const sortedAchievements = computed(() => {
  const unlocked = props.achievements
    .filter(a => a.unlocked)
    .sort((a, b) => {
      const da = a.unlockedAt ? new Date(a.unlockedAt).getTime() : 0
      const db = b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0
      return db - da
    })
  const locked = props.achievements.filter(a => !a.unlocked)
  return [...unlocked, ...locked]
})
</script>

<style scoped>
.ach-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ach-list__summary {
  margin: 0;
  font-size: 0.8rem;
}

.ach-list__count {
  font-weight: 700;
  color: #22c55e;
}

.ach-list__count-total { color: rgba(255, 255, 255, 0.5); }
.ach-list__count-label { color: rgba(255, 255, 255, 0.35); }

/* Desktop: 2-col grid */
.ach-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

/* Mobile: single col */
@media (max-width: 600px) {
  .ach-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
}

/* Skeleton */
.ach-skeleton {
  height: 74px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}
</style>
