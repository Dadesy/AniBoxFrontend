<template>
  <Transition name="banner">
    <aside
      v-if="show"
      class="maintenance-banner relative z-40 flex min-h-[3.25rem] w-full items-stretch overflow-hidden"
      role="status"
      aria-live="polite"
    >
      <!-- Акцент: только полоска + точка (зелёный) -->
      <div class="maint-stripe w-1.5 shrink-0 sm:w-2" aria-hidden="true" />
      <div
        class="maint-pulse-col flex w-12 shrink-0 items-center justify-center sm:w-14"
        aria-hidden="true"
      >
        <span class="maint-pulse-ring">
          <span class="maint-pulse-dot" />
        </span>
      </div>

      <div
        class="flex min-w-0 flex-1 flex-col justify-center gap-0.5 py-2.5 pr-2 sm:flex-row sm:items-center sm:gap-4 sm:py-3 sm:pr-4"
      >
        <div class="flex min-w-0 items-start gap-2 sm:items-center">
          <UIcon
            name="lucide:wrench"
            class="maint-icon-accent mt-0.5 size-[1.15rem] shrink-0 sm:mt-0 sm:size-5"
          />
          <div class="min-w-0">
            <p class="maint-headline text-[13px] font-extrabold uppercase tracking-wide sm:text-sm">
              Техработы · плеер Kodik
            </p>
            <p class="maint-body text-xs leading-snug sm:text-[13px]">
              Просмотр может быть недоступен. Каталог и аккаунт работают в обычном режиме.
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        class="maint-close flex shrink-0 items-center justify-center px-3 transition-colors sm:px-4"
        aria-label="Скрыть баннер"
        @click="dismissed = true"
      >
        <UIcon name="lucide:x" class="size-4 sm:size-5" />
      </button>
    </aside>
  </Transition>
</template>

<script setup lang="ts">
const { isKodikDown } = useKodikStatus()
const dismissed = ref(false)

const show = computed(() => isKodikDown.value && !dismissed.value)
</script>

<style scoped>
.banner-enter-active,
.banner-leave-active {
  transition:
    opacity 0.28s ease,
    max-height 0.32s ease,
    transform 0.28s ease;
}
.banner-enter-from,
.banner-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-6px);
}
.banner-enter-to,
.banner-leave-from {
  opacity: 1;
  max-height: 140px;
  transform: translateY(0);
}

/* Тёмная тема: нейтральный фон, зелёный только полоска / иконка / пульс */
.maintenance-banner {
  background: linear-gradient(100deg, #27272a 0%, #3f3f46 50%, #2d2d30 100%) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow:
    0 2px 16px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.maint-stripe {
  background: linear-gradient(180deg, #bbf7d0 0%, #4ade80 45%, #22c55e 100%);
  box-shadow: 2px 0 12px rgba(74, 222, 128, 0.25);
}

.maint-pulse-col {
  background: rgba(0, 0, 0, 0.15);
}

.maint-pulse-ring {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
}

.maint-pulse-dot {
  position: relative;
  z-index: 1;
  width: 10px;
  height: 10px;
  border-radius: 9999px;
  background: #4ade80;
  box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.45);
  animation: maint-pulse 2s ease-out infinite;
}

.maint-icon-accent {
  color: #86efac !important;
}

.maint-headline {
  color: #fafafa !important;
}

.maint-body {
  color: rgba(212, 212, 216, 0.88) !important;
}

.maint-close {
  color: rgba(161, 161, 170, 0.85) !important;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
}
.maint-close:hover {
  color: #fafafa !important;
  background: rgba(255, 255, 255, 0.06);
}

/* Светлая тема: «бумажный» белый, чёткая граница, зелёный только слева */
:global(html.light) .maintenance-banner {
  background: linear-gradient(180deg, #ffffff 0%, #fafafa 55%, #f4f4f5 100%) !important;
  border-bottom: 1px solid #e4e4e7 !important;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.8) inset,
    0 4px 20px -4px rgba(24, 24, 27, 0.08),
    0 2px 8px -2px rgba(24, 24, 27, 0.04);
}

:global(html.light) .maint-stripe {
  background: linear-gradient(180deg, #bbf7d0 0%, #4ade80 55%, #16a34a 100%);
  box-shadow:
    inset -1px 0 0 rgba(255, 255, 255, 0.35),
    2px 0 14px rgba(22, 163, 74, 0.12);
}

:global(html.light) .maint-pulse-col {
  background: linear-gradient(180deg, #f4f4f5 0%, #e4e4e7 100%);
  border-right: 1px solid #e4e4e7;
}

:global(html.light) .maint-pulse-dot {
  background: #16a34a;
  box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.28);
  animation: maint-pulse-light 2s ease-out infinite;
}

:global(html.light) .maint-icon-accent {
  color: #15803d !important;
}

:global(html.light) .maint-headline {
  color: #09090b !important;
  letter-spacing: 0.02em;
}

:global(html.light) .maint-body {
  color: #52525b !important;
  max-width: 62ch;
}

:global(html.light) .maint-close {
  color: #a1a1aa !important;
  border-left: 1px solid #e4e4e7;
}
:global(html.light) .maint-close:hover {
  color: #18181b !important;
  background: #f4f4f5 !important;
}
:global(html.light) .maint-close:active {
  background: #e4e4e7 !important;
}

@keyframes maint-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.45);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(74, 222, 128, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(74, 222, 128, 0);
  }
}

@keyframes maint-pulse-light {
  0% {
    box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.28);
  }
  70% {
    box-shadow: 0 0 0 9px rgba(22, 163, 74, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(22, 163, 74, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .maint-pulse-dot {
    animation: none;
    box-shadow: none;
  }
  :global(html.light) .maint-pulse-dot {
    animation: none;
    box-shadow: none;
  }
}
</style>
