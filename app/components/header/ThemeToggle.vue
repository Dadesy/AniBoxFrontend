<template>
  <button
    class="theme-btn w-9 h-9 flex items-center justify-center rounded-lg transition-all"
    :title="label"
    @click="cycle"
  >
    <Transition name="icon-swap" mode="out-in">
      <UIcon :key="preference" :name="icon" class="size-[18px]" />
    </Transition>
  </button>
</template>

<script setup lang="ts">
type Preference = 'system' | 'dark' | 'light';

const colorMode = useColorMode();

const preference = computed(() => colorMode.preference as Preference);

const CYCLE: Preference[] = ['system', 'dark', 'light'];

const ICONS: Record<Preference, string> = {
  system: 'lucide:monitor',
  dark:   'lucide:moon',
  light:  'lucide:sun',
};

const LABELS: Record<Preference, string> = {
  system: 'Системная тема',
  dark:   'Тёмная тема',
  light:  'Светлая тема',
};

const icon  = computed(() => ICONS[preference.value]  ?? ICONS.system);
const label = computed(() => LABELS[preference.value] ?? LABELS.system);

function cycle() {
  const idx  = CYCLE.indexOf(preference.value);
  const next = CYCLE[(idx + 1) % CYCLE.length]!;
  colorMode.preference = next;
}
</script>

<style scoped>
.theme-btn { color: #71717a; }
.theme-btn:hover { background: rgba(255,255,255,0.06); color: #e4e4e7; }

:global(html.light) .theme-btn:hover { background: rgba(0,0,0,0.06); color: #18181b; }

.icon-swap-enter-active,
.icon-swap-leave-active { transition: opacity 0.1s ease, transform 0.1s ease; }
.icon-swap-enter-from   { opacity: 0; transform: scale(0.7) rotate(-30deg); }
.icon-swap-leave-to     { opacity: 0; transform: scale(0.7) rotate(30deg); }
</style>
