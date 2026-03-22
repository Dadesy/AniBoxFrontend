<!--
  components/home/ContinueWatchingRow.vue
  Горизонтальный ряд «Продолжить просмотр» для главной.
-->
<template>
  <section class="space-y-4" aria-labelledby="continue-watching-heading">
    <div class="flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 xl:px-12">
      <div class="flex min-w-0 items-center gap-3">
        <div class="h-5 w-1 shrink-0 rounded-full bg-emerald-500" />
        <h2 id="continue-watching-heading" class="truncate text-lg font-bold text-white">
          Продолжить просмотр
        </h2>
        <span v-if="!loading && items.length" class="shrink-0 text-sm text-slate-500">
          {{ items.length }}
        </span>
      </div>
      <NuxtLink
        to="/history"
        class="flex shrink-0 items-center gap-1 text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300"
      >
        История
        <UIcon name="lucide:chevron-right" class="size-4" />
      </NuxtLink>
    </div>

    <div
      class="flex gap-3 overflow-x-auto overscroll-x-contain px-4 py-2 scrollbar-hide scroll-smooth sm:px-6 lg:px-8 xl:px-12"
      style="-webkit-overflow-scrolling: touch"
    >
      <template v-if="loading">
        <div
          v-for="i in 6"
          :key="i"
          class="w-[148px] shrink-0 animate-pulse motion-reduce:animate-none"
        >
          <div class="aspect-[2/3] rounded-xl bg-white/[0.06]" />
          <div class="mt-2 h-3 w-3/4 rounded bg-white/[0.06]" />
        </div>
      </template>
      <ContinueCard
        v-for="item in items"
        v-else
        :key="item.id"
        :item="item"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { EpisodeProgress } from '~/types/content'
import ContinueCard from '~/components/anime/ContinueCard.vue'

defineProps<{
  items: EpisodeProgress[]
  loading?: boolean
}>()
</script>
