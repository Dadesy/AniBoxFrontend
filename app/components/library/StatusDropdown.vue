<template>
  <div ref="root" class="status-drop">
    <!-- Trigger -->
    <button
      class="status-drop__trigger"
      :class="{ 'status-drop__trigger--active': currentStatus }"
      :disabled="busy"
      @click.stop="open = !open"
    >
      <span v-if="currentStatus" class="status-drop__icon">{{ STATUS_ICONS[currentStatus] }}</span>
      <span v-else class="status-drop__icon">＋</span>
      <span class="status-drop__label">
        {{ currentStatus ? STATUS_LABELS[currentStatus] : 'В список' }}
      </span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        class="status-drop__chevron"
        :class="{ 'status-drop__chevron--up': open }"
      >
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </button>

    <!-- Dropdown menu -->
    <Transition name="drop">
      <div v-if="open" class="status-drop__menu">
        <!-- Status options -->
        <button
          v-for="status in STATUS_ORDER"
          :key="status"
          class="status-drop__item"
          :class="{ 'status-drop__item--active': currentStatus === status }"
          @click.stop="selectStatus(status)"
        >
          <span class="status-drop__item-icon">{{ STATUS_ICONS[status] }}</span>
          <span class="status-drop__item-label">{{ STATUS_LABELS[status] }}</span>
          <svg
            v-if="currentStatus === status"
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            class="status-drop__check ml-auto"
          >
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </button>

        <!-- Remove divider (only if already in list) -->
        <template v-if="currentStatus || entry?.isLiked">
          <div class="status-drop__divider" />
          <button class="status-drop__item status-drop__item--remove" @click.stop="handleRemove">
            <span class="status-drop__item-icon">✕</span>
            <span class="status-drop__item-label">Удалить из списка</span>
          </button>
        </template>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import type { AnimeStatus } from '~/types/library'
import {
  STATUS_LABELS,
  STATUS_ICONS,
  STATUS_ORDER,
} from '~/types/library'
import { useLibrary } from '~/composables/useLibrary'

const props = defineProps<{
  animeId: string
  title: string
  titleRu?: string
  posterUrl?: string
  contentType?: string
  year?: number
}>()

const { getCachedEntry, setStatus, removeFromLibrary } = useLibrary()
const entry        = computed(() => getCachedEntry(props.animeId))
const currentStatus = computed(() => entry.value?.status ?? null)

const open = ref(false)
const busy = ref(false)
const root = ref<HTMLElement>()

onClickOutside(root, () => { open.value = false })

async function selectStatus(status: AnimeStatus) {
  open.value = false
  if (busy.value) return
  busy.value = true
  try {
    await setStatus({
      animeId:     props.animeId,
      title:       props.title,
      titleRu:     props.titleRu,
      posterUrl:   props.posterUrl,
      contentType: props.contentType,
      year:        props.year,
      status,
    })
  } finally {
    busy.value = false
  }
}

async function handleRemove() {
  open.value = false
  if (busy.value) return
  busy.value = true
  try {
    await removeFromLibrary(props.animeId)
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.status-drop {
  position: relative;
  display: inline-flex;
}

/* Trigger button */
.status-drop__trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.18s, background 0.18s, color 0.18s;
  white-space: nowrap;
}

.status-drop__trigger:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.status-drop__trigger--active {
  border-color: rgba(34, 197, 94, 0.35) !important;
  background: rgba(34, 197, 94, 0.08) !important;
  color: #86efac !important;
}

.status-drop__icon  { font-size: 0.85rem; }
.status-drop__label { flex: 1; }

.status-drop__chevron {
  opacity: 0.5;
  transition: transform 0.2s ease;
}
.status-drop__chevron--up { transform: rotate(180deg); }

/* Dropdown menu */
.status-drop__menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  min-width: 200px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #1c1c1f;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
  overflow: hidden;
  z-index: 200;
  padding: 4px;
}

.status-drop__item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 10px;
  border-radius: 7px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.82rem;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s, color 0.15s;
}

.status-drop__item:hover {
  background: rgba(255, 255, 255, 0.07);
  color: #fff;
}

.status-drop__item--active {
  color: #86efac;
}

.status-drop__item--remove {
  color: rgba(239, 68, 68, 0.7);
}
.status-drop__item--remove:hover {
  background: rgba(239, 68, 68, 0.08);
  color: #f87171;
}

.status-drop__item-icon  { font-size: 0.9rem; flex-shrink: 0; }
.status-drop__item-label { flex: 1; }

.status-drop__divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.07);
  margin: 4px 0;
}

/* Dropdown transition */
.drop-enter-active { transition: all 0.2s cubic-bezier(0.34, 1.2, 0.64, 1); }
.drop-leave-active { transition: all 0.15s ease; }
.drop-enter-from   { opacity: 0; transform: translateY(-6px) scale(0.97); }
.drop-leave-to     { opacity: 0; transform: translateY(-4px); }
</style>
