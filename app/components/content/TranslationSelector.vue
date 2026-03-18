<template>
  <div class="flex flex-wrap gap-1.5">
    <button
      v-for="t in translations"
      :key="t.id"
      :class="[
        'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all border font-medium',
        activeId === t.id
          ? 'bg-green-500/15 text-green-400 border-green-500/30 glow-green-sm'
          : 'bg-white/4 text-slate-400 border-white/6 hover:bg-white/8 hover:text-white',
        compact ? 'px-2.5 py-1 text-xs' : '',
      ]"
      @click="emit('select', t.id)"
    >
      <UIcon
        :name="t.type === 'subtitles' ? 'lucide:subtitles' : 'lucide:mic-2'"
        :class="compact ? 'size-3' : 'size-3.5'"
      />
      {{ t.title }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Translation } from '~/types/content';

defineProps<{
  translations: Translation[];
  activeId: number | null;
  compact?: boolean;
}>();

const emit = defineEmits<{ (e: 'select', id: number): void }>();
</script>
