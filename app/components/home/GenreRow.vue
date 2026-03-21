<script setup lang="ts">
// Popular anime genres — displayed as quick-access chips on the homepage
// Each chip links to the catalog (genre filtering can be extended later)
// Genre names match Kodik's internal genre filter values.
// Linking to /catalog?genres=<name> pre-applies the filter on the catalog page.
const genres = [
  { emoji: '⚔️',  label: 'Экшн',            g: 'Экшн' },
  { emoji: '💕',  label: 'Романтика',        g: 'Романтика' },
  { emoji: '😂',  label: 'Комедия',          g: 'Комедия' },
  { emoji: '🌀',  label: 'Фэнтези',          g: 'Фэнтези' },
  { emoji: '🔮',  label: 'Мистика',          g: 'Мистика' },
  { emoji: '🚀',  label: 'Сай-фай',          g: 'Научная фантастика' },
  { emoji: '🥋',  label: 'Спорт',            g: 'Спорт' },
  { emoji: '👾',  label: 'Игры',             g: 'Игры' },
  { emoji: '😢',  label: 'Драма',            g: 'Драма' },
  { emoji: '🌸',  label: 'Повседневность',   g: 'Повседневность' },
  { emoji: '😱',  label: 'Ужасы',            g: 'Ужасы' },
  { emoji: '🎭',  label: 'Психологическое',  g: 'Психологическое' },
]
</script>

<template>
  <section>
    <div class="mb-3 flex items-center justify-between">
      <h2 class="text-[15px] font-semibold text-zinc-100 tracking-tight">Жанры</h2>
      <NuxtLink
        to="/catalog"
        class="text-[12px] text-zinc-500 hover:text-emerald-400 transition-colors"
      >
        Весь каталог →
      </NuxtLink>
    </div>

    <div class="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
      <NuxtLink
        v-for="genre in genres"
        :key="genre.g"
        :to="`/catalog?genres=${encodeURIComponent(genre.g)}`"
        class="group flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.025] px-3 py-2.5 transition-all hover:border-emerald-500/25 hover:bg-emerald-500/5"
      >
        <span class="text-base leading-none">{{ genre.emoji }}</span>
        <span class="truncate text-[12px] font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">
          {{ genre.label }}
        </span>
      </NuxtLink>
    </div>
  </section>
</template>
