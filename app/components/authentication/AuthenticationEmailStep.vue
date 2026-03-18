<template>
  <UForm :state="state" :schema="schema" class="space-y-4" @submit="handleSubmit">
    <UFormField name="email">
      <template #label>
        <UIcon name="lucide:mail" class="mr-2 size-4" />
        <span>Email</span>
      </template>
      <UInput
        v-model="state.email"
        type="email"
        placeholder="you@example.com"
        autocomplete="email"
        class="w-full"
        :disabled="pending"
      />
    </UFormField>

    <UButton
      type="submit"
      color="primary"
      class="w-full justify-center"
      :loading="pending"
      :disabled="pending"
    >
      Получить код
    </UButton>
  </UForm>
</template>

<script setup lang="ts">
import { z as zod } from 'zod';

const emit = defineEmits<{
  (event: 'code-sent', email: string): void;
}>();

const { requestCode } = useAuth();

const schema = zod.object({
  email: zod
    .string()
    .trim()
    .min(1, 'Email обязателен')
    .pipe(zod.email({ message: 'Некорректный email' })),
});

const state = reactive({ email: '' });
const pending = ref(false);

const toast = useToast();

async function handleSubmit(): Promise<void> {
  if (pending.value) return;
  pending.value = true;

  try {
    await requestCode(state.email.trim().toLowerCase());
    emit('code-sent', state.email.trim().toLowerCase());
  } catch (error: unknown) {
    const message = extractErrorMessage(error, 'Не удалось отправить код. Попробуйте позже.');
    toast.add({ title: 'Ошибка', description: message, color: 'error' });
  } finally {
    pending.value = false;
  }
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'data' in error &&
    typeof (error as { data: unknown }).data === 'object' &&
    (error as { data: { message?: unknown } }).data !== null
  ) {
    const msg = (error as { data: { message?: unknown } }).data.message;
    if (typeof msg === 'string') return msg;
  }
  return fallback;
}
</script>
