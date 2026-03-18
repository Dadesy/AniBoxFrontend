<!--
  Global toast container for gamification events.
  Mount once in app.vue or default layout.
  Listens to gamificationBus and shows stacked toasts.
-->
<template>
  <Teleport to="body">
    <div class="toast-stack" aria-live="polite">
      <TransitionGroup name="toast" tag="div" class="toast-stack__inner">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="`toast--${toast.type}`"
        >
          <div class="toast__icon" aria-hidden="true">{{ toast.icon }}</div>
          <div class="toast__body">
            <p class="toast__title">{{ toast.title }}</p>
            <p v-if="toast.sub" class="toast__sub">{{ toast.sub }}</p>
          </div>
          <button class="toast__close" aria-label="Закрыть" @click="remove(toast.id)">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>

    <!-- Level-up fullscreen flash -->
    <Transition name="levelup-flash">
      <div v-if="levelUpFlash" class="levelup-flash" aria-hidden="true">
        <div class="levelup-flash__content">
          <div class="levelup-flash__badge">
            <span class="levelup-flash__icon">⬆</span>
            <span class="levelup-flash__label">LEVEL UP!</span>
          </div>
          <p class="levelup-flash__level">Уровень {{ levelUpFlash.newLevel }}</p>
          <p class="levelup-flash__title">{{ levelUpFlash.levelTitle }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { gamificationBus } from '~/composables/useGamification'
import { getLevelTitle } from '~/types/gamification'

interface Toast {
  id: number
  type: 'exp' | 'achievement' | 'levelup'
  icon: string
  title: string
  sub?: string
}

const toasts   = ref<Toast[]>([])
const levelUpFlash = ref<{ newLevel: number; levelTitle: string } | null>(null)
let nextId = 0
const AUTO_DISMISS_MS = 4000

function add(toast: Omit<Toast, 'id'>) {
  const id = nextId++
  toasts.value.push({ ...toast, id })
  setTimeout(() => remove(id), AUTO_DISMISS_MS)
}

function remove(id: number) {
  const idx = toasts.value.findIndex(t => t.id === id)
  if (idx !== -1) toasts.value.splice(idx, 1)
}

// Subscribe to bus events
let unsubLevelUp:     (() => void) | null = null
let unsubAchievement: (() => void) | null = null
let unsubExp:         (() => void) | null = null

onMounted(() => {
  unsubLevelUp = gamificationBus.onLevelUp(({ newLevel, levelTitle }) => {
    // Big flash overlay
    levelUpFlash.value = { newLevel, levelTitle }
    setTimeout(() => { levelUpFlash.value = null }, 2800)

    // Toast as well
    add({ type: 'levelup', icon: '⬆', title: `Уровень ${newLevel}!`, sub: levelTitle })
  })

  unsubAchievement = gamificationBus.onAchievement((ach) => {
    add({
      type:  'achievement',
      icon:  ach.icon,
      title: ach.title,
      sub:   `+${ach.expReward} EXP`,
    })
  })

  unsubExp = gamificationBus.onExpGain(({ amount }) => {
    add({ type: 'exp', icon: '✨', title: `+${amount} EXP` })
  })
})

onUnmounted(() => {
  unsubLevelUp?.()
  unsubAchievement?.()
  unsubExp?.()
})
</script>

<style scoped>
/* Toast stack — bottom-right */
.toast-stack {
  position: fixed;
  bottom: 24px;
  right: 20px;
  z-index: 9999;
  pointer-events: none;
  width: 300px;
}

.toast-stack__inner {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

/* Toast */
.toast {
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(24, 24, 27, 0.92);
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  width: 100%;
}

.toast--exp         { border-color: rgba(34, 197, 94, 0.3); }
.toast--achievement { border-color: rgba(251, 191, 36, 0.3); }
.toast--levelup     { border-color: rgba(34, 197, 94, 0.5);  background: rgba(20, 40, 25, 0.95); }

.toast__icon {
  font-size: 1.1rem;
  flex-shrink: 0;
  margin-top: 1px;
}

.toast__body { flex: 1; min-width: 0; }

.toast__title {
  font-size: 0.82rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.toast--levelup .toast__title { color: #4ade80; }

.toast__sub {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.45);
  margin: 2px 0 0;
}

.toast__close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  border-radius: 4px;
  transition: color 0.15s;
  margin-top: 1px;
  padding: 0;
}
.toast__close:hover { color: rgba(255, 255, 255, 0.7); }

/* Toast transitions */
.toast-enter-active  { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.toast-leave-active  { transition: all 0.25s ease; }
.toast-enter-from    { opacity: 0; transform: translateX(20px) scale(0.96); }
.toast-leave-to      { opacity: 0; transform: translateX(24px); }

/* Level-up flash overlay */
.levelup-flash {
  position: fixed;
  inset: 0;
  z-index: 10000;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(ellipse at center, rgba(34, 197, 94, 0.12) 0%, transparent 70%);
}

.levelup-flash__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.levelup-flash__badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.levelup-flash__icon {
  font-size: 2.5rem;
  animation: bounce-up 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.levelup-flash__label {
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  color: #22c55e;
  opacity: 0.8;
}

.levelup-flash__level {
  font-size: 3.5rem;
  font-weight: 900;
  color: #fff;
  margin: 0;
  line-height: 1;
  text-shadow: 0 0 40px rgba(34, 197, 94, 0.6), 0 0 80px rgba(34, 197, 94, 0.3);
  animation: pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both;
}

.levelup-flash__title {
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  animation: pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
}

/* Flash overlay transitions */
.levelup-flash-enter-active { transition: opacity 0.3s ease; }
.levelup-flash-leave-active { transition: opacity 0.8s ease 1.8s; }
.levelup-flash-enter-from,
.levelup-flash-leave-to     { opacity: 0; }

@keyframes bounce-up {
  0%   { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0);    opacity: 1; }
}

@keyframes pop-in {
  0%   { transform: scale(0.7); opacity: 0; }
  100% { transform: scale(1);   opacity: 1; }
}

/* Mobile: narrower stack */
@media (max-width: 480px) {
  .toast-stack {
    right: 12px;
    left: 12px;
    width: auto;
  }
}
</style>
