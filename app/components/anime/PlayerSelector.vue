<template>
  <div v-if="players.length" class="flex flex-wrap gap-2">
    <button
      v-for="player in players"
      :key="player.externalId"
      type="button"
      class="inline-flex min-h-11 items-center justify-center rounded-2xl px-4 text-sm font-semibold transition-all"
      :class="playerButtonClass(player)"
      :disabled="!player.available"
      @click="$emit('select', player)"
    >
      {{ player.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { AnimePlayerOption } from '~/types/content'

const props = defineProps<{
  players: AnimePlayerOption[]
  activeExternalId?: string | null
}>()

defineEmits<{
  (e: 'select', player: AnimePlayerOption): void
}>()

function playerButtonClass(player: AnimePlayerOption): string {
  if (!player.available) {
    return 'cursor-not-allowed border border-white/10 bg-white/[0.04] text-slate-500'
  }

  if (player.externalId === props.activeExternalId) {
    return 'bg-emerald-500 text-black shadow-[0_0_0_1px_rgba(255,255,255,0.08)]'
  }

  return 'border border-white/10 bg-white/[0.05] text-slate-200 hover:border-white/20 hover:bg-white/[0.08]'
}
</script>
