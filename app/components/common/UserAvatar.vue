<template>
  <div
    class="rounded-full overflow-hidden shrink-0 ring-1 ring-white/10"
    :style="containerStyle"
  >
    <img
      v-if="src"
      :src="src"
      :alt="displayName"
      class="w-full h-full object-cover"
    />
    <div
      v-else
      class="w-full h-full flex items-center justify-center bg-green-500/20 text-green-400 font-bold select-none"
      :style="textStyle"
    >
      {{ initial }}
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  email?: string;
  avatarUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}>(), { size: 'md' });

const src = computed(() => props.avatarUrl || null);
const displayName = computed(() => props.email?.split('@')[0] || '?');
const initial = computed(() => (props.email?.[0] || '?').toUpperCase());

const SIZE_PX   = { xs: 24, sm: 32, md: 40, lg: 48 } as const;
const FONT_SIZE = { xs: 11, sm: 12, md: 14, lg: 17 } as const;

const containerStyle = computed(() => {
  const s = SIZE_PX[props.size];
  return { width: `${s}px`, height: `${s}px`, minWidth: `${s}px` };
});
const textStyle = computed(() => ({ fontSize: `${FONT_SIZE[props.size]}px` }));
</script>
