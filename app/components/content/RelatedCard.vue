<script setup lang="ts">
import type { NormalizedAnimeCard } from '~/types/metadata'
import { KIND_LABELS, STATUS_LABELS } from '~/types/metadata'
import { navigateToCard } from '~/composables/useMetadata'

const props = defineProps<{ card: NormalizedAnimeCard }>()

const navigating = ref(false)
const posterFailed = ref(false)

async function handleClick() {
  if (navigating.value) return
  navigating.value = true
  await navigateToCard(props.card)
  navigating.value = false
}

const displayTitle = computed(() => props.card.titleRu || props.card.title)
const kindLabel    = computed(() => KIND_LABELS[props.card.kind ?? ''] ?? props.card.kind?.toUpperCase() ?? '')
</script>

<template>
  <div
    class="group relative w-[140px] flex-shrink-0 cursor-pointer select-none"
    @click="handleClick"
  >
    <!-- Poster -->
    <div class="relative overflow-hidden rounded-xl bg-white/5 aspect-[2/3]">
      <div
        v-if="!card.posterUrl || posterFailed"
        class="absolute inset-0 animate-pulse bg-gradient-to-br from-white/5 to-white/10"
      >
        <div class="flex h-full w-full items-center justify-center">
          <UIcon name="lucide:image-off" class="size-10 text-slate-700" />
        </div>
      </div>
      <img
        v-else
        :src="card.posterUrl"
        :alt="displayTitle"
        loading="lazy"
        class="h-full w-full object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-110"
        @error="posterFailed = true"
      />

      <!-- Hover overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div class="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/90 shadow-lg shadow-emerald-500/30 backdrop-blur-sm"
          :class="{ 'animate-pulse': navigating }"
        >
          <UIcon
            v-if="!navigating"
            name="lucide:play"
            class="ml-0.5 h-4 w-4 text-white"
          />
          <UIcon v-else name="lucide:loader-circle" class="h-3.5 w-3.5 animate-spin text-white" />
        </div>
      </div>

      <!-- Kind badge -->
      <span
        v-if="kindLabel"
        class="absolute left-1.5 top-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm"
      >
        {{ kindLabel }}
      </span>
    </div>

    <!-- Relation badge — shown below poster -->
    <div
      v-if="card.relation"
      class="mt-1.5 inline-block rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 ring-1 ring-emerald-500/20"
    >
      {{ card.relation }}
    </div>
    <div v-else class="mt-1.5 h-4" /><!-- spacer so cards stay aligned -->

    <!-- Title -->
    <p class="mt-0.5 line-clamp-2 text-[12px] font-semibold leading-snug text-white/90 transition-colors group-hover:text-emerald-400">
      {{ displayTitle }}
    </p>
    <p v-if="card.year" class="text-[10px] text-white/35">{{ card.year }}</p>
  </div>
</template>
