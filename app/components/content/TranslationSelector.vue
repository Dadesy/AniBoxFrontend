<template>
  <div class="space-y-2">
    <label class="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
      Озвучка
    </label>

    <div class="relative">
      <UIcon
        name="lucide:chevrons-up-down"
        class="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-500"
      />
      <select
        :value="activeId ?? undefined"
        :class="[
          'w-full appearance-none rounded-2xl border border-white/8 bg-white/5 pl-4 pr-11 text-white outline-none transition-colors focus:border-green-500/40',
          compact ? 'py-2 text-sm font-medium' : 'py-3 text-sm font-medium',
        ]"
        @change="emit('select', Number(($event.target as HTMLSelectElement).value))"
      >
        <option
          v-for="translation in translations"
          :key="translation.id"
          :value="translation.id"
          class="bg-slate-950 text-white"
        >
          {{ formatTranslationLabel(translation) }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Translation } from '~/types/content'

defineProps<{
  translations: Translation[]
  activeId: number | null
  compact?: boolean
}>()

const emit = defineEmits<{ (e: 'select', id: number): void }>()

function formatTranslationLabel(translation: Translation): string {
  const suffix = translation.episodesCount ? ` · ${translation.episodesCount} эп.` : ''
  return `${translation.title}${suffix}`
}
</script>
