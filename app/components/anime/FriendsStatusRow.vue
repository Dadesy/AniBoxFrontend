<template>
  <div class="flex items-center gap-2">
    <!-- Label -->
    <span class="text-xs shrink-0" :class="statusClass">{{ label }}</span>

    <!-- Avatars -->
    <div class="flex -space-x-1.5">
      <template v-for="u in visible" :key="u.id">
        <img
          v-if="u.avatarUrl"
          :src="u.avatarUrl"
          :alt="displayName(u.email)"
          :title="displayName(u.email)"
          class="h-6 w-6 rounded-full object-cover ring-1 ring-cinema-card"
        />
        <div
          v-else
          :title="displayName(u.email)"
          class="h-6 w-6 rounded-full bg-cinema-accent/20 ring-1 ring-cinema-card
                 flex items-center justify-center text-[10px] font-bold text-cinema-accent"
        >
          {{ u.email[0]?.toUpperCase() }}
        </div>
      </template>

      <!-- Overflow badge -->
      <div
        v-if="overflow > 0"
        class="h-6 w-6 rounded-full bg-white/15 ring-1 ring-cinema-card
               flex items-center justify-center text-[10px] text-white/60 font-medium"
      >
        +{{ overflow }}
      </div>
    </div>

    <!-- Name list (first 2) -->
    <span class="text-xs text-white/50 truncate">
      {{ nameList }}
    </span>
  </div>
</template>

<script setup lang="ts">
import type { UserWithStatus } from '~/types/social';

const props = defineProps<{
  label: string;
  statusClass: string;
  users: UserWithStatus[];
  max?: number;
}>();

const limit = computed(() => props.max ?? 5);
const visible = computed(() => props.users.slice(0, limit.value));
const overflow = computed(() => Math.max(0, props.users.length - limit.value));

const nameList = computed(() => {
  const names = visible.value.slice(0, 2).map((u) => displayName(u.email));
  if (props.users.length > 2) {
    return names.join(', ') + (props.users.length > 2 ? ' и др.' : '');
  }
  return names.join(', ');
});

function displayName(email: string): string {
  return email.split('@')[0] ?? email;
}
</script>
