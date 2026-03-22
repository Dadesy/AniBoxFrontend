<script setup lang="ts">
import LibrarySection from '~/components/library/LibrarySection.vue'
import { useLibraryActiveTab } from '~/composables/useActiveTab'
import { useSiteBranding } from '~/composables/useSiteBranding'

definePageMeta({
  middleware: 'auth',
})

const { siteName } = useSiteBranding()
const { isAuthenticated } = useAuth()
const { library, libLoading, fetchLibrary } = useLibrary()
const { activeTab } = useLibraryActiveTab()

onMounted(() => {
  void fetchLibrary()
})

watch(isAuthenticated, (ok) => {
  if (ok) void fetchLibrary()
})

const title = computed(() => `Библиотека — ${siteName.value}`)

useSeoMeta({
  title,
  description: 'Ваша аниме-библиотека: смотрю, план, просмотрено, нравится.',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div class="px-4 pt-4 sm:px-6 sm:pt-6 lg:pb-8">
    <header class="mb-6">
      <h1 class="text-2xl font-bold text-white">Библиотека</h1>
      <p class="mt-1 text-sm text-zinc-500">
        Быстрые фильтры и мгновенный доступ к спискам
      </p>
    </header>

    <LibrarySection
      v-model:active-tab="activeTab"
      :library="library"
      :loading="libLoading"
    />
  </div>
</template>
