/**
 * composables/useWatchProgress.ts
 *
 * Управляет сохранением и восстановлением прогресса просмотра.
 * Throttle: сохраняет раз в 15 секунд + при pause/beforeunload.
 */

import type { EpisodeProgress, SaveProgressPayload } from '~/types/content';
import type { SaveProgressResponse } from '~/types/gamification';
import { useGamification } from '~/composables/useGamification';

const SAVE_INTERVAL_MS = 15_000; // 15 секунд
const MIN_SAVE_TIME = 5;         // не сохранять если смотрел < 5 секунд

export const useWatchProgress = () => {
  const { isAuthenticated } = useAuth();
  const apiUrl = useApiUrl();
  const { processExpResult } = useGamification();

  // ── State ─────────────────────────────────────────────────────────────────
  const currentProgress = ref<EpisodeProgress | null>(null);
  const isSaving = ref(false);

  let saveTimer: ReturnType<typeof setTimeout> | null = null;
  let pendingPayload: SaveProgressPayload | null = null;

  // ── Save ──────────────────────────────────────────────────────────────────
  async function doSave(payload: SaveProgressPayload): Promise<void> {
    if (!isAuthenticated.value) return;
    if (payload.currentTime < MIN_SAVE_TIME) return;

    isSaving.value = true;
    try {
      const res = await $fetch<SaveProgressResponse>(`${apiUrl}/progress`, {
        method: 'POST',
        body: payload,
        credentials: 'include',
      });
      if (res?.expResult) {
        processExpResult(res.expResult);
      }
    } catch (error) {
      console.warn('[useWatchProgress] save failed:', error);
    } finally {
      isSaving.value = false;
    }
  }

  /**
   * Запланировать сохранение с throttle.
   * Вызывать при каждом time_update.
   */
  function scheduleSave(payload: SaveProgressPayload): void {
    pendingPayload = payload;

    if (saveTimer) return; // уже запланировано

    saveTimer = setTimeout(async () => {
      saveTimer = null;
      if (pendingPayload) {
        await doSave(pendingPayload);
        pendingPayload = null;
      }
    }, SAVE_INTERVAL_MS);
  }

  /**
   * Немедленное сохранение (при pause, beforeunload, смене серии).
   */
  async function saveNow(payload: SaveProgressPayload): Promise<void> {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
    pendingPayload = null;
    await doSave(payload);
  }

  /**
   * Загрузить сохранённый прогресс для конкретного эпизода.
   */
  async function loadProgress(
    externalId: string,
    season?: number,
    episode?: number,
    translationId?: number,
  ): Promise<EpisodeProgress | null> {
    if (!isAuthenticated.value) return null;

    try {
      const params = new URLSearchParams();
      if (season !== undefined) params.set('season', String(season));
      if (episode !== undefined) params.set('episode', String(episode));
      if (translationId !== undefined) params.set('translationId', String(translationId));

      const data = await $fetch<EpisodeProgress | null>(
        `${apiUrl}/progress/${encodeURIComponent(externalId)}?${params}`,
        { credentials: 'include' },
      );

      currentProgress.value = data ?? null;
      return data ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Получить прогресс по всем эпизодам тайтла.
   */
  async function loadTitleProgress(externalId: string): Promise<EpisodeProgress[]> {
    if (!isAuthenticated.value) return [];

    try {
      return await $fetch<EpisodeProgress[]>(
        `${apiUrl}/progress/${encodeURIComponent(externalId)}/title`,
        { credentials: 'include' },
      );
    } catch {
      return [];
    }
  }

  /**
   * Получить "продолжить просмотр".
   */
  async function loadContinueWatching(limit = 10): Promise<EpisodeProgress[]> {
    if (!isAuthenticated.value) return [];

    try {
      return await $fetch<EpisodeProgress[]>(
        `${apiUrl}/progress/continue-watching?limit=${limit}`,
        { credentials: 'include' },
      );
    } catch {
      return [];
    }
  }

  // ── Cleanup ───────────────────────────────────────────────────────────────
  function cleanup(): void {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
  }

  onBeforeUnmount(cleanup);

  return {
    currentProgress,
    isSaving,
    scheduleSave,
    saveNow,
    loadProgress,
    loadTitleProgress,
    loadContinueWatching,
    cleanup,
  };
};
