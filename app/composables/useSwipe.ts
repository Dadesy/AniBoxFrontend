/**
 * composables/useSwipe.ts
 *
 * Свайпы на pointer events (touch + mouse), без блокировки нативного scroll:
 * срабатывает по завершении жеста (pointerup/cancel), порог и соотношение dx/dy.
 */

import { onBeforeUnmount, toValue, watch, type MaybeRefOrGetter } from 'vue'

export type SwipeDirection = 'left' | 'right' | 'up' | 'down'

export interface UseSwipeOptions {
  /** Минимальное смещение по доминирующей оси, px */
  threshold?: number
  /** Горизонтальные / вертикальные / обе оси */
  axis?: 'horizontal' | 'vertical' | 'both'
  /**
   * Для horizontal: |dx| должен быть >= |dy| * ratio.
   * Снижает ложные срабатывания при вертикальном скролле страницы.
   */
  ratio?: number
}

const DEFAULT_THRESHOLD = 56
const DEFAULT_RATIO = 1.15

export function useSwipe(
  target: MaybeRefOrGetter<HTMLElement | null>,
  onSwipe: (direction: SwipeDirection) => void,
  options: UseSwipeOptions = {},
) {
  const threshold = options.threshold ?? DEFAULT_THRESHOLD
  const axis = options.axis ?? 'horizontal'
  const ratio = options.ratio ?? DEFAULT_RATIO

  let startX = 0
  let startY = 0
  let tracking = false
  let activePointerId: number | null = null

  function onPointerDown(e: PointerEvent) {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    const el = toValue(target)
    if (!el || !el.contains(e.target as Node)) return
    tracking = true
    activePointerId = e.pointerId
    startX = e.clientX
    startY = e.clientY
  }

  function finish(e: PointerEvent) {
    if (!tracking || e.pointerId !== activePointerId) return
    tracking = false
    activePointerId = null

    const dx = e.clientX - startX
    const dy = e.clientY - startY
    const adx = Math.abs(dx)
    const ady = Math.abs(dy)

    if (axis === 'horizontal') {
      if (adx < threshold || adx < ady * ratio) return
      onSwipe(dx > 0 ? 'right' : 'left')
      return
    }

    if (axis === 'vertical') {
      if (ady < threshold || ady < adx * ratio) return
      onSwipe(dy > 0 ? 'down' : 'up')
      return
    }

    // both — по доминирующей оси
    if (adx >= ady && adx >= threshold) {
      onSwipe(dx > 0 ? 'right' : 'left')
    } else if (ady > adx && ady >= threshold) {
      onSwipe(dy > 0 ? 'down' : 'up')
    }
  }

  let detach: (() => void) | undefined

  function attach(el: HTMLElement) {
    el.addEventListener('pointerdown', onPointerDown, { passive: true })
    el.addEventListener('pointerup', finish, { passive: true })
    el.addEventListener('pointercancel', finish, { passive: true })
    detach = () => {
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('pointerup', finish)
      el.removeEventListener('pointercancel', finish)
      detach = undefined
    }
  }

  const stop = watch(
    () => toValue(target),
    (el) => {
      detach?.()
      if (import.meta.server || !el) return
      attach(el)
    },
    { flush: 'post', immediate: true },
  )

  onBeforeUnmount(() => {
    stop()
    detach?.()
  })
}
