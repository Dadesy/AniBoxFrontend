<template>
  <div ref="rootRef" class="relative">
    <!-- Trigger pill -->
    <button
      type="button"
      class="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all"
      :class="isActive
        ? 'border-green-500/40 bg-green-500/15 text-green-300 hover:bg-green-500/20'
        : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white'"
      @click="open = !open"
    >
      <UIcon v-if="icon" :name="icon" class="size-3.5 shrink-0" />
      <span class="max-w-[140px] truncate">{{ triggerLabel }}</span>
      <UIcon
        name="lucide:chevron-down"
        class="size-3 shrink-0 opacity-60 transition-transform duration-150"
        :class="{ 'rotate-180': open }"
      />
    </button>

    <!-- Dropdown panel -->
    <Transition name="chip-dropdown">
      <div
        v-if="open"
        class="absolute left-0 top-full z-50 mt-1.5 rounded-2xl border border-white/10 bg-zinc-900/95 shadow-2xl backdrop-blur-md"
        :style="{ minWidth: searchable ? '220px' : '180px' }"
      >
        <!-- Search input -->
        <div v-if="searchable" class="border-b border-white/8 p-2">
          <input
            ref="searchRef"
            v-model="query"
            type="text"
            placeholder="Поиск…"
            class="w-full rounded-lg bg-white/6 px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:bg-white/10"
          />
        </div>

        <!-- Options list -->
        <div class="max-h-60 overflow-y-auto p-1.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
          <button
            v-for="opt in filteredOptions"
            :key="opt.value"
            type="button"
            class="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs transition-colors"
            :class="isSelected(opt.value)
              ? 'bg-green-500/18 text-green-300'
              : 'text-slate-300 hover:bg-white/8 hover:text-white'"
            @click="toggle(opt.value)"
          >
            <UIcon
              v-if="multi"
              :name="isSelected(opt.value) ? 'lucide:check-square' : 'lucide:square'"
              class="size-3.5 shrink-0"
              :class="isSelected(opt.value) ? 'text-green-400' : 'text-slate-600'"
            />
            <span class="truncate">{{ opt.label }}</span>
          </button>

          <p v-if="!filteredOptions.length" class="px-3 py-5 text-center text-xs text-slate-500">
            Ничего не найдено
          </p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: string
  options: Array<{ value: string; label: string }>
  placeholder: string
  icon?: string
  multi?: boolean
  searchable?: boolean
}>(), {
  multi: false,
  searchable: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: string | undefined): void
}>()

const open = ref(false)
const query = ref('')
const rootRef = ref<HTMLElement | null>(null)
const searchRef = ref<HTMLInputElement | null>(null)

const selected = computed<string[]>(() =>
  props.modelValue ? props.modelValue.split(',').filter(Boolean) : [],
)

const isActive = computed(() => selected.value.length > 0)

const triggerLabel = computed(() => {
  if (!selected.value.length) return props.placeholder
  if (selected.value.length === 1) {
    return props.options.find((o) => o.value === selected.value[0])?.label ?? props.placeholder
  }
  return `${props.placeholder} · ${selected.value.length}`
})

const filteredOptions = computed(() => {
  if (!query.value) return props.options
  const q = query.value.toLowerCase()
  return props.options.filter((o) => o.label.toLowerCase().includes(q))
})

function isSelected(val: string): boolean {
  return selected.value.includes(val)
}

function toggle(val: string): void {
  if (!props.multi) {
    emit('update:modelValue', isSelected(val) ? undefined : val)
    open.value = false
    return
  }
  const next = isSelected(val)
    ? selected.value.filter((v) => v !== val)
    : [...selected.value, val]
  emit('update:modelValue', next.length ? next.join(',') : undefined)
}

// Focus search input when dropdown opens
watch(open, async (v) => {
  if (v && props.searchable) {
    await nextTick()
    searchRef.value?.focus()
  }
  if (!v) query.value = ''
})

// Close on outside click
function onPointerDown(e: PointerEvent): void {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    open.value = false
  }
}
onMounted(() => document.addEventListener('pointerdown', onPointerDown))
onBeforeUnmount(() => document.removeEventListener('pointerdown', onPointerDown))
</script>

<style scoped>
.chip-dropdown-enter-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.chip-dropdown-leave-active { transition: opacity 0.1s ease, transform 0.1s ease; }
.chip-dropdown-enter-from,
.chip-dropdown-leave-to  { opacity: 0; transform: translateY(-6px) scale(0.97); }
</style>
