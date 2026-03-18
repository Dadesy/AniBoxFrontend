<!--
  Combined row for title page hero:
  [❤️ LikeButton] [📌 StatusDropdown]
-->
<template>
  <div class="atl-row">
    <LikeButton
      :anime-id="animeId"
      :title="title"
      :title-ru="titleRu"
      :poster-url="posterUrl"
      :content-type="contentType"
      :year="year"
      :show-label="true"
      :size="16"
    />
    <StatusDropdown
      :anime-id="animeId"
      :title="title"
      :title-ru="titleRu"
      :poster-url="posterUrl"
      :content-type="contentType"
      :year="year"
    />
  </div>
</template>

<script setup lang="ts">
import LikeButton from '~/components/library/LikeButton.vue'
import StatusDropdown from '~/components/library/StatusDropdown.vue'

defineProps<{
  animeId: string
  title: string
  titleRu?: string
  posterUrl?: string
  contentType?: string
  year?: number
}>()
</script>

<style scoped>
.atl-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
