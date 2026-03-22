<script setup lang="ts">
import type { NormalizedAnimeCard } from '~/types/metadata'
import TitleCard from '~/components/content/TitleCard.vue'

const props = defineProps<{
  card: NormalizedAnimeCard
  size?: 'sm' | 'md'
}>()

/** Чуть шире карточка → больше пикселей под постер при том же соотношении 2:3 */
const widthClass = computed(() =>
  props.size === 'sm' ? 'w-[138px]' : 'w-[162px]',
)
</script>

<template>
  <div :class="['flex-shrink-0', widthClass]">
    <!-- CatalogCard — совместим по полям с NormalizedAnimeCard -->
    <TitleCard :content="card" />
  </div>
</template>
