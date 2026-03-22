/**
 * composables/useGesture.ts
 *
 * Обёртки над useSwipe для типовых сценариев (модалки, bottom sheet).
 */

import type { MaybeRefOrGetter } from 'vue'
import { useSwipe, type SwipeDirection, type UseSwipeOptions } from '~/composables/useSwipe'

export type { SwipeDirection, UseSwipeOptions } from '~/composables/useSwipe'
export { useSwipe } from '~/composables/useSwipe'

/** Свайп вниз для закрытия панели (threshold чуть ниже, чем у горизонтали). */
export function useSwipeToDismiss(
  target: MaybeRefOrGetter<HTMLElement | null>,
  onDismiss: () => void,
  options: Pick<UseSwipeOptions, 'threshold'> = {},
) {
  const threshold = options.threshold ?? 72
  return useSwipe(
    target,
    (dir) => {
      if (dir === 'down') onDismiss()
    },
    { axis: 'vertical', ratio: 1.05, threshold },
  )
}
