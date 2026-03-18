<template>
  <div class="exp-bar-wrap">
    <div
      class="exp-bar-track"
      role="progressbar"
      :aria-valuenow="pct"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div
        class="exp-bar-fill"
        :style="{ width: animatedPct + '%' }"
      />
      <div
        class="exp-bar-glow"
        :style="{ width: animatedPct + '%' }"
      />
    </div>
    <span v-if="showLabel" class="exp-bar-label">{{ pct }}%</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  pct: number        // 0-100
  showLabel?: boolean
  animate?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showLabel: false,
  animate:   true,
})

// Animated percentage: transitions from 0 to target on mount and on change
const animatedPct = ref(props.animate ? 0 : props.pct)

onMounted(() => {
  if (!props.animate) return
  // Short delay so CSS transition fires after paint
  requestAnimationFrame(() => {
    animatedPct.value = props.pct
  })
})

watch(() => props.pct, (val) => {
  animatedPct.value = val
})
</script>

<style scoped>
.exp-bar-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.exp-bar-track {
  position: relative;
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 99px;
  overflow: visible;
}

.exp-bar-fill {
  position: absolute;
  inset-block: 0;
  left: 0;
  border-radius: 99px;
  background: linear-gradient(90deg, #16a34a 0%, #22c55e 60%, #4ade80 100%);
  transition: width 0.9s cubic-bezier(0.22, 1, 0.36, 1);
  overflow: hidden;

  /* shimmer animation */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.18) 50%,
      transparent 100%
    );
    background-size: 200% 100%;
    animation: shimmer 2s linear infinite;
  }
}

.exp-bar-glow {
  position: absolute;
  inset-block: -2px;
  left: 0;
  border-radius: 99px;
  background: linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.5));
  filter: blur(4px);
  transition: width 0.9s cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: none;
}

.exp-bar-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.45);
  white-space: nowrap;
  min-width: 30px;
  text-align: right;
}

@keyframes shimmer {
  0%   { background-position: 200% center; }
  100% { background-position: -200% center; }
}
</style>
