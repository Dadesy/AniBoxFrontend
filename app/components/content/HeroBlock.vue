<template>
  <div class="relative w-full overflow-hidden" style="height: min(90vh, 640px)">
    <!-- Backdrop image -->
    <div class="absolute inset-0">
      <img
        v-if="item.posterUrl"
        :src="item.posterUrl"
        :alt="item.title"
        referrerpolicy="no-referrer"
        class="w-full h-full object-cover object-top scale-105"
        style="filter: blur(2px) brightness(0.55) saturate(0.85)"
      />
      <div v-else class="w-full h-full bg-cinema-surface" />
    </div>

    <!-- Gradients -->
    <div class="absolute inset-0 bg-gradient-to-r from-cinema-base via-cinema-base/60 to-transparent" />
    <div class="absolute inset-0 bg-gradient-to-t from-cinema-base via-transparent to-cinema-base/30" />

    <!-- Content -->
    <div class="absolute inset-0 flex items-end pb-16 px-4 sm:px-6 lg:px-8 xl:px-12">
      <div class="max-w-xl animate-fade-up">
        <!-- Type badge -->
        <span class="inline-block mb-3 text-xs font-bold uppercase tracking-widest text-green-400 border border-green-500/30 bg-green-500/10 px-2.5 py-1 rounded-full">
          {{ typeLabel }}
        </span>

        <h1 class="text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-2 delay-100 animate-fade-up">
          {{ item.title }}
        </h1>

        <p v-if="item.originalTitle && item.originalTitle !== item.title"
           class="text-slate-400 text-sm mb-3 delay-100 animate-fade-up">
          {{ item.originalTitle }}
        </p>

        <!-- Meta -->
        <div class="flex items-center gap-2 text-sm text-slate-400 mb-4 delay-200 animate-fade-up flex-wrap">
          <span v-if="item.year" class="font-medium text-white">{{ item.year }}</span>
          <span v-if="item.year && item.genres.length" class="text-slate-600">·</span>
          <span v-if="item.episodesCount">{{ item.episodesCount }} эп.</span>
          <span v-if="item.episodesCount && item.genres.length" class="text-slate-600">·</span>
          <span v-for="(g, i) in item.genres.slice(0, 3)" :key="g">
            {{ g }}<span v-if="i < item.genres.slice(0, 3).length - 1" class="ml-2 text-slate-600">·</span>
          </span>
        </div>

        <p v-if="item.description"
           class="text-slate-300 text-sm leading-relaxed line-clamp-3 mb-6 max-w-md delay-200 animate-fade-up">
          {{ item.description }}
        </p>

        <!-- Actions -->
        <div class="flex items-center gap-3 delay-300 animate-fade-up">
          <NuxtLink :to="watchHref">
            <button class="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl transition-all duration-200 glow-green-sm hover:glow-green text-sm">
              <UIcon name="lucide:play" class="size-4 ml-0.5" />
              Смотреть
            </button>
          </NuxtLink>
          <NuxtLink :to="detailHref">
            <button class="flex items-center gap-2 px-5 py-3 glass hover:bg-white/10 text-white font-semibold rounded-xl transition-all duration-200 text-sm">
              <UIcon name="lucide:info" class="size-4" />
              Подробнее
            </button>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Bottom fade -->
    <div class="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-cinema-base to-transparent pointer-events-none" />
  </div>
</template>

<script setup lang="ts">
import type { ContentCard } from '~/types/content';

const props = defineProps<{ item: ContentCard }>();

const typeLabel = computed(() => {
  const map: Record<string, string> = {
    'anime-serial': 'Аниме-сериал',
    'anime': 'Аниме-фильм',
  };
  return map[props.item.type] ?? 'Аниме';
});

const detailHref = computed(() =>
  props.item.slug
    ? `/anime/${encodeURIComponent(props.item.slug)}`
    : `/title/${encodeURIComponent(props.item.externalId)}`,
)

const watchHref = computed(() =>
  props.item.slug
    ? `/watch/${encodeURIComponent(props.item.slug)}`
    : `/watch/${encodeURIComponent(props.item.externalId)}`,
)
</script>
