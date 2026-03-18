<template>
  <div class="flex flex-wrap gap-3 items-end">
    <!-- Type -->
    <div class="min-w-36">
      <label class="block text-xs text-muted mb-1">Тип</label>
      <USelect
        v-model="local.types"
        :items="typeOptions"
        placeholder="Все типы"
        class="w-full"
        @update:model-value="handleChange"
      />
    </div>

    <!-- Genre -->
    <div class="min-w-40">
      <label class="block text-xs text-muted mb-1">Жанр</label>
      <USelect
        v-model="local.genres"
        :items="genreOptions"
        placeholder="Все жанры"
        class="w-full"
        @update:model-value="handleChange"
      />
    </div>

    <!-- Year -->
    <div class="min-w-28">
      <label class="block text-xs text-muted mb-1">Год</label>
      <USelect
        v-model="local.year"
        :items="yearOptions"
        placeholder="Любой"
        class="w-full"
        @update:model-value="handleChange"
      />
    </div>

    <!-- Reset -->
    <UButton
      v-if="hasActiveFilters"
      variant="ghost"
      color="neutral"
      size="sm"
      @click="handleReset"
    >
      <UIcon name="lucide:x" class="mr-1 size-3" />
      Сбросить
    </UButton>
  </div>
</template>

<script setup lang="ts">
import type { CatalogFilters, FilterOptions } from '~/types/content';

const props = defineProps<{
  modelValue: CatalogFilters;
  options: FilterOptions;
}>();

const emit = defineEmits<{
  (e: 'change', filters: CatalogFilters): void;
  (e: 'reset'): void;
}>();

const local = reactive<CatalogFilters>(normalizeFilters(props.modelValue));

watch(() => props.modelValue, (v) => Object.assign(local, normalizeFilters(v)), { deep: true });

const typeOptions = computed(() => [
  { label: 'Аниме-сериал', value: 'anime-serial' },
  { label: 'Аниме-фильм', value: 'anime' },
]);

const genreOptions = computed(() => [
  ...props.options.genres.map((g) => ({ label: g, value: g })),
]);

const yearOptions = computed(() => [
  ...props.options.years.map((y) => ({ label: String(y), value: String(y) })),
]);

const hasActiveFilters = computed(
  () => !!(local.types || local.genres || local.year || local.country || local.translationId),
);

function handleReset(): void {
  Object.keys(local).forEach((k) => delete (local as Record<string, unknown>)[k]);
  emit('reset');
}

function handleChange(): void {
  emit('change', normalizeFilters(local));
}

function normalizeFilters(filters: CatalogFilters): CatalogFilters {
  return {
    types: filters.types || undefined,
    genres: filters.genres || undefined,
    year: filters.year || undefined,
    country: filters.country || undefined,
    translationId: filters.translationId || undefined,
  };
}
</script>
