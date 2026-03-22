<!--
  components/home/ContinueWatchingRow.vue
  Горизонтальный ряд «Продолжить просмотр» для главной — Expressive cinema style.
-->
<template>
  <section class="space-y-3" aria-labelledby="continue-watching-heading">

    <!-- Header: accent bar + title + pill link -->
    <div class="flex items-center justify-between gap-3">
      <div class="flex min-w-0 items-center gap-2.5">
        <div class="h-[1.1em] w-[3px] shrink-0 rounded-full bg-emerald-500/65" aria-hidden="true" />
        <h2
          id="continue-watching-heading"
          class="truncate text-[clamp(0.9rem,2.4vw,1.05rem)] font-bold tracking-tight text-white/90"
        >
          Продолжить просмотр
        </h2>
        <span
          v-if="!loading && items.length"
          class="shrink-0 text-xs tabular-nums text-white/25"
        >
          {{ items.length }}
        </span>
      </div>
      <NuxtLink
        to="/history"
        class="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-white/[0.09] px-2.5 py-0.5 text-[11px] font-semibold text-white/35 transition-all duration-200 hover:border-emerald-500/30 hover:bg-emerald-500/[0.07] hover:text-emerald-400"
      >
        История
        <UIcon name="lucide:chevron-right" class="size-3" />
      </NuxtLink>
    </div>

    <!-- Scroll track -->
    <div
      class="scrollbar-hide flex gap-[var(--app-card-gap)] overflow-x-auto overscroll-x-contain pb-1"
      style="scroll-snap-type: x mandatory; scroll-padding-inline: 0;"
    >
      <!-- Skeleton -->
      <template v-if="loading">
        <div
          v-for="i in 6"
          :key="i"
          class="w-[148px] shrink-0"
          style="scroll-snap-align: start;"
        >
          <div
            class="aspect-[2/3] w-full rounded-[var(--app-radius-lg)] bg-cinema-card skeleton-shine"
            :style="{ animationDelay: `${(i - 1) * 80}ms` }"
          />
          <div class="mt-2 h-2.5 w-3/4 animate-pulse rounded bg-white/[0.06]" />
          <div class="mt-1.5 h-1.5 w-1/2 animate-pulse rounded bg-white/[0.04]" />
        </div>
      </template>

      <!-- Cards -->
      <template v-else>
        <div
          v-for="item in items"
          :key="item.id"
          class="shrink-0"
          style="scroll-snap-align: start;"
        >
          <ContinueCard :item="item" />
        </div>
      </template>
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
