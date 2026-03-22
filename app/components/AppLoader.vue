<template>
  <!-- Без Teleport to body: в Nuxt гидрация часто ломается → «белый экран» и зависание -->
  <Transition name="loader-overlay" @after-leave="onOverlayLeaveDone">
    <div
      v-if="!destroyed && visible"
      class="app-loader"
      aria-hidden="true"
      data-app-loader-overlay
    >
      <div class="app-loader__inner">
        <svg
          ref="svgRef"
          class="app-loader__glyph"
          viewBox="0 0 100 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path ref="legLeftRef" d="M 7 88 L 50 4" stroke="currentColor" stroke-width="6" stroke-linecap="round" />
          <path ref="legRightRef" d="M 50 4 L 93 88" stroke="currentColor" stroke-width="6" stroke-linecap="round" />
          <path ref="crossbarRef" d="M 27 57 L 73 57" stroke="currentColor" stroke-width="6" stroke-linecap="round" />
        </svg>

        <div ref="wordmarkRef" class="app-loader__wordmark">
          {{ siteName }}
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const siteName = config.public.siteName as string;
const { isLoading, markBootOverlayRemoved } = useAppLoader();

function onOverlayLeaveDone() {
  destroyed.value = true;
  markBootOverlayRemoved();
}

const svgRef = ref<SVGSVGElement | null>(null);
const legLeftRef = ref<SVGPathElement | null>(null);
const legRightRef = ref<SVGPathElement | null>(null);
const crossbarRef = ref<SVGPathElement | null>(null);
const wordmarkRef = ref<HTMLElement | null>(null);

const visible = ref(true);
const destroyed = ref(false);

const prefersReduced =
  import.meta.client && typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

function setDashoffset(el: SVGPathElement) {
  const len = el.getTotalLength();
  el.style.strokeDasharray = String(len);
  el.style.strokeDashoffset = String(len);
  return len;
}

async function playIntro(anime: typeof import('animejs').default) {
  if (prefersReduced || !legLeftRef.value || !legRightRef.value || !crossbarRef.value || !wordmarkRef.value || !svgRef.value)
    return;

  setDashoffset(legLeftRef.value);
  setDashoffset(legRightRef.value);
  setDashoffset(crossbarRef.value);

  wordmarkRef.value.style.opacity = '0';
  wordmarkRef.value.style.transform = 'translateY(10px)';
  svgRef.value.style.opacity = '0';

  const tl = anime.timeline({ easing: 'cubicBezier(0.22, 1, 0.36, 1)' });

  tl.add({
    targets: svgRef.value,
    opacity: [0, 1],
    duration: 240,
  })
    .add({
      targets: legLeftRef.value,
      strokeDashoffset: [anime.setDashoffset, 0],
      duration: 520,
    })
    .add({
      targets: legRightRef.value,
      strokeDashoffset: [anime.setDashoffset, 0],
      duration: 520,
      offset: '-=340',
    })
    .add({
      targets: crossbarRef.value,
      strokeDashoffset: [anime.setDashoffset, 0],
      duration: 280,
      offset: '-=80',
    })
    .add({
      targets: wordmarkRef.value,
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 360,
      offset: '-=120',
    });

  if (tl.finished) await tl.finished;
}

async function playExit(anime: typeof import('animejs').default) {
  if (prefersReduced || !svgRef.value || !wordmarkRef.value) return;

  const tl = anime.timeline({ easing: 'cubicBezier(0.4, 0, 1, 1)' });

  tl.add({
    targets: wordmarkRef.value,
    opacity: [1, 0],
    translateY: [0, -8],
    duration: 220,
  }).add({
    targets: svgRef.value,
    opacity: [1, 0],
    scale: [1, 0.88],
    duration: 300,
    offset: '-=100',
  });

  if (tl.finished) await tl.finished;
}

function waitUntilAppReady(): Promise<void> {
  return new Promise((resolve) => {
    if (!isLoading.value) {
      resolve();
      return;
    }
    const stop = watch(
      () => isLoading.value,
      (loading) => {
        if (!loading) {
          stop();
          resolve();
        }
      },
    );
  });
}

onMounted(async () => {
  await nextTick();

  if (prefersReduced) {
    watchEffect(() => {
      if (!isLoading.value) visible.value = false;
    });
    return;
  }

  let animeMod: typeof import('animejs').default | undefined;
  try {
    const mod = await import('animejs');
    animeMod = mod.default;
    await playIntro(animeMod);
  } catch (e) {
    if (import.meta.dev) console.warn('[AppLoader] intro failed', e);
  }

  await waitUntilAppReady();
  await new Promise<void>((r) => setTimeout(r, 140));

  try {
    if (!animeMod) {
      const mod = await import('animejs');
      animeMod = mod.default;
    }
    if (animeMod) await playExit(animeMod);
  } catch (e) {
    if (import.meta.dev) console.warn('[AppLoader] exit failed', e);
  } finally {
    visible.value = false;
  }
});
</script>

<style scoped>
/* Всегда тёмный слой загрузки — не зависит от html.light / --cinema-base */
.app-loader {
  position: fixed;
  inset: 0;
  z-index: 2147483646;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #111113;
  pointer-events: auto;
}

.app-loader__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(14px, 2.4vw, 22px);
}

.app-loader__glyph {
  width: clamp(52px, 9vw, 80px);
  height: auto;
  color: #86efac;
  opacity: 0;
}

.app-loader__wordmark {
  color: #fafafa;
  font-size: clamp(0.95rem, 2vw, 1.25rem);
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0;
}

.loader-overlay-leave-active {
  transition: opacity 0.38s ease;
}
.loader-overlay-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .app-loader__glyph,
  .app-loader__wordmark {
    opacity: 1 !important;
    transform: none !important;
  }
  .loader-overlay-leave-active {
    transition: opacity 0.15s ease;
  }
}
</style>
