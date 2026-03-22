import { nextTick, onBeforeUnmount, ref, watch, type Ref } from 'vue'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

function focusableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) =>
      !el.hasAttribute('disabled')
      && el.getAttribute('aria-hidden') !== 'true'
      && (el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement),
  )
}

/**
 * Ловушка фокуса для модалок / bottom sheet: Tab циклически внутри root, Escape не обрабатывается здесь.
 */
export function useFocusTrap(rootRef: Ref<HTMLElement | null>, active: Ref<boolean>): void {
  const previousActive = ref<HTMLElement | null>(null)

  function onKeydown(e: KeyboardEvent): void {
    if (!active.value || e.key !== 'Tab') return
    const root = rootRef.value
    if (!root) return
    const list = focusableElements(root)
    if (list.length === 0) return
    const first = list[0]!
    const last = list[list.length - 1]!
    if (e.shiftKey) {
      if (document.activeElement === first || !root.contains(document.activeElement)) {
        e.preventDefault()
        last.focus()
      }
    } else if (document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  watch(
    active,
    (v) => {
      if (!import.meta.client) return
      if (v) {
        previousActive.value = document.activeElement as HTMLElement | null
        nextTick(() => {
          const root = rootRef.value
          if (!root) return
          const list = focusableElements(root)
          list[0]?.focus()
        })
        document.addEventListener('keydown', onKeydown)
      } else {
        document.removeEventListener('keydown', onKeydown)
        previousActive.value?.focus?.()
        previousActive.value = null
      }
    },
    { flush: 'post', immediate: true },
  )

  onBeforeUnmount(() => {
    if (import.meta.client) document.removeEventListener('keydown', onKeydown)
  })
}
