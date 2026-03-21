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
/** Yandex.Metrika: tag.js, счётчик, вебвизор */
const yandexMetrikaOrigins = ['https://mc.yandex.ru', 'https://yastatic.net'] as const;
const defaultConnectSrc = [
  "'self'",
  ...(apiOrigin ? [apiOrigin] : []),
  'https://anilibria.top', // AniLibria public API — fresh releases section
  ...yandexMetrikaOrigins,
];
const watchConnectSrc = [
  ...defaultConnectSrc,
  'https://kodik.info',
  'https://kodik.cc',
  'https://kodik.biz',
];
const scriptSrcWithMetrika = ["'self'", "'unsafe-inline'", ...yandexMetrikaOrigins].join(' ');
const frameSrcWithMetrikaWatch = [
  "'self'",
  'https://kodik.info',
  'https://kodik.cc',
  'https://kodik.biz',
  ...yandexMetrikaOrigins,
].join(' ');
/** Без 'none': вебвизор Метрики грузит iframe с mc.yandex.ru */
const frameSrcWithMetrikaDefault = [...yandexMetrikaOrigins].join(' ');

export default defineNuxtConfig({
  modules: ['@nuxt/ui'],

  // ── Icons — bundle lucide locally so no CDN requests (CSP-safe) ────────────
  icon: {
    serverBundle: {
      collections: ['lucide'],
    },
    clientBundle: {
      scan: true,              // auto-detect icons used in .vue files
      includeCustomCollections: true,
    },
    provider: 'server',        // serve icons from SSR, no external CDN calls
  },
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
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL ?? 'https://ani-box.up.railway.app',
      /** Пустая строка / 0 — отключить счётчик */
      yandexMetrikaId: process.env.NUXT_PUBLIC_YANDEX_METRIKA_ID ?? '108180420',
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
        { rel: 'preconnect', href: 'https://anilibria.top' },
      ],
      meta: [
        { name: 'theme-color', content: '#0d0d10' },
        { name: 'color-scheme', content: 'dark' },
        { name: 'format-detection', content: 'telephone=no' },
        // Default OG tags (overridden per-page via useSeoMeta)
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'ru_RU' },
        { name: 'twitter:card', content: 'summary_large_image' },
        // Mobile web app
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'AniBox' },
        // Yandex verification (add your token after registration)
        // { name: 'yandex-verification', content: 'YOUR_TOKEN' },
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
              `script-src ${scriptSrcWithMetrika}`,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "media-src 'self' https: blob:",
              `frame-src ${frameSrcWithMetrikaWatch}`,
              `connect-src ${watchConnectSrc.join(' ')}`,
            ].join('; '),
          },
        },
        '/**': {
          headers: {
            'Content-Security-Policy': [
              "default-src 'self'",
              `script-src ${scriptSrcWithMetrika}`,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "media-src 'self' https: blob:",
              `frame-src ${frameSrcWithMetrikaDefault}`,
              `connect-src ${defaultConnectSrc.join(' ')}`,
            ].join('; '),
            'X-Frame-Options': 'DENY',
            'X-Content-Type-Options': 'nosniff',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
          },
        },
      },
});
