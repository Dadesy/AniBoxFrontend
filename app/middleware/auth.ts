/**
 * middleware/auth.ts
 *
 * Защита маршрутов: только для авторизованных пользователей.
 * Используется через definePageMeta({ middleware: 'auth' }).
 *
 * Работает только на клиенте (access_token в httpOnly cookie недоступен на сервере).
 */
export default defineNuxtRouteMiddleware((_to, _from) => {
  if (import.meta.server) return;

  const { isAuthenticated } = useAuth();

  if (!isAuthenticated.value) {
    return navigateTo('/authentication');
  }
});
