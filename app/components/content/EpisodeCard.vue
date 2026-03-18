<template>
  <button
    type="button"
    :class="cardClass"
    @click="emit('select')"
  >
    <span class="text-sm font-bold tabular-nums" :class="titleClass">{{ episode.number }}</span>

    <span
      v-if="active"
      class="absolute right-1.5 top-1.5 inline-flex size-5 items-center justify-center rounded-full bg-green-500/20 text-green-300"
    >
      <UIcon name="lucide:play" class="size-3" />
    </span>
    <span
      v-else-if="completed"
      class="absolute right-1.5 top-1.5 inline-flex size-5 items-center justify-center rounded-full bg-green-500/15 text-green-400"
    >
      <UIcon name="lucide:check" class="size-3" />
    </span>
    <span
      v-else-if="inProgress"
      class="absolute right-1.5 top-1.5 inline-flex size-5 items-center justify-center rounded-full bg-amber-500/15 text-amber-300"
    >
      <UIcon name="lucide:clock-3" class="size-3" />
    </span>

    <div
      v-if="progressPercent > 0"
      class="absolute inset-x-1.5 bottom-1.5 h-1 overflow-hidden rounded-full bg-white/8"
    >
      <div
        class="h-full rounded-full transition-all duration-300"
        :class="progressBarClass"
        :style="{ width: `${progressPercent}%` }"
      />
    </div>
  </button>
</template>

<script setup lang="ts">
import type { Episode } from '~/types/content'

const props = defineProps<{
  episode: Episode
  active?: boolean
  completed?: boolean
  inProgress?: boolean
  progressPercent?: number
}>()

const emit = defineEmits<{
  (e: 'select'): void
}>()

const cardClass = computed(() => {
  const base = 'group relative flex h-14 w-full items-center justify-center overflow-hidden rounded-2xl border text-center transition-all duration-200'

  if (props.active) {
    return `${base} border-green-500/35 bg-green-500/15 text-white shadow-[0_0_24px_rgba(34,197,94,0.18)]`
  }
  if (props.completed) {
    return `${base} border-green-500/15 bg-green-500/[0.07] text-slate-100 hover:border-green-500/25 hover:bg-green-500/[0.1]`
  }
  if (props.inProgress) {
    return `${base} border-amber-500/20 bg-amber-500/[0.06] text-slate-100 hover:border-amber-500/30 hover:bg-amber-500/[0.1]`
  }

  return `${base} border-white/8 bg-white/[0.03] text-slate-100 hover:border-white/15 hover:bg-white/[0.06]`
})

const titleClass = computed(() => {
  if (props.active) return 'text-white'
  if (props.inProgress) return 'text-white'
  return 'text-slate-200'
})

const progressBarClass = computed(() => {
  if (props.completed) return 'bg-green-500'
  if (props.inProgress) return 'bg-amber-400'
  return 'bg-slate-500'
})
</script>
