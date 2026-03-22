<!--
  components/common/BottomSheet.vue
  Мобильный bottom sheet: safe-area, закрытие по overlay и свайпу вниз с ручки.
-->
<template>
  <Teleport to="body">
    <Transition name="bottom-sheet-fade">
      <div
        v-if="open"
        class="fixed inset-0 z-[100] flex flex-col justify-end lg:hidden"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
      >
        <button
          type="button"
          tabindex="-1"
          class="absolute inset-0 bg-black/55 backdrop-blur-[2px] motion-safe:transition-opacity"
          aria-label="Закрыть"
          @click="close"
        />

        <Transition :name="panelTransitionName">
          <div
            v-if="open"
            ref="panelRef"
            class="relative z-[1] max-h-[min(88dvh,560px)] w-full overflow-hidden rounded-t-2xl border border-white/[0.08] bg-[var(--cinema-surface)] shadow-2xl motion-safe:transition-transform motion-reduce:transition-none"
            :class="reducedMotion ? '' : 'duration-300 ease-out'"
            :style="sheetStyle"
          >
            <div
              ref="handleRef"
              class="flex cursor-grab touch-none justify-center py-3 active:cursor-grabbing"
              aria-hidden="true"
            >
              <span
                class="h-1 w-10 rounded-full bg-white/20"
              />
            </div>

            <div
              v-if="title || $slots.title"
              :id="titleId"
              class="border-b border-white/[0.06] px-4 pb-3 pt-0"
            >
              <slot name="title">
                <h2 class="text-base font-semibold text-white">{{ title }}</h2>
              </slot>
            </div>

            <div class="max-h-[min(72dvh,480px)] overflow-y-auto overscroll-contain px-4 py-3">
              <slot />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useSwipeToDismiss } from '~/composables/useGesture'
import { useFocusTrap } from '~/composables/useFocusTrap'

const open = defineModel<boolean>('open', { default: false })

withDefaults(
  defineProps<{
    title?: string
  }>(),
  { title: '' },
)

const panelRef = ref<HTMLElement | null>(null)
const handleRef = ref<HTMLElement | null>(null)
const titleId = `bottom-sheet-title-${Math.random().toString(36).slice(2, 9)}`

const reducedMotion = ref(false)

const panelTransitionName = computed(() =>
  reducedMotion.value ? 'bottom-sheet-panel-none' : 'bottom-sheet-panel',
)

const sheetStyle = computed(() => ({
  paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 12px)',
}))

function close() {
  open.value = false
}

useSwipeToDismiss(handleRef, close, { threshold: 64 })

useFocusTrap(panelRef, open)

function setBodyLock(locked: boolean) {
  if (!import.meta.client) return
  document.documentElement.classList.toggle('bottom-sheet-lock', locked)
}

watch(open, (v) => {
  setBodyLock(v)
  if (v && import.meta.client) {
    reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }
})

onMounted(() => {
  if (import.meta.client) {
    reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (open.value) setBodyLock(true)
  }
})

onBeforeUnmount(() => {
  setBodyLock(false)
})
</script>

<style scoped>
.bottom-sheet-fade-enter-active,
.bottom-sheet-fade-leave-active {
  transition: opacity 0.2s ease;
}
.bottom-sheet-fade-enter-from,
.bottom-sheet-fade-leave-to {
  opacity: 0;
}

.bottom-sheet-panel-enter-active,
.bottom-sheet-panel-leave-active {
  transition: transform 0.28s cubic-bezier(0.32, 0.72, 0, 1);
}
.bottom-sheet-panel-enter-from,
.bottom-sheet-panel-leave-to {
  transform: translateY(105%);
}

.bottom-sheet-panel-none-enter-active,
.bottom-sheet-panel-none-leave-active {
  transition: none;
}
</style>
