<template>
  <div class="flex gap-3 group">
    <!-- Avatar -->
    <img
      v-if="comment.author.avatarUrl"
      :src="comment.author.avatarUrl"
      :alt="comment.author.email"
      class="h-8 w-8 rounded-full object-cover ring-1 ring-white/10 shrink-0"
    />
    <div
      v-else
      class="h-8 w-8 rounded-full bg-cinema-accent/20 flex items-center justify-center
             text-xs font-bold text-cinema-accent shrink-0"
    >
      {{ comment.author.email[0]?.toUpperCase() }}
    </div>

    <div class="flex-1 min-w-0">
      <!-- Author + date -->
      <div class="flex items-baseline gap-2 mb-0.5">
        <span class="text-sm font-medium text-white">
          {{ displayName(comment.author.email) }}
        </span>
        <span class="text-xs text-white/30">{{ timeAgo(comment.createdAt) }}</span>
      </div>

      <!-- Content -->
      <p class="text-sm text-white/75 leading-relaxed whitespace-pre-wrap break-words">
        {{ comment.content }}
      </p>

      <!-- Actions -->
      <div class="flex items-center gap-3 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          v-if="isAuthenticated"
          class="text-xs text-white/40 hover:text-cinema-accent transition-colors"
          @click="$emit('reply')"
        >
          Ответить
        </button>
        <button
          v-if="canDelete"
          class="text-xs text-red-400/50 hover:text-red-400 transition-colors"
          @click="$emit('delete')"
        >
          Удалить
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Comment } from '~/types/social';

defineProps<{
  comment: Comment;
  canDelete: boolean;
}>();

defineEmits<{
  reply: [];
  delete: [];
}>();

const { isAuthenticated } = useAuth();

function displayName(email: string): string {
  return email.split('@')[0] ?? email;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'только что';
  if (mins < 60) return `${mins} мин назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч назад`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} дн назад`;
  return new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'short' }).format(
    new Date(iso),
  );
}
</script>
