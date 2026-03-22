<template>
  <header
    class="app-header-shell fixed left-0 right-0 top-0 z-50 pt-[var(--app-safe-top)] transition-all duration-300"
    :class="scrolled ? 'header--scrolled' : 'header--top'"
  >
    <!-- ─── Main row (desktop + mobile top bar) ─────────────────────── -->
    <div class="relative h-14 sm:h-16 max-w-screen-2xl mx-auto">

      <!-- Left: Logo + Nav ─────────────────────────────────────── -->
      <div class="absolute left-0 top-0 h-full flex items-center pl-4 sm:pl-6 gap-1 z-10">
        <NuxtLink to="/" class="group mr-3 flex shrink-0 items-baseline gap-0">
          <template v-if="logoAccent">
            <span class="logo-ani text-[20px] font-extrabold tracking-tight">{{ logoPrimary }}</span>
            <span class="logo-box text-[20px] font-extrabold tracking-tight transition-opacity group-hover:opacity-90">{{ logoAccent }}</span>
          </template>
          <span
            v-else
            class="logo-ani text-[20px] font-extrabold tracking-tight"
          >{{ logoPrimary }}</span>
        </NuxtLink>
        <nav class="hidden sm:flex items-center gap-0.5">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="rounded-lg px-3 py-1.5 text-[13px] font-medium text-slate-400 transition-colors hover:bg-[var(--accent-green-softer)] hover:text-[var(--logo-text)]"
            active-class="nav-link-active"
          >
            {{ link.label }}
          </NuxtLink>

        </nav>
      </div>

      <!-- Center: Search – absolute viewport-center (desktop only) ── -->
      <div
        ref="desktopSearchWrap"
        class="hidden sm:flex absolute inset-y-0 left-1/2 -translate-x-1/2 items-center"
        style="width: min(520px, calc(100vw - 420px))"
      >
        <div class="relative w-full">
          <UIcon
            name="lucide:search"
            class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500 pointer-events-none z-10"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск аниме..."
            class="search-input w-full h-9 pl-9 pr-8 rounded-[var(--app-radius-md)] text-[13px] text-white placeholder:text-slate-500 transition-all"
            :class="{ 'search-input--active': searchFocused }"
            @focus="searchFocused = true"
            @keydown.enter="goSearch"
            @keydown.escape="closeDesktopSearch"
          />
          <button
            v-if="searchQuery"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            @click="clearSearch"
          >
            <UIcon name="lucide:x" class="size-3.5" />
          </button>

          <!-- Desktop search dropdown -->
          <Transition name="search-drop">
            <div
              v-if="showDropdown && searchFocused"
              class="search-dropdown absolute top-[calc(100%+6px)] left-0 right-0 z-50 rounded-2xl overflow-hidden py-1"
            >
            <SearchDropdownContent
              :loading="searchLoading"
              :results="searchResults"
              :query="searchQuery"
              :error="searchError"
              @select="closeDesktopSearch"
              @all="goSearch"
            />
            </div>
          </Transition>
        </div>
      </div>

      <!-- Right: тег «обновление» в зазоре слева от кнопок (lg+); на меньших экранах — на главной под техработами -->
      <div
        class="absolute right-0 top-0 z-10 flex h-full items-center gap-2 pr-4 sm:pr-6"
      >
        <div
          class="hidden min-w-0 max-w-[6.5rem] shrink leading-tight sm:max-w-[7.5rem] lg:flex lg:flex-col lg:items-end lg:justify-center xl:max-w-[9rem] xl:mr-0.5"
        >
          <ReleaseHighlightBanner placement="header" />
        </div>
        <div class="flex shrink-0 items-center gap-1">
        <button
          class="flex w-9 h-9 items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/6 transition-all"
          :disabled="randomLoading"
          title="Случайное аниме"
          @click="goRandom"
        >
          <UIcon
            :name="randomLoading ? 'lucide:loader-circle' : 'lucide:dices'"
            class="size-[18px]"
            :class="randomLoading ? 'animate-spin' : ''"
          />
        </button>

        <!-- Theme toggle -->
        <ThemeToggle />

        <template v-if="isAuthenticated && user">
          <!-- History shortcut, desktop only -->
          <NuxtLink
            to="/history"
            class="hidden sm:flex w-9 h-9 items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/6 transition-all"
            title="История просмотров"
          >
            <UIcon name="lucide:clock" class="size-[18px]" />
          </NuxtLink>

          <!-- Profile button + custom dropdown ──────────────────── -->
          <div ref="profileWrap" class="relative">
            <button
              class="flex items-center gap-2 pl-1.5 pr-2.5 h-9 rounded-xl hover:bg-white/6 border border-white/0 hover:border-white/8 transition-all"
              :class="profileOpen ? 'bg-white/6 border-white/8' : ''"
              @click="profileOpen = !profileOpen"
            >
              <UserAvatar :email="user.email" size="xs" />
              <span class="hidden md:block text-[13px] font-medium text-white/90 max-w-[100px] truncate">
                {{ user.email.split('@')[0] }}
              </span>
              <UIcon
                name="lucide:chevron-down"
                class="size-3 text-slate-500 transition-transform duration-200"
                :class="profileOpen ? 'rotate-180' : ''"
              />
            </button>

            <Transition name="profile-drop">
              <div
                v-if="profileOpen"
                class="profile-dropdown absolute right-0 top-[calc(100%+8px)] w-52 rounded-2xl overflow-hidden z-[100]"
              >
                <!-- User info header -->
                <div class="px-4 py-3.5 border-b border-white/6">
                  <p class="text-[13px] font-semibold text-white truncate">
                    {{ user.email.split('@')[0] }}
                  </p>
                  <p class="text-[11px] text-slate-500 truncate mt-0.5">{{ user.email }}</p>
                </div>

                <!-- Navigation items -->
                <nav class="py-1.5">
                  <NuxtLink
                    v-for="item in profileMenuItems"
                    :key="item.to"
                    :to="item.to"
                    class="flex items-center gap-3 px-4 py-2 text-[13px] text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    @click="profileOpen = false"
                  >
                    <UIcon :name="item.icon" class="size-4 text-slate-500 shrink-0" />
                    {{ item.label }}
                  </NuxtLink>
                </nav>

                <!-- Logout -->
                <div class="border-t border-white/6 py-1.5">
                  <button
                    class="w-full flex items-center gap-3 px-4 py-2 text-[13px] text-red-400/80 hover:text-red-300 hover:bg-red-500/5 transition-colors"
                    @click="handleLogout"
                  >
                    <UIcon name="lucide:log-out" class="size-4 shrink-0" />
                    Выйти
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </template>

        <template v-else>
          <NuxtLink
            to="/authentication"
            class="glow-green-sm inline-flex h-9 items-center rounded-xl bg-green-500 px-4 text-[13px] font-semibold text-emerald-950 transition-all hover:bg-green-400"
          >
            Войти
          </NuxtLink>
        </template>
        </div>
      </div>
    </div>

    <!-- ─── Mobile search row (below main bar) ──────────────────────── -->
    <div ref="mobileSearchWrap" class="sm:hidden border-b border-[var(--cinema-border)]/50 px-4 pb-3">
      <div class="relative">
        <UIcon
          name="lucide:search"
          class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500 pointer-events-none z-10"
        />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск аниме..."
          class="search-input w-full h-9 pl-9 pr-8 rounded-[var(--app-radius-md)] text-[13px] text-white placeholder:text-slate-500 transition-all"
          :class="{ 'search-input--active': mobileSearchFocused }"
          @focus="mobileSearchFocused = true"
          @keydown.enter="goSearch"
          @keydown.escape="closeMobileSearch"
        />
        <button
          v-if="searchQuery"
          class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          @click="clearSearch"
        >
          <UIcon name="lucide:x" class="size-3.5" />
        </button>

        <!-- Mobile search dropdown -->
        <Transition name="search-drop">
          <div
            v-if="showDropdown && mobileSearchFocused"
            class="search-dropdown absolute top-[calc(100%+6px)] left-0 right-0 z-50 rounded-2xl overflow-hidden py-1"
          >
            <SearchDropdownContent
              :loading="searchLoading"
              :results="searchResults"
              :query="searchQuery"
              :error="searchError"
              @select="closeMobileSearch"
              @all="goSearch"
            />
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import SearchDropdownContent from '~/components/header/SearchDropdownContent.vue';
import ThemeToggle from '~/components/header/ThemeToggle.vue';
import UserAvatar from '~/components/common/UserAvatar.vue';
import ReleaseHighlightBanner from '~/components/ReleaseHighlightBanner.vue';
import { navigateToCard } from '~/composables/useMetadata';
import type { ContentCard } from '~/types/content';
import type { HomePageData, NormalizedAnimeCard } from '~/types/metadata';

