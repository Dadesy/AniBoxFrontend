<template>
  <header
    :class="[
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled
        ? 'bg-cinema-base/90 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/40'
        : 'bg-transparent',
    ]"
  >
    <div class="mx-auto max-w-screen-2xl px-4 sm:px-6 h-16 flex items-center gap-4">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-baseline gap-0.5 shrink-0 mr-2">
        <span class="text-xl font-bold text-white">Ani</span>
        <span class="text-xl font-bold text-green-400">Box</span>
      </NuxtLink>

      <!-- Nav links -->
      <nav class="hidden sm:flex items-center gap-1">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors text-slate-300 hover:text-white hover:bg-white/5"
          active-class="text-white bg-white/8"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <!-- Search -->
      <div ref="searchWrap" class="flex-1 max-w-md ml-auto relative">
        <div class="relative">
          <UIcon
            name="lucide:search"
            class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500 pointer-events-none"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск аниме..."
            class="w-full h-9 pl-9 pr-4 rounded-xl bg-white/5 border border-white/8 text-sm text-white placeholder:text-slate-500
                   focus:outline-none focus:bg-white/8 focus:border-green-500/40 transition-all"
            @focus="searchFocused = true"
            @keydown.enter="goSearch"
            @keydown.escape="closeSearch"
          />
          <button
            v-if="searchQuery"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            @click="searchQuery = ''; searchResults = []"
          >
            <UIcon name="lucide:x" class="size-3.5" />
          </button>
        </div>

        <!-- Search dropdown -->
        <Transition name="dropdown">
          <div
            v-if="showDropdown"
            class="absolute top-full mt-2 left-0 right-0 glass rounded-xl overflow-hidden shadow-2xl shadow-black/60 z-50"
          >
            <!-- Loading -->
            <div v-if="searchLoading" class="flex items-center justify-center py-6">
              <UIcon name="lucide:loader-circle" class="size-5 text-green-400 animate-spin" />
            </div>

            <!-- Results -->
            <template v-else>
              <NuxtLink
                v-for="item in searchResults"
                :key="item.externalId"
                :to="`/title/${encodeURIComponent(item.externalId)}`"
                class="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors"
                @click="closeSearch"
              >
                <div class="w-9 h-12 shrink-0 rounded overflow-hidden bg-cinema-card">
                  <img
                    v-if="item.posterUrl"
                    :src="item.posterUrl"
                    :alt="item.title"
                    class="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div v-else class="flex h-full items-center justify-center">
                    <UIcon name="lucide:film" class="size-4 text-slate-600" />
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-white line-clamp-1" v-html="highlight(item.title)" />
                  <p class="text-xs text-slate-400 mt-0.5">
                    {{ item.year }}
                    <span v-if="item.year && item.genres.length" class="mx-1">·</span>
                    {{ item.genres.slice(0, 2).join(', ') }}
                  </p>
                </div>
                <span class="shrink-0 text-xs px-1.5 py-0.5 rounded bg-white/6 text-slate-400">
                  {{ typeLabel(item.type) }}
                </span>
              </NuxtLink>

              <!-- All results link -->
              <div class="border-t border-white/5 px-4 py-2.5">
                <button
                  class="w-full text-left text-sm text-green-400 hover:text-green-300 transition-colors flex items-center gap-1.5"
                  @click="goSearch"
                >
                  <UIcon name="lucide:search" class="size-3.5" />
                  Все результаты для «{{ searchQuery }}»
                </button>
              </div>
            </template>
          </div>
        </Transition>
      </div>

      <!-- Auth -->
      <div class="flex items-center gap-2 shrink-0">
        <template v-if="isAuthenticated && user">
          <NuxtLink
            to="/history"
            class="hidden sm:flex items-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            title="История просмотров"
          >
            <UIcon name="lucide:clock" class="size-5" />
          </NuxtLink>
          <!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
          <UDropdownMenu :items="(userMenuItems as any)">
            <button class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/8 border border-white/6 transition-all">
              <div class="w-6 h-6 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 text-xs font-bold">
                {{ userInitial }}
              </div>
              <span class="hidden md:block text-sm font-medium text-white max-w-[120px] truncate">
                {{ user.email.split('@')[0] }}
              </span>
              <UIcon name="lucide:chevron-down" class="size-3 text-slate-500" />
            </button>
          </UDropdownMenu>
        </template>
        <template v-else>
          <UButton to="/authentication" color="primary" size="sm" class="glow-green-sm">
            Войти
          </UButton>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { ContentCard } from '~/types/content';

