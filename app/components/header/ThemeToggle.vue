<template>
  <button
    class="theme-btn w-9 h-9 flex items-center justify-center rounded-xl transition-all"
    :title="isDark ? 'Светлая тема' : 'Тёмная тема'"
    @click="toggle"
  >
    <Transition name="icon-swap" mode="out-in">
      <UIcon v-if="isDark" key="sun"  name="lucide:sun"  class="size-[18px] text-slate-400" />
      <UIcon v-else         key="moon" name="lucide:moon" class="size-[18px] text-slate-600" />
    </Transition>
  </button>
</template>

<script setup lang="ts">
const colorMode = useColorMode();
const isDark = computed(() => colorMode.value === 'dark');
function toggle() {
  colorMode.preference = isDark.value ? 'light' : 'dark';
}
</script>

<style scoped>
.theme-btn { color: inherit; }
.theme-btn:hover { background: rgba(255, 255, 255, 0.06); }

:global(html.light) .theme-btn:hover { background: rgba(0, 0, 0, 0.06); }

.icon-swap-enter-active,
.icon-swap-leave-active { transition: opacity 0.12s ease, transform 0.12s ease; }
.icon-swap-enter-from   { opacity: 0; transform: rotate(-60deg) scale(0.7); }
.icon-swap-leave-to     { opacity: 0; transform: rotate(60deg)  scale(0.7); }
</style>
