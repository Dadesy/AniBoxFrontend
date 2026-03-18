<template>
  <!-- Loading -->
  <div v-if="loading" class="flex justify-center py-5">
    <UIcon name="lucide:loader-circle" class="size-5 text-green-400 animate-spin" />
  </div>

  <template v-else>
    <NuxtLink
      v-for="item in results"
      :key="item.externalId"
      :to="`/title/${encodeURIComponent(item.externalId)}`"
      class="result-row flex items-center gap-3 px-4 py-2.5 transition-colors"
      @click="emit('select')"
    >
      <!-- Poster thumbnail -->
      <div class="w-8 h-[44px] shrink-0 rounded-md overflow-hidden bg-cinema-card">
        <img
          v-if="item.posterUrl"
          :src="item.posterUrl"
          :alt="item.title"
          class="w-full h-full object-cover"
          loading="lazy"
        />
        <div v-else class="flex h-full items-center justify-center">
          <UIcon name="lucide:film" class="size-3.5 text-slate-600" />
        </div>
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <p
          class="text-[13px] font-medium text-white line-clamp-1"
          v-html="highlight(item.title)"
        />
        <p class="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
          <span v-if="item.originalTitle && item.originalTitle !== item.title" class="text-slate-400">{{ item.originalTitle }}</span>
          <span v-if="item.originalTitle && item.originalTitle !== item.title && item.year" class="mx-1 text-slate-600">·</span>
          <span v-if="item.year">{{ item.year }}</span>
        </p>
      </div>

      <!-- Type badge -->
      <span class="shrink-0 text-[11px] px-1.5 py-0.5 rounded-md bg-white/6 text-slate-500">
        {{ typeLabel(item.type) }}
      </span>
    </NuxtLink>

    <!-- "All results" footer -->
    <div v-if="results.length > 0" class="border-t border-white/5 mt-1 px-4 py-2.5">
      <button
        class="text-[13px] text-green-400 hover:text-green-300 transition-colors flex items-center gap-1.5"
        @click="emit('all')"
      >
        <UIcon name="lucide:search" class="size-3.5" />
        Все результаты для «{{ query }}»
      </button>
    </div>

    <!-- Error state -->
    <div v-if="error && !loading" class="px-4 py-5 text-center">
      <p class="text-[13px] text-red-400/80">{{ error }}</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="results.length === 0 && !loading" class="px-4 py-5 text-center">
      <p class="text-[13px] text-slate-500">Ничего не найдено</p>
    </div>
  </template>
</template>

<script setup lang="ts">
import type { ContentCard } from '~/types/content';

const props = defineProps<{
  loading: boolean;
  results: ContentCard[];
  query: string;
  error?: string | null;
}>();

const emit = defineEmits<{
  (e: 'select'): void;
  (e: 'all'): void;
}>();

function highlight(text: string): string {
  if (!props.query) return text;
  const esc = props.query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(
    new RegExp(`(${esc})`, 'gi'),
    '<mark class="bg-green-500/20 text-green-300 rounded-sm px-0.5 not-italic">$1</mark>',
  );
}

function typeLabel(type: string): string {
  if (type === 'anime-serial') return 'Сериал';
  if (type === 'anime')        return 'Фильм';
  return 'Аниме';
}
</script>

<style scoped>
.result-row:hover { background: rgba(255, 255, 255, 0.04); }

:global(html.light) .result-row:hover { background: rgba(0, 0, 0, 0.04); }
:global(html.light) .result-row p.text-white { color: #1e293b; }
</style>
