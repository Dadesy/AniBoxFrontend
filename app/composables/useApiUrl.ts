export const useApiUrl = (): string => {
  const config = useRuntimeConfig();

  return import.meta.server
    ? (config.apiUrlInternal as string)
    : (config.public.apiUrl as string);
};