const { user, isAuthenticated, isAdmin, logout } = useAuth();
const router = useRouter();
const apiUrl = useApiUrl();
const { siteName } = useSiteBranding();

const logoPrimary = computed(() => {
  const n = siteName.value;
  if (!n.length) return 'App';
  const i = Math.ceil(n.length / 2);
  return n.slice(0, i);
});
const logoAccent = computed(() => {
  const n = siteName.value;
  const i = Math.ceil(n.length / 2);
  return n.length > 1 ? n.slice(i) : '';
});

// ── Scroll state ──────────────────────────────────────────────────────────
const scrolled = ref(false);
onMounted(() => {
  const onScroll = () => { scrolled.value = window.scrollY > 20; };
  window.addEventListener('scroll', onScroll, { passive: true });
  onUnmounted(() => window.removeEventListener('scroll', onScroll));
});

// ── Nav links ─────────────────────────────────────────────────────────────
const navLinks = [
  { to: '/', label: 'Главная' },
  { to: '/catalog', label: 'Каталог' },
  { to: '/schedule', label: 'Расписание' },
];

// ── Search ────────────────────────────────────────────────────────────────
const searchQuery         = ref('');
const searchResults       = ref<ContentCard[]>([]);
const searchLoading       = ref(false);
const searchError         = ref<string | null>(null);
const randomLoading       = ref(false);
const searchFocused       = ref(false);
const mobileSearchFocused = ref(false);

