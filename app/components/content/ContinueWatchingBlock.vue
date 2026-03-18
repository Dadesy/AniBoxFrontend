<template>
  <section v-if="items.length" class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12">
      <div class="flex items-center gap-3">
        <div class="w-1 h-5 rounded-full bg-green-500" />
        <h2 class="text-lg font-bold text-white">Продолжить просмотр</h2>
        <span class="text-sm text-slate-500">{{ items.length }}</span>
      </div>
      <NuxtLink
        to="/history"
        class="flex items-center gap-1 text-sm text-green-400 hover:text-green-300 transition-colors font-medium"
      >
        История
        <UIcon name="lucide:chevron-right" class="size-4" />
      </NuxtLink>
    </div>

    <!-- Carousel -->
    <div
      ref="scrollEl"
      class="flex gap-3 overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8 xl:px-12 py-2 scroll-smooth"
    >
      <NuxtLink
        v-for="item in items"
        :key="item.id"
        :to="watchLink(item)"
        style="width: 148px; flex-shrink: 0"
        class="group block focus:outline-none"
      >
        <div class="relative overflow-hidden rounded-xl bg-cinema-card transition-transform duration-300 group-hover:scale-[1.04] group-hover:shadow-xl shadow-black/60">
          <!-- Poster -->
          <div class="aspect-[2/3] overflow-hidden">
            <img
              v-if="item.posterUrl"
              :src="item.posterUrl"
              :alt="item.title"
              loading="lazy"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div v-else class="flex h-full w-full items-center justify-center bg-cinema-card">
              <UIcon name="lucide:film" class="size-10 text-slate-700" />
            </div>
          </div>

          <!-- Gradient -->
          <div class="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none" />

          <!-- Progress bar -->
          <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-black/60">
            <div
              class="h-full bg-green-500 transition-all duration-300"
              :style="{ width: `${progressPercent(item)}%` }"
            />
          </div>

          <!-- Episode info -->
          <div class="absolute bottom-0 inset-x-0 p-2 pb-2.5 pointer-events-none">
            <p class="text-[11px] font-semibold text-white line-clamp-2 leading-tight">{{ item.title }}</p>
            <p class="text-[10px] text-slate-400 mt-0.5">
              <template v-if="item.season">С{{ item.season }}</template>
              <template v-if="item.season && item.episode"> · </template>
              <template v-if="item.episode">Э{{ item.episode }}</template>
            </p>
          </div>

          <!-- Completed overlay -->
          <div v-if="item.completed" class="absolute top-2 right-2">
            <span class="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-green-500/80 text-black">✓</span>
          </div>

          <!-- Play button on hover -->
          <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div class="w-11 h-11 rounded-full bg-green-500/90 flex items-center justify-center shadow-lg glow-green-sm">
              <UIcon name="lucide:play" class="size-5 text-black ml-0.5" />
            </div>
          </div>

          <!-- Hover ring -->
          <div class="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ring-1 ring-green-500/40" />
        </div>

        <!-- Date label -->
        <p class="mt-1.5 text-[10px] text-slate-500 px-0.5">{{ timeLabel(item) }}</p>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { EpisodeProgress } from '~/types/content';

const props = defineProps<{ items: EpisodeProgress[] }>();

function progressPercent(p: EpisodeProgress): number {
  if (!p.duration) return 0;
  return Math.min(100, (p.currentTime / p.duration) * 100);
}

function watchLink(p: EpisodeProgress): string {
  const params = new URLSearchParams();
  if (p.season) params.set('season', String(p.season));
  if (p.episode) params.set('episode', String(p.episode));
  if (p.translationId) params.set('translationId', String(p.translationId));
  if (!p.completed && p.currentTime > 5) params.set('t', String(Math.floor(p.currentTime)));
  return `/watch/${encodeURIComponent(p.externalId)}?${params}`;
}

function timeLabel(p: EpisodeProgress): string {
  const diff = Math.floor((Date.now() - new Date(p.lastWatchedAt).getTime()) / 86_400_000);
  if (diff === 0) return 'Сегодня';
  if (diff === 1) return 'Вчера';
  return `${diff} дн. назад`;
}
</script>
