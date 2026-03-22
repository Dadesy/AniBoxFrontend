/**
 * composables/useAuth.ts
 *
 * Глобальное состояние аутентификации.
 * useState — SSR-совместимый стейт, шарится между компонентами.
 */

export interface AuthUser {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

/** Один общий запрос, если `fetchMe` дергают плагин и middleware одновременно */
let fetchMeInFlight: Promise<void> | null = null;

export const useAuth = () => {
  // ── Глобальный стейт ────────────────────────────────────────────────────
  const user = useState<AuthUser | null>('auth:user', () => null);
  const isInitialized = useState<boolean>('auth:initialized', () => false);

  const isAuthenticated = computed(() => user.value !== null);
  const isAdmin = computed(() => user.value?.role === 'ADMIN');

  // ── API base ─────────────────────────────────────────────────────────────
  const apiUrl = useApiUrl();

  // ── Методы ───────────────────────────────────────────────────────────────

  /**
   * Шаг 1: Запросить одноразовый код на email.
   */
  async function requestCode(email: string): Promise<void> {
    await $fetch(`${apiUrl}/auth/email/request-code`, {
      method: 'POST',
      body: { email },
      credentials: 'include',
    });
  }

  /**
   * Шаг 2: Верифицировать код — если успешно, устанавливаются httpOnly cookies.
   */
  async function verifyCode(email: string, code: string): Promise<void> {
    const data = await $fetch<{ user: AuthUser }>(`${apiUrl}/auth/email/verify-code`, {
      method: 'POST',
      body: { email, code },
      credentials: 'include',
    });
    user.value = data.user;
    isInitialized.value = true;
    await navigateTo('/');
  }

  /**
   * Получить текущего пользователя (используется при инициализации и после refresh).
   * При 401 пытается обновить токен через /auth/refresh, затем повторяет.
   */
  async function fetchMe(): Promise<void> {
    if (fetchMeInFlight) {
      return fetchMeInFlight;
    }

    fetchMeInFlight = (async () => {
      try {
        const data = await $fetch<AuthUser>(`${apiUrl}/auth/me`, {
          credentials: 'include',
        });
        user.value = data;
      } catch (error: unknown) {
        // Пробуем refresh при 401 и при любой другой ошибке (CORS, network, etc.).
        // Если access_token не пришёл к бэку (cross-origin SameSite=Lax) — статус
        // может быть любым; refresh с действующим токеном всё равно восстановит сессию.
        const status = getHttpStatus(error);
        const shouldTryRefresh = status === undefined || status === 0 || status === 401;

        if (shouldTryRefresh) {
          const refreshed = await tryRefresh();
          if (refreshed) {
            try {
              const data = await $fetch<AuthUser>(`${apiUrl}/auth/me`, {
                credentials: 'include',
              });
              user.value = data;
              return;
            } catch {
              /* fallthrough → user.value = null */
            }
          }
        }
        user.value = null;
      } finally {
        isInitialized.value = true;
      }
    })();

    try {
      await fetchMeInFlight;
    } finally {
      fetchMeInFlight = null;
    }
  }

  /**
   * Тихий refresh access token.
   * Возвращает true, если refresh прошёл успешно.
   */
  async function tryRefresh(): Promise<boolean> {
    try {
      await $fetch(`${apiUrl}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Выйти из системы: отзывает refresh token, очищает cookies и стейт.
   */
  async function logout(): Promise<void> {
    try {
      await $fetch(`${apiUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      user.value = null;
      await navigateTo('/authentication');
    }
  }

  return {
    user,
    isAuthenticated,
    isAdmin,
    isInitialized,
    requestCode,
    verifyCode,
    fetchMe,
    logout,
  };
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Статус HTTP из ошибки $fetch/ofetch/H3Error */
function getHttpStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) return undefined;
  const e = error as Record<string, unknown>;
  for (const key of ['statusCode', 'status'] as const) {
    const v = e[key];
    if (typeof v === 'number' && Number.isFinite(v)) return v;
  }
  const response = e.response;
  if (response && typeof response === 'object') {
    const r = response as Record<string, unknown>;
    const s = r.status ?? r.statusCode;
    if (typeof s === 'number' && Number.isFinite(s)) return s;
  }
  return undefined;
}
