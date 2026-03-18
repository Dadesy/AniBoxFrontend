<template>
  <div class="ach-card" :class="{ 'ach-card--locked': !achievement.unlocked }">
    <div class="ach-card__icon-wrap">
      <span class="ach-card__icon" aria-hidden="true">{{ achievement.icon }}</span>
      <div v-if="!achievement.unlocked" class="ach-card__lock">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>
    </div>

    <div class="ach-card__body">
      <p class="ach-card__title">{{ achievement.title }}</p>
      <p class="ach-card__desc">{{ achievement.description }}</p>
      <div class="ach-card__footer">
        <span class="ach-card__exp">+{{ achievement.expReward }} EXP</span>
        <span v-if="achievement.unlocked && achievement.unlockedAt" class="ach-card__date">
          {{ formatDate(achievement.unlockedAt) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AchievementDto } from '~/types/gamification'

defineProps<{ achievement: AchievementDto }>()

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'short',
  })
}
</script>

<style scoped>
.ach-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  border-radius: 10px;
  border: 1px solid rgba(34, 197, 94, 0.2);
  background: rgba(34, 197, 94, 0.04);
  transition: border-color 0.2s, background 0.2s, transform 0.2s;
}

.ach-card:hover {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.07);
  transform: translateY(-1px);
}

.ach-card--locked {
  border-color: rgba(255, 255, 255, 0.07);
  background: transparent;
  opacity: 0.55;
}

.ach-card--locked:hover {
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.02);
  transform: none;
}

/* Icon */
.ach-card__icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
}

.ach-card__icon {
  font-size: 1.4rem;
  line-height: 1;
}

.ach-card__lock {
  position: absolute;
  bottom: -4px;
  right: -4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #1c1c1f;
  color: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Body */
.ach-card__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.ach-card__title {
  font-size: 0.82rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.ach-card--locked .ach-card__title { color: rgba(255, 255, 255, 0.6); }

.ach-card__desc {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.45);
  margin: 0;
  line-height: 1.4;
}

.ach-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}

.ach-card__exp {
  font-size: 0.7rem;
  font-weight: 600;
  color: #22c55e;
}

.ach-card--locked .ach-card__exp { color: rgba(255, 255, 255, 0.3); }

.ach-card__date {
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.3);
}
</style>
