<template>
  <article class="rounded-2xl bg-cinema-card border border-white/5 p-5 group">
    <!-- Author row -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-3">
        <img
          v-if="review.author.avatarUrl"
          :src="review.author.avatarUrl"
          :alt="review.author.email"
          class="h-9 w-9 rounded-full object-cover ring-1 ring-white/10"
        />
        <div
          v-else
          class="h-9 w-9 rounded-full bg-cinema-accent/20 flex items-center justify-center text-sm font-bold text-cinema-accent"
        >
          {{ review.author.email[0]?.toUpperCase() }}
        </div>
        <div>
          <p class="text-sm font-medium text-white leading-none">
            {{ displayName(review.author.email) }}
          </p>
          <p class="text-xs text-white/40 mt-0.5">
            {{ formatDate(review.createdAt) }}
            <span v-if="review.author.level > 1" class="ml-1">· Ур. {{ review.author.level }}</span>
          </p>
        </div>
      </div>

      <!-- Stars -->
      <div class="flex items-center gap-1 shrink-0">
        <span class="text-yellow-400 text-sm">{{ '★'.repeat(Math.round(review.rating / 2)) }}</span>
        <span class="text-xs font-bold text-yellow-400 ml-1">{{ review.rating }}/10</span>
      </div>
    </div>

    <!-- Title -->
    <h4 class="font-semibold text-white mb-1.5">{{ review.title }}</h4>

    <!-- Content -->
    <p
      class="text-sm text-white/70 leading-relaxed"
      :class="{ 'line-clamp-4': !expanded }"
    >
      {{ review.content }}
    </p>

    <button
      v-if="!expanded && review.content.length > 240"
      class="text-xs text-cinema-accent mt-1 hover:underline"
      @click="expanded = true"
    >
      Читать полностью
    </button>

    <!-- Footer: likes + actions -->
    <div class="flex items-center gap-4 mt-4 pt-3 border-t border-white/5">
      <!-- Like button -->
      <button
        v-if="canLike"
        class="flex items-center gap-1.5 text-xs transition-colors"
        :class="
          review.isLikedByMe
            ? 'text-cinema-accent'
            : 'text-white/40 hover:text-white/70'
        "
        @click="$emit('like')"
      >
        <UIcon
          :name="review.isLikedByMe ? 'lucide:heart' : 'lucide:heart'"
          class="h-3.5 w-3.5"
          :class="review.isLikedByMe ? 'fill-current' : ''"
        />
        {{ review.likesCount > 0 ? review.likesCount : '' }}
        {{ review.isLikedByMe ? 'Понравилось' : 'Нравится' }}
      </button>
      <span v-else-if="review.likesCount > 0" class="text-xs text-white/30">
        ♥ {{ review.likesCount }}
      </span>

      <!-- Delete (shown for owner via parent) -->
      <slot name="actions" />
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Review } from '~/types/social';

defineProps<{
  review: Review;
  canLike: boolean;
}>();

defineEmits<{
  like: [];
  delete: [];
}>();

const expanded = ref(false);

function displayName(email: string): string {
  return email.split('@')[0] ?? email;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('ru', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}
</script>
