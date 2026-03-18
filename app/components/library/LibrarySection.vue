<template>
  <div class="lib-section">
    <!-- Tab bar -->
    <div class="lib-tabs" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="lib-tab"
        :class="{ 'lib-tab--active': activeTab === tab.key }"
        role="tab"
        :aria-selected="activeTab === tab.key"
        @click="activeTab = tab.key"
      >
        <span class="lib-tab__icon" aria-hidden="true">{{ tab.icon }}</span>
        <span class="lib-tab__label">{{ tab.label }}</span>
        <span v-if="tab.count > 0" class="lib-tab__count">{{ tab.count }}</span>
      </button>
    </div>

    <!-- Content -->
    <div class="lib-content" role="tabpanel">
      <!-- Loading skeleton -->
      <template v-if="loading">
        <div v-for="i in 4" :key="i" class="lib-skeleton" />
      </template>

      <!-- Empty state -->
      <div
        v-else-if="activeEntries.length === 0"
        class="lib-empty"
      >
        <span class="lib-empty__icon" aria-hidden="true">{{ activeTabDef?.icon }}</span>
        <p class="lib-empty__text">{{ emptyText }}</p>
        <NuxtLink to="/catalog" class="lib-empty__cta">Найти аниме</NuxtLink>
      </div>

      <!-- Entry list -->
      <TransitionGroup v-else name="lib-list" tag="div" class="lib-list">
        <LibraryCard
          v-for="entry in activeEntries"
          :key="entry.animeId"
          :entry="entry"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GroupedLibrary } from '~/types/library'
import LibraryCard from '~/components/library/LibraryCard.vue'

const props = defineProps<{
  library: GroupedLibrary | null
  loading?: boolean
}>()

type TabKey = 'watching' | 'planned' | 'completed' | 'liked' | 'dropped'

const tabs = computed(() => [
  { key: 'watching'  as TabKey, label: 'Смотрю',          icon: '▶️', count: props.library?.counts.watching  ?? 0 },
  { key: 'planned'   as TabKey, label: 'Буду смотреть',   icon: '📌', count: props.library?.counts.planned   ?? 0 },
  { key: 'completed' as TabKey, label: 'Просмотрено',     icon: '✅', count: props.library?.counts.completed ?? 0 },
  { key: 'liked'     as TabKey, label: 'Нравится',        icon: '❤️', count: props.library?.counts.liked     ?? 0 },
  { key: 'dropped'   as TabKey, label: 'Брошено',         icon: '🚫', count: props.library?.counts.dropped   ?? 0 },
])

const activeTab = ref<TabKey>('watching')

const activeEntries = computed(() => {
  if (!props.library) return []
  return props.library[activeTab.value] ?? []
})

const activeTabDef = computed(() => tabs.value.find(t => t.key === activeTab.value))

const EMPTY_TEXTS: Record<TabKey, string> = {
  watching:  'Вы пока ничего не смотрите',
  planned:   'Список «Буду смотреть» пуст',
  completed: 'Вы ещё ничего не завершили',
  liked:     'Здесь будут аниме, которые вам понравились',
  dropped:   'Нет заброшенных тайтлов',
}

const emptyText = computed(() => EMPTY_TEXTS[activeTab.value])
</script>

<style scoped>
.lib-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Tabs */
.lib-tabs {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 2px;
}
.lib-tabs::-webkit-scrollbar { display: none; }

.lib-tab {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  flex-shrink: 0;
}

.lib-tab:hover {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.75);
}

.lib-tab--active {
  background: rgba(34, 197, 94, 0.1) !important;
  border-color: rgba(34, 197, 94, 0.25) !important;
  color: #86efac !important;
}

.lib-tab__icon { font-size: 0.85rem; }

.lib-tab__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 16px;
  padding: 0 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 99px;
  font-size: 0.65rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.5);
}

.lib-tab--active .lib-tab__count {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
}

/* Content */
.lib-content { min-height: 100px; }

/* Entry list */
.lib-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Two-column on desktop */
@media (min-width: 640px) {
  .lib-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
}

/* List animation */
.lib-list-enter-active { transition: all 0.22s ease; }
.lib-list-leave-active { transition: all 0.18s ease; }
.lib-list-enter-from   { opacity: 0; transform: translateY(8px); }
.lib-list-leave-to     { opacity: 0; transform: translateY(-4px); }

/* Empty state */
.lib-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 40px 20px;
  text-align: center;
  border: 1px dashed rgba(255, 255, 255, 0.08);
  border-radius: 12px;
}

.lib-empty__icon { font-size: 1.8rem; opacity: 0.5; }

.lib-empty__text {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.35);
  margin: 0;
}

.lib-empty__cta {
  display: inline-flex;
  align-items: center;
  padding: 8px 20px;
  border-radius: 99px;
  background: rgba(34, 197, 94, 0.12);
  border: 1px solid rgba(34, 197, 94, 0.25);
  color: #86efac;
  font-size: 0.8rem;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.18s;
}
.lib-empty__cta:hover { background: rgba(34, 197, 94, 0.2); }

/* Skeleton */
.lib-skeleton {
  height: 80px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  animation: skel-pulse 1.5s ease-in-out infinite;
}

@keyframes skel-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}
</style>
