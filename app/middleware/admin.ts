/**
 * middleware/admin.ts
 *
 * Защита маршрутов: только для администраторов.
 * Используется через definePageMeta({ middleware: 'admin' }).
 */
export default defineNuxtRouteMiddleware((_to, _from) => {
  if (import.meta.server) return;

  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated.value) {
    return navigateTo('/authentication');
  }

  if (!isAdmin.value) {
    return navigateTo('/');
  }
});
