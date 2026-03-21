<template>
  <div class="site-shell min-h-screen bg-cinema-base">
    <AppHeader />
    <!-- pt-[104px] accounts for mobile 2-row header (56px + 48px search row) -->
    <!-- sm:pt-16 is the single-row desktop header (64px) -->
    <main class="pt-[104px] sm:pt-16">
      <MaintenanceBanner />
      <slot />
    </main>

    <!-- Generic toasts (library actions, etc.) -->
    <ToastContainer />

    <!-- Gamification toasts (level-up flash, achievements, EXP) -->
    <LevelUpToast />

    <!-- Предупреждение о недоступности Kodik (клиент + sessionStorage) -->
    <ClientOnly>
      <KodikUnavailableModal />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '~/components/AppHeader.vue';
import MaintenanceBanner from '~/components/MaintenanceBanner.vue';
import KodikUnavailableModal from '~/components/KodikUnavailableModal.vue';
import ToastContainer from '~/components/ui/ToastContainer.vue';
import LevelUpToast from '~/components/gamification/LevelUpToast.vue';
</script>
