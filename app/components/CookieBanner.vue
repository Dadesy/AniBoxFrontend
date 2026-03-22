<script setup lang="ts">
/**
 * CookieBanner — informational consent notice.
 * Shows once per browser session (localStorage key).
 * Does NOT block Yandex.Metrika — just informs the user.
 * Dismiss is persisted so it never re-appears after acceptance.
 */

const STORAGE_KEY = 'cookie-consent-v1'

const visible = ref(false)
const route = useRoute()

/** Над фиксированным BottomNav (как в футере), на watch/admin панели нет */
const reserveBottomNav = computed(
  () =>
    !route.path.startsWith('/watch/') && !route.path.startsWith('/admin'),
)

onMounted(() => {
  try {
    if (!localStorage.getItem(STORAGE_KEY)) {
      visible.value = true
    }
  } catch {
    // localStorage unavailable (private mode, etc.) — show banner anyway
    visible.value = true
  }
})

function accept() {
  visible.value = false
  try {
    localStorage.setItem(STORAGE_KEY, '1')
  } catch { /* ignore */ }
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <div
      v-if="visible"
      role="dialog"
      aria-live="polite"
      aria-label="Уведомление об использовании cookie"
      class="cookie-banner-root fixed bottom-0 left-0 right-0 z-[800]"
    >
      <!-- Gradient lift -->
      <div
        class="pointer-events-none absolute inset-x-0 bottom-0 h-28"
        aria-hidden="true"
        style="background: linear-gradient(to top, rgba(8,8,10,0.85) 0%, transparent 100%);"
      />

      <div
        class="relative mx-auto max-w-screen-md px-4 sm:px-6"
        :class="
          reserveBottomNav
            ? 'mb-[calc(var(--app-bottom-nav-height)+0.75rem)] sm:mb-5'
            : 'mb-4 sm:mb-5'
        "
      >
        <div
          class="flex flex-col gap-3 rounded-2xl border border-white/[0.09] bg-[#111116]/95 px-4 py-3.5 shadow-2xl shadow-black/60 backdrop-blur-md sm:flex-row sm:items-center sm:gap-4 sm:px-5"
        >
          <!-- Icon -->
          <UIcon
            name="lucide:cookie"
            class="hidden shrink-0 text-amber-400/80 sm:block size-5"
            aria-hidden="true"
          />

          <!-- Text -->
          <p class="flex-1 text-[13px] leading-relaxed text-slate-400">
            Мы используем аналитические cookie
            (<a
              href="https://metrika.yandex.ru"
              target="_blank"
              rel="noopener noreferrer"
              class="text-slate-300 underline underline-offset-2 hover:text-white"
            >Яндекс.Метрика</a>)
            для улучшения сайта. Подробнее —
            <NuxtLink
              to="/privacy"
              class="text-slate-300 underline underline-offset-2 hover:text-white"
            >
              политика конфиденциальности
            </NuxtLink>.
          </p>

          <!-- Accept button -->
          <button
            type="button"
            class="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-emerald-500/90 px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 active:scale-[0.97]"
            @click="accept"
          >
            <UIcon name="lucide:check" class="size-3.5" />
            Понятно
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Нижний safe-area + запас над системной кромкой; отступ под таб-бар через mb на внутреннем блоке */
.cookie-banner-root {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
</style>
