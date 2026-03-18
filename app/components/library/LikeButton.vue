<template>
  <button
    class="like-btn"
    :class="{ 'like-btn--active': isLiked, 'like-btn--loading': busy }"
    :aria-label="isLiked ? 'Убрать из «Нравится»' : 'Нравится'"
    :aria-pressed="isLiked"
    :disabled="busy"
    @click.prevent.stop="handleClick"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      :fill="isLiked ? 'currentColor' : 'none'"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="like-btn__icon"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
    <span v-if="showLabel" class="like-btn__label">
      {{ isLiked ? 'Нравится' : 'Нравится' }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { useLibrary } from '~/composables/useLibrary'

const props = withDefaults(defineProps<{
  animeId: string
  title: string
  titleRu?: string
  posterUrl?: string
  contentType?: string
  year?: number
  showLabel?: boolean
  size?: number
}>(), {
  showLabel: false,
  size: 18,
})

const { getCachedEntry, toggleLike } = useLibrary()

const entry  = computed(() => getCachedEntry(props.animeId))
const isLiked = computed(() => entry.value?.isLiked ?? false)
const busy   = ref(false)

async function handleClick() {
  if (busy.value) return
  busy.value = true
  try {
    await toggleLike({
      animeId:     props.animeId,
      title:       props.title,
      titleRu:     props.titleRu,
      posterUrl:   props.posterUrl,
      contentType: props.contentType,
      year:        props.year,
    })
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.like-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: color 0.18s, border-color 0.18s, background 0.18s, transform 0.12s;
  flex-shrink: 0;
}

.like-btn:hover:not(:disabled) {
  border-color: rgba(239, 68, 68, 0.4);
  background: rgba(239, 68, 68, 0.08);
  color: #f87171;
}

.like-btn--active {
  border-color: rgba(239, 68, 68, 0.5) !important;
  background: rgba(239, 68, 68, 0.12) !important;
  color: #ef4444 !important;
}

.like-btn--loading {
  opacity: 0.6;
  pointer-events: none;
}

.like-btn:active:not(:disabled) {
  transform: scale(0.94);
}

.like-btn__icon {
  flex-shrink: 0;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.like-btn--active .like-btn__icon {
  transform: scale(1.15);
}

.like-btn__label {
  font-size: 0.82rem;
  font-weight: 600;
  white-space: nowrap;
}
</style>
