<template>
  <div class="flex gap-3">
    <!-- Avatar placeholder -->
    <div
      class="h-8 w-8 rounded-full bg-cinema-accent/20 flex items-center justify-center
             text-sm font-bold text-cinema-accent shrink-0 mt-0.5"
    >
      {{ userInitial }}
    </div>

    <div class="flex-1">
      <!-- Reply indicator -->
      <div
        v-if="replyTo"
        class="flex items-center gap-1.5 text-xs text-white/40 mb-1.5"
      >
        <UIcon name="lucide:corner-down-right" class="h-3 w-3" />
        Ответ на комментарий
        <button class="text-white/30 hover:text-white/60 ml-1" @click="$emit('cancelReply')">
          ✕
        </button>
      </div>

      <div class="relative">
        <textarea
          ref="textareaRef"
          v-model="content"
          :placeholder="replyTo ? 'Напишите ответ...' : 'Оставьте комментарий...'"
          rows="1"
          maxlength="2000"
          class="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white
                 placeholder:text-white/30 focus:outline-none focus:border-cinema-accent transition-colors
                 resize-none overflow-hidden"
          @input="autoResize"
          @keydown.ctrl.enter="handleSubmit"
          @keydown.meta.enter="handleSubmit"
          @focus="focused = true"
          @blur="focused = false"
        />
      </div>

      <!-- Actions (visible on focus or when content exists) -->
      <div
        v-if="focused || content.length > 0"
        class="flex items-center justify-between mt-2"
      >
        <span class="text-xs text-white/20">{{ content.length }}/2000 · Ctrl+Enter для отправки</span>
        <div class="flex gap-2">
          <button
            v-if="replyTo || content.length > 0"
            class="text-xs text-white/40 hover:text-white/70 px-3 py-1.5 transition-colors"
            @click="handleCancel"
          >
            Отмена
          </button>
          <button
            :disabled="!canSubmit || submitting"
            class="rounded-lg bg-cinema-accent px-4 py-1.5 text-xs font-semibold text-white
                   disabled:opacity-40 disabled:cursor-not-allowed
                   hover:bg-cinema-accent/80 active:scale-95 transition-all"
            @click="handleSubmit"
          >
            <span v-if="submitting">
              <UIcon name="lucide:loader-2" class="h-3 w-3 animate-spin" />
            </span>
            <span v-else>Отправить</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  animeId: string;
  replyTo?: string; // parentId
  submitting?: boolean;
}>();

const emit = defineEmits<{
  submit: [payload: { animeId: string; content: string; parentId?: string }];
  cancelReply: [];
}>();

const { user } = useAuth();
const userInitial = computed(() => user.value?.email?.[0]?.toUpperCase() ?? '?');

const content = ref('');
const focused = ref(false);
const textareaRef = ref<HTMLTextAreaElement | null>(null);

const canSubmit = computed(() => content.value.trim().length >= 1);

function autoResize() {
  const el = textareaRef.value;
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
}

async function handleSubmit() {
  if (!canSubmit.value || props.submitting) return;
  emit('submit', {
    animeId: props.animeId,
    content: content.value.trim(),
    ...(props.replyTo ? { parentId: props.replyTo } : {}),
  });
  content.value = '';
  if (textareaRef.value) textareaRef.value.style.height = 'auto';
}

function handleCancel() {
  content.value = '';
  focused.value = false;
  if (props.replyTo) emit('cancelReply');
}
</script>
