/**
 * plugins/auth.ts
 *
 * Универсальный плагин (SSR + клиент), enforce: 'pre'.
 *
 * Ключевые гарантии:
 *  1. nuxtApp._authInit — Promise, который создаётся ДО await.
 *     Middleware может await его даже при гонке с плагином.
 *  2. SSR: пробрасывает Cookie-заголовок напрямую к бэкенду,
 *     восстанавливает user до гидрации.
 *  3. Клиент: если SSR не смог (токен истёк) — запускает
 *     полный fetchMe() с refresh-поддержкой.
 */
import type { AuthUser } from '~/composables/useAuth';

// Позволяет middleware обращаться к nuxtApp._authInit через useNuxtApp()
declare module '#app' {
  interface NuxtApp {
    _authInit?: Promise<void>;
  }
}

export default defineNuxtPlugin({
  name: 'auth-session',
  enforce: 'pre',

  async setup(nuxtApp) {
    const { user, isInitialized, fetchMe } = useAuth();

    // Уже инициализировано (клиентская навигация после первой загрузки)
    if (isInitialized.value) {
      nuxtApp._authInit = Promise.resolve();
      return;
    }

    const doInit = async (): Promise<void> => {
      // ── SSR: пробрасываем cookies браузера в бэкенд ───────────────────────
      if (import.meta.server) {
        const { cookie } = useRequestHeaders(['cookie']);

        // Нет access_token — нечего проверять, клиент попробует refresh
        if (!cookie?.includes('access_token')) return;

        const apiUrl = useApiUrl();
        try {
          const data = await $fetch<{ id: string; email: string; role: string }>(
            `${apiUrl}/auth/me`,
            { headers: { cookie } },
          );
          user.value = {
            id: data.id,
            email: data.email,
            role: data.role as AuthUser['role'],
          };
          isInitialized.value = true;
        } catch {
          // access_token истёк — isInitialized намеренно false,
          // клиент запустит fetchMe() и обновит через refresh
        }
        return;
      }

      // ── Клиент: полный цикл (fetchMe → refresh при 401) ──────────────────
      await fetchMe();
    };

    // Сохраняем promise ДО await — middleware может его await-ить,
    // даже если он запускается параллельно с плагином
    nuxtApp._authInit = doInit();
    await nuxtApp._authInit;
  },
});
