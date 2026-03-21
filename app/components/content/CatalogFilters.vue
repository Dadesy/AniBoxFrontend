<template>
  <div class="space-y-3">
    <!-- ── Filter pills row ─────────────────────────────────────── -->
    <div class="flex flex-wrap gap-2 items-center">

      <FilterChipSelect
        v-model="local.kind"
        :options="options.kinds"
        placeholder="Тип"
        icon="lucide:tv-2"
        multi
        @update:model-value="commit"
      />

      <FilterChipSelect
        v-model="local.status"
        :options="options.statuses"
        placeholder="Статус"
        icon="lucide:activity"
        multi
        @update:model-value="commit"
      />

      <FilterChipSelect
        v-model="local.genre"
        :options="genreOptions"
        placeholder="Жанр"
        icon="lucide:tag"
        multi
        searchable
        @update:model-value="commit"
      />

      <FilterChipSelect
        v-model="local.season"
        :options="options.seasons"
        placeholder="Сезон"
        icon="lucide:calendar"
        @update:model-value="commit"
      />

      <FilterChipSelect
        v-model="local.score"
        :options="scoreOptions"
        placeholder="Оценка"
        icon="lucide:star"
        @update:model-value="commit"
      />

      <FilterChipSelect
        v-model="local.order"
        :options="options.sorts"
        placeholder="Сортировка"
        icon="lucide:arrow-up-down"
        @update:model-value="commit"
      />

      <!-- Reset all -->
      <Transition name="fade-quick">
        <button
          v-if="hasActiveFilters"
          type="button"
          class="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-500 transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
          @click="handleReset"
        >
          <UIcon name="lucide:x" class="size-3" />
          Сбросить
        </button>
      </Transition>
    </div>

    <!-- ── Active chips ──────────────────────────────────────────── -->
    <Transition name="fade-quick">
      <div v-if="activeChips.length" class="flex flex-wrap gap-1.5">
        <button
          v-for="chip in activeChips"
          :key="`${chip.key}-${chip.value}`"
          type="button"
          class="group flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-xs text-green-300 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
          @click="removeChip(chip)"
        >
          {{ chip.label }}
          <UIcon name="lucide:x" class="size-3 opacity-50 group-hover:opacity-100" />
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import FilterChipSelect from '~/components/content/FilterChipSelect.vue'
import type { CatalogFilters, FilterOptions } from '~/types/content'

const props = defineProps<{
  modelValue: CatalogFilters
  options: FilterOptions
}>()

const emit = defineEmits<{
  (e: 'change', filters: CatalogFilters): void
  (e: 'reset'): void
}>()

const local = reactive<CatalogFilters>({ ...props.modelValue })
watch(() => props.modelValue, (v) => {
  Object.keys(local).forEach((k) => delete (local as Record<string, unknown>)[k])
  Object.assign(local, v)
}, { deep: true })

// ── Option lists ─────────────────────────────────────────────────────────────

const genreOptions = computed(() =>
  props.options.genres.map((g) => ({ value: String(g.id), label: g.russian || g.name })),
)

const scoreOptions = [
  { value: '9', label: '9+ — Шедевр' },
  { value: '8', label: '8+ — Отлично' },
  { value: '7', label: '7+ — Хорошо' },
  { value: '6', label: '6+ — Нормально' },
]

// ── Active state ─────────────────────────────────────────────────────────────

const hasActiveFilters = computed(() =>
  !!(local.kind || local.status || local.genre || local.season || local.score || local.order || local.search),
)

// ── Active chips ─────────────────────────────────────────────────────────────

interface Chip { key: keyof CatalogFilters; value: string; label: string }

const activeChips = computed<Chip[]>(() => {
  const chips: Chip[] = []

  function addMulti(key: keyof CatalogFilters, opts: Array<{ value: string; label: string }>) {
    const val = local[key] as string | undefined
    if (!val) return
    for (const v of val.split(',')) {
      const opt = opts.find((o) => o.value === v)
      if (opt) chips.push({ key, value: v, label: opt.label })
    }
  }

  addMulti('kind',   props.options.kinds)
  addMulti('status', props.options.statuses)
  addMulti('genre',  genreOptions.value)

  if (local.season) {
    const s = props.options.seasons.find((o) => o.value === local.season)
    if (s) chips.push({ key: 'season', value: local.season, label: s.label })
  }
  if (local.score) {
    const s = scoreOptions.find((o) => o.value === local.score)
    if (s) chips.push({ key: 'score', value: local.score, label: s.label })
  }
  if (local.order) {
    const s = props.options.sorts.find((o) => o.value === local.order)
    if (s) chips.push({ key: 'order', value: local.order, label: `↕ ${s.label}` })
  }

  return chips
})

function removeChip(chip: Chip): void {
  const cur = local[chip.key] as string | undefined
  if (!cur) return
  const parts = cur.split(',').filter((v) => v !== chip.value)
  if (parts.length) {
    (local as Record<string, unknown>)[chip.key] = parts.join(',')
  } else {
    delete (local as Record<string, unknown>)[chip.key]
  }
  commit()
}

// ── Commit / reset ───────────────────────────────────────────────────────────

function commit(): void {
  emit('change', clean(local))
}

function handleReset(): void {
  Object.keys(local).forEach((k) => delete (local as Record<string, unknown>)[k])
  emit('reset')
}

function clean(f: CatalogFilters): CatalogFilters {
  const out: CatalogFilters = {}
  if (f.kind)   out.kind   = f.kind
  if (f.status) out.status = f.status
  if (f.genre)  out.genre  = f.genre
  if (f.season) out.season = f.season
  if (f.score)  out.score  = f.score
  if (f.order)  out.order  = f.order
  if (f.search) out.search = f.search
  return out
}
</script>

<style scoped>
.fade-quick-enter-active { transition: opacity 0.15s ease; }
.fade-quick-leave-active { transition: opacity 0.1s ease; }
.fade-quick-enter-from,
.fade-quick-leave-to { opacity: 0; }
</style>
