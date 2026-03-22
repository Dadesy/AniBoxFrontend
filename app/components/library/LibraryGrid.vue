<!--
  components/library/LibraryGrid.vue
  Сетка карточек библиотеки + skeleton + empty state.
-->
<template>
  <div class="min-h-[120px]" role="tabpanel">
    <template v-if="loading">
      <div
        class="grid grid-cols-1 gap-2 sm:grid-cols-2"
      >
        <div
          v-for="i in 6"
          :key="i"
          class="h-20 animate-pulse rounded-xl bg-white/[0.04] motion-reduce:animate-none"
        />
      </div>
    </template>

    <div
      v-else-if="entries.length === 0"
      class="flex flex-col items-center gap-3 rounded-xl border border-dashed border-white/[0.08] px-6 py-10 text-center"
    >
      <span class="text-3xl opacity-50" aria-hidden="true">{{ emptyIcon }}</span>
      <p class="m-0 max-w-sm text-sm text-zinc-500">
        {{ emptyText }}
      </p>
      <NuxtLink
        to="/catalog"
        class="inline-flex min-h-11 items-center justify-center rounded-full border border-emerald-500/35 bg-emerald-500/10 px-5 text-sm font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/20"
      >
        Найти аниме
      </NuxtLink>
    </div>

    <TransitionGroup
      v-else
      name="library-grid"
      tag="div"
      class="grid grid-cols-1 gap-2 sm:grid-cols-2"
    >
      <LibraryCard
        v-for="entry in entries"
        :key="entry.animeId"
        :entry="entry"
      />
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import type { LibraryEntry } from '~/types/library'
import LibraryCard from '~/components/library/LibraryCard.vue'

defineProps<{
  entries: LibraryEntry[]
  loading?: boolean
  emptyText: string
  emptyIcon: string
}>()
</script>

<style scoped>
.library-grid-enter-active {
  transition: all 0.22s ease;
}
.library-grid-leave-active {
  transition: all 0.18s ease;
}
.library-grid-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.library-grid-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .library-grid-enter-active,
  .library-grid-leave-active {
    transition: none;
  }
}
</style>
