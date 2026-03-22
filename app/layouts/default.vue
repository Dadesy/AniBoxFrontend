<template>
  <div class="site-shell min-h-screen bg-cinema-base">
    <AppHeader />
    <!-- pt-[104px] accounts for mobile 2-row header (56px + 48px search row) -->
    <!-- sm:pt-16 is the single-row desktop header (64px) -->
    <main
      class="pt-[104px] sm:pt-16"
      :class="
        mobileBottomNavPad
          ? 'max-lg:pb-[calc(3.5rem+env(safe-area-inset-bottom,0px)+12px)]'
          : ''
      "
    >
      <MaintenanceBanner />
      <ReleaseHighlightBanner />
      <slot />
      <AppFooter />
    </main>

    <BottomNav />

    <!-- Generic toasts (library actions, etc.) -->
    <ToastContainer />

    <!-- Gamification toasts (level-up flash, achievements, EXP) -->
    <LevelUpToast />

    <!-- Предупреждение о недоступности плеера (клиент + sessionStorage) -->
    <ClientOnly>
      <KodikUnavailableModal />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '~/components/AppHeader.vue';
import AppFooter from '~/components/AppFooter.vue';
import BottomNav from '~/components/navigation/BottomNav.vue';
import MaintenanceBanner from '~/components/MaintenanceBanner.vue';
import ReleaseHighlightBanner from '~/components/ReleaseHighlightBanner.vue';
import KodikUnavailableModal from '~/components/KodikUnavailableModal.vue';
import ToastContainer from '~/components/ui/ToastContainer.vue';
import LevelUpToast from '~/components/gamification/LevelUpToast.vue';

const route = useRoute();

/** Согласовано с `BottomNav.vue`: отступ снизу только когда панель видна */
const mobileBottomNavPad = computed(
  () =>
    !route.path.startsWith('/watch/') && !route.path.startsWith('/admin'),
);
</script>
