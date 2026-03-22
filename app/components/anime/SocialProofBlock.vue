<template>
  <div class="rounded-2xl bg-cinema-card border border-white/5 overflow-hidden">
    <!-- Rating + review summary -->
    <div class="p-5 border-b border-white/5">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs text-white/40 uppercase tracking-wide mb-1">Оценка зрителей</p>
          <div class="flex items-baseline gap-2">
            <span class="text-4xl font-black text-white">
              {{ ratingSummary ? ratingSummary.average.toFixed(1) : '—' }}
            </span>
            <span class="text-sm text-white/40">/10</span>
          </div>
          <div class="flex items-center gap-1 mt-1">
            <template v-if="ratingSummary && ratingSummary.average > 0">
              <span
                v-for="n in 5"
                :key="n"
                class="text-sm"
                :class="n <= Math.round(ratingSummary.average / 2) ? 'text-yellow-400' : 'text-white/20'"
              >★</span>
              <span class="text-xs text-white/40 ml-1">
                {{ ratingSummary.count }} {{ reviewsWord }}
              </span>
            </template>
            <span v-else class="text-xs text-white/30">Нет оценок</span>
          </div>
        </div>

        <!-- CTA: leave a review -->
        <button
          v-if="isAuthenticated && !myReview"
          class="rounded-xl bg-cinema-accent/15 border border-cinema-accent/30 px-3 py-2 text-xs
                 text-cinema-accent hover:bg-cinema-accent/25 transition-colors"
          @click="$emit('openReviewForm')"
        >
          + Отзыв
        </button>
        <div
          v-else-if="myReview"
          class="flex items-center gap-1.5 text-xs text-cinema-accent"
        >
          <UIcon name="lucide:check-circle" class="h-3.5 w-3.5" />
          Ваш отзыв: {{ myReview.rating }}/10
        </div>
      </div>
    </div>

    <!-- Friends in list (authenticated only) -->
    <div v-if="isAuthenticated" class="p-5">
      <!-- Loading skeleton -->
      <div v-if="activityLoading" class="space-y-2">
        <div class="h-3 w-24 rounded bg-white/10 skeleton-shine" />
        <div class="flex gap-1.5 mt-2">
          <div v-for="n in 4" :key="n" class="h-7 w-7 rounded-full bg-white/10 skeleton-shine" />
        </div>
      </div>

      <!-- Activity data -->
      <template v-else-if="activity && activity.total > 0">
        <p class="text-xs text-white/50 mb-3">
          <UIcon name="lucide:users" class="h-3 w-3 inline mr-1 text-cinema-accent" />
          {{ activity.total }}
          {{ pluralize(activity.total, 'друг', 'друга', 'друзей') }}
          {{ pluralize(activity.total, 'добавил', 'добавило', 'добавили') }}
        </p>

        <div class="space-y-2">
          <!-- Watching now -->
          <div v-if="activity.watching.length" class="flex items-center gap-2">
            <span class="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            <span class="text-xs text-green-400">Смотрят сейчас</span>
            <div class="flex -space-x-1">
              <img
                v-for="u in activity.watching.slice(0, 4)"
                :key="u.id"
                :src="u.avatarUrl ?? defaultAvatar(u.email)"
                :alt="u.email"
                :title="u.email.split('@')[0]"
                class="h-6 w-6 rounded-full object-cover ring-1 ring-cinema-card"
              />
              <div
                v-if="activity.watching.length > 4"
                class="h-6 w-6 rounded-full bg-white/15 ring-1 ring-cinema-card
                       flex items-center justify-center text-[10px] text-white/60"
              >
                +{{ activity.watching.length - 4 }}
              </div>
            </div>
          </div>

          <!-- Completed -->
          <div v-if="activity.completed.length" class="flex items-center gap-2">
            <UIcon name="lucide:check" class="h-3 w-3 text-blue-400" />
            <span class="text-xs text-blue-400">Посмотрели</span>
            <div class="flex -space-x-1">
              <img
                v-for="u in activity.completed.slice(0, 4)"
                :key="u.id"
                :src="u.avatarUrl ?? defaultAvatar(u.email)"
                :alt="u.email"
                :title="u.email.split('@')[0]"
                class="h-6 w-6 rounded-full object-cover ring-1 ring-cinema-card"
              />
            </div>
          </div>

          <!-- Planned -->
          <div v-if="activity.planned.length" class="flex items-center gap-2">
            <UIcon name="lucide:bookmark" class="h-3 w-3 text-white/40" />
            <span class="text-xs text-white/40">Планируют</span>
            <span class="text-xs text-white/30">{{ activity.planned.length }}</span>
          </div>
        </div>
      </template>

      <!-- No friend activity -->
      <p v-else class="text-xs text-white/30">
        <UIcon name="lucide:user-plus" class="h-3 w-3 inline mr-1" />
        Добавляйте друзей, чтобы видеть их активность
      </p>
    </div>

    <!-- Not authenticated -->
    <div v-else class="px-5 pb-5">
      <p class="text-xs text-white/40">
        <NuxtLink to="/authentication" class="text-cinema-accent hover:underline">
          Войдите
        </NuxtLink>, чтобы видеть активность друзей
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AnimeRatingSummary, Review } from '~/types/social';
import { useAnimeActivity } from '~/composables/useSocial';

const props = defineProps<{
  animeId: string;
  ratingSummary?: AnimeRatingSummary | null;
  myReview?: Review | null;
}>();

defineEmits<{ openReviewForm: [] }>();

const { isAuthenticated } = useAuth();
const { activity, loading: activityLoading, fetchActivity } = useAnimeActivity(
  props.animeId,
);

const reviewsWord = computed(() => {
  if (!props.ratingSummary) return '';
  return pluralize(props.ratingSummary.count, 'отзыв', 'отзыва', 'отзывов');
});

function pluralize(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 19) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

function defaultAvatar(email: string): string {
  return `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(email)}`;
}

onMounted(() => {
  if (isAuthenticated.value) fetchActivity();
});
</script>
