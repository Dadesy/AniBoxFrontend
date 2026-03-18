<template>
  <section class="space-y-4">
    <!-- Section header -->
    <div class="flex items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12">
      <div class="flex items-center gap-3">
        <div v-if="icon" class="w-1 h-5 rounded-full bg-green-500" />
        <h2 class="text-lg font-bold text-white">{{ title }}</h2>
        <span v-if="!loading && items.length" class="text-sm text-slate-500">{{ items.length }}</span>
      </div>
      <NuxtLink
        v-if="to"
        :to="to"
        class="flex items-center gap-1 text-sm text-green-400 hover:text-green-300 transition-colors font-medium"
      >
        Все
        <UIcon name="lucide:chevron-right" class="size-4" />
      </NuxtLink>
    </div>

    <!-- Carousel -->
    <div class="relative group/row">
      <!-- Scroll left -->
      <button
        v-show="canScrollLeft && !loading"
        class="absolute left-0 top-0 bottom-0 z-10 w-14 flex items-center justify-center
               bg-gradient-to-r from-cinema-base to-transparent opacity-0 group-hover/row:opacity-100
               transition-opacity duration-200 cursor-pointer"
        @click="scroll(-1)"
      >
        <div class="w-8 h-8 rounded-full glass flex items-center justify-center text-white hover:bg-white/10 transition-colors">
          <UIcon name="lucide:chevron-left" class="size-5" />
        </div>
      </button>

      <!-- Scroll right -->
      <button
        v-show="canScrollRight && !loading"
        class="absolute right-0 top-0 bottom-0 z-10 w-14 flex items-center justify-center
               bg-gradient-to-l from-cinema-base to-transparent opacity-0 group-hover/row:opacity-100
               transition-opacity duration-200 cursor-pointer"
        @click="scroll(1)"
      >
        <div class="w-8 h-8 rounded-full glass flex items-center justify-center text-white hover:bg-white/10 transition-colors">
          <UIcon name="lucide:chevron-right" class="size-5" />
        </div>
      </button>

      <!-- Scroll container -->
      <div
        ref="scrollEl"
        class="flex gap-3 overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8 xl:px-12 py-2 scroll-smooth"
        @scroll="updateScrollState"
      >
        <!-- Skeletons -->
        <template v-if="loading">
          <div
            v-for="i in skeletonCount"
            :key="i"
            :style="{ width: cardWidth, flexShrink: 0 }"
            class="rounded-xl overflow-hidden"
          >
            <div class="aspect-[2/3] w-full skeleton-shine rounded-xl" />
            <div class="mt-2 space-y-1.5 px-0.5">
              <div class="h-3 w-3/4 rounded skeleton-shine" />
              <div class="h-2.5 w-1/2 rounded skeleton-shine" />
            </div>
          </div>
        </template>

        <!-- Cards -->
        <div
          v-for="item in items"
          :key="item.externalId"
          :style="{ width: cardWidth, flexShrink: 0 }"
        >
          <TitleCard :content="item" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ContentCard } from '~/types/content';
import TitleCard from '~/components/content/TitleCard.vue';

withDefaults(defineProps<{
  title: string;
  items: ContentCard[];
  loading?: boolean;
  to?: string;
  icon?: boolean;
  cardWidth?: string;
  skeletonCount?: number;
}>(), {
  loading: false,
  icon: true,
  cardWidth: '148px',
  skeletonCount: 9,
});

const scrollEl = ref<HTMLElement | null>(null);
const canScrollLeft  = ref(false);
const canScrollRight = ref(true);

function updateScrollState(): void {
  const el = scrollEl.value;
  if (!el) return;
  canScrollLeft.value  = el.scrollLeft > 8;
  canScrollRight.value = el.scrollLeft < el.scrollWidth - el.clientWidth - 8;
}

function scroll(dir: 1 | -1): void {
  const el = scrollEl.value;
  if (!el) return;
  el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: 'smooth' });
}

onMounted(() => nextTick(updateScrollState));
</script>
