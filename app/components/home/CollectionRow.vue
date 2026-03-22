<template>
  <section class="space-y-4">
    <!-- Section grid (2×2 on mobile, 4 wide on desktop) -->
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="col in collections"
        :key="col.id"
        class="group relative overflow-hidden rounded-2xl border border-white/6 bg-cinema-card p-4 transition-all duration-200 hover:border-white/12 hover:bg-white/5 cursor-pointer"
        @click="navigateTo(col.seeAllHref ?? '/catalog')"
      >
        <!-- Icon + title -->
        <div class="mb-3 flex items-center gap-2">
          <div class="flex h-8 w-8 items-center justify-center rounded-xl bg-white/8">
            <UIcon :name="col.icon ?? 'lucide:layers'" class="size-4 text-green-400" />
          </div>
          <div class="min-w-0">
            <p class="truncate text-sm font-bold text-white">{{ col.title }}</p>
            <p v-if="col.subtitle" class="truncate text-[10px] text-slate-500">{{ col.subtitle }}</p>
          </div>
        </div>

        <!-- Mini poster grid (up to 4 posters) -->
        <div class="grid grid-cols-4 gap-1">
          <div
            v-for="(item, i) in col.items.slice(0, 4)"
            :key="i"
            class="aspect-[2/3] overflow-hidden rounded-md bg-white/5"
          >
            <img
              v-if="item.posterUrl"
              :src="item.posterUrl"
              :alt="item.title"
              loading="lazy"
              referrerpolicy="no-referrer"
              class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <!-- Fill empty slots -->
          <div
            v-for="i in Math.max(0, 4 - col.items.slice(0, 4).length)"
            :key="`empty-${i}`"
            class="aspect-[2/3] rounded-md bg-white/3"
          />
        </div>

        <!-- Item count -->
        <p class="mt-2.5 text-[11px] text-slate-500">
          {{ col.items.length }}+ тайтлов
          <span class="ml-1 text-slate-600">→</span>
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Collection } from '~/types/metadata'

defineProps<{ collections: Collection[] }>()
</script>
