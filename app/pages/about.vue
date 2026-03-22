<script setup lang="ts">
const { siteName } = useSiteBranding()

const features = [
  {
    icon:  'lucide:search',
    title: 'Каталог и поиск',
    desc:  'Тысячи аниме с фильтрацией по жанру, году, типу и рейтингу.',
  },
  {
    icon:  'lucide:play-circle',
    title: 'Онлайн-просмотр',
    desc:  'Встроенный плеер с субтитрами и озвучкой на русском языке.',
  },
  {
    icon:  'lucide:calendar',
    title: 'Расписание',
    desc:  'Актуальное расписание выхода новых серий по дням недели.',
  },
  {
    icon:  'lucide:bookmark',
    title: 'Библиотека',
    desc:  'Сохраняйте аниме в «Смотрю», «Посмотрел», «Планирую» и «Брошено».',
  },
  {
    icon:  'lucide:history',
    title: 'История просмотров',
    desc:  'Автоматически сохраняется, на каком эпизоде вы остановились.',
  },
  {
    icon:  'lucide:star',
    title: 'Без рекламы',
    desc:  'Никаких рекламных баннеров и всплывающих окон.',
  },
]

useSeoMeta({
  title:       computed(() => `О сайте — ${siteName.value}`),
  description: computed(() => `${siteName.value} — каталог аниме, онлайн-просмотр и расписание выхода серий.`),
  robots:      'index, follow',
})
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">

    <!-- Hero -->
    <div class="mb-10 space-y-3">
      <div class="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-1.5">
        <span class="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span class="text-xs font-bold uppercase tracking-wider text-emerald-400">Бета</span>
      </div>
      <h1 class="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        {{ siteName }}
      </h1>
      <p class="text-base leading-relaxed text-slate-400">
        Удобный каталог аниме с онлайн-просмотром, расписанием выхода серий
        и персональной библиотекой. Всё бесплатно, без рекламы.
      </p>
    </div>

    <!-- Features grid -->
    <div class="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div
        v-for="feat in features"
        :key="feat.title"
        class="flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4"
      >
        <div class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
          <UIcon :name="feat.icon" class="size-4 text-emerald-400" />
        </div>
        <div>
          <p class="text-sm font-semibold text-white">{{ feat.title }}</p>
          <p class="mt-0.5 text-xs leading-relaxed text-slate-500">{{ feat.desc }}</p>
        </div>
      </div>
    </div>

    <!-- Sources -->
    <div class="mb-10 space-y-3">
      <h2 class="text-base font-bold text-white">Источники данных</h2>
      <p class="text-sm leading-relaxed text-slate-400">
        Метаданные аниме (обложки, описания, оценки, жанры) предоставлены
        <a
          href="https://shikimori.one"
          target="_blank"
          rel="noopener noreferrer"
          class="text-emerald-400 underline-offset-2 hover:underline"
        >Shikimori</a>.
        Видеоконтент воспроизводится через встроенные плееры
        <a
          href="https://kodik.info"
          target="_blank"
          rel="noopener noreferrer"
          class="text-emerald-400 underline-offset-2 hover:underline"
        >Kodik</a>
        и
        <a
          href="https://anilibria.top"
          target="_blank"
          rel="noopener noreferrer"
          class="text-emerald-400 underline-offset-2 hover:underline"
        >AniLibria</a>.
        Сайт не хранит видеофайлы.
      </p>
    </div>

    <!-- Legal note -->
    <div class="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-sm leading-relaxed text-slate-500">
      <p>
        Все права на произведения принадлежат их правообладателям. Материалы
        используются исключительно в информационных целях.
        <NuxtLink to="/privacy" class="text-emerald-400 underline-offset-2 hover:underline">
          Политика конфиденциальности
        </NuxtLink>.
      </p>
    </div>
  </div>
</template>
