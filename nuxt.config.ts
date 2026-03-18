import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite';

const isDevelopment = process.env.NODE_ENV !== 'production';
const rawApiUrl = process.env.NUXT_PUBLIC_API_URL ?? 'http://localhost:8080/api';

function getApiOrigin(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    return new URL(withProtocol).origin;
  } catch {
    return null;
  }
}

const apiOrigin = getApiOrigin(rawApiUrl);
const defaultConnectSrc = ["'self'", ...(apiOrigin ? [apiOrigin] : [])];
const watchConnectSrc = [
  ...defaultConnectSrc,
  'https://kodik.info',
  'https://kodik.cc',
  'https://kodik.biz',
];

export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  components: [
    {
      path: '~/app/components',
      pathPrefix: false,
    },
  ],
  colorMode: { preference: 'system', fallback: 'dark', classSuffix: '' },
  devtools: { enabled: true },
  css: [
    '@fontsource-variable/public-sans/index.css',
    '~/assets/css/tailwind.css',
    '~/assets/css/main.css',
  ],
  compatibilityDate: '2025-07-15',
  vite: {
    plugins: [tailwindcss()],
  },
  hooks: {
    'pages:extend'(pages) {
      const hasScheduleRoute = pages.some((page) => page.path === '/schedule')

      if (!hasScheduleRoute) {
        pages.push({
          name: 'schedule',
          path: '/schedule',
          file: fileURLToPath(new URL('./app/pages/schedule.vue', import.meta.url)),
        })
      }
    },
  },

  // ── Runtime config ─────────────────────────────────────────────────────────
  runtimeConfig: {
    apiUrlInternal: process.env.NUXT_API_URL_INTERNAL ?? process.env.NUXT_PUBLIC_API_URL ?? 'http://localhost:8080/api',
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL ?? 'http://localhost:8080/api',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL ?? 'https://anibox.app',
    },
  },

  // ── Global head ─────────────────────────────────────────────────────────────
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      htmlAttrs: { lang: 'ru' },
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
      meta: [
        { name: 'theme-color', content: '#0d0d10' },
        { name: 'color-scheme', content: 'dark' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
    },
  },

  // ── Security headers ────────────────────────────────────────────────────────
  routeRules: isDevelopment
    ? {}
    : {
        '/watch/**': {
          headers: {
            'Content-Security-Policy': [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "media-src 'self' https: blob:",
              "frame-src 'self' https://kodik.info https://kodik.cc https://kodik.biz",
              `connect-src ${watchConnectSrc.join(' ')}`,
            ].join('; '),
          },
        },
        '/**': {
          headers: {
            'Content-Security-Policy': [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "media-src 'self' https: blob:",
              "frame-src 'none'",
              `connect-src ${defaultConnectSrc.join(' ')}`,
            ].join('; '),
            'X-Frame-Options': 'DENY',
            'X-Content-Type-Options': 'nosniff',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
          },
        },
      },
});
