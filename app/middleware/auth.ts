/**
 * middleware/auth.ts
 *
 * Защита маршрутов: только для авторизованных пользователей.
 * Используется через definePageMeta({ middleware: 'auth' }).
 *
 * На сервере: плагин auth.ts уже восстановил сессию из cookies.
 * На клиенте: ждёт nuxtApp._authInit (promise из плагина), чтобы
 * исключить race condition между async-плагином и middleware.
 */
export default defineNuxtRouteMiddleware(async (_to, _from) => {
  // ── Сервер ────────────────────────────────────────────────────────────────
  // Плагин уже выполнил /auth/me с forwarded cookies.
  // Если не смог инициализировать (токен истёк) — не редиректим с сервера:
  // клиент запустит refresh через fetchMe().
  if (import.meta.server) {
    const { isAuthenticated, isInitialized } = useAuth();
    if (isInitialized.value && !isAuthenticated.value) {
      return navigateTo('/authentication');
    }
    return;
  }

  // ── Клиент ────────────────────────────────────────────────────────────────
  const nuxtApp = useNuxtApp();

  // Ждём плагин: убирает гонку «middleware запустился до завершения плагина»
  if (nuxtApp._authInit) {
    await nuxtApp._authInit;
  } else {
    // Fallback: плагин не успел выставить _authInit (крайне маловероятно)
    const { isInitialized, fetchMe } = useAuth();
    if (!isInitialized.value) await fetchMe();
  }

  const { isAuthenticated } = useAuth();
  if (!isAuthenticated.value) {
    return navigateTo('/authentication');
  }
});
