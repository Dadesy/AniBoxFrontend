/**
 * composables/useBottomSheet.ts
 *
 * Состояние bottom sheet + блокировка прокрутки фона (только клиент).
 */

export function useBottomSheet(initialOpen = false) {
  const open = ref(initialOpen)

  function show() {
    open.value = true
  }

  function hide() {
    open.value = false
  }

  function toggle() {
    open.value = !open.value
  }

  function lockBody(locked: boolean) {
    if (!import.meta.client) return
    document.documentElement.classList.toggle('bottom-sheet-lock', locked)
  }

  watch(open, (v) => lockBody(v), { flush: 'post' })

  onBeforeUnmount(() => {
    if (import.meta.client) document.documentElement.classList.remove('bottom-sheet-lock')
  })

  return {
    open,
    show,
    hide,
    toggle,
  }
}
