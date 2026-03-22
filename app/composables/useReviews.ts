import type {
  AnimeRatingSummary,
  CreateReviewPayload,
  Review,
  ReviewListResult,
  ReviewSortOrder,
  UpdateReviewPayload,
} from '~/types/social';

export function useReviews(animeId: string) {
  const apiUrl = useApiUrl();

  const reviews = ref<Review[]>([]);
  const myReview = ref<Review | null>(null);
  const total = ref(0);
  const avgRating = ref<number | null>(null);
  const ratingSummary = ref<AnimeRatingSummary | null>(null);
  const loading = ref(false);
  const submitting = ref(false);
  const error = ref<string | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  async function fetchReviews(
    sort: ReviewSortOrder = 'newest',
    limit = 20,
    offset = 0,
  ): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      const data = await $fetch<ReviewListResult>(
        `${apiUrl}/reviews/anime/${animeId}`,
        {
          params: { sort, limit, offset },
          credentials: 'include',
        },
      );
      if (offset === 0) {
        reviews.value = data.items;
      } else {
        reviews.value.push(...data.items);
      }
      total.value = data.total;
      avgRating.value = data.avgRating;
    } catch (e) {
      error.value = extractErrorMessage(e);
    } finally {
      loading.value = false;
    }
  }

  async function fetchMyReview(): Promise<void> {
    try {
      myReview.value = await $fetch<Review | null>(
        `${apiUrl}/reviews/anime/${animeId}/my`,
        { credentials: 'include' },
      );
    } catch {
      myReview.value = null;
    }
  }

  async function fetchRatingSummary(): Promise<void> {
    try {
      ratingSummary.value = await $fetch<AnimeRatingSummary>(
        `${apiUrl}/reviews/anime/${animeId}/rating`,
      );
    } catch {
      ratingSummary.value = null;
    }
  }

  // ── Mutate ────────────────────────────────────────────────────────────────

  async function submitReview(payload: CreateReviewPayload): Promise<Review> {
    submitting.value = true;
    try {
      const created = await $fetch<Review>(`${apiUrl}/reviews`, {
        method: 'POST',
        body: payload,
        credentials: 'include',
      });
      myReview.value = created;
      reviews.value.unshift(created);
      total.value++;
      return created;
    } finally {
      submitting.value = false;
    }
  }

  async function updateReview(
    reviewId: string,
    payload: UpdateReviewPayload,
  ): Promise<Review> {
    submitting.value = true;
    try {
      const updated = await $fetch<Review>(`${apiUrl}/reviews/${reviewId}`, {
        method: 'PATCH',
        body: payload,
        credentials: 'include',
      });
      // Update in list
      const idx = reviews.value.findIndex((r) => r.id === reviewId);
      if (idx !== -1) reviews.value[idx] = updated;
      if (myReview.value?.id === reviewId) myReview.value = updated;
      return updated;
    } finally {
      submitting.value = false;
    }
  }

  async function deleteReview(reviewId: string): Promise<void> {
    await $fetch(`${apiUrl}/reviews/${reviewId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    reviews.value = reviews.value.filter((r) => r.id !== reviewId);
    if (myReview.value?.id === reviewId) myReview.value = null;
    total.value = Math.max(0, total.value - 1);
  }

  async function toggleLike(reviewId: string): Promise<void> {
    // Optimistic update
    const review = reviews.value.find((r) => r.id === reviewId);
    if (!review) return;

    const wasLiked = review.isLikedByMe;
    review.isLikedByMe = !wasLiked;
    review.likesCount += wasLiked ? -1 : 1;

    try {
      const result = await $fetch<{ likesCount: number; isLiked: boolean }>(
        `${apiUrl}/reviews/${reviewId}/like`,
        { method: 'POST', credentials: 'include' },
      );
      review.likesCount = result.likesCount;
      review.isLikedByMe = result.isLiked;
    } catch {
      // Rollback on failure
      review.isLikedByMe = wasLiked;
      review.likesCount += wasLiked ? 1 : -1;
    }
  }

  return {
    reviews: readonly(reviews),
    myReview: readonly(myReview),
    total: readonly(total),
    avgRating: readonly(avgRating),
    ratingSummary: readonly(ratingSummary),
    loading: readonly(loading),
    submitting: readonly(submitting),
    error: readonly(error),
    fetchReviews,
    fetchMyReview,
    fetchRatingSummary,
    submitReview,
    updateReview,
    deleteReview,
    toggleLike,
  };
}

function extractErrorMessage(e: unknown): string {
  if (typeof e === 'object' && e !== null) {
    const err = e as Record<string, unknown>;
    const msg = err.message ?? (err.data as Record<string, unknown>)?.message;
    if (typeof msg === 'string') return msg;
  }
  return 'Произошла ошибка';
}