const { user, isAuthenticated, isAdmin, logout } = useAuth();
const router = useRouter();
const apiUrl = useApiUrl();

// ── Scroll state ──────────────────────────────────────────────────────────
const scrolled = ref(false);
onMounted(() => {
  const onScroll = () => { scrolled.value = window.scrollY > 30; };
  window.addEventListener('scroll', onScroll, { passive: true });
  onUnmounted(() => window.removeEventListener('scroll', onScroll));
});

// ── Nav links ─────────────────────────────────────────────────────────────
const navLinks = [
  { to: '/', label: 'Главная' },
  { to: '/catalog', label: 'Каталог' },
];

// ── Search ────────────────────────────────────────────────────────────────
const searchQuery = ref('');
const searchResults = ref<ContentCard[]>([]);
const searchLoading = ref(false);
const searchFocused = ref(false);
const searchWrap = ref<HTMLElement | null>(null);

const showDropdown = computed(
  () => searchFocused.value && searchQuery.value.length >= 2 && (searchLoading.value || searchResults.value.length > 0),
);

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
watch(searchQuery, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer);
  searchResults.value = [];
  if (val.length < 2) return;
  searchLoading.value = true;
  debounceTimer = setTimeout(async () => {
    try {
      const data = await $fetch<{ items: ContentCard[] }>(
        `${apiUrl}/content/search?q=${encodeURIComponent(val)}&limit=6`,
      );
      searchResults.value = data.items;
    } finally {
      searchLoading.value = false;
    }
  }, 300);
});

function goSearch(): void {
  if (!searchQuery.value.trim()) return;
  router.push(`/search?q=${encodeURIComponent(searchQuery.value.trim())}`);
  closeSearch();
}

function closeSearch(): void {
  searchFocused.value = false;
  searchQuery.value = '';
  searchResults.value = [];
}

// Close dropdown on outside click
onMounted(() => {
  const handler = (e: MouseEvent) => {
    if (searchWrap.value && !searchWrap.value.contains(e.target as Node)) {
      searchFocused.value = false;
    }
  };
  document.addEventListener('mousedown', handler);
  onUnmounted(() => document.removeEventListener('mousedown', handler));
});

function highlight(text: string): string {
  if (!searchQuery.value) return text;
  const escaped = searchQuery.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(
    new RegExp(`(${escaped})`, 'gi'),
    '<mark class="bg-green-500/20 text-green-300 rounded-sm px-0.5">$1</mark>',
  );
}

function typeLabel(type: string): string {
  const map: Record<string, string> = {
    'anime-serial': 'Аниме-сериал',
    'anime': 'Аниме-фильм',
  };
  return map[type] ?? 'Аниме';
}

// ── User menu ─────────────────────────────────────────────────────────────
const userInitial = computed(() => user.value?.email?.[0]?.toUpperCase() ?? '?');

const userMenuItems = computed<unknown[]>(() => [
  [{ label: user.value?.email ?? '', disabled: true }],
  [
    { label: 'История', icon: 'lucide:clock', to: '/history' },
    { label: 'Профиль', icon: 'lucide:user', to: '/profile' },
    ...(isAdmin.value ? [{ label: 'Панель', icon: 'lucide:shield', to: '/admin' }] : []),
  ],
  [{ label: 'Выйти', icon: 'lucide:log-out', onSelect: () => void logout() }],
]);
</script>

<style scoped>
.dropdown-enter-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.dropdown-leave-active { transition: opacity 0.14s ease, transform 0.14s ease; }
.dropdown-enter-from  { opacity: 0; transform: translateY(-4px); }
.dropdown-leave-to    { opacity: 0; transform: translateY(-4px); }
</style>
