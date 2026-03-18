import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite';

const isDevelopment = process.env.NODE_ENV !== 'production';

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
              "connect-src 'self' https://kodik.info https://kodik.cc https://kodik.biz",
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
              "connect-src 'self'",
            ].join('; '),
            'X-Frame-Options': 'DENY',
            'X-Content-Type-Options': 'nosniff',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
          },
        },
      },
});