const desktopSearchWrap = ref<HTMLElement | null>(null);
const mobileSearchWrap  = ref<HTMLElement | null>(null);

const showDropdown = computed(() => searchQuery.value.trim().length >= 2);

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
watch(searchQuery, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer);
  searchResults.value = [];
  searchError.value = null;
  if (val.trim().length < 2) { searchLoading.value = false; return; }
  searchLoading.value = true;
  debounceTimer = setTimeout(async () => {
    try {
      const query = val.trim();
      const data = await $fetch<{ items: ContentCard[] }>(
        `${apiUrl}/content/search?q=${encodeURIComponent(query)}&types=anime-serial,anime&limit=6`,
      );
      searchResults.value = data.items;
    } catch (error) {
      console.warn('[header-search] failed to load results:', error);
      searchResults.value = [];
      searchError.value = 'Не удалось загрузить результаты';
    } finally {
      searchLoading.value = false;
    }
  }, 300);
});

function clearSearch(): void {
  searchQuery.value = '';
  searchResults.value = [];
  searchError.value = null;
}

function closeDesktopSearch(): void {
  searchFocused.value = false;
  clearSearch();
}

function closeMobileSearch(): void {
  mobileSearchFocused.value = false;
  clearSearch();
}

function goSearch(): void {
  const q = searchQuery.value.trim();
  if (!q) return;
  router.push(`/search?q=${encodeURIComponent(q)}`);
  closeDesktopSearch();
  closeMobileSearch();
}

async function goRandom(): Promise<void> {
  if (randomLoading.value) return;

  randomLoading.value = true;
  try {
    const random = await $fetch<{ id: string; type: string }>(`${apiUrl}/content/random`);
    await router.push(`/title/${encodeURIComponent(random.id)}`);
  } catch (error) {
    console.warn('[header-random] failed to pick random title:', error);
    const fallbackCard = await getRandomCardFromMetadata();

    if (fallbackCard) {
      await navigateToCard(fallbackCard);
      randomLoading.value = false;
      return;
    }

    await router.push('/catalog');
  } finally {
    randomLoading.value = false;
  }
}

async function getRandomCardFromMetadata(): Promise<NormalizedAnimeCard | null> {
  try {
    const data = await $fetch<HomePageData>(`${apiUrl}/metadata/home`);

    const uniqueCards = new Map<string, NormalizedAnimeCard>();
    const cards = [
      ...(data.hero ? [data.hero] : []),
      ...data.sections.flatMap((section) => section.items),
    ];

    for (const card of cards) {
      uniqueCards.set(`${card.source}:${card.id}`, card);
    }

    const values = Array.from(uniqueCards.values());
    if (!values.length) return null;

    const randomIndex = Math.floor(Math.random() * values.length);
    return values[randomIndex] ?? null;
  } catch (error) {
    console.warn('[header-random] metadata fallback failed:', error);
    return null;
  }
}

