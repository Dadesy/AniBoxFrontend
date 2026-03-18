/**
 * plugins/auth.client.ts
 *
 * Суффикс `.client.ts` — запускается только в браузере.
 * Восстанавливает сессию пользователя при первой загрузке приложения.
 */
export default defineNuxtPlugin(async () => {
  const { fetchMe, isInitialized } = useAuth();

  if (!isInitialized.value) {
    await fetchMe();
  }
});
