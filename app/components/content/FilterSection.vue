<template>
  <div class="border-b border-white/6 pb-5">
    <button
      class="mb-3 flex w-full items-center justify-between"
      @click="open = !open"
    >
      <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">{{ title }}</span>
      <UIcon
        name="lucide:chevron-down"
        class="size-3.5 text-slate-500 transition-transform duration-200"
        :class="{ 'rotate-180': open }"
      />
    </button>
    <div v-show="open">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string }>()
const open = ref(true)
</script>
