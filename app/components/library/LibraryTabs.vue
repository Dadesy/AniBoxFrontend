<!--
  components/library/LibraryTabs.vue
  Горизонтальные быстрые фильтры библиотеки (mobile-first, min touch 44px).
-->
<template>
  <div
    class="flex gap-1 overflow-x-auto pb-1 scrollbar-hide"
    role="tablist"
    aria-label="Фильтры библиотеки"
  >
    <button
      v-for="tab in tabs"
      :key="tab.key"
      type="button"
      role="tab"
      class="flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors duration-200 motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
      :class="
        activeTab === tab.key
          ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-300'
          : 'border-transparent bg-white/[0.03] text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200'
      "
      :aria-selected="activeTab === tab.key"
      @click="activeTab = tab.key"
    >
      <span aria-hidden="true">{{ tab.icon }}</span>
      <span>{{ tab.label }}</span>
      <span
        v-if="tab.count > 0"
        class="inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white/10 px-1 text-[10px] font-bold text-zinc-400 tabular-nums"
        :class="activeTab === tab.key ? 'bg-emerald-500/20 text-emerald-200' : ''"
      >
        {{ tab.count }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { GroupedLibrary } from '~/types/library'
import type { LibrarySectionTabKey } from '~/types/library'

const props = defineProps<{
  library: GroupedLibrary | null
}>()

const activeTab = defineModel<LibrarySectionTabKey>({ default: 'watching' })

const tabs = computed(() => [
  {
    key: 'watching' as const,
    label: 'Смотрю',
    icon: '▶️',
    count: props.library?.counts.watching ?? 0,
  },
  {
    key: 'planned' as const,
    label: 'Буду смотреть',
    icon: '📌',
    count: props.library?.counts.planned ?? 0,
  },
  {
    key: 'completed' as const,
    label: 'Просмотрено',
    icon: '✅',
    count: props.library?.counts.completed ?? 0,
  },
  {
    key: 'liked' as const,
    label: 'Нравится',
    icon: '❤️',
    count: props.library?.counts.liked ?? 0,
  },
  {
    key: 'dropped' as const,
    label: 'Брошено',
    icon: '🚫',
    count: props.library?.counts.dropped ?? 0,
  },
])
</script>
