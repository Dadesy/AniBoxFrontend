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

export const useAuth = () => {
  const router = useRouter();

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
    await router.push('/');
  }

  /**
   * Получить текущего пользователя (используется при инициализации и после refresh).
   * При 401 пытается обновить токен через /auth/refresh, затем повторяет.
   */
  async function fetchMe(): Promise<void> {
    try {
      const data = await $fetch<AuthUser>(`${apiUrl}/auth/me`, {
        credentials: 'include',
      });
      user.value = data;
    } catch (error: unknown) {
      if (isHttpError(error, 401)) {
        // Пробуем обновить access token через refresh token
        const refreshed = await tryRefresh();
        if (refreshed) {
          try {
            const data = await $fetch<AuthUser>(`${apiUrl}/auth/me`, {
              credentials: 'include',
            });
            user.value = data;
            return;
          } catch {
            // refresh прошёл, но /me всё равно упало — сбрасываем
          }
        }
      }
      user.value = null;
    } finally {
      isInitialized.value = true;
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
      await router.push('/authentication');
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

function isHttpError(error: unknown, status: number): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    (error as { statusCode: number }).statusCode === status
  );
}
