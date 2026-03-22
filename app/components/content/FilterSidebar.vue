<template>
  <aside class="flex flex-col gap-5">
    <!-- Sort -->
    <FilterSection title="Сортировка">
      <div class="flex flex-col gap-1">
        <button
          v-for="opt in options.sorts"
          :key="opt.value"
          class="filter-radio"
          :class="{ active: local.order === opt.value }"
          @click="toggle('order', opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>
    </FilterSection>

    <!-- Availability -->
    <FilterSection title="Доступность">
      <label class="flex cursor-pointer items-center gap-2.5">
        <span
          class="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors"
          :class="local.hasPlayer ? 'bg-green-500' : 'bg-white/10'"
          @click="local.hasPlayer = !local.hasPlayer"
        >
          <span
            class="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200"
            :class="local.hasPlayer ? 'translate-x-4.5' : 'translate-x-0.5'"
          />
        </span>
        <span class="text-sm text-slate-300">Только с плеером</span>
      </label>
    </FilterSection>

    <!-- Kind -->
    <FilterSection title="Тип">
      <div class="flex flex-col gap-1">
        <label
          v-for="opt in options.kinds"
          :key="opt.value"
          class="filter-checkbox"
        >
          <input
            type="checkbox"
            class="sr-only"
            :checked="isChecked('kind', opt.value)"
            @change="toggleMulti('kind', opt.value)"
          />
          <span class="check-box" :class="{ checked: isChecked('kind', opt.value) }">
            <UIcon v-if="isChecked('kind', opt.value)" name="lucide:check" class="size-2.5" />
          </span>
          {{ opt.label }}
        </label>
      </div>
    </FilterSection>

    <!-- Status -->
    <FilterSection title="Статус">
      <div class="flex flex-col gap-1">
        <label
          v-for="opt in options.statuses"
          :key="opt.value"
          class="filter-checkbox"
        >
          <input
            type="checkbox"
            class="sr-only"
            :checked="isChecked('status', opt.value)"
            @change="toggleMulti('status', opt.value)"
          />
          <span class="check-box" :class="{ checked: isChecked('status', opt.value) }">
            <UIcon v-if="isChecked('status', opt.value)" name="lucide:check" class="size-2.5" />
          </span>
          {{ opt.label }}
        </label>
      </div>
    </FilterSection>

    <!-- Genre -->
    <FilterSection title="Жанр">
      <div class="mb-2">
        <input
          v-model="genreSearch"
          type="text"
          placeholder="Поиск жанра…"
          class="w-full rounded-lg border border-white/8 bg-white/5 px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-green-500/50 focus:outline-none"
        />
      </div>
      <div class="flex max-h-44 flex-col gap-1 overflow-y-auto pr-1 scrollbar-thin">
        <label
          v-for="g in filteredGenres"
          :key="g.id"
          class="filter-checkbox"
        >
          <input
            type="checkbox"
            class="sr-only"
            :checked="isChecked('genre', String(g.id))"
            @change="toggleMulti('genre', String(g.id))"
          />
          <span class="check-box" :class="{ checked: isChecked('genre', String(g.id)) }">
            <UIcon v-if="isChecked('genre', String(g.id))" name="lucide:check" class="size-2.5" />
          </span>
          {{ g.russian || g.name }}
        </label>
        <p v-if="!filteredGenres.length" class="py-2 text-center text-xs text-slate-500">Нет результатов</p>
      </div>
    </FilterSection>

    <!-- Demographic -->
    <FilterSection v-if="options.demographics?.length" title="Аудитория">
      <div class="flex flex-col gap-1">
        <label
          v-for="opt in options.demographics"
          :key="opt.value"
          class="filter-checkbox"
        >
          <input
            type="checkbox"
            class="sr-only"
            :checked="isChecked('demographic', opt.value)"
            @change="toggleMulti('demographic', opt.value)"
          />
          <span class="check-box" :class="{ checked: isChecked('demographic', opt.value) }">
            <UIcon v-if="isChecked('demographic', opt.value)" name="lucide:check" class="size-2.5" />
          </span>
          {{ opt.label }}
        </label>
      </div>
    </FilterSection>

    <!-- Season -->
    <FilterSection title="Сезон">
      <select
        v-model="local.season"
        class="filter-select"
      >
        <option value="">Любой</option>
        <option v-for="opt in options.seasons" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </FilterSection>

    <!-- Year range -->
    <FilterSection title="Год">
      <div class="flex items-center gap-2">
        <input
          v-model="local.yearFrom"
          type="number"
          placeholder="От"
          min="1960"
          :max="currentYear"
          class="filter-input w-full"
        />
        <span class="text-slate-500">—</span>
        <input
          v-model="local.yearTo"
          type="number"
          placeholder="До"
          min="1960"
          :max="currentYear"
          class="filter-input w-full"
        />
      </div>
    </FilterSection>

    <!-- Score -->
    <FilterSection title="Минимальный рейтинг">
      <div class="flex flex-wrap gap-1">
        <button
          v-for="s in scores"
          :key="s"
          class="filter-score-btn"
          :class="{ active: local.score === String(s) }"
          @click="toggle('score', String(s))"
        >
          {{ s }}+
        </button>
      </div>
    </FilterSection>

    <!-- Age rating -->
    <FilterSection title="Возрастной рейтинг">
      <div class="flex flex-col gap-1">
        <label
          v-for="opt in options.ageRatings"
          :key="opt.value"
          class="filter-checkbox"
        >
          <input
            type="checkbox"
            class="sr-only"
            :checked="isChecked('ageRating', opt.value)"
            @change="toggleMulti('ageRating', opt.value)"
          />
          <span class="check-box" :class="{ checked: isChecked('ageRating', opt.value) }">
            <UIcon v-if="isChecked('ageRating', opt.value)" name="lucide:check" class="size-2.5" />
          </span>
          {{ opt.label }}
        </label>
      </div>
    </FilterSection>

    <!-- Studio -->
    <FilterSection v-if="options.studios?.length" title="Студия">
      <div class="mb-2">
        <input
          v-model="studioSearch"
          type="text"
          placeholder="Поиск студии…"
          class="w-full rounded-lg border border-white/8 bg-white/5 px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-green-500/50 focus:outline-none"
        />
      </div>
      <div class="flex max-h-44 flex-col gap-1 overflow-y-auto pr-1 scrollbar-thin">
        <label
          v-for="s in filteredStudios"
          :key="s.id"
          class="filter-checkbox"
        >
          <input
            type="checkbox"
            class="sr-only"
            :checked="isChecked('studio', String(s.id))"
            @change="toggleMulti('studio', String(s.id))"
          />
          <span class="check-box" :class="{ checked: isChecked('studio', String(s.id)) }">
            <UIcon v-if="isChecked('studio', String(s.id))" name="lucide:check" class="size-2.5" />
          </span>
          {{ s.name }}
        </label>
        <p v-if="!filteredStudios.length" class="py-2 text-center text-xs text-slate-500">Нет результатов</p>
      </div>
    </FilterSection>

    <!-- Actions -->
    <div class="sticky bottom-0 flex gap-2 bg-cinema-bg/80 pb-2 pt-3 backdrop-blur-sm">
      <button
        class="flex-1 rounded-xl border border-white/8 bg-white/5 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10"
        @click="reset"
      >
        Сбросить
      </button>
      <button
        class="flex-1 rounded-xl bg-green-500 py-2.5 text-sm font-bold text-black transition-opacity hover:opacity-90"
        @click="apply"
      >
        Применить
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import FilterSection from '~/components/content/FilterSection.vue'
import type { CatalogFilters, FilterOptions } from '~/types/content'

