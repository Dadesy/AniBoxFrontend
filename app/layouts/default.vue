<template>
  <div class="min-h-screen bg-cinema-base text-[#f0f0f0]">
    <AppHeader />
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '~/components/AppHeader.vue';
</script>
