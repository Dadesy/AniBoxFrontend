<template>
  <div class="space-y-6">
    <!-- Заголовок -->
    <div class="space-y-2 text-center">
      <h1 class="text-3xl font-semibold tracking-tight">
        {{ step === 'email' ? `Вход в ${siteName}` : 'Введите код' }}
      </h1>
      <p class="text-base text-muted">
        {{
          step === 'email'
            ? 'Введите email — мы пришлём одноразовый код для входа.'
            : 'Код действует 10 минут и может быть использован только один раз.'
        }}
      </p>
    </div>

    <UCard>
      <!-- Шаг 1: ввод email -->
      <AuthenticationEmailStep
        v-if="step === 'email'"
        @code-sent="handleCodeSent"
      />

      <!-- Шаг 2: ввод кода -->
      <AuthenticationCodeStep
        v-else-if="step === 'code'"
        :email="pendingEmail"
        @back="handleBack"
      />
    </UCard>

    <!-- Индикатор шагов -->
    <div class="flex justify-center gap-2">
      <div
        class="h-2 w-8 rounded-full transition-colors"
        :class="step === 'email' ? 'bg-primary' : 'bg-muted'"
      />
      <div
        class="h-2 w-8 rounded-full transition-colors"
        :class="step === 'code' ? 'bg-primary' : 'bg-muted'"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import AuthenticationCodeStep from '~/components/authentication/AuthenticationCodeStep.vue';
import AuthenticationEmailStep from '~/components/authentication/AuthenticationEmailStep.vue';

definePageMeta({
  layout: 'authentication',
});

type Step = 'email' | 'code';

const { siteName } = useSiteBranding();

const step = ref<Step>('email');
const pendingEmail = ref('');

function handleCodeSent(email: string): void {
  pendingEmail.value = email;
  step.value = 'code';
}

function handleBack(): void {
  step.value = 'email';
  pendingEmail.value = '';
}
</script>
