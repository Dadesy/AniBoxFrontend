<template>
  <!--
    aspect-ratio задаёт высоту блока от ширины родителя — в flex-ряду карусели
    надёжнее, чем padding-top % (процент мог считаться не от той ширины → «сжатый» постер).
  -->
  <div
    :class="['relative w-full min-h-0 overflow-hidden', wrapperClass]"
    :style="{ aspectRatio: aspectRatioCss }"
  >
    <!-- Skeleton shimmer пока картинка грузится -->
    <div
      v-if="phase === 'loading'"
      class="absolute inset-0 bg-cinema-card skeleton-shine"
      aria-hidden="true"
    />

    <!-- Fallback при ошибке загрузки -->
    <div
      v-else-if="phase === 'error'"
      class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/5 to-white/10"
    >
      <slot name="fallback">
        <UIcon name="lucide:image-off" class="size-8 text-zinc-600" />
      </slot>
    </div>

    <!--
      <img> рендерится даже в фазе loading (opacity: 0) — это важно для SSR:
      браузер видит тег и начинает загрузку сразу, а не после гидрации.
      Переход в opacity-100 происходит через CSS transition после события load.
    -->
    <!--
      Не убираем <img> при phase === 'error': иначе в DOM нет ни src, ни зацепки в DevTools,
      хотя URL был (часто CDN / Referer / разовый сбой). Плейсхолдер рисуем поверх.
    -->
    <img
      v-if="displaySrc"
      :key="`${displaySrc}|${loadAttempt}`"
      ref="imgRef"
      :src="displaySrc"
      :alt="alt"
      :loading="priority ? 'eager' : 'lazy'"
      :fetchpriority="priority ? 'high' : undefined"
      :decoding="priority ? 'sync' : 'async'"
      :class="[
        'absolute inset-0 h-full w-full object-cover',
        'transition-opacity duration-500 ease-out',
        phase === 'loaded' ? 'opacity-100' : 'opacity-0',
        imgClass,
      ]"
      v-bind="$attrs"
      @load="onLoad"
      @error="onError"
    />

    <!-- Слот для оверлеев: бейджи, кнопки, видео-превью -->
    <slot />
  </div>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

interface Props {
  src?:         string | null
  alt?:         string
  aspectRatio?: string
  /** true для first-viewport (LCP) изображений — отключает lazy loading */
  priority?:    boolean
  wrapperClass?: string
  imgClass?:    string
}

const props = withDefaults(defineProps<Props>(), {
  alt:         '',
  aspectRatio: '2/3',
  priority:    false,
})

type Phase = 'loading' | 'loaded' | 'error'

const imgRef = ref<HTMLImageElement | null>(null)
/** One silent retry (cache-bust) after transient CDN / TLS hiccups */
const loadAttempt = ref(0)
const phase       = ref<Phase>((props.src ?? '').trim() ? 'loading' : 'error')

const displaySrc = computed(() => {
  const raw = (props.src ?? '').trim()
  if (!raw) return ''
  if (loadAttempt.value === 0) return raw
  const sep = raw.includes('?') ? '&' : '?'
  return `${raw}${sep}_imgretry=${loadAttempt.value}`
})

/** CSS aspect-ratio, напр. "2 / 3" */
const aspectRatioCss = computed(() => {
  const raw = props.aspectRatio.trim()
  const match = raw.match(/^(\d+(?:\.\d+)?)\s*[:/]\s*(\d+(?:\.\d+)?)$/)
  if (!match) return '2 / 3'

  const w = Number(match[1])
  const h = Number(match[2])
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return '2 / 3'

  return `${w} / ${h}`
})

function onLoad() {
  phase.value = 'loaded'
}

function onError() {
  const raw = (props.src ?? '').trim()
  // Несколько попыток (cache-bust) — CDN / TLS иногда отваливаются разово
  if (raw && loadAttempt.value < 3) {
    loadAttempt.value += 1
    phase.value = 'loading'
    return
  }
  phase.value = 'error'
}

onMounted(() => {
  // Картинка может быть уже загружена из кеша до того, как Vue успел
  // повесить обработчик onload. Проверяем img.complete сразу после маунта.
  const img = imgRef.value
  if (!img) return
  if (img.complete) {
    phase.value = img.naturalWidth > 0 ? 'loaded' : 'error'
  }
})

watch(
  () => props.src,
  (newSrc, oldSrc) => {
    if (newSrc === oldSrc) return
    loadAttempt.value = 0
    phase.value = (newSrc ?? '').trim() ? 'loading' : 'error'
  },
)
</script>
