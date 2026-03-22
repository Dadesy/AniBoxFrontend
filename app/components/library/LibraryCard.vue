<template>
  <div class="lib-card">
    <!-- Poster -->
    <NuxtLink
      :to="`/title/${encodeURIComponent(entry.animeId)}`"
      class="lib-card__poster-wrap"
    >
      <img
        v-if="entry.posterUrl"
        :src="entry.posterUrl"
        :alt="displayTitle"
        loading="lazy"
        referrerpolicy="no-referrer"
        class="lib-card__poster"
      />
      <div v-else class="lib-card__poster-fallback" />

      <!-- Play overlay -->
      <div class="lib-card__play" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
      </div>
    </NuxtLink>

    <!-- Info -->
    <div class="lib-card__info">
      <NuxtLink
        :to="`/title/${encodeURIComponent(entry.animeId)}`"
        class="lib-card__title"
      >
        {{ displayTitle }}
      </NuxtLink>

      <div class="lib-card__meta">
        <span v-if="entry.year" class="lib-card__year">{{ entry.year }}</span>
        <span v-if="entry.status" class="lib-card__status-badge">
          {{ STATUS_ICONS[entry.status] }} {{ STATUS_LABELS[entry.status] }}
        </span>
        <span v-if="entry.isLiked" class="lib-card__like-badge">❤️</span>
      </div>

      <!-- Quick actions -->
      <div class="lib-card__actions">
        <StatusDropdown
          :anime-id="entry.animeId"
          :title="entry.title"
          :title-ru="entry.titleRu ?? undefined"
          :poster-url="entry.posterUrl ?? undefined"
          :content-type="entry.contentType ?? undefined"
          :year="entry.year ?? undefined"
        />
        <LikeButton
          :anime-id="entry.animeId"
          :title="entry.title"
          :title-ru="entry.titleRu ?? undefined"
          :poster-url="entry.posterUrl ?? undefined"
          :content-type="entry.contentType ?? undefined"
          :year="entry.year ?? undefined"
          :size="15"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LibraryEntry } from '~/types/library'
import { STATUS_LABELS, STATUS_ICONS } from '~/types/library'
import StatusDropdown from '~/components/library/StatusDropdown.vue'
import LikeButton from '~/components/library/LikeButton.vue'

const props = defineProps<{ entry: LibraryEntry }>()

const displayTitle = computed(() =>
  props.entry.titleRu ?? props.entry.title,
)
</script>

<style scoped>
.lib-card {
  display: flex;
  gap: 12px;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(255, 255, 255, 0.02);
  transition: background 0.18s, border-color 0.18s;
}

.lib-card:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.09);
}

/* Poster */
.lib-card__poster-wrap {
  position: relative;
  width: 56px;
  aspect-ratio: 2/3;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.05);
  display: block;
}

.lib-card__poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.25s;
}

.lib-card:hover .lib-card__poster { transform: scale(1.05); }

.lib-card__poster-fallback {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1a22, #111115);
}

.lib-card__play {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  opacity: 0;
  transition: opacity 0.18s;
}

.lib-card:hover .lib-card__play { opacity: 1; }

/* Info */
.lib-card__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
  justify-content: center;
}

.lib-card__title {
  font-size: 0.83rem;
  font-weight: 600;
  color: #fff;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.15s;
}
.lib-card__title:hover { color: #86efac; }

.lib-card__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.lib-card__year {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.4);
}

.lib-card__status-badge {
  font-size: 0.68rem;
  padding: 2px 7px;
  border-radius: 99px;
  background: rgba(34, 197, 94, 0.1);
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.lib-card__like-badge {
  font-size: 0.72rem;
}

/* Actions */
.lib-card__actions {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
}
</style>
