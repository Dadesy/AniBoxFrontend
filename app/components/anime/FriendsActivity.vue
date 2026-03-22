<template>
  <div v-if="isAuthenticated">
    <!-- Skeleton -->
    <div v-if="loading" class="rounded-2xl bg-cinema-card border border-white/5 p-4 space-y-3">
      <div class="h-3 w-32 rounded bg-white/10 skeleton-shine" />
      <div class="flex gap-2">
        <div v-for="n in 3" :key="n" class="h-8 w-8 rounded-full bg-white/10 skeleton-shine" />
      </div>
    </div>

    <!-- No friends / no activity -->
    <template v-else-if="activity">
      <div
        v-if="activity.total > 0"
        class="rounded-2xl bg-cinema-card border border-white/5 p-4 space-y-3"
      >
        <!-- Header: total count -->
        <p class="text-sm font-medium text-white">
          <span class="text-cinema-accent font-bold">{{ activity.total }}</span>
          {{ pluralize(activity.total, 'друг', 'друга', 'друзей') }}
          {{ pluralize(activity.total, 'добавил', 'добавило', 'добавили') }} в список
        </p>

        <!-- Status groups -->
        <div class="space-y-2">
          <FriendsStatusRow
            v-if="activity.watching.length"
            label="Смотрят"
            status-class="text-green-400"
            :users="activity.watching"
            :max="5"
          />
          <FriendsStatusRow
            v-if="activity.completed.length"
            label="Посмотрели"
            status-class="text-blue-400"
            :users="activity.completed"
            :max="5"
          />
          <FriendsStatusRow
            v-if="activity.planned.length"
            label="Планируют"
            status-class="text-white/50"
            :users="activity.planned"
            :max="3"
          />
        </div>
      </div>

      <!-- No friends have this -->
      <div
        v-else
        class="rounded-2xl bg-white/3 border border-white/5 px-4 py-3"
      >
        <p class="text-xs text-white/40">
          Никто из ваших друзей не добавил этот тайтл
        </p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useAnimeActivity } from '~/composables/useSocial';

const props = defineProps<{ animeId: string }>();

const { isAuthenticated } = useAuth();
const { activity, loading, fetchActivity } = useAnimeActivity(props.animeId);

onMounted(() => {
  if (isAuthenticated.value) fetchActivity();
});

function pluralize(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 19) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}
</script>
