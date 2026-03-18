<!--
  Global toast container.
  Mount once in default.vue.
  Driven by toastBus from useToast.ts.
-->
<template>
  <Teleport to="body">
    <div class="toast-container" aria-live="polite" aria-atomic="false">
      <TransitionGroup name="t" tag="div" class="toast-container__list">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="`toast--${toast.type}`"
          role="status"
        >
          <span v-if="toast.icon" class="toast__icon" aria-hidden="true">{{ toast.icon }}</span>
          <div class="toast__body">
            <p class="toast__title">{{ toast.title }}</p>
            <p v-if="toast.sub" class="toast__sub">{{ toast.sub }}</p>
          </div>
          <button class="toast__close" aria-label="Закрыть" @click="dismiss(toast.id)">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { toastBus, type Toast } from '~/composables/useToast'

const DEFAULT_DURATION = 3500

const toasts = ref<Toast[]>([])
const timers = new Map<number, ReturnType<typeof setTimeout>>()

function dismiss(id: number) {
  const idx = toasts.value.findIndex(t => t.id === id)
  if (idx !== -1) toasts.value.splice(idx, 1)
  const timer = timers.get(id)
  if (timer) { clearTimeout(timer); timers.delete(id) }
  toastBus.dismiss(id)
}

let unsubAdd:     (() => void) | null = null
let unsubDismiss: (() => void) | null = null

onMounted(() => {
  unsubAdd = toastBus.onAdd((toast) => {
    toasts.value.push(toast)
    const duration = toast.durationMs ?? DEFAULT_DURATION
    const timer = setTimeout(() => dismiss(toast.id), duration)
    timers.set(toast.id, timer)
  })

  unsubDismiss = toastBus.onDismiss((id) => {
    const idx = toasts.value.findIndex(t => t.id === id)
    if (idx !== -1) toasts.value.splice(idx, 1)
  })
})

onUnmounted(() => {
  unsubAdd?.()
  unsubDismiss?.()
  timers.forEach(clearTimeout)
  timers.clear()
})
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 20px;
  right: 16px;
  z-index: 9998;
  pointer-events: none;
  width: 280px;
}

.toast-container__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

.toast {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  background: rgba(28, 28, 31, 0.96);
  backdrop-filter: blur(14px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  width: 100%;
}

.toast--success { border-color: rgba(34, 197, 94, 0.28); }
.toast--error   { border-color: rgba(239, 68, 68, 0.28); }
.toast--info    { border-color: rgba(255, 255, 255, 0.1); }

.toast__icon {
  font-size: 1rem;
  flex-shrink: 0;
  line-height: 1;
}

.toast__body  { flex: 1; min-width: 0; }

.toast__title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toast--success .toast__title { color: #86efac; }
.toast--error   .toast__title { color: #fca5a5; }

.toast__sub {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
  margin: 2px 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toast__close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  border-radius: 3px;
  transition: color 0.15s;
}
.toast__close:hover { color: rgba(255, 255, 255, 0.7); }

/* Transitions */
.t-enter-active { transition: all 0.28s cubic-bezier(0.34, 1.4, 0.64, 1); }
.t-leave-active { transition: all 0.22s ease; position: absolute; }
.t-enter-from   { opacity: 0; transform: translateX(16px) scale(0.95); }
.t-leave-to     { opacity: 0; transform: translateX(20px); }
.t-move         { transition: transform 0.25s ease; }

@media (max-width: 480px) {
  .toast-container {
    right: 10px;
    left: 10px;
    width: auto;
  }
}
</style>
