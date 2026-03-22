<template>
  <section class="space-y-6">
    <!-- Header -->
    <h2 class="text-xl font-bold text-white">Комментарии</h2>

    <!-- Write comment (auth required) -->
    <CommentForm
      v-if="isAuthenticated"
      :anime-id="animeId"
      :submitting="submitting"
      @submit="handleTopLevelSubmit"
    />
    <p v-else class="text-sm text-white/40 rounded-xl bg-white/5 px-4 py-3">
      <NuxtLink to="/authentication" class="text-cinema-accent hover:underline">
        Войдите
      </NuxtLink>, чтобы оставить комментарий
    </p>

    <!-- Skeleton -->
    <template v-if="loading && threads.length === 0">
      <div
        v-for="n in 4"
        :key="n"
        class="rounded-2xl bg-cinema-card border border-white/5 p-4 space-y-3"
      >
        <div class="flex items-center gap-3">
          <div class="h-8 w-8 rounded-full bg-white/10 skeleton-shine shrink-0" />
          <div class="h-3 w-24 rounded bg-white/10 skeleton-shine" />
        </div>
        <div class="h-2.5 w-full rounded bg-white/10 skeleton-shine" />
        <div class="h-2.5 w-4/5 rounded bg-white/10 skeleton-shine" />
      </div>
    </template>

    <!-- Comment threads -->
    <template v-else>
      <article
        v-for="thread in threads"
        :key="thread.id"
        class="rounded-2xl bg-cinema-card border border-white/5 p-4"
      >
        <!-- Top-level comment -->
        <CommentItem
          :comment="thread"
          :can-delete="canDelete(thread.author.id)"
          @delete="deleteComment(thread.id)"
          @reply="replyingTo = thread.id"
        />

        <!-- Replies -->
        <div
          v-if="thread.replies.length > 0"
          class="mt-3 ml-8 pl-4 border-l border-white/10 space-y-3"
        >
          <CommentItem
            v-for="reply in thread.replies"
            :key="reply.id"
            :comment="reply"
            :can-delete="canDelete(reply.author.id)"
            @delete="deleteComment(reply.id, thread.id)"
            @reply="replyingTo = thread.id"
          />
        </div>

        <!-- Reply form -->
        <div v-if="replyingTo === thread.id" class="mt-3 ml-8">
          <CommentForm
            :anime-id="animeId"
            :reply-to="thread.id"
            :submitting="submitting"
            @submit="handleReplySubmit"
            @cancel-reply="replyingTo = null"
          />
        </div>

        <!-- Load more replies button -->
        <button
          v-if="thread.replyCount > thread.replies.length"
          class="mt-2 ml-8 text-xs text-cinema-accent hover:underline"
          @click="replyingTo = thread.id"
        >
          + ещё {{ thread.replyCount - thread.replies.length }} ответов
        </button>
      </article>
    </template>

    <!-- Empty state -->
    <p
      v-if="!loading && threads.length === 0"
      class="text-center text-white/40 text-sm py-6"
    >
      Комментариев пока нет
    </p>

    <!-- Load more -->
    <button
      v-if="hasMore"
      :disabled="loading"
      class="w-full rounded-xl bg-white/5 py-2.5 text-sm text-white/60
             hover:bg-white/10 transition-colors disabled:opacity-40"
      @click="loadMore"
    >
      {{ loading ? 'Загрузка...' : 'Загрузить ещё' }}
    </button>
  </section>
</template>

<script setup lang="ts">
import { useComments } from '~/composables/useComments';

const props = defineProps<{ animeId: string }>();

const { user, isAuthenticated } = useAuth();
const { threads, hasMore, loading, submitting, fetchComments, loadMore, submitComment, deleteComment } =
  useComments(props.animeId);

const replyingTo = ref<string | null>(null);

function canDelete(authorId: string): boolean {
  if (!user.value) return false;
  return user.value.id === authorId || user.value.role === 'ADMIN';
}

async function handleTopLevelSubmit(payload: {
  animeId: string;
  content: string;
  parentId?: string;
}) {
  await submitComment(payload);
}

async function handleReplySubmit(payload: {
  animeId: string;
  content: string;
  parentId?: string;
}) {
  await submitComment(payload);
  replyingTo.value = null;
}

onMounted(() => fetchComments(true));
</script>
