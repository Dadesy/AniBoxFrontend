<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const siteUrl = config.public.siteUrl
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
  ogSiteName: 'AniBox',
  ogType: 'website',
  ogImage: `${siteUrl}/og-image.png`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  twitterCard: 'summary_large_image',
  twitterImage: `${siteUrl}/og-image.png`,
  robots: 'index, follow',
})
</script>
