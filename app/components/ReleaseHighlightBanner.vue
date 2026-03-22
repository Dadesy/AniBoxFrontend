<template>
  <Transition name="banner">
    <aside
      v-if="show"
      class="release-banner relative z-40 w-full border-b border-[var(--cinema-border)] bg-[var(--cinema-surface)] shadow-[inset_0_1px_0_var(--cinema-border-soft)]"
      role="status"
      aria-live="polite"
    >
      <!-- Контент по той же сетке, что и main (max-w-screen-2xl + px) — без «уезда» влево/вправо -->
      <div
        class="mx-auto flex min-h-11 max-w-screen-2xl items-stretch sm:min-h-[3.25rem]"
      >
        <div
          class="rel-accent-bar w-1 shrink-0 sm:w-2"
          aria-hidden="true"
        />
        <div
          class="rel-icon-slot flex w-9 shrink-0 items-center justify-center border-r border-[var(--cinema-border)] bg-black/[0.06] sm:w-14 dark:bg-black/20"
          aria-hidden="true"
        >
          <span class="rel-dot" />
        </div>

        <div
          class="flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5 sm:gap-4 sm:px-4 sm:py-3"
        >
          <UIcon
            name="lucide:sparkles"
            class="hidden size-5 shrink-0 text-[var(--accent-green)] sm:block"
          />

          <div
            class="grid min-w-0 flex-1 gap-1.5 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-6 sm:gap-y-2"
          >
            <div class="min-w-0 space-y-0 sm:space-y-0.5">
              <p class="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 sm:gap-x-2 sm:gap-y-1">
                <span
                  class="text-[11px] font-extrabold uppercase tracking-wide text-[var(--logo-text)] sm:text-sm"
                >
                  Обновление
                </span>
                <span
                  v-if="fresh?.version"
                  class="inline-flex max-w-full truncate rounded-md bg-[var(--accent-green-soft)] px-1.5 py-px text-[10px] font-bold tabular-nums text-[var(--accent-green)] ring-1 ring-[var(--accent-green-border)] sm:px-2 sm:py-0.5 sm:text-xs"
                >
                  {{ fresh.version }}
                </span>
              </p>
              <p
                v-if="fresh?.date"
                class="hidden text-[11px] leading-snug text-[var(--ui-text-muted)] sm:block sm:text-xs"
              >
                Дата релиза: {{ fresh.date }}
              </p>
            </div>

            <div
              class="flex flex-shrink-0 flex-wrap items-center gap-1.5 sm:justify-end sm:gap-2"
            >
              <NuxtLink
                to="/updates"
                class="inline-flex items-center justify-center rounded-lg bg-[var(--accent-green-soft)] px-2 py-1 text-[10px] font-semibold text-[var(--accent-green)] ring-1 ring-[var(--accent-green-border)] transition-colors hover:bg-[var(--accent-green-softer)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-green)] sm:rounded-xl sm:px-3 sm:py-2 sm:text-xs"
              >
                <span class="sm:hidden">Изменения</span>
                <span class="hidden sm:inline">Что изменилось</span>
              </NuxtLink>
              <a
                v-if="fresh?.versionUrl"
                :href="fresh.versionUrl"
                class="hidden items-center justify-center rounded-xl border border-[var(--cinema-border)] px-3 py-2 text-xs font-medium text-[var(--ui-text-muted)] transition-colors hover:border-[var(--accent-green-border)] hover:text-[var(--logo-text)] sm:inline-flex"
                target="_blank"
                rel="noopener noreferrer"
              >
                Релиз ↗
              </a>
            </div>
          </div>
        </div>

        <button
          type="button"
          class="flex w-9 shrink-0 items-center justify-center border-l border-[var(--cinema-border)] text-[var(--ui-text-muted)] transition-colors hover:bg-black/[0.04] hover:text-[var(--logo-text)] sm:w-12 dark:hover:bg-white/[0.06]"
          aria-label="Скрыть уведомление"
          @click="dismissed = true"
        >
          <UIcon name="lucide:x" class="size-4 sm:size-5" />
        </button>
      </div>
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
  transform: translateY(-4px);
}
.banner-enter-to,
.banner-leave-from {
  opacity: 1;
  max-height: 200px;
  transform: translateY(0);
}

.rel-accent-bar {
  background: linear-gradient(
    180deg,
    var(--accent-green) 0%,
    #4ade80 50%,
    #22c55e 100%
  );
  box-shadow: 2px 0 10px rgba(74, 222, 128, 0.2);
}

.rel-dot {
  width: 7px;
  height: 7px;
  border-radius: 9999px;
  background: var(--accent-green);
  box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.4);
  animation: rel-dot-pulse 2.2s ease-out infinite;
}

@media (min-width: 640px) {
  .rel-dot {
    width: 9px;
    height: 9px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .rel-dot {
    animation: none;
    box-shadow: none;
  }
}

@keyframes rel-dot-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.4);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(74, 222, 128, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(74, 222, 128, 0);
  }
}
</style>
