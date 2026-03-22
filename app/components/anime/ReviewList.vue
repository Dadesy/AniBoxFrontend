<template>
  <section class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <h2 class="text-xl font-bold text-white">Отзывы</h2>
        <span
          v-if="total > 0"
          class="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white/60"
        >
          {{ total }}
        </span>
      </div>

      <!-- Sort -->
      <select
        v-if="reviews.length > 1"
        v-model="sort"
        class="rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 text-sm text-white/70
               focus:outline-none focus:border-cinema-accent"
        @change="handleSortChange"
      >
        <option value="newest">Новые</option>
        <option value="oldest">Старые</option>
        <option value="highest_rated">Высокая оценка</option>
        <option value="most_liked">Популярные</option>
      </select>
    </div>

    <!-- Rating summary bar -->
    <div
      v-if="ratingSummary && ratingSummary.count > 0"
      class="rounded-2xl bg-cinema-card border border-white/5 p-5"
    >
      <div class="flex items-center gap-6">
        <!-- Average score -->
        <div class="text-center shrink-0">
          <div class="text-5xl font-black text-white leading-none">
            {{ ratingSummary.average.toFixed(1) }}
          </div>
          <div class="flex justify-center mt-1.5 gap-0.5">
            <span
              v-for="n in 10"
              :key="n"
              class="text-xs"
              :class="n <= Math.round(ratingSummary.average) ? 'text-yellow-400' : 'text-white/20'"
            >★</span>
          </div>
          <div class="text-xs text-white/40 mt-1">{{ ratingSummary.count }} отзывов</div>
        </div>

        <!-- Distribution bars -->
        <div class="flex-1 space-y-1">
          <div
            v-for="n in [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]"
            :key="n"
            class="flex items-center gap-2 text-xs"
          >
            <span class="w-4 text-right text-white/40">{{ n }}</span>
            <div class="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                class="h-full rounded-full bg-yellow-400 transition-all duration-700"
                :style="{ width: barWidth(n) }"
              />
            </div>
            <span class="w-4 text-white/30">{{ ratingSummary.distribution[n] ?? 0 }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Write review (if authenticated and no own review) -->
    <template v-if="isAuthenticated">
      <ReviewForm
        v-if="showForm"
        :anime-id="animeId"
        :existing="editingReview ?? undefined"
        :submitting="submitting"
        :error="formError ?? undefined"
        @submit="handleFormSubmit"
        @cancel="cancelEdit"
      />
      <button
        v-else-if="!myReview"
        class="w-full rounded-2xl border border-dashed border-white/20 py-4 text-sm text-white/50
               hover:border-white/40 hover:text-white/70 transition-colors"
        @click="showForm = true"
      >
        + Написать отзыв
      </button>
    </template>

    <!-- Own review (shown above others) -->
    <div
      v-if="myReview"
      class="rounded-2xl ring-1 ring-cinema-accent/40 bg-cinema-card border border-white/5 p-5"
    >
      <div class="flex items-start justify-between mb-1">
        <span class="text-xs text-cinema-accent font-medium">Ваш отзыв</span>
        <div class="flex gap-2">
          <button
            class="text-xs text-white/40 hover:text-white transition-colors"
            @click="startEdit(myReview)"
          >
            Редактировать
          </button>
          <button
            class="text-xs text-red-400/60 hover:text-red-400 transition-colors"
            @click="handleDelete(myReview.id)"
          >
            Удалить
          </button>
        </div>
      </div>
      <ReviewCard :review="myReview" :can-like="false" />
    </div>

    <!-- Skeleton -->
    <template v-if="loading">
      <div
        v-for="n in 3"
        :key="n"
        class="rounded-2xl bg-cinema-card border border-white/5 p-5 space-y-3"
      >
        <div class="flex items-center gap-3">
          <div class="h-9 w-9 rounded-full bg-white/10 skeleton-shine" />
          <div class="flex-1 space-y-1.5">
            <div class="h-3 w-28 rounded bg-white/10 skeleton-shine" />
            <div class="h-2.5 w-16 rounded bg-white/10 skeleton-shine" />
          </div>
        </div>
        <div class="h-2.5 w-3/4 rounded bg-white/10 skeleton-shine" />
        <div class="h-2.5 w-full rounded bg-white/10 skeleton-shine" />
        <div class="h-2.5 w-2/3 rounded bg-white/10 skeleton-shine" />
      </div>
    </template>

    <!-- List -->
    <template v-else>
      <ReviewCard
        v-for="review in otherReviews"
        :key="review.id"
        :review="review"
        :can-like="isAuthenticated"
        @like="() => toggleLike(review.id)"
        @delete="() => handleDelete(review.id)"
      />

      <p
        v-if="!loading && reviews.length === 0 && !myReview"
        class="text-center text-white/40 text-sm py-8"
      >
        Отзывов пока нет. Будьте первым!
      </p>
    </template>

    <!-- Load more -->
    <button
      v-if="total > reviews.length + (myReview ? 1 : 0)"
      class="w-full rounded-xl bg-white/5 py-2.5 text-sm text-white/60
             hover:bg-white/10 transition-colors"
      @click="loadMore"
    >
      Показать ещё
    </button>
  </section>
</template>

<script setup lang="ts">
import type { CreateReviewPayload, Review, UpdateReviewPayload } from '~/types/social';
import { useReviews } from '~/composables/useReviews';

const props = defineProps<{ animeId: string }>();

const { isAuthenticated } = useAuth();

const {
  reviews,
  myReview,
  total,
  ratingSummary,
  loading,
  submitting,
  fetchReviews,
  fetchMyReview,
  fetchRatingSummary,
  submitReview,
  updateReview,
  deleteReview,
  toggleLike,
} = useReviews(props.animeId);

const sort = ref<'newest' | 'oldest' | 'highest_rated' | 'most_liked'>('newest');
const showForm = ref(false);
const editingReview = ref<Review | null>(null);
const formError = ref<string | null>(null);
const offset = ref(0);

const otherReviews = computed(() =>
  myReview.value
    ? reviews.value.filter((r) => r.id !== myReview.value!.id)
    : reviews.value,
);

function barWidth(n: number): string {
  if (!ratingSummary.value) return '0%';
  const max = Math.max(...Object.values(ratingSummary.value.distribution));
  if (max === 0) return '0%';
  const count = ratingSummary.value.distribution[n] ?? 0;
  return `${(count / max) * 100}%`;
}

async function handleSortChange() {
  offset.value = 0;
  await fetchReviews(sort.value, 20, 0);
}

async function loadMore() {
  offset.value += 20;
  await fetchReviews(sort.value, 20, offset.value);
}

function startEdit(review: Review) {
  editingReview.value = review;
  showForm.value = true;
}

function cancelEdit() {
  editingReview.value = null;
  showForm.value = false;
  formError.value = null;
}

async function handleFormSubmit(
  payload: CreateReviewPayload | UpdateReviewPayload,
) {
  formError.value = null;
  try {
    if (editingReview.value) {
      await updateReview(editingReview.value.id, payload as UpdateReviewPayload);
    } else {
      await submitReview(payload as CreateReviewPayload);
    }
    cancelEdit();
    await fetchRatingSummary();
  } catch (e: unknown) {
    formError.value = extractMessage(e);
  }
}

async function handleDelete(reviewId: string) {
  if (!confirm('Удалить отзыв?')) return;
  await deleteReview(reviewId);
  await fetchRatingSummary();
}

function extractMessage(e: unknown): string {
  if (typeof e === 'object' && e !== null) {
    const err = e as Record<string, unknown>;
    const msg = err.message ?? (err.data as Record<string, unknown> | undefined)?.message;
    if (typeof msg === 'string') return msg;
  }
  return 'Произошла ошибка';
}

onMounted(async () => {
  await Promise.all([
    fetchReviews(),
    fetchRatingSummary(),
    isAuthenticated.value ? fetchMyReview() : Promise.resolve(),
  ]);
});
</script>
