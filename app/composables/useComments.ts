import type { Comment, CommentThread, CommentsPage, CreateCommentPayload } from '~/types/social';

export function useComments(animeId: string) {
  const apiUrl = useApiUrl();

  const threads = ref<CommentThread[]>([]);
  const nextCursor = ref<string | null>(null);
  const loading = ref(false);
  const submitting = ref(false);
  const hasMore = computed(() => nextCursor.value !== null);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  async function fetchComments(reset = false): Promise<void> {
    if (loading.value) return;

    if (reset) {
      threads.value = [];
      nextCursor.value = null;
    }

    loading.value = true;
    try {
      const data = await $fetch<CommentsPage>(
        `${apiUrl}/comments/anime/${animeId}`,
        {
          params: {
            ...(nextCursor.value ? { cursor: nextCursor.value } : {}),
            limit: 20,
          },
        },
      );

      threads.value.push(...data.items);
      nextCursor.value = data.nextCursor;
    } finally {
      loading.value = false;
    }
  }

  async function loadMore(): Promise<void> {
    if (!hasMore.value) return;
    await fetchComments(false);
  }

  // ── Mutate ────────────────────────────────────────────────────────────────

  async function submitComment(payload: CreateCommentPayload): Promise<Comment> {
    submitting.value = true;
    try {
      const created = await $fetch<Comment>(`${apiUrl}/comments`, {
        method: 'POST',
        body: payload,
        credentials: 'include',
      });

      if (!payload.parentId) {
        // Top-level: prepend to list (optimistic, newest first)
        threads.value.unshift({
          ...created,
          replies: [],
        });
      } else {
        // Reply: push into parent thread
        const parent = threads.value.find((t) => t.id === payload.parentId);
        if (parent) {
          parent.replies.push(created);
          parent.replyCount = (parent.replyCount ?? 0) + 1;
        }
      }

      return created;
    } finally {
      submitting.value = false;
    }
  }

  async function deleteComment(commentId: string, parentId?: string): Promise<void> {
    await $fetch(`${apiUrl}/comments/${commentId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!parentId) {
      threads.value = threads.value.filter((t) => t.id !== commentId);
    } else {
      const parent = threads.value.find((t) => t.id === parentId);
      if (parent) {
        parent.replies = parent.replies.filter((r) => r.id !== commentId);
        parent.replyCount = Math.max(0, (parent.replyCount ?? 1) - 1);
      }
    }
  }

  return {
    threads: readonly(threads),
    nextCursor: readonly(nextCursor),
    hasMore,
    loading: readonly(loading),
    submitting: readonly(submitting),
    fetchComments,
    loadMore,
    submitComment,
    deleteComment,
  };
}
