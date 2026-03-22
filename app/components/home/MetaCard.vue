<script setup lang="ts">
import type { NormalizedAnimeCard } from '~/types/metadata'
import TitleCard from '~/components/content/TitleCard.vue'

const props = defineProps<{
  card: NormalizedAnimeCard
  size?: 'sm' | 'md'
}>()

const widthClass = computed(() =>
  props.size === 'sm' ? 'w-[130px]' : 'w-[150px]',
)
</script>

<template>
  <div :class="['flex-shrink-0', widthClass]">
    <!-- CatalogCard — совместим по полям с NormalizedAnimeCard -->
    <TitleCard :content="card" />
  </div>
</template>
