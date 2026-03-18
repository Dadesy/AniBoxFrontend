<template>
  <NuxtLink
    :to="`/title/${encodeURIComponent(content.externalId)}`"
    class="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50 rounded-xl"
  >
    <div class="relative overflow-hidden rounded-xl bg-cinema-card transition-transform duration-300 ease-out group-hover:scale-[1.04] group-hover:z-10 group-hover:shadow-2xl group-hover:shadow-black/70">
      <!-- Poster -->
      <div class="aspect-[2/3] w-full overflow-hidden bg-cinema-card">
        <img
          v-if="content.posterUrl"
          :src="content.posterUrl"
          :alt="content.title"
          class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div v-else class="flex h-full w-full items-center justify-center">
          <UIcon name="lucide:film" class="size-12 text-slate-700" />
        </div>
      </div>

      <!-- Bottom gradient — always visible -->
      <div class="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

      <!-- Type badge -->
      <div class="absolute top-2 left-2">
        <span :class="['text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md', typeBadgeClass]">
          {{ typeLabel }}
        </span>
      </div>

      <!-- Quality badge -->
      <div class="absolute top-2 right-2">
        <span class="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-black/60 text-slate-300 backdrop-blur-sm">
          {{ content.quality }}
        </span>
      </div>

      <!-- Bottom title — always visible -->
      <div class="absolute bottom-0 inset-x-0 p-2.5 pointer-events-none">
        <p class="text-xs font-semibold text-white line-clamp-2 leading-tight">{{ content.title }}</p>
        <p v-if="content.year" class="text-[10px] text-slate-400 mt-0.5">{{ content.year }}</p>
      </div>

      <!-- Hover overlay — play button -->
      <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-250">
        <div class="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/40 glow-green-sm transform scale-75 group-hover:scale-100 transition-transform duration-250">
          <UIcon name="lucide:play" class="size-5 text-black ml-0.5" />
        </div>
      </div>

      <!-- Hover border glow -->
      <div class="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ring-1 ring-green-500/40" />
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { ContentCard } from '~/types/content';

const props = defineProps<{ content: ContentCard }>();

const typeLabel = computed(() => {
  const map: Record<string, string> = {
    'anime-serial': 'Аниме-сериал',
    'anime': 'Аниме-фильм',
  };
  return map[props.content.type] ?? 'Аниме';
});

const typeBadgeClass = computed((): string => {
  const map: Record<string, string> = {
    'anime-serial': 'bg-green-500/80 text-black backdrop-blur-sm',
    'anime':        'bg-emerald-400/80 text-black backdrop-blur-sm',
  };
  return map[props.content.type] ?? 'bg-white/20 text-white backdrop-blur-sm';
});
</script>
