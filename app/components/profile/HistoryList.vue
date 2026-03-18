<template>
  <div class="history-list">
    <div v-if="items.length === 0 && !loading" class="history-empty">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
        <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0"/><path d="M12 8v4"/><path d="M12 16h.01"/>
      </svg>
      <p>История просмотров пуста</p>
    </div>

    <template v-else>
      <div class="history-items">
        <div
          v-for="item in items"
          :key="item.id"
          class="history-item"
          @click="navigate(item)"
        >
          <!-- Poster -->
          <div class="history-poster">
            <img
              v-if="item.posterUrl"
              :src="item.posterUrl"
              :alt="item.title"
              loading="lazy"
            />
            <div v-else class="poster-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="2" ry="2"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M17 7h5M2 17h5M17 17h5"/>
              </svg>
            </div>
            <div class="poster-play">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            </div>
          </div>

          <!-- Info -->
          <div class="history-info">
            <p class="history-title">{{ item.title }}</p>
            <p class="history-meta">
              <span v-if="item.season">Сезон {{ item.season }}, </span>
              <span v-if="item.episode">Эпизод {{ item.episode }}</span>
              <span v-if="item.translationName" class="sep"> · </span>
              <span v-if="item.translationName" class="translation">{{ item.translationName }}</span>
            </p>
            <!-- Progress bar -->
            <div class="progress-bar-wrap">
              <div
                class="progress-bar-fill"
                :style="{ width: progressPercent(item) + '%' }"
                :class="{ completed: item.completed }"
              />
            </div>
            <p class="history-time">
              {{ formatTime(item.currentTime) }} / {{ formatTime(item.duration) }}
              <span class="sep"> · </span>
              {{ formatDate(item.lastWatchedAt) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Load more -->
      <div v-if="items.length < total" class="load-more">
        <button class="load-more-btn" :disabled="loading" @click="$emit('load-more')">
          <span v-if="loading">Загрузка...</span>
          <span v-else>Показать ещё ({{ total - items.length }})</span>
        </button>
      </div>
    </template>

    <!-- Skeleton -->
    <div v-if="loading && items.length === 0" class="history-items">
      <div v-for="i in 5" :key="i" class="history-item skeleton">
        <div class="history-poster skeleton-box" />
        <div class="history-info">
          <div class="skel-line wide" />
          <div class="skel-line narrow" />
          <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:40%" /></div>
          <div class="skel-line narrow" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EpisodeProgress } from '~/types/content'

const props = defineProps<{
  items: EpisodeProgress[]
  total: number
  loading: boolean
}>()

defineEmits<{ 'load-more': [] }>()

const router = useRouter()

function progressPercent(item: EpisodeProgress): number {
  if (!item.duration || item.duration === 0) return 0
  return Math.min(100, Math.round((item.currentTime / item.duration) * 100))
}

function formatTime(seconds: number): string {
  if (!seconds) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Сегодня'
  if (days === 1) return 'Вчера'
  if (days < 7) return `${days} дн. назад`
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

function navigate(item: EpisodeProgress): void {
  router.push(`/title/${item.externalId}`)
}
</script>

<style scoped>
.history-list { display: flex; flex-direction: column; gap: 0; }

.history-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 24px;
  color: var(--text-muted, rgba(255,255,255,.4));
  font-size: .9rem;
}
.empty-icon { opacity: .5; }

.history-items { display: flex; flex-direction: column; }

.history-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid var(--border, rgba(255,255,255,.06));
  cursor: pointer;
  transition: background .15s;
  border-radius: 8px;
  padding-inline: 12px;
}

.history-item:last-child { border-bottom: none; }

.history-item:hover { background: rgba(255,255,255,.04); }

/* Poster */
.history-poster {
  position: relative;
  flex-shrink: 0;
  width: 64px;
  height: 90px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--surface-3, #1a1a20);
}

.history-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.poster-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,.2);
}

.poster-play {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,.5);
  opacity: 0;
  transition: opacity .15s;
  color: #fff;
}

.history-item:hover .poster-play { opacity: 1; }

/* Info */
.history-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-title {
  font-size: .9rem;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

.history-meta {
  font-size: .78rem;
  color: var(--text-muted, rgba(255,255,255,.5));
  margin: 0;
}

.translation { color: var(--color-primary, #22c55e); }
.sep { opacity: .5; }

/* Progress bar */
.progress-bar-wrap {
  height: 3px;
  background: rgba(255,255,255,.1);
  border-radius: 99px;
  overflow: hidden;
  margin: 4px 0;
}

.progress-bar-fill {
  height: 100%;
  background: var(--color-primary, #22c55e);
  border-radius: 99px;
  transition: width .3s;
}

.progress-bar-fill.completed {
  background: rgba(255,255,255,.3);
}

.history-time {
  font-size: .72rem;
  color: rgba(255,255,255,.35);
  margin: 0;
}

/* Load more */
.load-more {
  display: flex;
  justify-content: center;
  padding: 20px 0 0;
}

.load-more-btn {
  padding: 10px 28px;
  background: transparent;
  border: 1px solid rgba(255,255,255,.15);
  border-radius: 99px;
  color: rgba(255,255,255,.7);
  font-size: .85rem;
  cursor: pointer;
  transition: border-color .2s, color .2s;
}

.load-more-btn:hover:not(:disabled) {
  border-color: var(--color-primary, #22c55e);
  color: var(--color-primary, #22c55e);
}

.load-more-btn:disabled { opacity: .5; cursor: default; }

/* Skeleton */
.skeleton { pointer-events: none; }

.skeleton-box {
  background: linear-gradient(90deg, #1e1e24 25%, #25252d 50%, #1e1e24 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

.skel-line {
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(90deg, #1e1e24 25%, #25252d 50%, #1e1e24 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

.skel-line.wide { width: 70%; }
.skel-line.narrow { width: 40%; }

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
