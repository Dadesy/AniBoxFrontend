<template>
  <!--
    Video preview overlay for anime cards.
    Only activates on desktop (pointer: fine) with user interaction.
    Respects prefers-reduced-motion — if reduced, preview is never shown.
    Falls back silently when no trailer is available.

    The YouTube nocookie iframe is only added to the DOM when `active = true`,
    so it doesn't block page load or consume bandwidth until the user hovers.

    Visual trick: the container is 2:3 (portrait) but YouTube is 16:9 (landscape).
    We scale the iframe by factor 8/3 ≈ 2.667 from its centre so the video fills
    the portrait card height, cropping the sides. overflow:hidden on the parent clips it.
  -->
  <Transition name="preview">
    <div
      v-if="shouldRender"
      class="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-xl"
      aria-hidden="true"
    >
      <!-- YouTube nocookie embed, muted autoplay loop -->
      <iframe
        v-if="youtubeId"
        :src="iframeSrc"
        class="yt-portrait-fill"
        frameborder="0"
        allow="autoplay; encrypted-media"
        :title="`Preview`"
      />

      <!-- Bottom gradient keeps title readable over the video -->
      <div
        class="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/95 via-black/50 to-transparent"
      />
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface Props {
  /** Full YouTube URL: https://www.youtube.com/watch?v=ID or https://youtu.be/ID */
  trailerUrl?: string | null
  /** Whether this card is the active preview (after hover delay) */
  active: boolean
}

const props = defineProps<Props>()

const { reducedMotion } = useReducedMotion()

// Desktop-only: pointer:fine = mouse/stylus (not touchscreen)
const hasFinePointer = ref(false)
onMounted(() => {
  hasFinePointer.value = window.matchMedia('(pointer: fine)').matches
})

/** Extract the YouTube video ID from various URL formats */
function extractYoutubeId(url: string): string | null {
  try {
    const u = new URL(url)
    // https://www.youtube.com/watch?v=ID
    if (u.hostname.includes('youtube.com')) {
      return u.searchParams.get('v')
    }
    // https://youtu.be/ID
    if (u.hostname === 'youtu.be') {
      return u.pathname.slice(1) || null
    }
  } catch {
    // ignore malformed URLs
  }
  return null
}

const youtubeId = computed(() =>
  props.trailerUrl ? extractYoutubeId(props.trailerUrl) : null,
)

const iframeSrc = computed(() => {
  if (!youtubeId.value) return null
  const id = youtubeId.value
  const params = new URLSearchParams({
    autoplay: '1',
    mute:     '1',
    loop:     '1',
    playlist: id, // required for loop to work
    controls: '0',
    modestbranding: '1',
    rel:      '0',
    showinfo: '0',
    iv_load_policy: '3', // hide video annotations
  })
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`
})

/**
 * Only render the iframe when:
 *  1. There is an active hover (after delay)
 *  2. A valid YouTube URL is present
 *  3. User is on a pointer device (not touch)
 *  4. User has NOT requested reduced motion
 */
const shouldRender = computed(
  () =>
    props.active &&
    !!youtubeId.value &&
    hasFinePointer.value &&
    !reducedMotion.value,
)
</script>

<style scoped>
/**
 * Fill a 2:3 portrait container with a 16:9 landscape YouTube iframe.
 *
 * Math:
 *   container aspect = 2/3 → height = 1.5 × width
 *   iframe at 16:9:  if width = container_width → height = 0.5625 × width
 *   scale factor to fill height: 1.5 / 0.5625 = 8/3 ≈ 2.667
 *   at that scale, iframe width = 2.667 × container_width (clipped by overflow:hidden)
 */
.yt-portrait-fill {
  position: absolute;
  top: 0;
  left: 50%;
  width: 100%;
  aspect-ratio: 16 / 9;
  transform: translateX(-50%) scale(2.667);
  transform-origin: top center;
  pointer-events: none;
}

/* Fade transition */
.preview-enter-active {
  transition: opacity 0.35s ease;
}
.preview-leave-active {
  transition: opacity 0.2s ease;
}
.preview-enter-from,
.preview-leave-to {
  opacity: 0;
}
</style>
