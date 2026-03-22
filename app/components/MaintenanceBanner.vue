<template>
  <Transition name="banner">
    <aside
      v-if="show"
      class="flex flex-col gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.06] px-4 py-4 shadow-lg shadow-emerald-500/10 sm:flex-row sm:items-center sm:justify-between sm:px-5"
      role="status"
      aria-live="polite"
    >
      <div class="flex min-w-0 items-start gap-3 sm:items-center">
        <UIcon
          name="lucide:wrench"
          class="mt-0.5 size-5 shrink-0 text-emerald-400 sm:mt-0 sm:size-[1.35rem]"
          aria-hidden="true"
        />
        <div class="min-w-0 space-y-1">
          <p class="text-[11px] font-bold uppercase tracking-wider text-emerald-400/90">
            Техработы · источники
          </p>
          <p class="text-sm leading-snug text-white/80">
            {{ bannerText }}
          </p>
        </div>
      </div>

      <button
        type="button"
        class="inline-flex shrink-0 items-center justify-center self-end rounded-lg p-2 text-white/35 transition-colors hover:bg-white/10 hover:text-white/70 sm:self-center"
        aria-label="Скрыть предупреждение"
        @click="dismissed = true"
      >
        <UIcon name="lucide:x" class="size-5" />
      </button>
    </aside>
  </Transition>
</template>

<script setup lang="ts">
const {
  hasMaintenance,
  isAnilibriaDown,
  isKodikDown,
  isShikimoriDown,
} = useKodikStatus()
const { bootOverlayRemoved } = useAppLoader()
const dismissed = ref(false)

const issueKey = computed(() => [
  isAnilibriaDown.value ? 'anilibria' : '',
  isKodikDown.value ? 'kodik' : '',
  isShikimoriDown.value ? 'shikimori' : '',
].filter(Boolean).join('|'))

watch(issueKey, (next, prev) => {
  if (next && next !== prev) dismissed.value = false
})

const bannerText = computed(() => {
  if (isShikimoriDown.value && isKodikDown.value) {
    return 'Shikimori и Kodik временно недоступны. Просмотр части тайтлов и метаданные могут работать с ограничениями.'
  }
  if (isShikimoriDown.value) {
    return 'Shikimori временно недоступен. Метаданные, карточки и часть переходов могут работать с ограничениями.'
  }
  if (isKodikDown.value && isAnilibriaDown.value) {
    return 'Оба плеера временно недоступны. Просмотр может быть ограничен до восстановления источников.'
  }
  if (isKodikDown.value) {
    return 'Kodik временно недоступен. Просмотр части тайтлов может быть ограничен, AniLibria продолжает работать.'
  }
  if (isAnilibriaDown.value) {
    return 'AniLibria временно недоступна. Просмотр части релизов может быть ограничен, остальные разделы работают.'
  }
  return 'Один из источников временно недоступен. Возможны ограничения в просмотре и метаданных.'
})

const show = computed(
  () => bootOverlayRemoved.value && hasMaintenance.value && !dismissed.value,
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
  max-height: 12rem;
  transform: translateY(0);
}
</style>
