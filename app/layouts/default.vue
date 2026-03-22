<template>
  <div class="site-shell min-h-screen bg-cinema-base">
    <a
      href="#main-content"
      class="skip-to-content"
    >
      Перейти к содержимому
    </a>

    <AppHeader />
    <main
      id="main-content"
      tabindex="-1"
      class="max-sm:pt-[var(--app-header-offset-mobile)] sm:pt-[var(--app-header-offset-desktop)] outline-none focus:outline-none"
      :class="
        mobileBottomNavPad
          ? 'max-lg:pb-[calc(var(--app-bottom-nav-height)+12px)]'
          : ''
      "
    >
      <slot />
      <AppFooter />
    </main>

    <BottomNav />

    <!-- Generic toasts (library actions, etc.) -->
    <ToastContainer />

    <!-- Gamification toasts (level-up flash, achievements, EXP) -->
    <LevelUpToast />

    <!-- Cookie / analytics consent notice -->
    <ClientOnly>
      <CookieBanner />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '~/components/AppHeader.vue';
import AppFooter from '~/components/AppFooter.vue';
import BottomNav from '~/components/navigation/BottomNav.vue';
import CookieBanner from '~/components/CookieBanner.vue';
import ToastContainer from '~/components/ui/ToastContainer.vue';
import LevelUpToast from '~/components/gamification/LevelUpToast.vue';

const route = useRoute();

/** Согласовано с `BottomNav.vue`: отступ снизу только когда панель видна */
const mobileBottomNavPad = computed(
  () =>
    !route.path.startsWith('/watch/') && !route.path.startsWith('/admin'),
);
</script>
