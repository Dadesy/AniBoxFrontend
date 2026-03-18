<template>
  <div class="space-y-4">
    <!-- Подтверждение отправки -->
    <div class="rounded-lg bg-primary/10 border border-primary/20 p-3 text-sm text-center">
      <UIcon name="lucide:mail-check" class="mr-1 size-4 inline-block text-primary" />
      Код отправлен на <strong>{{ email }}</strong>
    </div>

    <UForm :state="state" :schema="schema" class="space-y-4" @submit="handleSubmit">
      <UFormField name="code">
        <template #label>
          <UIcon name="lucide:shield-check" class="mr-2 size-4" />
          <span>Код из письма</span>
        </template>
        <UInput
          v-model="state.code"
          placeholder="000000"
          maxlength="6"
          autocomplete="one-time-code"
          inputmode="numeric"
          class="w-full font-mono text-center text-xl tracking-[0.5em]"
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
        Войти
      </UButton>
    </UForm>

    <!-- Повторная отправка с таймером -->
    <div class="text-center text-sm text-muted">
      <template v-if="cooldown > 0">
        Повторная отправка через {{ cooldown }} сек.
      </template>
      <template v-else>
        <UButton
          variant="link"
          color="neutral"
          class="p-0 h-auto"
          :loading="resendPending"
          @click="handleResend"
        >
          Отправить код повторно
        </UButton>
      </template>
    </div>

    <!-- Вернуться к вводу email -->
    <div class="text-center">
      <UButton
        variant="link"
        color="neutral"
        size="sm"
        class="p-0"
        @click="emit('back')"
      >
        <UIcon name="lucide:arrow-left" class="mr-1 size-3" />
        Изменить email
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z as zod } from 'zod';

const props = defineProps<{
  email: string;
}>();

const emit = defineEmits<{
  (event: 'back'): void;
}>();

const { verifyCode, requestCode } = useAuth();

const schema = zod.object({
  code: zod
    .string()
    .length(6, 'Код должен содержать 6 цифр')
    .regex(/^\d+$/, 'Только цифры'),
});

const state = reactive({ code: '' });
const pending = ref(false);
const resendPending = ref(false);
const cooldown = ref(60); // 60 секунд cooldown при первой отправке

const toast = useToast();

// Запускаем таймер сразу при монтировании (код только что отправлен)
let timer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  startCooldown();
});

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});

function startCooldown(seconds = 60): void {
  cooldown.value = seconds;
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    cooldown.value--;
    if (cooldown.value <= 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  }, 1000);
}

async function handleSubmit(): Promise<void> {
  if (pending.value) return;
  pending.value = true;

  try {
    await verifyCode(props.email, state.code);
    // verifyCode выполняет router.push('/') внутри
  } catch (error: unknown) {
    const message = extractErrorMessage(error, 'Неверный или устаревший код.');
    toast.add({ title: 'Ошибка', description: message, color: 'error' });
    state.code = '';
  } finally {
    pending.value = false;
  }
}

async function handleResend(): Promise<void> {
  if (resendPending.value || cooldown.value > 0) return;
  resendPending.value = true;

  try {
    await requestCode(props.email);
    toast.add({
      title: 'Код отправлен',
      description: `Новый код отправлен на ${props.email}`,
      color: 'success',
    });
    startCooldown(60);
  } catch (error: unknown) {
    const message = extractErrorMessage(error, 'Не удалось отправить код повторно.');
    toast.add({ title: 'Ошибка', description: message, color: 'error' });
  } finally {
    resendPending.value = false;
  }
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = (error as { data: unknown }).data;
    if (typeof data === 'object' && data !== null && 'message' in data) {
      const msg = (data as { message: unknown }).message;
      if (typeof msg === 'string') return msg;
    }
  }
  return fallback;
}
</script>
