/**
 * composables/useAppLoader.ts
 *
 * Shared singleton state for the fullscreen intro loader.
 * isLoading starts true — component hides itself when set to false.
 * hide() is called from app.vue once fonts and initial data are ready.
 *
 * bootOverlayRemoved — true только после Transition leave лоадера (оверлей снят с экрана).
 * Нужен, чтобы Teleport-модалки в body не показывались поверх лоадера.
 */
const _loading = ref(true);
const _bootOverlayRemoved = ref(false);

export const useAppLoader = () => {
  const isLoading = readonly(_loading);
  const bootOverlayRemoved = readonly(_bootOverlayRemoved);

  const hide = () => {
    _loading.value = false;
  };

  /** Вызывать из AppLoader @after-leave */
  const markBootOverlayRemoved = () => {
    _bootOverlayRemoved.value = true;
  };

  return { isLoading, bootOverlayRemoved, hide, markBootOverlayRemoved };
};
