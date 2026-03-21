<template>
  <!-- Watchable card — link to title page -->
  <NuxtLink
    v-if="content.externalId"
    :to="`/title/${encodeURIComponent(content.externalId)}`"
    class="group block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50"
  >
    <CardInner :content="content" />
  </NuxtLink>

  <!-- Catalogue-only card (no Kodik match yet) — not clickable -->
  <div v-else class="block rounded-xl opacity-75">
    <CardInner :content="content" :no-play="true" />
  </div>
</template>

<script setup lang="ts">
import CardInner from '~/components/content/TitleCardInner.vue'
import type { CatalogCard } from '~/types/content'

defineProps<{ content: CatalogCard }>()
</script>
