<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="backdrop">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        @click="$emit('update:modelValue', false)"
      />
    </Transition>

    <!-- Sheet -->
    <Transition name="sheet">
      <div
        v-if="modelValue"
        class="fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-2xl bg-cinema-card shadow-2xl"
      >
        <!-- Handle + header -->
        <div class="flex shrink-0 items-center justify-between border-b border-white/8 px-5 pb-3 pt-4">
          <div class="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20 absolute top-3 left-1/2 -translate-x-1/2" />
          <h2 class="text-base font-bold text-white">Фильтры</h2>
          <button
            class="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/8 hover:text-white"
            @click="$emit('update:modelValue', false)"
          >
            <UIcon name="lucide:x" class="size-4" />
          </button>
        </div>

        <!-- Scrollable content -->
        <div class="flex-1 overflow-y-auto px-5 py-4">
          <!-- Sort -->
          <div class="mb-5">
            <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Сортировка</p>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="opt in options.sorts"
                :key="opt.value"
                class="chip"
                :class="{ active: local.order === opt.value }"
                @click="toggle('order', opt.value)"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <!-- Availability -->
          <div class="mb-5">
            <label class="flex cursor-pointer items-center gap-3">
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
          </div>

          <!-- Kind -->
          <div class="mb-5">
            <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Тип</p>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="opt in options.kinds"
                :key="opt.value"
                class="chip"
                :class="{ active: isChecked('kind', opt.value) }"
                @click="toggleMulti('kind', opt.value)"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <!-- Status -->
          <div class="mb-5">
            <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Статус</p>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="opt in options.statuses"
                :key="opt.value"
                class="chip"
                :class="{ active: isChecked('status', opt.value) }"
                @click="toggleMulti('status', opt.value)"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <!-- Genre -->
          <div class="mb-5">
            <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Жанр</p>
            <input
              v-model="genreSearch"
              type="text"
              placeholder="Поиск жанра…"
              class="mb-2 w-full rounded-lg border border-white/8 bg-white/5 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-green-500/50 focus:outline-none"
            />
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="g in filteredGenres"
                :key="g.id"
                class="chip"
                :class="{ active: isChecked('genre', String(g.id)) }"
                @click="toggleMulti('genre', String(g.id))"
              >
                {{ g.russian || g.name }}
              </button>
            </div>
          </div>

          <!-- Demographic -->
          <div v-if="options.demographics?.length" class="mb-5">
            <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Аудитория</p>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="opt in options.demographics"
                :key="opt.value"
                class="chip"
                :class="{ active: isChecked('demographic', opt.value) }"
                @click="toggleMulti('demographic', opt.value)"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <!-- Season -->
          <div class="mb-5">
            <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Сезон</p>
            <select v-model="local.season" class="filter-select">
              <option value="">Любой</option>
              <option v-for="opt in options.seasons" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <!-- Year range -->
          <div class="mb-5">
            <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Год</p>
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
          </div>

          <!-- Score -->
          <div class="mb-5">
            <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Минимальный рейтинг</p>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="s in scores"
                :key="s"
                class="chip"
                :class="{ active: local.score === String(s) }"
                @click="toggle('score', String(s))"
              >
                {{ s }}+
              </button>
            </div>
          </div>

          <!-- Age rating -->
          <div class="mb-5">
            <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Возрастной рейтинг</p>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="opt in options.ageRatings"
                :key="opt.value"
                class="chip"
                :class="{ active: isChecked('ageRating', opt.value) }"
                @click="toggleMulti('ageRating', opt.value)"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Sticky footer -->
        <div class="flex shrink-0 gap-3 border-t border-white/8 px-5 py-4">
          <button
            class="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10"
            @click="reset"
          >
            Сбросить
          </button>
          <button
            class="flex-1 rounded-xl bg-green-500 py-3 text-sm font-bold text-black transition-opacity hover:opacity-90"
            @click="apply"
          >
            Применить
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { CatalogFilters, FilterOptions } from '~/types/content'

const props = defineProps<{
  modelValue: boolean
  filters: CatalogFilters
  options: FilterOptions
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  change: [filters: CatalogFilters]
  reset: []
}>()

const local = reactive<CatalogFilters>({ ...props.filters })

watch(() => props.filters, (v) => {
  Object.assign(local, v)
}, { deep: true })

const genreSearch = ref('')
const currentYear = new Date().getFullYear()
const scores      = [5, 6, 7, 8, 9]

const filteredGenres = computed(() => {
  const q = genreSearch.value.toLowerCase()
  return q
    ? props.options.genres.filter((g) =>
        (g.russian || g.name).toLowerCase().includes(q),
      )
    : props.options.genres
})

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
  if (idx >= 0) parts.splice(idx, 1)
  else parts.push(value)
  ;(local as Record<string, unknown>)[field] = parts.join(',') || undefined
}

function toggle(field: keyof CatalogFilters, value: string): void {
  if ((local as Record<string, unknown>)[field] === value) {
    ;(local as Record<string, unknown>)[field] = undefined
  } else {
    ;(local as Record<string, unknown>)[field] = value
  }
}

function apply(): void {
  const cleaned: CatalogFilters = {}
  for (const [k, v] of Object.entries(local)) {
    if (v !== undefined && v !== '' && v !== false) {
      ;(cleaned as Record<string, unknown>)[k] = v
    }
  }
  emit('change', cleaned)
  emit('update:modelValue', false)
}

function reset(): void {
  Object.keys(local).forEach((k) => delete (local as Record<string, unknown>)[k])
  emit('reset')
  emit('update:modelValue', false)
}
</script>

<style scoped>
@reference "tailwindcss";

.chip {
  @apply rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300 transition-colors hover:border-white/20 hover:text-white;
}
.chip.active {
  @apply border-green-500/60 bg-green-500/15 text-green-400;
}

.filter-select {
  @apply w-full rounded-lg border border-white/8 bg-white/5 px-3 py-2.5 text-sm text-slate-200 focus:border-green-500/50 focus:outline-none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: 2.25rem;
}

.filter-input {
  @apply rounded-lg border border-white/8 bg-white/5 px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-green-500/50 focus:outline-none;
  -moz-appearance: textfield;
}
.filter-input::-webkit-inner-spin-button,
.filter-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
}

/* Transitions */
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.25s ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.sheet-enter-active,
.sheet-leave-active {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.sheet-enter-from,
.sheet-leave-to {
  transform: translateY(100%);
}
</style>
