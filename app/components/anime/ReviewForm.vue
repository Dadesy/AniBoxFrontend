<template>
  <div class="rounded-2xl bg-cinema-card border border-white/5 p-6">
    <h3 class="text-lg font-semibold text-white mb-5">
      {{ isEditing ? 'Редактировать отзыв' : 'Написать отзыв' }}
    </h3>

    <!-- Star rating -->
    <div class="mb-5">
      <p class="text-sm text-white/50 mb-2">Оценка</p>
      <div class="flex gap-1">
        <button
          v-for="n in 10"
          :key="n"
          type="button"
          class="text-2xl transition-transform duration-100 hover:scale-110 focus:outline-none"
          :class="n <= (hoverRating || form.rating) ? 'text-yellow-400' : 'text-white/20'"
          @mouseenter="hoverRating = n"
          @mouseleave="hoverRating = 0"
          @click="form.rating = n"
        >
          ★
        </button>
        <span class="ml-2 text-sm text-white/50 self-center">
          {{ form.rating ? ratingLabel(form.rating) : 'Выберите оценку' }}
        </span>
      </div>
    </div>

    <!-- Title -->
    <div class="mb-4">
      <label class="block text-sm text-white/50 mb-1">Заголовок</label>
      <input
        v-model="form.title"
        type="text"
        maxlength="150"
        placeholder="Кратко о впечатлении..."
        class="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white
               placeholder:text-white/30 focus:outline-none focus:border-cinema-accent transition-colors"
      />
    </div>

    <!-- Content -->
    <div class="mb-5">
      <label class="block text-sm text-white/50 mb-1">Текст отзыва</label>
      <textarea
        v-model="form.content"
        rows="5"
        maxlength="5000"
        placeholder="Поделитесь своими впечатлениями..."
        class="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white
               placeholder:text-white/30 focus:outline-none focus:border-cinema-accent transition-colors
               resize-none"
      />
      <p class="text-xs text-white/30 mt-1 text-right">
        {{ form.content.length }}/5000
      </p>
    </div>

    <!-- Error -->
    <p v-if="error" class="text-red-400 text-sm mb-4">{{ error }}</p>

    <!-- Actions -->
    <div class="flex gap-3">
      <button
        type="button"
        :disabled="!canSubmit || submitting"
        class="flex-1 rounded-xl bg-cinema-accent py-2.5 text-sm font-semibold text-white
               disabled:opacity-40 disabled:cursor-not-allowed
               hover:bg-cinema-accent/80 active:scale-95 transition-all duration-150"
        @click="handleSubmit"
      >
        <span v-if="submitting" class="flex items-center justify-center gap-2">
          <UIcon name="lucide:loader-2" class="animate-spin h-4 w-4" />
          Сохраняем...
        </span>
        <span v-else>{{ isEditing ? 'Сохранить' : 'Опубликовать' }}</span>
      </button>
      <button
        v-if="isEditing || onCancel"
        type="button"
        class="px-4 rounded-xl bg-white/5 text-sm text-white/70 hover:bg-white/10 transition-colors"
        @click="handleCancel"
      >
        Отмена
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CreateReviewPayload, Review, UpdateReviewPayload } from '~/types/social';

const props = defineProps<{
  animeId: string;
  /** Pass to pre-fill the form for editing */
  existing?: Review;
  submitting?: boolean;
  error?: string | null;
}>();

const emit = defineEmits<{
  submit: [payload: CreateReviewPayload | UpdateReviewPayload];
  cancel: [];
}>();

const onCancel = computed(() => !!props.existing);
const isEditing = computed(() => !!props.existing);

const hoverRating = ref(0);
const form = reactive({
  rating: props.existing?.rating ?? 0,
  title: props.existing?.title ?? '',
  content: props.existing?.content ?? '',
});

// Sync when existing changes (e.g. entering edit mode)
watch(
  () => props.existing,
  (e) => {
    if (e) {
      form.rating = e.rating;
      form.title = e.title;
      form.content = e.content;
    }
  },
);

const canSubmit = computed(
  () =>
    form.rating > 0 &&
    form.title.trim().length >= 2 &&
    form.content.trim().length >= 10,
);

function handleSubmit() {
  if (!canSubmit.value) return;
  if (isEditing.value) {
    emit('submit', {
      title: form.title.trim(),
      content: form.content.trim(),
      rating: form.rating,
    } satisfies UpdateReviewPayload);
  } else {
    emit('submit', {
      animeId: props.animeId,
      title: form.title.trim(),
      content: form.content.trim(),
      rating: form.rating,
    } satisfies CreateReviewPayload);
  }
}

function handleCancel() {
  emit('cancel');
}

function ratingLabel(n: number): string {
  const labels: Record<number, string> = {
    1: 'Кошмар',
    2: 'Ужасно',
    3: 'Плохо',
    4: 'Слабо',
    5: 'Нормально',
    6: 'Хорошо',
    7: 'Очень хорошо',
    8: 'Отлично',
    9: 'Великолепно',
    10: 'Шедевр',
  };
  return labels[n] ?? '';
}
</script>