const props = defineProps<{
  modelValue: CatalogFilters
  options: FilterOptions
}>()

const emit = defineEmits<{
  change: [filters: CatalogFilters]
  reset: []
}>()

// ── Local state — cloned from props on each open ──────────────────────────

const local = reactive<CatalogFilters>({ ...props.modelValue })

watch(() => props.modelValue, (v) => {
  Object.assign(local, v)
}, { deep: true })

const genreSearch  = ref('')
const studioSearch = ref('')
const currentYear  = new Date().getFullYear()
const scores       = [5, 6, 7, 8, 9]

// ── Filtered lists ────────────────────────────────────────────────────────

const filteredGenres = computed(() => {
  const q = genreSearch.value.toLowerCase()
  return q
    ? props.options.genres.filter((g) =>
        (g.russian || g.name).toLowerCase().includes(q),
      )
    : props.options.genres
})

const filteredStudios = computed(() => {
  const q = studioSearch.value.toLowerCase()
  return q
    ? (props.options.studios ?? []).filter((s) =>
        s.name.toLowerCase().includes(q),
      )
    : (props.options.studios ?? [])
})

// ── Helpers ───────────────────────────────────────────────────────────────

type MultiKey = 'kind' | 'status' | 'genre' | 'demographic' | 'ageRating' | 'studio'

