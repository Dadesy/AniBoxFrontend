<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <UIcon name="lucide:shield" class="size-7 text-warning-500" />
      <div>
        <h1 class="text-2xl font-semibold">Панель администратора</h1>
        <p class="text-muted text-sm">Доступ только для роли ADMIN</p>
      </div>
    </div>

    <UCard>
      <div class="space-y-4">
        <UAlert
          color="warning"
          variant="soft"
          title="Административная зона"
          description="Вы вошли как администратор. Здесь будут располагаться инструменты управления контентом, пользователями и настройками."
          icon="lucide:alert-triangle"
        />

        <USeparator />

        <!-- Заглушки для будущего функционала -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <UCard
            v-for="item in adminSections"
            :key="item.title"
            class="cursor-not-allowed opacity-60"
          >
            <div class="flex items-center gap-3">
              <UIcon :name="item.icon" class="size-6 text-primary" />
              <div>
                <p class="font-medium text-sm">{{ item.title }}</p>
                <p class="text-xs text-muted">{{ item.description }}</p>
              </div>
            </div>
          </UCard>
        </div>

        <USeparator />

        <div class="text-sm text-muted">
          Вы вошли как: <strong>{{ user?.email }}</strong>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'admin',
});

const { user } = useAuth();

const adminSections = [
  { title: 'Пользователи', description: 'Управление аккаунтами', icon: 'lucide:users' },
  { title: 'Аниме', description: 'Управление каталогом и плеером', icon: 'lucide:tv' },
  { title: 'S3 Хранилище', description: 'Управление медиафайлами', icon: 'lucide:hard-drive' },
  { title: 'Роли', description: 'Назначение прав доступа', icon: 'lucide:shield-check' },
  { title: 'Логи', description: 'История входов и событий', icon: 'lucide:scroll-text' },
  { title: 'Настройки', description: 'Конфигурация системы', icon: 'lucide:settings' },
];
</script>
