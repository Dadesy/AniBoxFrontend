<template>
  <div class="space-y-3">
    <div class="sm:hidden">
      <label class="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        Сезон
      </label>
      <select
        :value="activeSeason"
        class="w-full rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm font-medium text-white outline-none transition-colors focus:border-green-500/40"
        @change="emit('change', Number(($event.target as HTMLSelectElement).value))"
      >
        <option
          v-for="season in seasons"
          :key="season.number"
          :value="season.number"
          class="bg-slate-950 text-white"
        >
          {{ season.title }} · {{ season.episodesCount }} эп.
        </option>
      </select>
    </div>

    <div class="hidden flex-wrap gap-2 sm:flex">
      <button
        v-for="season in seasons"
        :key="season.number"
        type="button"
        :class="[
          'group rounded-2xl border px-4 py-2.5 text-left transition-all duration-200',
          activeSeason === season.number
            ? 'border-green-500/40 bg-green-500/15 text-green-300 shadow-[0_0_24px_rgba(34,197,94,0.18)]'
            : 'border-white/8 bg-white/[0.03] text-slate-300 hover:border-white/15 hover:bg-white/[0.06] hover:text-white',
        ]"
        @click="emit('change', season.number)"
      >
        <div class="text-sm font-semibold">{{ season.title }}</div>
        <div class="text-xs text-slate-500 transition-colors group-hover:text-slate-400">
          {{ season.episodesCount }} эп.
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SeasonOption } from '~/types/content'

defineProps<{
  seasons: SeasonOption[]
  activeSeason: number
}>()

const emit = defineEmits<{
  (e: 'change', season: number): void
}>()
</script>
