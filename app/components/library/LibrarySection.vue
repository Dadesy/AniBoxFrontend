<template>
  <div class="flex flex-col gap-4">
    <LibraryTabs v-model="activeTab" :library="library" />
    <LibraryGrid
      :entries="activeEntries"
      :loading="loading"
      :empty-text="emptyText"
      :empty-icon="emptyIcon"
    />
  </div>
</template>

<script setup lang="ts">
import type { GroupedLibrary } from '~/types/library'
import type { LibrarySectionTabKey } from '~/types/library'
import LibraryGrid from '~/components/library/LibraryGrid.vue'
import LibraryTabs from '~/components/library/LibraryTabs.vue'

const props = defineProps<{
  library: GroupedLibrary | null
  loading?: boolean
}>()

const activeTab = defineModel<LibrarySectionTabKey>('activeTab', {
  required: false,
  default: 'watching',
})

const activeEntries = computed(() => {
  if (!props.library) return []
  return props.library[activeTab.value] ?? []
})

const activeTabMeta = computed(() => {
  const map: Record<LibrarySectionTabKey, { icon: string }> = {
    watching:  { icon: 'lucide:play-circle' },
    planned:   { icon: 'lucide:calendar-plus' },
    completed: { icon: 'lucide:circle-check' },
    liked:     { icon: 'lucide:heart' },
    dropped:   { icon: 'lucide:ban' },
  }
  return map[activeTab.value]
})

const EMPTY_TEXTS: Record<LibrarySectionTabKey, string> = {
  watching: 'Вы пока ничего не смотрите',
  planned: 'Список «Буду смотреть» пуст',
  completed: 'Вы ещё ничего не завершили',
  liked: 'Здесь будут аниме, которые вам понравились',
  dropped: 'Нет заброшенных тайтлов',
}

const emptyText = computed(() => EMPTY_TEXTS[activeTab.value])
const emptyIcon = computed(() => activeTabMeta.value.icon)
</script>
