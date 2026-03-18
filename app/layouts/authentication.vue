<template>
  <div class="min-h-screen bg-default text-default flex items-start justify-center px-4 py-10">
    <main class="w-full max-w-md space-y-6">
      <UButton to="/" variant="link" color="neutral" class="p-0 justify-start">
        <UIcon name="lucide:arrow-left" class="mr-2 size-4" />
        На главную
      </UButton>

      <slot />
    </main>
  </div>
</template>
