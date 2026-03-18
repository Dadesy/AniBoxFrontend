// Lightweight global toast bus.
// Used by library, gamification, and any other feature that needs toasts.

export type ToastType = 'success' | 'info' | 'error'

export interface Toast {
  id: number
  type: ToastType
  icon?: string
  title: string
  sub?: string
  durationMs?: number
}

type ToastListener = (toast: Toast) => void
type DismissListener = (id: number) => void

const addListeners     = new Set<ToastListener>()
const dismissListeners = new Set<DismissListener>()
let _nextId = 0

export const toastBus = {
  onAdd(fn: ToastListener):     () => void { addListeners.add(fn);     return () => addListeners.delete(fn) },
  onDismiss(fn: DismissListener): () => void { dismissListeners.add(fn); return () => dismissListeners.delete(fn) },
  add(toast: Omit<Toast, 'id'>): number {
    const id = _nextId++
    addListeners.forEach(fn => fn({ ...toast, id }))
    return id
  },
  dismiss(id: number) {
    dismissListeners.forEach(fn => fn(id))
  },
}

// ── Convenience helpers ───────────────────────────────────────────────────────

export function useToast() {
  function success(title: string, sub?: string, icon = '✓') {
    return toastBus.add({ type: 'success', icon, title, sub })
  }
  function info(title: string, sub?: string, icon?: string) {
    return toastBus.add({ type: 'info', icon, title, sub })
  }
  function error(title: string, sub?: string) {
    return toastBus.add({ type: 'error', icon: '✕', title, sub })
  }
  return { success, info, error }
}
