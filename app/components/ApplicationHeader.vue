<template>
  <UHeader :toggle="false" class="h-max py-2">
    <template #title>
      <NuxtLink to="/" class="flex items-baseline gap-0.5 no-underline">
        <template v-if="logoAccent">
          <span class="m-0 font-semibold">{{ logoPrimary }}</span>
          <span class="m-0 font-semibold text-emerald-600">{{ logoAccent }}</span>
        </template>
        <span v-else class="m-0 font-semibold">{{ logoPrimary }}</span>
      </NuxtLink>
    </template>

    <template #right>
      <UColorModeButton />

      <!-- Авторизованный пользователь -->
      <template v-if="isAuthenticated && user">
        <!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
        <UDropdownMenu :items="(userMenuItems as any)">
          <UButton variant="ghost" color="neutral" class="gap-2">
            <div
              class="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold"
            >
              {{ userInitial }}
            </div>
            <span class="hidden sm:inline text-sm">{{ user.email }}</span>
            <UIcon name="lucide:chevron-down" class="size-3 text-muted" />
          </UButton>
        </UDropdownMenu>
      </template>

      <!-- Не авторизован -->
      <template v-else>
        <UButton to="/authentication" color="primary">Войти</UButton>
      </template>
    </template>
  </UHeader>
</template>

<script setup lang="ts">
const { user, isAuthenticated, isAdmin, logout } = useAuth();
const { siteName } = useSiteBranding();

const logoPrimary = computed(() => {
  const n = siteName.value;
  if (!n.length) return 'App';
  const i = Math.ceil(n.length / 2);
  return n.slice(0, i);
});
const logoAccent = computed(() => {
  const n = siteName.value;
  const i = Math.ceil(n.length / 2);
  return n.length > 1 ? n.slice(i) : '';
});

const userInitial = computed(() => user.value?.email?.[0]?.toUpperCase() ?? '?');

// Используем as any[] чтобы избежать сложных union-типов UDropdownMenu
// (API @nuxt/ui v4 меняется — упрощаем для совместимости)
const userMenuItems = computed<unknown[]>(() => {
  const items: unknown[] = [
    [
      { label: user.value?.email ?? '', disabled: true },
    ],
    [
      { label: 'Профиль', icon: 'lucide:user', to: '/profile' },
      ...(isAdmin.value
        ? [{ label: 'Админ-панель', icon: 'lucide:shield', to: '/admin' }]
        : []),
    ],
    [
      { label: 'Выйти', icon: 'lucide:log-out', onSelect: () => void logout() },
    ],
  ];
  return items;
});
</script>
