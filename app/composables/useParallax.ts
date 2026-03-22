/**
 * Tracks window.scrollY and returns a raw `scrollY` ref.
 * Use the `scrollY` value in template inline styles to create multi-speed parallax layers.
 *
 * Example: :style="{ transform: `translateY(${scrollY * 0.2}px)` }"
 * → the layer moves at 20% of scroll speed (appears "deeper" / farther away).
 */
export function useParallax() {
  const scrollY = ref(0)

  if (import.meta.client) {
    const update = () => { scrollY.value = window.scrollY }
    window.addEventListener('scroll', update, { passive: true })
    onUnmounted(() => window.removeEventListener('scroll', update))
  }

  return { scrollY }
}
