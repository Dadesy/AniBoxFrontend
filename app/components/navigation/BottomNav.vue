<!--
  components/navigation/BottomNav.vue
  Фиксированная нижняя навигация (mobile / tablet), safe-area iOS.
-->
<template>
  <nav
    v-if="!hideOnThisRoute"
    class="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.06] bg-[var(--cinema-surface)]/95 backdrop-blur-md lg:hidden"
    style="padding-bottom: env(safe-area-inset-bottom, 0px)"
    aria-label="Основная навигация"
  >
    <div
      class="mx-auto flex h-14 max-w-screen-lg items-stretch justify-between gap-0.5 px-1 pt-1"
    >
      <NavItem
        to="/"
        label="Главная"
        icon="lucide:home"
        :active="isHome"
      />
      <NavItem
        to="/catalog"
        label="Каталог"
        icon="lucide:layout-grid"
        :active="isCatalog"
      />
      <NavItem
        to="/search"
        label="Поиск"
        icon="lucide:search"
        :active="isSearch"
      />
      <NavItem
        to="/library"
        label="Библиотека"
        icon="lucide:library"
        :active="isLibrary"
      />
      <NavItem
        to="/profile"
        label="Профиль"
        icon="lucide:user"
        :active="isProfile"
      />
    </div>
  </nav>
</template>

<script setup lang="ts">
import NavItem from '~/components/navigation/NavItem.vue'

const route = useRoute()

/** Плеер и админка: не перекрывать UI нижней панелью */
const hideOnThisRoute = computed(
  () =>
    route.path.startsWith('/watch/') || route.path.startsWith('/admin'),
)

const isHome = computed(() => route.path === '/')
const isCatalog = computed(
  () => route.path === '/catalog' || route.path.startsWith('/catalog/'),
)
const isSearch = computed(() => route.path === '/search')
const isLibrary = computed(
  () => route.path === '/library' || route.path.startsWith('/library/'),
)
const isProfile = computed(
  () => route.path === '/profile' || route.path.startsWith('/profile/'),
)
</script>
