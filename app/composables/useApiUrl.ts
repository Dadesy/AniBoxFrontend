function normalizeApiUrl(rawValue: string): string {
  const trimmed = rawValue.trim().replace(/\/+$/, '');
  if (!trimmed) return 'http://localhost:8080/api';

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : /^\/(?!\/)/.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;

  if (withProtocol.startsWith('/')) {
    return withProtocol.endsWith('/api') ? withProtocol : `${withProtocol}/api`;
  }

  try {
    const url = new URL(withProtocol);
    if (url.pathname === '/' || url.pathname === '') {
      url.pathname = '/api';
    }
    return url.toString().replace(/\/+$/, '');
  } catch {
    return trimmed;
  }
}

export const useApiUrl = (): string => {
  const config = useRuntimeConfig();

  const rawValue = import.meta.server
    ? (config.apiUrlInternal as string)
    : (config.public.apiUrl as string);

  return normalizeApiUrl(rawValue);
};
