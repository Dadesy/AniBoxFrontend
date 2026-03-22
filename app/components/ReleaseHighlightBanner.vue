<template>
  <Transition name="banner">
    <aside
      v-if="show"
      class="release-banner relative z-40 flex min-h-[3.25rem] w-full items-stretch overflow-hidden"
      role="status"
      aria-live="polite"
    >
      <div class="rel-stripe w-1.5 shrink-0 sm:w-2" aria-hidden="true" />
      <div
        class="rel-pulse-col flex w-12 shrink-0 items-center justify-center sm:w-14"
        aria-hidden="true"
      >
        <span class="rel-pulse-ring">
          <span class="rel-pulse-dot" />
        </span>
      </div>

      <div
        class="flex min-w-0 flex-1 flex-col justify-center gap-1 py-2.5 pr-2 sm:flex-row sm:items-center sm:gap-4 sm:py-3 sm:pr-4"
      >
        <div class="flex min-w-0 items-start gap-2 sm:items-center">
          <UIcon
            name="lucide:sparkles"
            class="rel-icon-accent mt-0.5 size-[1.15rem] shrink-0 sm:mt-0 sm:size-5"
          />
          <div class="min-w-0">
            <p class="rel-headline text-[13px] font-extrabold uppercase tracking-wide sm:text-sm">
              Новая версия
              <template v-if="fresh?.version">
                · {{ fresh.version }}
              </template>
            </p>
            <p class="rel-body text-xs leading-snug sm:text-[13px]">
              <span v-if="fresh?.date">от {{ fresh.date }} · </span>
              <NuxtLink
                to="/updates"
                class="font-semibold text-green-300 underline decoration-green-500/40 underline-offset-2 transition-colors hover:text-green-200"
              >
                Что изменилось
              </NuxtLink>
              <template v-if="fresh?.versionUrl">
                <span class="text-zinc-500"> · </span>
                <a
                  :href="fresh.versionUrl"
                  class="font-medium text-zinc-400 underline decoration-white/15 underline-offset-2 transition-colors hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Релиз ↗
                </a>
              </template>
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        class="rel-close flex shrink-0 items-center justify-center px-3 transition-colors sm:px-4"
        aria-label="Скрыть уведомление"
        @click="dismissed = true"
      >
        <UIcon name="lucide:x" class="size-4 sm:size-5" />
      </button>
    </aside>
  </Transition>
</template>

<script setup lang="ts">
import type { ChangelogApiResponse } from '~/types/changelog'

const { bootOverlayRemoved } = useAppLoader()
const dismissed = ref(false)

const { data } = useFetch<ChangelogApiResponse>('/api/changelog', {
  key: 'changelog',
})

const fresh = computed(() => data.value?.freshRelease ?? null)

const show = computed(
  () =>
    bootOverlayRemoved.value &&
    !!fresh.value &&
    !dismissed.value,
)
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

.release-banner {
  background: linear-gradient(100deg, #27272a 0%, #3f3f46 50%, #2d2d30 100%) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow:
    0 2px 16px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.rel-stripe {
  background: linear-gradient(180deg, #86efac 0%, #4ade80 45%, #22c55e 100%);
  box-shadow: 2px 0 12px rgba(74, 222, 128, 0.25);
}

.rel-pulse-col {
  background: rgba(0, 0, 0, 0.15);
}

.rel-pulse-ring {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
}

.rel-pulse-dot {
  position: relative;
  z-index: 1;
  width: 10px;
  height: 10px;
  border-radius: 9999px;
  background: #4ade80;
  box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.45);
  animation: rel-pulse 2s ease-out infinite;
}

.rel-icon-accent {
  color: #86efac !important;
}

.rel-headline {
  color: #fafafa !important;
}

.rel-body {
  color: rgba(212, 212, 216, 0.88) !important;
}

.rel-close {
  color: rgba(161, 161, 170, 0.85) !important;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
}
.rel-close:hover {
  color: #fafafa !important;
  background: rgba(255, 255, 255, 0.06);
}

:global(html.light) .release-banner {
  background: linear-gradient(180deg, #ffffff 0%, #fafafa 55%, #f4f4f5 100%) !important;
  border-bottom: 1px solid #e4e4e7 !important;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.8) inset,
    0 4px 20px -4px rgba(24, 24, 27, 0.08),
    0 2px 8px -2px rgba(24, 24, 27, 0.04);
}

:global(html.light) .rel-stripe {
  background: linear-gradient(180deg, #bbf7d0 0%, #4ade80 55%, #16a34a 100%);
  box-shadow:
    inset -1px 0 0 rgba(255, 255, 255, 0.35),
    2px 0 14px rgba(22, 163, 74, 0.12);
}

:global(html.light) .rel-pulse-col {
  background: linear-gradient(180deg, #f4f4f5 0%, #e4e4e7 100%);
  border-right: 1px solid #e4e4e7;
}

:global(html.light) .rel-pulse-dot {
  background: #16a34a;
  box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.28);
  animation: rel-pulse-light 2s ease-out infinite;
}

:global(html.light) .rel-icon-accent {
  color: #15803d !important;
}

:global(html.light) .rel-headline {
  color: #09090b !important;
}

:global(html.light) .rel-body {
  color: #52525b !important;
}

:global(html.light) .rel-close {
  color: #a1a1aa !important;
  border-left: 1px solid #e4e4e7;
}
:global(html.light) .rel-close:hover {
  color: #18181b !important;
  background: #f4f4f5 !important;
}

@keyframes rel-pulse {
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

@keyframes rel-pulse-light {
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
  .rel-pulse-dot {
    animation: none;
    box-shadow: none;
  }
  :global(html.light) .rel-pulse-dot {
    animation: none;
    box-shadow: none;
  }
}
</style>