function isChecked(field: MultiKey, value: string): boolean {
  const current = (local[field] as string | undefined) ?? ''
  return current.split(',').map((s) => s.trim()).includes(value)
}

function toggleMulti(field: MultiKey, value: string): void {
  const parts = ((local[field] as string | undefined) ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const idx = parts.indexOf(value)
  if (idx >= 0) {
    parts.splice(idx, 1)
  } else {
    parts.push(value)
  }
  ;(local as Record<string, unknown>)[field] = parts.join(',') || undefined
}

function toggle(field: keyof CatalogFilters, value: string): void {
  if ((local as Record<string, unknown>)[field] === value) {
    ;(local as Record<string, unknown>)[field] = undefined
  } else {
    ;(local as Record<string, unknown>)[field] = value
  }
}

// ── Actions ───────────────────────────────────────────────────────────────

function apply(): void {
  // Strip empty strings / undefined
  const cleaned: CatalogFilters = {}
  for (const [k, v] of Object.entries(local)) {
    if (v !== undefined && v !== '' && v !== false) {
      ;(cleaned as Record<string, unknown>)[k] = v
    }
  }
  emit('change', cleaned)
}

function reset(): void {
  Object.keys(local).forEach((k) => delete (local as Record<string, unknown>)[k])
  emit('reset')
}
</script>

<style scoped>
@reference "tailwindcss";

.filter-radio {
  @apply w-full rounded-lg px-2.5 py-1.5 text-left text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-white;
}
.filter-radio.active {
  @apply bg-green-500/15 text-green-400;
}

.filter-checkbox {
  @apply flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-300 transition-colors hover:bg-white/5;
}

.check-box {
  @apply flex h-4 w-4 shrink-0 items-center justify-center rounded border border-white/20 bg-white/5 transition-colors;
}
.check-box.checked {
  @apply border-green-500 bg-green-500 text-black;
}

.filter-select {
  @apply w-full rounded-lg border border-white/8 bg-white/5 px-3 py-2 text-sm text-slate-200 focus:border-green-500/50 focus:outline-none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: 2.25rem;
}

.filter-input {
  @apply rounded-lg border border-white/8 bg-white/5 px-2.5 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-green-500/50 focus:outline-none;
  /* remove number arrows */
  -moz-appearance: textfield;
}
.filter-input::-webkit-inner-spin-button,
.filter-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
}

.filter-score-btn {
  @apply rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-400 transition-colors hover:border-green-500/50 hover:text-green-400;
}
.filter-score-btn.active {
  @apply border-green-500/60 bg-green-500/15 text-green-400;
}

.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
}
</style>
