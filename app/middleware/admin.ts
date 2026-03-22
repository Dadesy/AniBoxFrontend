/**
 * middleware/admin.ts
 *
 * Защита маршрутов: только для администраторов.
 * Используется через definePageMeta({ middleware: 'admin' }).
 */
export default defineNuxtRouteMiddleware(async (_to, _from) => {
  if (import.meta.server) {
    const { isAuthenticated, isAdmin, isInitialized } = useAuth();
    if (isInitialized.value && !isAuthenticated.value) {
      return navigateTo('/authentication');
    }
    if (isInitialized.value && isAuthenticated.value && !isAdmin.value) {
      return navigateTo('/');
    }
    return;
  }

  const nuxtApp = useNuxtApp();

  // Ждём плагин: убирает гонку «middleware запустился до завершения плагина»
  if (nuxtApp._authInit) {
    await nuxtApp._authInit;
  } else {
    const { isInitialized, fetchMe } = useAuth();
    if (!isInitialized.value) await fetchMe();
  }

  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated.value) return navigateTo('/authentication');
  if (!isAdmin.value) return navigateTo('/');
});
