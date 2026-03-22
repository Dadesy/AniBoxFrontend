<!--
  components/anime/ContinueCard.vue
  Карточка эпизода: постер, прогресс, CTA «Продолжить» → плеер.
-->
<template>
  <article class="w-[148px] shrink-0">
    <NuxtLink
      :to="episodeWatchLink(item)"
      class="group block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60"
    >
      <div
        class="relative overflow-hidden rounded-xl bg-cinema-card shadow-black/60 transition-transform duration-300 motion-reduce:transition-none sm:group-hover:scale-[1.03] sm:group-hover:shadow-xl"
      >
        <AppImage
          :src="posterSrc"
          :alt="item.title"
          aspect-ratio="2/3"
          wrapper-class="w-full"
          img-class="transition-transform duration-500 motion-reduce:transition-none sm:group-hover:scale-105"
        >
          <template #fallback>
            <UIcon name="lucide:film" class="size-10 text-slate-700" />
          </template>

          <div
            class="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/95 via-black/50 to-transparent"
          />

          <div class="pointer-events-none absolute bottom-0 left-0 right-0 h-0.5 bg-black/60">
            <div
              class="h-full bg-emerald-500 transition-all duration-300 motion-reduce:transition-none"
              :style="{ width: `${episodeProgressPercent(item)}%` }"
            />
          </div>

          <div class="pointer-events-none absolute inset-x-0 bottom-0 p-2 pb-2.5">
            <p class="line-clamp-2 text-[11px] font-semibold leading-tight text-white">
              {{ item.title }}
            </p>
            <p class="mt-0.5 text-[10px] text-slate-400">
              <template v-if="item.season">С{{ item.season }}</template>
              <template v-if="item.season && item.episode"> · </template>
              <template v-if="item.episode">Э{{ item.episode }}</template>
            </p>
          </div>

          <div
            v-if="item.completed"
            class="pointer-events-none absolute right-2 top-2"
          >
            <span
              class="rounded-md bg-emerald-500/80 px-1.5 py-0.5 text-[10px] font-bold text-black"
            >✓</span>
          </div>

          <div
            class="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-center pb-3 pt-8 opacity-100 sm:pb-2 sm:opacity-0 sm:transition-opacity sm:duration-200 sm:group-hover:opacity-100"
          >
            <span
              class="inline-flex min-h-11 min-w-[120px] items-center justify-center gap-1.5 rounded-full bg-emerald-500/95 px-3 text-xs font-bold text-black shadow-lg glow-green-sm"
            >
              <UIcon name="lucide:play" class="size-4 shrink-0" />
              Продолжить
            </span>
          </div>

          <div
            class="pointer-events-none absolute inset-0 rounded-xl opacity-0 ring-1 ring-emerald-500/40 transition-opacity duration-200 motion-reduce:transition-none sm:group-hover:opacity-100"
          />
        </AppImage>
      </div>
    </NuxtLink>
    <p class="mt-1.5 px-0.5 text-[10px] text-slate-500">
      {{ episodeTimeLabelRu(item) }}
    </p>
  </article>
</template>

<script setup lang="ts">
import AppImage from '~/components/common/AppImage.vue'
import type { EpisodeProgress } from '~/types/content'
import {
  episodeProgressPercent,
  episodeTimeLabelRu,
  episodeWatchLink,
} from '~/utils/episode-progress-display'

const props = defineProps<{ item: EpisodeProgress }>()

const posterSrc = computed(() => {
  const u = (props.item.posterUrl ?? '').trim()
  return u.length ? u : null
})
</script>
