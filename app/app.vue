<template>
  <div class="site-root min-h-dvh">
    <UApp>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UApp>
  </div>
  <!-- Снаружи site-root: fixed на весь viewport, без Teleport (стабильная гидрация) -->
  <AppLoader />
</template>

<script setup lang="ts">
import AppLoader from './components/AppLoader.vue'
import { whenBootBackendReady } from '~/composables/useKodikStatus'

const { hide } = useAppLoader();

onMounted(async () => {
  try {
    await document.fonts.ready
  } catch {
    /* ignore */
  }
  // Первый ответ бэка (статус плеера) — иначе модалка Kodik / баннер мелькают до снятия лоадера
  await whenBootBackendReady()
  hide()
});

const config = useRuntimeConfig()
const siteUrl = config.public.siteUrl
const siteName = config.public.siteName as string
const ymId = config.public.yandexMetrikaId

if (ymId) {
  useHead({
    noscript: [
      {
        tagPosition: 'bodyClose',
        innerHTML: `<div><img src="https://mc.yandex.ru/watch/${ymId}" style="position:absolute; left:-9999px;" alt="" /></div>`,
      },
    ],
  })
}

useSeoMeta({
  ogSiteName: siteName,
  ogType: 'website',
  ogImage: `${siteUrl}/og-image.png`,
  ogImageAlt: siteName,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  twitterCard: 'summary_large_image',
  twitterImage: `${siteUrl}/og-image.png`,
  author: siteName,
  robots: 'index, follow',
})
</script>
