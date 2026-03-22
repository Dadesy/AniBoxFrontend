<template>
  <NuxtLink
    :to="`/anime/${encodeURIComponent(card.slug)}`"
    class="group flex h-full flex-col overflow-hidden rounded-[28px] border border-white/8 bg-white/[0.03] transition-all hover:-translate-y-0.5 hover:border-white/14 hover:bg-white/[0.05]"
  >
    <div class="relative aspect-[2/3] overflow-hidden bg-cinema-surface">
      <img
        v-if="card.poster"
        :src="card.poster"
        :alt="card.titleRu || card.title"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      >
      <div v-else class="absolute inset-0 bg-linear-to-br from-white/8 to-transparent" />

      <div class="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
        <span
          class="rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]"
          :class="card.watchAvailable ? 'border-emerald-500/25 bg-emerald-500/15 text-emerald-300' : 'border-white/10 bg-black/40 text-slate-400'"
        >
          {{ card.watchAvailable ? 'Смотреть' : 'Недоступно' }}
        </span>
        <span
          v-if="card.rating"
          class="rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white"
        >
          ★ {{ card.rating.toFixed(1) }}
        </span>
      </div>
    </div>

    <div class="flex flex-1 flex-col gap-2 px-4 py-4">
      <p class="line-clamp-2 text-sm font-semibold text-white">
        {{ card.titleRu || card.title }}
      </p>
      <p class="text-xs text-slate-400">
        {{ [card.year, card.status, card.availableEpisodes ? `${card.availableEpisodes} эп.` : null].filter(Boolean).join(' · ') }}
      </p>
      <p v-if="card.watchBlockedReason" class="line-clamp-2 text-xs text-amber-300/80">
        {{ card.watchBlockedReason }}
      </p>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { AnimeCardDto } from '~/types/content'

defineProps<{
  card: AnimeCardDto
}>()
</script>
