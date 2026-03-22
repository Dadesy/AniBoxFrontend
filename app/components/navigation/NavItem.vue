<!--
  components/navigation/NavItem.vue
  Пункт нижней навигации: минимум 44×44, иконка + подпись.
-->
<template>
  <NuxtLink
    :to="to"
    :aria-current="active ? 'page' : undefined"
    class="flex min-h-11 min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 transition-colors duration-200 motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
    :class="
      active
        ? 'text-[var(--accent-green)]'
        : 'text-zinc-500 hover:text-zinc-300'
    "
  >
    <UIcon :name="icon" class="size-6 shrink-0" aria-hidden="true" />
    <span class="max-w-full truncate text-center text-[10px] font-semibold leading-tight">
      {{ label }}
    </span>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  to: string
  label: string
  icon: string
  active: boolean
}>()
</script>
