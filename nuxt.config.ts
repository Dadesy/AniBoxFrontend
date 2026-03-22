import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite';

import { buildYandexMetrikaHeadScript } from './metrika-snippet';

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
/** Yandex.Metrika: tag.js, счётчик, вебвизор, вебвизор по wss */
const yandexMetrikaOrigins = [
  'https://mc.yandex.ru',
  'https://mc.yandex.com',
  'https://yastatic.net',
  'https://metrika.yandex.ru',
] as const;
const yandexMetrikaConnectWs = ['wss://mc.yandex.ru', 'wss://mc.yandex.com'] as const;
const defaultConnectSrc = [
  "'self'",
  ...(apiOrigin ? [apiOrigin] : []),
  'https://anilibria.top', // AniLibria public API — fresh releases section
  ...yandexMetrikaOrigins,
  ...yandexMetrikaConnectWs,
];
const watchConnectSrc = [
  ...defaultConnectSrc,
  'https://kodik.info',
  'https://kodik.cc',
  'https://kodik.biz',
];
const scriptSrcMetrikaList = ["'self'", "'unsafe-inline'", ...yandexMetrikaOrigins].join(' ');
/** Safari/WebKit иногда проверяет script-src-elem отдельно */
const scriptSrcWithMetrika = [
  `script-src ${scriptSrcMetrikaList}`,
  `script-src-elem ${scriptSrcMetrikaList}`,
].join('; ');
const frameSrcWithMetrikaWatch = [
  "'self'",
  'https://kodik.info',
  'https://kodik.cc',
  'https://kodik.biz',
  'https://www.youtube-nocookie.com', // muted trailer previews on card hover
  ...yandexMetrikaOrigins,
].join(' ');
/** Без 'none': вебвизор Метрики грузит iframe с mc.yandex.ru */
const frameSrcWithMetrikaDefault = [
  'https://www.youtube-nocookie.com', // muted trailer previews on card hover
  ...yandexMetrikaOrigins,
].join(' ');

const ymIdForHead = process.env.NUXT_PUBLIC_YANDEX_METRIKA_ID ?? '108180420';
const yandexMetrikaHeadScripts =
  !isDevelopment && ymIdForHead.trim() !== '' && ymIdForHead !== '0'
    ? [
        {
          key: 'yandex-metrika',
          type: 'text/javascript' as const,
          innerHTML: buildYandexMetrikaHeadScript(ymIdForHead),
          tagPriority: 'critical' as const,
        },
      ]
    : [];

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
    optimizeDeps: {
      include: ['animejs'],
    },
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
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL ?? 'https://example.com',
      /** Публичное имя бренда (логотип, title, OG) */
      siteName: process.env.NUXT_PUBLIC_SITE_NAME ?? 'AnimeScope',
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
      script: yandexMetrikaHeadScripts,
      meta: [
        { name: 'theme-color', content: '#111113', media: '(prefers-color-scheme: dark)' },
        { name: 'theme-color', content: '#f4f4f5', media: '(prefers-color-scheme: light)' },
        { name: 'color-scheme', content: 'dark light' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'referrer', content: 'strict-origin-when-cross-origin' },
        {
          name: 'googlebot',
          content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
        },
        // Default OG tags (overridden per-page via useSeoMeta)
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'ru_RU' },
        { property: 'og:locale:alternate', content: 'en_US' },
        { name: 'twitter:card', content: 'summary_large_image' },
        // Mobile web app
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        {
          name: 'apple-mobile-web-app-title',
          content: process.env.NUXT_PUBLIC_SITE_NAME ?? 'AnimeScope',
        },
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
              scriptSrcWithMetrika,
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
              scriptSrcWithMetrika,
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
