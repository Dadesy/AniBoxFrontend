<template>
  <div class="min-h-screen bg-cinema-base">
    <AppHeader />
    <!-- pt-[104px] accounts for mobile 2-row header (56px + 48px search row) -->
    <!-- sm:pt-16 is the single-row desktop header (64px) -->
    <main class="pt-[104px] sm:pt-16">
      <slot />
    </main>

    <!-- Generic toasts (library actions, etc.) -->
    <ToastContainer />

    <!-- Gamification toasts (level-up flash, achievements, EXP) -->
    <LevelUpToast />
  </div>
</template>

<script setup lang="ts">
import AppHeader from '~/components/AppHeader.vue';
import ToastContainer from '~/components/ui/ToastContainer.vue';
import LevelUpToast from '~/components/gamification/LevelUpToast.vue';
</script>