// Close search on outside click
onMounted(() => {
  const handler = (e: MouseEvent) => {
    if (desktopSearchWrap.value && !desktopSearchWrap.value.contains(e.target as Node)) {
      searchFocused.value = false;
    }
    if (mobileSearchWrap.value && !mobileSearchWrap.value.contains(e.target as Node)) {
      mobileSearchFocused.value = false;
    }
  };
  document.addEventListener('mousedown', handler);
  onUnmounted(() => document.removeEventListener('mousedown', handler));
});

// ── Profile dropdown ──────────────────────────────────────────────────────
const profileOpen = ref(false);
const profileWrap = ref<HTMLElement | null>(null);

const profileMenuItems = computed(() => [
  { to: '/profile', label: 'Профиль',     icon: 'lucide:user'   },
  { to: '/history', label: 'История',     icon: 'lucide:clock'  },
  ...(isAdmin.value ? [{ to: '/admin', label: 'Панель',  icon: 'lucide:shield' }] : []),
]);

onMounted(() => {
  const handler = (e: MouseEvent) => {
    if (profileWrap.value && !profileWrap.value.contains(e.target as Node)) {
      profileOpen.value = false;
    }
  };
  document.addEventListener('mousedown', handler);
  onUnmounted(() => document.removeEventListener('mousedown', handler));
});

async function handleLogout(): Promise<void> {
  profileOpen.value = false;
  await logout();
  router.push('/');
}
</script>

<style scoped>
/* ── Header backgrounds ──────────────────────────────────────────────────── */
.header--top {
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.45) 0%, transparent 100%);
}
.header--scrolled {
  background: var(--header-scrolled-bg, rgba(17, 17, 19, 0.92));
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--header-scrolled-border, rgba(255, 255, 255, 0.06));
}

:global(html.light) .header--top {
  background: linear-gradient(to bottom, rgba(15, 23, 42, 0.08) 0%, transparent 100%);
}
:global(html.light) header.header--scrolled {
  background: var(--header-scrolled-bg, rgba(255, 255, 255, 0.82));
  border-bottom-color: var(--header-scrolled-border, rgba(15, 23, 42, 0.08));
  box-shadow: 0 1px 0 rgba(15, 23, 42, 0.05);
}

/* ── Search input ────────────────────────────────────────────────────────── */
.search-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.search-input:focus { outline: none; }
.search-input--active {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--accent-green-border);
  box-shadow: 0 0 0 3px var(--accent-green-soft);
}

:global(html.light) .search-input {
  background: rgba(255, 255, 255, 0.72);
  border-color: rgba(15, 23, 42, 0.1);
}
:global(html.light) .search-input--active {
  background: #ffffff;
  border-color: var(--accent-green-border);
  box-shadow: 0 0 0 3px var(--accent-green-soft);
}

/* ── Dropdown panels ─────────────────────────────────────────────────────── */
.search-dropdown,
.profile-dropdown {
  background: rgba(22, 22, 24, 0.97);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--cinema-border);
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.55),
    0 0 0 1px rgba(255, 255, 255, 0.04);
}

:global(html.light) .search-dropdown,
:global(html.light) .profile-dropdown {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.99), rgba(250, 250, 250, 0.98));
  border-color: var(--cinema-border);
  box-shadow:
    0 24px 60px rgba(15, 23, 42, 0.1),
    0 0 0 1px rgba(15, 23, 42, 0.05);
}

/* ── Transitions ─────────────────────────────────────────────────────────── */
.search-drop-enter-active  { transition: opacity 0.15s ease, transform 0.15s ease; }
.search-drop-leave-active  { transition: opacity 0.1s  ease, transform 0.1s  ease; }
.search-drop-enter-from    { opacity: 0; transform: translateY(-8px) scale(0.97); }
.search-drop-leave-to      { opacity: 0; transform: translateY(-4px) scale(0.98); }

.profile-drop-enter-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.profile-drop-leave-active { transition: opacity 0.1s  ease, transform 0.1s  ease; }
.profile-drop-enter-from   { opacity: 0; transform: translateY(-10px) scale(0.95); }
.profile-drop-leave-to     { opacity: 0; transform: translateY(-5px)  scale(0.97); }
</style>
