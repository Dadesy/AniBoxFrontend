<!--
  components/library/LibraryTabs.vue
  Фильтры библиотеки: Lucide + общий cinema/emerald стиль (как карточки и чипы сайта).
-->
<template>
  <div
    class="scrollbar-hide flex gap-1 overflow-x-auto pb-0.5"
    style="scroll-snap-type: x proximity;"
    role="tablist"
    aria-label="Фильтры библиотеки"
  >
    <button
      v-for="tab in tabs"
      :key="tab.key"
      type="button"
      role="tab"
      style="scroll-snap-align: start;"
      class="flex min-h-11 shrink-0 items-center gap-2 rounded-[var(--app-radius-lg)] px-3.5 py-2 text-[13px] font-semibold tracking-tight transition-[background,border-color,color,box-shadow] duration-200 motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/45"
      :class="
        activeTab === tab.key
          ? 'border border-emerald-500/35 bg-emerald-500/[0.11] text-emerald-200 shadow-[0_0_0_1px_rgba(52,211,153,0.08)]'
          : 'border border-[var(--cinema-border)] bg-[var(--cinema-card)] text-slate-400 hover:border-white/[0.09] hover:bg-white/[0.04] hover:text-slate-200'
      "
      :aria-selected="activeTab === tab.key"
      @click="activeTab = tab.key"
    >
      <UIcon
        :name="tab.icon"
        class="size-4 shrink-0 opacity-90"
        :class="activeTab === tab.key ? 'text-emerald-400/90' : 'text-slate-500'"
        aria-hidden="true"
      />
      <span>{{ tab.label }}</span>
      <span
        v-if="tab.count > 0"
        class="inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold tabular-nums"
        :class="
          activeTab === tab.key
            ? 'bg-emerald-500/25 text-emerald-100'
            : 'bg-white/[0.08] text-slate-400'
        "
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
    icon: 'lucide:play-circle',
    count: props.library?.counts.watching ?? 0,
  },
  {
    key: 'planned' as const,
    label: 'Буду смотреть',
    icon: 'lucide:calendar-plus',
    count: props.library?.counts.planned ?? 0,
  },
  {
    key: 'completed' as const,
    label: 'Просмотрено',
    icon: 'lucide:circle-check',
    count: props.library?.counts.completed ?? 0,
  },
  {
    key: 'liked' as const,
    label: 'Нравится',
    icon: 'lucide:heart',
    count: props.library?.counts.liked ?? 0,
  },
  {
    key: 'dropped' as const,
    label: 'Брошено',
    icon: 'lucide:ban',
    count: props.library?.counts.dropped ?? 0,
  },
])
</script>
