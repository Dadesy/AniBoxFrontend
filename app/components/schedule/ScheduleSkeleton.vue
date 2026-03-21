<template>
  <div class="space-y-6 motion-reduce:animate-none" aria-hidden="true">
    <div
      class="h-48 animate-pulse rounded-2xl bg-white/[0.04] motion-reduce:animate-none sm:h-56"
    />
    <div class="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div class="space-y-3">
        <div class="h-10 animate-pulse rounded-lg bg-white/[0.04] motion-reduce:animate-none" />
        <div
          class="grid grid-cols-7 gap-1 sm:gap-2"
        >
          <div
            v-for="n in 35"
            :key="n"
            class="aspect-square animate-pulse rounded-lg bg-white/[0.03] motion-reduce:animate-none"
          />
        </div>
        <div class="space-y-2 pt-4">
          <div
            v-for="n in 4"
            :key="n"
            class="h-24 animate-pulse rounded-xl bg-white/[0.04] motion-reduce:animate-none"
          />
        </div>
      </div>
      <div class="hidden space-y-2 lg:block">
        <div
          v-for="n in 3"
          :key="n"
          class="h-32 animate-pulse rounded-xl bg-white/[0.04] motion-reduce:animate-none"
        />
      </div>
    </div>
  </div>
</template>
