<template>
  <ContinueWatchingRow :items="items" :loading="loading" />
</template>

<script setup lang="ts">
import type { EpisodeProgress } from '~/types/content'
import ContinueWatchingRow from '~/components/home/ContinueWatchingRow.vue'

defineProps<{
  items: EpisodeProgress[]
  loading?: boolean
}>()
</script>
