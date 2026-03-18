export const useInfiniteTrigger = (
  shouldLoad: () => boolean,
  onLoad: () => Promise<void> | void,
): Ref<HTMLElement | null> => {
  const target = ref<HTMLElement | null>(null);
  let observer: IntersectionObserver | null = null;
  let isLoading = false;

  async function handleIntersect(entries: IntersectionObserverEntry[]): Promise<void> {
    if (!entries.some((entry) => entry.isIntersecting) || isLoading || !shouldLoad()) return;

    isLoading = true;
    try {
      await onLoad();
    } finally {
      isLoading = false;
    }
  }

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => void handleIntersect(entries),
      { rootMargin: '500px 0px' },
    );

    watch(target, (element, previous) => {
      if (!observer) return;
      if (previous) observer.unobserve(previous);
      if (element) observer.observe(element);
    }, { immediate: true });
  });

  onBeforeUnmount(() => observer?.disconnect());

  return target;
};
