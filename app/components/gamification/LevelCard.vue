<template>
  <div class="level-card" :class="`tier-${progress.tier}`">
    <!-- Tier glow orb background -->
    <div class="level-card__orb" aria-hidden="true" />

    <!-- Left: level number + icon -->
    <div class="level-card__badge">
      <div class="level-icon" :class="`level-icon--${progress.tier}`">
        <span class="level-icon__symbol" aria-hidden="true">{{ tierIcon }}</span>
        <span class="level-icon__number">{{ progress.level }}</span>
      </div>
    </div>

    <!-- Right: title + bar + EXP numbers -->
    <div class="level-card__body">
      <div class="level-card__header">
        <span class="level-card__title">{{ progress.levelTitle }}</span>
        <span class="level-card__lvl-label">Уровень {{ progress.level }}</span>
      </div>

      <ExpProgressBar
        :pct="progress.progressPct"
        :show-label="true"
        :animate="true"
        class="level-card__bar"
      />

      <div class="level-card__exp-row">
        <span class="level-card__exp-cur">
          {{ progress.exp.toLocaleString('ru-RU') }} EXP
        </span>
        <span class="level-card__exp-sep">/</span>
        <span class="level-card__exp-next">
          {{ progress.expToNext.toLocaleString('ru-RU') }} до следующего
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LevelProgressDto, LevelTier } from '~/types/gamification'
import ExpProgressBar from '~/components/gamification/ExpProgressBar.vue'

const props = defineProps<{ progress: LevelProgressDto }>()

const TIER_ICONS: Record<LevelTier, string> = {
  bronze: '🥉',
  silver: '🥈',
  gold:   '🥇',
  neon:   '💎',
}

const tierIcon = computed(() => TIER_ICONS[props.progress.tier])
</script>

<style scoped>
.level-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 24px;
  border-radius: 14px;
  border: 1px solid;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.03);
}

/* Tier-specific border colors */
.tier-bronze { border-color: rgba(205, 127, 50, 0.3); }
.tier-silver { border-color: rgba(168, 184, 200, 0.3); }
.tier-gold   { border-color: rgba(255, 215, 0, 0.3); }
.tier-neon   { border-color: rgba(34, 197, 94, 0.35); }

/* Background glow orb */
.level-card__orb {
  position: absolute;
  top: -40px;
  left: -40px;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  opacity: 0.08;
  pointer-events: none;
}

.tier-bronze .level-card__orb { background: radial-gradient(circle, #cd7f32, transparent); }
.tier-silver .level-card__orb { background: radial-gradient(circle, #a8b8c8, transparent); }
.tier-gold   .level-card__orb { background: radial-gradient(circle, #ffd700, transparent); }
.tier-neon   .level-card__orb { background: radial-gradient(circle, #22c55e, transparent); }

/* Level icon */
.level-icon {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 68px;
  height: 68px;
  border-radius: 50%;
  border: 2px solid;
  flex-shrink: 0;
}

.level-icon--bronze { border-color: rgba(205, 127, 50, 0.5);  box-shadow: 0 0 16px rgba(205, 127, 50, 0.2); }
.level-icon--silver { border-color: rgba(168, 184, 200, 0.5); box-shadow: 0 0 16px rgba(168, 184, 200, 0.2); }
.level-icon--gold   { border-color: rgba(255, 215, 0, 0.5);   box-shadow: 0 0 16px rgba(255, 215, 0, 0.25); }
.level-icon--neon   { border-color: rgba(34, 197, 94, 0.6);   box-shadow: 0 0 20px rgba(34, 197, 94, 0.3); }

.level-icon__symbol {
  font-size: 1.1rem;
  line-height: 1;
}

.level-icon__number {
  font-size: 1.15rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.03em;
}

.tier-bronze .level-icon__number { color: #cd7f32; }
.tier-silver .level-icon__number { color: #c0cdd8; }
.tier-gold   .level-icon__number { color: #ffd700; }
.tier-neon   .level-icon__number { color: #22c55e; }

/* Body */
.level-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.level-card__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.level-card__title {
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
}

.level-card__lvl-label {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.35);
}

.level-card__bar {
  /* ExpProgressBar fills its container */
}

.level-card__exp-row {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
}

.level-card__exp-cur {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}

.level-card__exp-sep { color: rgba(255, 255, 255, 0.25); }

.level-card__exp-next { color: rgba(255, 255, 255, 0.35); }

/* Mobile */
@media (max-width: 480px) {
  .level-card {
    padding: 16px;
    gap: 14px;
  }

  .level-icon {
    width: 56px;
    height: 56px;
  }

  .level-icon__symbol { font-size: 0.9rem; }
  .level-icon__number { font-size: 1rem; }
  .level-card__title  { font-size: 0.9rem; }
}
</style>
