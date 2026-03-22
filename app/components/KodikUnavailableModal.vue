<script setup lang="ts">
/**
 * Одноразово за сессию — если плеер недоступен (по статусу с сервера).
 */
import { useFocusTrap } from '~/composables/useFocusTrap'

const STORAGE_KEY = 'site-player-unavailable-modal-dismissed'

const { isKodikDown } = useKodikStatus()
const { bootOverlayRemoved } = useAppLoader()

const open = ref(false)
const kodikTrapRef = ref<HTMLElement | null>(null)

useFocusTrap(kodikTrapRef, open)

function isDismissed(): boolean {
  if (!import.meta.client) return false
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function markDismissed(): void {
  if (!import.meta.client) return
  try {
    sessionStorage.setItem(STORAGE_KEY, '1')
  } catch {
    /* ignore */
  }
}

function clearDismissed(): void {
  if (!import.meta.client) return
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

function syncOpen() {
  if (!import.meta.client) return
  // Пока boot-лоадер на экране (или уходит Transition) — не показывать поверх него
  if (!bootOverlayRemoved.value) {
    open.value = false
    return
  }
  if (!isKodikDown.value) {
    clearDismissed()
    open.value = false
    return
  }
  open.value = !isDismissed()
}

watch(
  () => [isKodikDown.value, bootOverlayRemoved.value] as const,
  () => syncOpen(),
  { flush: 'post' },
)

onMounted(() => {
  syncOpen()
  window.addEventListener('keydown', onKeydown)
})

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) onConfirm()
}

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('keydown', onKeydown)
  }
})

function onConfirm() {
  markDismissed()
  open.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition name="kodik-modal">
      <div
        v-if="open"
        class="kodik-modal-root fixed inset-0 z-[2147483645] flex items-center justify-center p-4 sm:p-6"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="kodik-modal-title"
        aria-describedby="kodik-modal-desc"
      >
        <div
          class="kodik-modal-backdrop absolute inset-0 z-0"
          aria-hidden="true"
          @click="onConfirm"
        />

        <div
          ref="kodikTrapRef"
          class="kodik-modal-panel relative z-10 w-full max-w-md overflow-hidden rounded-[var(--app-radius-2xl)]"
        >
          <div class="kodik-modal-accent" aria-hidden="true" />

          <div class="kodik-modal-inner px-5 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
            <div class="mb-4 flex items-start gap-3">
              <div
                class="kodik-modal-icon-wrap flex size-11 shrink-0 items-center justify-center rounded-xl"
              >
                <UIcon name="lucide:monitor-play" class="size-5" />
              </div>
              <div class="min-w-0 flex-1 pt-0.5">
                <h2
                  id="kodik-modal-title"
                  class="kodik-modal-title text-base font-bold leading-tight sm:text-lg"
                >
                  Плеер временно недоступен
                </h2>
                <p id="kodik-modal-desc" class="kodik-modal-desc mt-2 text-sm leading-relaxed">
                  Плеер сейчас может работать нестабильно: эпизоды иногда не открываются или воспроизводятся с
                  ошибками. Каталог, списки и профиль доступны как обычно. Мы следим за состоянием сервиса.
                </p>
              </div>
            </div>

            <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <UButton color="primary" block class="sm:!w-auto" @click="onConfirm">
                Понятно
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Тёмная тема: явный фон + blur в CSS (tailwind backdrop-blur мог обнулять/перебивать фон в Teleport) */
.kodik-modal-backdrop {
  z-index: 0;
  background-color: rgba(0, 0, 0, 0.68) !important;
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}

.kodik-modal-enter-active,
.kodik-modal-leave-active {
  transition: opacity 0.2s ease;
}
.kodik-modal-enter-active .kodik-modal-panel,
.kodik-modal-leave-active .kodik-modal-panel {
  transition:
    transform 0.22s ease,
    opacity 0.22s ease;
}
.kodik-modal-enter-from,
.kodik-modal-leave-to {
  opacity: 0;
}
.kodik-modal-enter-from .kodik-modal-panel,
.kodik-modal-leave-to .kodik-modal-panel {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}

/* Тёмная тема: нейтральная карточка, зелёный только полоска + иконка */
.kodik-modal-panel {
  background: linear-gradient(165deg, #1c1c1f 0%, #18181b 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.55),
    0 0 0 1px rgba(255, 255, 255, 0.04);
}
.kodik-modal-accent {
  height: 3px;
  width: 100%;
  background: linear-gradient(90deg, #86efac, #4ade80, #22c55e, #4ade80);
  background-size: 200% 100%;
  animation: kodik-accent-shift 4s ease-in-out infinite;
}
.kodik-modal-icon-wrap {
  background: rgba(74, 222, 128, 0.12);
  color: #86efac;
}
.kodik-modal-title {
  color: #fafafa;
}
.kodik-modal-desc {
  color: #a1a1aa;
}

/* Светлая тема: нейтральная карточка «как системный диалог» */
:global(html.light) .kodik-modal-backdrop {
  background-color: rgba(24, 24, 27, 0.48) !important;
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}

:global(html.light) .kodik-modal-panel {
  background: #ffffff;
  border: 1px solid #e4e4e7;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.6) inset,
    0 1px 2px rgba(24, 24, 27, 0.04),
    0 24px 48px -12px rgba(24, 24, 27, 0.14),
    0 12px 24px -8px rgba(24, 24, 27, 0.08);
}

:global(html.light) .kodik-modal-accent {
  height: 3px;
  background: linear-gradient(90deg, #bbf7d0, #4ade80, #22c55e, #4ade80);
  background-size: 200% 100%;
  opacity: 0.95;
}

:global(html.light) .kodik-modal-icon-wrap {
  background: linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 100%);
  border: 1px solid #bbf7d0;
  color: #15803d;
  box-shadow: 0 1px 2px rgba(22, 163, 74, 0.06);
}

:global(html.light) .kodik-modal-title {
  color: #09090b;
  letter-spacing: -0.01em;
}

:global(html.light) .kodik-modal-desc {
  color: #3f3f46;
}

:global(html.light) .kodik-modal-inner {
  background: linear-gradient(180deg, #fafafa 0%, #ffffff 28%);
}

@keyframes kodik-accent-shift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .kodik-modal-accent {
    animation: none;
    background: linear-gradient(90deg, #86efac, #22c55e);
  }
}
</style>
