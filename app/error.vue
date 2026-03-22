<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const { siteName } = useSiteBranding()
const isDev = import.meta.dev

const is404 = computed(() => props.error.statusCode === 404)

const title = computed(() =>
  is404.value ? 'Страница не найдена' : 'Что-то пошло не так',
)
const description = computed(() =>
  is404.value
    ? 'Возможно, ссылка устарела или страница была удалена.'
    : 'Произошла непредвиденная ошибка. Попробуйте обновить страницу.',
)

useSeoMeta({
  title: computed(() => `${title.value} — ${siteName.value}`),
  robots: 'noindex',
})

function handleError() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div
    class="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0e] px-4 text-center"
  >
    <!-- Glow accent -->
    <div
      class="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div
        class="absolute left-1/2 top-1/3 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20"
        :class="is404 ? 'bg-emerald-500/30 blur-[120px]' : 'bg-red-500/20 blur-[120px]'"
      />
    </div>

    <div class="relative z-10 flex flex-col items-center gap-6 max-w-sm">
      <!-- Status code -->
      <p
        class="text-[7rem] font-black leading-none tabular-nums"
        :class="is404 ? 'text-emerald-500/20' : 'text-red-500/20'"
      >
        {{ error.statusCode }}
      </p>

      <!-- Icon -->
      <div
        class="flex h-16 w-16 items-center justify-center rounded-2xl"
        :class="is404 ? 'bg-emerald-500/10' : 'bg-red-500/10'"
      >
        <UIcon
          :name="is404 ? 'lucide:file-question' : 'lucide:triangle-alert'"
          class="size-8"
          :class="is404 ? 'text-emerald-400' : 'text-red-400'"
        />
      </div>

      <div class="space-y-2">
        <h1 class="text-2xl font-bold text-white">{{ title }}</h1>
        <p class="text-sm leading-relaxed text-white/45">{{ description }}</p>
      </div>

      <div class="flex flex-col gap-2.5 w-full sm:flex-row sm:justify-center">
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 active:scale-[0.98]"
          @click="handleError"
        >
          <UIcon name="lucide:house" class="size-4" />
          На главную
        </button>

        <button
          v-if="!is404"
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-xl border border-white/12 px-6 py-2.5 text-sm font-medium text-white/70 transition-all hover:border-white/25 hover:text-white"
          @click="() => location.reload()"
        >
          <UIcon name="lucide:refresh-cw" class="size-4" />
          Обновить страницу
        </button>
      </div>

      <!-- Debug info in dev only -->
      <details
        v-if="isDev && error.message"
        class="w-full rounded-lg border border-white/8 bg-white/4 p-3 text-left"
      >
        <summary class="cursor-pointer text-xs text-white/30">Подробности ошибки</summary>
        <pre class="mt-2 overflow-auto text-[11px] text-red-400/80">{{ error.message }}</pre>
      </details>
    </div>
  </div>
</template>
