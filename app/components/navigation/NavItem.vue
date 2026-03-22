<!--
  components/navigation/NavItem.vue
  Пункт нижней навигации: минимум 44×44, иконка + подпись.
-->
<template>
  <NuxtLink
    :to="to"
    :aria-current="active ? 'page' : undefined"
    class="app-tab-item flex min-h-11 min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5 rounded-[var(--app-radius-xl)] px-1 py-1 transition-all duration-200 motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-green)]/40"
    :class="
      active
        ? 'text-[var(--accent-green)] bg-[var(--accent-green-soft)] shadow-[inset_0_0_0_1px_var(--accent-green-border)]'
        : 'text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200'
    "
  >
    <UIcon
      :name="icon"
      class="shrink-0 transition-transform duration-200 motion-reduce:transition-none"
      :class="active ? 'size-[1.35rem]' : 'size-6'"
      aria-hidden="true"
    />
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
