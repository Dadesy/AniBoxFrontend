<!--
  Подвал: навигация для десктопа и SEO-внутренние ссылки.
  На мобильных — отступ под фиксированный BottomNav (как у main).
-->
<template>
  <footer
    class="mt-12 border-t border-white/[0.06] bg-cinema-base/80"
    :class="
      padForBottomNav
        ? 'max-lg:pb-[calc(3.5rem+env(safe-area-inset-bottom,0px)+12px)]'
        : ''
    "
    role="contentinfo"
  >
    <div
      class="mx-auto max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-8 xl:px-12"
    >
      <div
        class="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between"
      >
        <div class="max-w-md space-y-3">
          <NuxtLink
            to="/"
            class="inline-flex items-center gap-2 text-lg font-bold tracking-tight text-white transition-colors hover:text-green-400"
          >
            <span class="rounded-lg bg-green-500/15 px-2 py-0.5 text-sm font-extrabold text-green-400">
              {{ siteName }}
            </span>
          </NuxtLink>
          <p class="text-sm leading-relaxed text-slate-500">
            Каталог аниме, расписание выхода серий и удобный просмотр онлайн.
            Материалы носят информационный характер.
          </p>
        </div>

        <nav
          class="grid grid-cols-2 gap-x-10 gap-y-2 sm:grid-cols-3"
          aria-label="Разделы сайта"
        >
          <div class="space-y-2">
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Смотреть
            </p>
            <ul class="space-y-1.5 text-sm text-slate-400">
              <li>
                <NuxtLink to="/" class="transition-colors hover:text-white">
                  Главная
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/catalog" class="transition-colors hover:text-white">
                  Каталог
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/search" class="transition-colors hover:text-white">
                  Поиск
                </NuxtLink>
              </li>
            </ul>
          </div>
          <div class="space-y-2">
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Ещё
            </p>
            <ul class="space-y-1.5 text-sm text-slate-400">
              <li>
                <NuxtLink to="/schedule" class="transition-colors hover:text-white">
                  Расписание
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/updates" class="transition-colors hover:text-white">
                  Обновления
                </NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/library"
                  class="transition-colors hover:text-white"
                >
                  Библиотека
                </NuxtLink>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <div
        class="mt-10 flex flex-col gap-3 border-t border-white/[0.04] pt-8 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between"
      >
        <p>
          © {{ year }} {{ siteName }}. Все права на тайтлы принадлежат их правообладателям.
        </p>
        <p class="text-slate-600">
          <NuxtLink to="/catalog" class="hover:text-slate-400">Каталог</NuxtLink>
          <span class="mx-2 text-slate-700">·</span>
          <NuxtLink to="/search" class="hover:text-slate-400">Поиск</NuxtLink>
          <span class="mx-2 text-slate-700">·</span>
          <NuxtLink to="/schedule" class="hover:text-slate-400">Расписание</NuxtLink>
          <span class="mx-2 text-slate-700">·</span>
          <NuxtLink to="/updates" class="hover:text-slate-400">Обновления</NuxtLink>
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { siteName } = useSiteBranding()
const route = useRoute()

const year = new Date().getFullYear()

/** Согласовано с `default.vue` / `BottomNav`: отступ только когда нижняя панель видна */
const padForBottomNav = computed(
  () =>
    !route.path.startsWith('/watch/') && !route.path.startsWith('/admin'),
)
</script>
