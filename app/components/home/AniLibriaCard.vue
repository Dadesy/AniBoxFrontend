<script setup lang="ts">
import AppImage from '~/components/common/AppImage.vue'
import type { AniLibriaRelease } from '~/composables/useAniLibria'
import { resolveBestAnilibriaPosterUrl } from '~/utils/anilibria-poster-url'

const props = defineProps<{
  release: AniLibriaRelease
}>()

const router = useRouter()

const displayTitle = computed(() =>
  props.release.name.main || props.release.name.english || props.release.alias,
)

const typeLabel = computed(() => props.release.type?.description ?? props.release.type?.value ?? '')

const posterSrc = computed(() => {
  const u = resolveBestAnilibriaPosterUrl(props.release.poster)
  return u.length ? u : null
})

function handleClick() {
  const q = props.release.name.main || props.release.name.english || ''
  router.push(`/search?q=${encodeURIComponent(q)}`)
}
</script>

<template>
  <div
    class="group relative cursor-pointer select-none flex-shrink-0 w-[140px] sm:w-[155px]"
    @click="handleClick"
  >
    <AppImage
      :src="posterSrc"
      :alt="displayTitle"
      aspect-ratio="2/3"
      wrapper-class="overflow-hidden rounded-lg bg-white/5"
      img-class="transition-transform duration-300 group-hover:scale-105"
    >
      <template #fallback>
        <UIcon name="lucide:image-off" class="size-8 text-zinc-700" />
      </template>

      <div class="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/45 transition-colors duration-200">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200"
        >
          <UIcon name="lucide:search" class="h-4 w-4 text-zinc-900" />
        </div>
      </div>

      <div class="pointer-events-none absolute left-1.5 top-1.5">
        <span
          v-if="typeLabel"
          class="rounded-sm bg-black/65 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white/80"
        >
          {{ typeLabel }}
        </span>
      </div>

      <div v-if="release.is_ongoing" class="pointer-events-none absolute right-1.5 top-1.5">
        <span class="flex items-center gap-0.5 rounded-sm bg-emerald-500/80 px-1 py-0.5 text-[9px] font-bold text-white">
          <span class="h-1 w-1 rounded-full bg-white animate-pulse" />
          Сейчас
        </span>
      </div>

      <div
        v-if="release.added_in_users_favorites > 100"
        class="pointer-events-none absolute bottom-1.5 right-1.5 flex items-center gap-0.5 rounded-sm bg-black/65 px-1 py-0.5"
      >
        <UIcon name="lucide:heart" class="h-2.5 w-2.5 text-rose-400" />
        <span class="text-[9px] font-bold text-white/70">
          {{ release.added_in_users_favorites >= 1000 ? `${(release.added_in_users_favorites / 1000).toFixed(1)}k` : release.added_in_users_favorites }}
        </span>
      </div>
    </AppImage>

    <!-- Info -->
    <div class="mt-2 space-y-0.5 px-0.5">
      <p class="line-clamp-2 text-[12px] font-medium leading-snug text-zinc-200 group-hover:text-white transition-colors">
        {{ displayTitle }}
      </p>
      <p class="text-[11px] text-zinc-500">
        {{ [release.year, release.season?.description].filter(Boolean).join(' · ') || '\u00A0' }}
      </p>
    </div>
  </div>
</template>
