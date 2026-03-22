<script setup lang="ts">
import ProfileStatsCards   from '~/components/profile/StatsCards.vue'
import ProfileHistoryList  from '~/components/profile/HistoryList.vue'
import ProfileAvatarPicker from '~/components/profile/AvatarPicker.vue'
import LevelCard           from '~/components/gamification/LevelCard.vue'
import AchievementList     from '~/components/gamification/AchievementList.vue'
import LibrarySection      from '~/components/library/LibrarySection.vue'
import { useProfile, useCountUp } from '~/composables/useProfile'
import { useGamification }        from '~/composables/useGamification'
import { useLibrary }             from '~/composables/useLibrary'
import { useParallax }            from '~/composables/useParallax'
import type { EpisodeProgress }   from '~/types/content'
import { PRESET_AVATAR_SEEDS }    from '~/types/user'
import { TIER_COLORS }            from '~/types/gamification'
import type { LevelTier }         from '~/types/gamification'

definePageMeta({ middleware: 'auth' })

const { logout } = useAuth()

const {
  profile, stats, history, historyTotal, continueWatching,
  loading, statsLoading, historyLoading, error,
  init, fetchHistory, setPresetAvatar, uploadAvatar,
} = useProfile()

const {
  levelProgress, achievements, loading: gamLoading, achievLoading,
  fetchLevelProgress, fetchAchievements,
} = useGamification()

const { library, libLoading, fetchLibrary } = useLibrary()

const showAvatarPicker = ref(false)
const logoutPending    = ref(false)

type Tab = 'overview' | 'library' | 'achievements' | 'history'
const activeTab = ref<Tab>('overview')

const tabs: Array<{ id: Tab; label: string; icon: string }> = [
  { id: 'overview',     label: 'Обзор',      icon: 'lucide:layout-dashboard' },
  { id: 'library',      label: 'Библиотека', icon: 'lucide:library'          },
  { id: 'achievements', label: 'Достижения', icon: 'lucide:medal'            },
  { id: 'history',      label: 'История',    icon: 'lucide:scroll-text'      },
]

// ── Tier tokens ───────────────────────────────────────────────────────────
const tierColors = computed(() => {
  const tier = levelProgress.value?.tier ?? 'bronze'
  return TIER_COLORS[tier]
})

const TIER_ICON_MAP: Record<LevelTier, string> = {
  bronze: 'lucide:shield',
  silver: 'lucide:award',
  gold:   'lucide:crown',
  neon:   'lucide:zap',
}
const tierIconName = computed(() =>
  TIER_ICON_MAP[levelProgress.value?.tier ?? 'bronze'],
)

// ── Level count-up animation ──────────────────────────────────────────────
const levelNum  = computed(() => levelProgress.value?.level ?? 0)
const animLevel = useCountUp(levelNum, 1200)

// ── Parallax ──────────────────────────────────────────────────────────────
const { scrollY: heroScrollY } = useParallax()

// ── Current preset id (supports local /avatars/<id>.svg paths) ────────────
const currentPresetId = computed<string | null>(() => {
  if (!profile.value?.avatarUrl || profile.value.avatarType !== 'preset') return null
  // Local static path: /avatars/<id>.svg
  const localMatch = profile.value.avatarUrl.match(/\/avatars\/([^/?#]+)\.svg/)
  if (localMatch?.[1]) return localMatch[1]
  // Legacy: DiceBear CDN URL with seed= param
  const found = PRESET_AVATAR_SEEDS.find(
    (p) => profile.value!.avatarUrl!.includes(`seed=${encodeURIComponent(p.seed)}`),
  )
  return found?.id ?? null
})

const unlockedCount = computed(() => achievements.value.filter((a) => a.unlocked).length)

// ── Quick stats for hero strip ─────────────────────────────────────────────
const quickStats = computed(() => [
  {
    label: 'эпизодов',
    value: stats.value?.totalEpisodes?.toLocaleString('ru-RU') ?? '—',
    accent: false,
  },
  {
    label: 'аниме',
    value: stats.value?.totalTitles?.toLocaleString('ru-RU') ?? '—',
    accent: false,
  },
  {
    label: 'достижений',
    value: String(unlockedCount.value || '—'),
    accent: true,
  },
  {
    label: 'уровень',
    value: levelProgress.value ? String(levelProgress.value.level) : '—',
    accent: true,
  },
])

// ── Init ──────────────────────────────────────────────────────────────────
onMounted(() => {
  init()
  fetchLevelProgress()
  fetchAchievements()
  fetchLibrary()
})

// ── Handlers ──────────────────────────────────────────────────────────────
async function onSelectPreset(id: string) {
  showAvatarPicker.value = false
  await setPresetAvatar(id)
}
async function onUploadFile(file: File) {
  showAvatarPicker.value = false
  await uploadAvatar(file)
}
async function handleLogout() {
  logoutPending.value = true
  try { await logout() } finally { logoutPending.value = false }
}

// ── Helpers ───────────────────────────────────────────────────────────────
function progressPercent(item: EpisodeProgress): number {
  if (!item.duration) return 0
  return Math.min(100, Math.round((item.currentTime / item.duration) * 100))
}
function fmtShort(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}
</script>

<template>
  <!-- ── Loading ──────────────────────────────────────────────────────── -->
  <div v-if="loading" class="flex min-h-[70vh] flex-col items-center justify-center gap-4">
    <div class="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-emerald-400" />
    <p class="text-xs text-white/25">Загрузка профиля...</p>
  </div>

  <!-- ── Error ────────────────────────────────────────────────────────── -->
  <div v-else-if="error" class="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
    <UIcon name="lucide:circle-alert" class="size-12 text-red-400/40" />
    <p class="text-sm text-white/40">{{ error }}</p>
    <button
      class="rounded-xl border border-white/12 px-5 py-2.5 text-sm text-white/60 transition-all hover:border-white/25 hover:text-white"
      @click="init"
    >
      Повторить
    </button>
  </div>

  <template v-else-if="profile">

    <!-- ═══════════════════════════════════════════════════════════════════
         VARIANT B — EXPRESSIVE HERO
    ═══════════════════════════════════════════════════════════════════ -->
    <section class="hero-section relative overflow-hidden" style="min-height: 58vh;">

      <!-- ── BG 0: solid dark base ──────────────────────────────────── -->
      <div class="absolute inset-0 bg-[#07070e]" aria-hidden="true" />

      <!-- ── BG 1: tier gradient orb — slowest parallax (0.13×) ─────── -->
      <div
        class="pointer-events-none absolute inset-0"
        aria-hidden="true"
        :style="{
          background: `radial-gradient(ellipse 90% 100% at 50% -5%, ${tierColors.glow} 0%, transparent 58%)`,
          transform:  `translateY(${(heroScrollY * 0.13).toFixed(1)}px)`,
        }"
      />

      <!-- ── BG 2: secondary accent orb (off-right) — 0.09× ────────── -->
      <div
        class="pointer-events-none absolute inset-0 opacity-35"
        aria-hidden="true"
        :style="{
          background: `radial-gradient(ellipse 55% 65% at 82% 30%, ${tierColors.glow.replace(/[\d.]+\)$/, '0.28)')} 0%, transparent 65%)`,
          transform:  `translateY(${(heroScrollY * 0.09).toFixed(1)}px)`,
        }"
      />

      <!-- ── BG 3: SVG diamond grid pattern — medium parallax (0.27×) ─ -->
      <div
        class="pointer-events-none absolute inset-[-6%]"
        aria-hidden="true"
        :style="{ transform: `translateY(${(heroScrollY * 0.27).toFixed(1)}px)` }"
      >
        <svg class="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-diamonds" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <!-- Diamond outline -->
              <path
                d="M30 3 L57 30 L30 57 L3 30 Z"
                fill="none"
                stroke="rgba(255,255,255,0.065)"
                stroke-width="0.8"
              />
              <!-- Center node -->
              <circle cx="30" cy="30" r="1.5" fill="rgba(255,255,255,0.04)" />
              <!-- Corner nodes -->
              <circle cx="0"  cy="0"  r="1"   fill="rgba(255,255,255,0.028)" />
              <circle cx="60" cy="0"  r="1"   fill="rgba(255,255,255,0.028)" />
              <circle cx="0"  cy="60" r="1"   fill="rgba(255,255,255,0.028)" />
              <circle cx="60" cy="60" r="1"   fill="rgba(255,255,255,0.028)" />
            </pattern>
          </defs>
          <rect width="112%" height="112%" fill="url(#hero-diamonds)" />
        </svg>
      </div>

      <!-- ── BG 4: noise grain (static, subtle depth) ───────────────── -->
      <div
        class="pointer-events-none absolute inset-0 opacity-[0.028]"
        aria-hidden="true"
        style="background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJuIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC42NSIgbnVtT2N0YXZlcz0iMyIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNuKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==);"
      />

      <!-- ── BG 5: bottom fade curtain (static) ────────────────────── -->
      <div
        class="pointer-events-none absolute inset-x-0 bottom-0 h-40"
        aria-hidden="true"
        style="background: linear-gradient(to top, #07070e 15%, transparent 100%);"
      />

      <!-- ── HERO CONTENT ────────────────────────────────────────────── -->
      <div class="relative flex flex-col items-center px-4 pb-18 pt-14 sm:pb-22 sm:pt-20">

        <!-- Avatar -->
        <button
          class="hero-avatar group relative mb-5 shrink-0"
          title="Сменить аватар"
          @click="showAvatarPicker = true"
        >
          <!-- Outer diffuse glow halo -->
          <div
            class="absolute -inset-6 rounded-full blur-3xl"
            aria-hidden="true"
            :style="`background: ${tierColors.glow}; opacity: 0.40;`"
          />
          <!-- Spinning conic tier ring -->
          <div
            class="absolute -inset-[4px] rounded-full"
            aria-hidden="true"
            style="animation: heroSpin 9s linear infinite;"
            :style="`background: conic-gradient(from 0deg, transparent 0%, ${tierColors.text} 20%, transparent 40%, ${tierColors.text} 62%, transparent 82%, ${tierColors.text} 100%); opacity: 0.72;`"
          />
          <!-- Pulsing solid ring behind conic -->
          <div
            class="absolute -inset-[3px] rounded-full"
            aria-hidden="true"
            style="animation: heroPulse 3.2s ease-in-out infinite;"
            :style="`background: ${tierColors.border}; opacity: 0.8;`"
          />
          <!-- Avatar image -->
          <div
            class="relative h-[112px] w-[112px] overflow-hidden rounded-full bg-[#1a1a22] ring-2 ring-black/70 sm:h-[132px] sm:w-[132px]"
          >
            <img
              v-if="profile.avatarUrl"
              :src="profile.avatarUrl"
              alt="Аватар"
              class="h-full w-full object-cover"
            />
            <div
              v-else
              class="flex h-full w-full items-center justify-center text-5xl font-black"
              :style="`color: ${tierColors.text}; text-shadow: 0 0 30px ${tierColors.glow};`"
            >
              {{ profile.email[0]?.toUpperCase() }}
            </div>
            <!-- Camera overlay on hover -->
            <div class="absolute inset-0 flex items-center justify-center bg-black/65 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <UIcon name="lucide:camera" class="size-6 text-white" />
            </div>
          </div>
        </button>

        <!-- Tier + level title pill -->
        <div
          v-if="levelProgress"
          class="hero-badge mb-3 flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest backdrop-blur-sm"
          :style="`
            color: ${tierColors.text};
            border-color: ${tierColors.border};
            background: ${tierColors.glow.replace(/[\d.]+\)$/, '0.10)')};
          `"
        >
          <UIcon :name="tierIconName" class="size-3" />
          {{ levelProgress.tier }} · {{ levelProgress.levelTitle }}
        </div>

        <!-- Username -->
        <h1 class="hero-username mb-2 text-xl font-extrabold tracking-tight text-white sm:text-2xl">
          {{ profile.email }}
        </h1>

        <!-- Role + join date badges -->
        <div class="hero-badges mb-7 flex flex-wrap items-center justify-center gap-1.5">
          <span
            v-if="profile.role === 'ADMIN'"
            class="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-400"
          >
            <UIcon name="lucide:shield-check" class="size-3" />
            Администратор
          </span>
          <span
            v-else
            class="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11px] text-white/40"
          >
            <UIcon name="lucide:user-round" class="size-3" />
            Пользователь
          </span>
          <span v-if="profile.createdAt" class="text-[11px] text-white/28">
            с {{ fmtShort(profile.createdAt) }}
          </span>
        </div>

        <!-- ── Level number + EXP bar ──────────────────────────────── -->
        <div
          v-if="levelProgress"
          class="hero-level mb-8 flex w-full max-w-[300px] flex-col items-center gap-3 sm:max-w-[340px]"
        >
          <!-- Big animated level number -->
          <div class="flex items-baseline gap-2">
            <span
              class="tabular-nums font-black leading-none tracking-tighter"
              style="font-size: clamp(3.2rem, 12vw, 5rem);"
              :style="`
                color: ${tierColors.text};
                text-shadow: 0 0 40px ${tierColors.glow}, 0 0 80px ${tierColors.glow.replace(/[\d.]+\)$/, '0.18)')};
              `"
            >{{ animLevel }}</span>
            <span class="text-sm font-semibold text-white/22">уровень</span>
          </div>

          <!-- EXP progress bar -->
          <div class="w-full">
            <div class="mb-1.5 h-2.5 overflow-hidden rounded-full bg-white/[0.07] backdrop-blur-sm">
              <div
                class="h-full rounded-full transition-[width] duration-[1200ms] ease-out"
                :style="`
                  width: ${levelProgress.progressPct}%;
                  background: linear-gradient(90deg,
                    ${tierColors.glow.replace(/[\d.]+\)$/, '0.9)')},
                    ${tierColors.text});
                  box-shadow: 0 0 10px ${tierColors.glow.replace(/[\d.]+\)$/, '0.65)')};
                `"
              />
            </div>
            <div class="flex justify-between text-[11px]">
              <span class="font-semibold text-white/50">
                {{ levelProgress.exp.toLocaleString('ru-RU') }} EXP
              </span>
              <span class="text-white/25">
                +{{ levelProgress.expToNext.toLocaleString('ru-RU') }} до след.
              </span>
            </div>
          </div>
        </div>

        <!-- ── Quick stats strip ──────────────────────────────────── -->
        <div class="hero-stats grid w-full max-w-[320px] grid-cols-4 gap-2 sm:max-w-[360px]">
          <div
            v-for="stat in quickStats"
            :key="stat.label"
            class="flex flex-col items-center gap-0.5 rounded-2xl border border-white/[0.07] bg-black/30 px-1 py-2.5 backdrop-blur-sm"
          >
            <span
              class="text-sm font-black tabular-nums leading-none"
              :style="stat.accent ? `color: ${tierColors.text}` : 'color: rgba(255,255,255,0.9)'"
            >{{ stat.value }}</span>
            <span class="mt-0.5 text-center text-[9px] leading-tight text-white/28">{{ stat.label }}</span>
          </div>
        </div>
      </div>

      <!-- Logout — absolute top-right corner in hero -->
      <button
        class="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-black/30 px-3 py-1.5 text-[11px] font-medium text-white/32 backdrop-blur-sm transition-all hover:border-red-500/25 hover:text-red-400 sm:right-6 sm:top-5"
        :disabled="logoutPending"
        @click="handleLogout"
      >
        <UIcon name="lucide:log-out" class="size-3" />
        {{ logoutPending ? '...' : 'Выйти' }}
      </button>
    </section>

    <!-- ═══════════════════════════════════════════════════════════════════
         STICKY TAB NAVIGATION
    ═══════════════════════════════════════════════════════════════════ -->
    <div
      class="sticky z-30 border-b border-white/[0.07] bg-[#07070e]/90 backdrop-blur-md"
      style="top: var(--app-header-offset-mobile, 64px);"
    >
      <div class="mx-auto flex max-w-2xl items-center gap-2 px-4 py-2.5 sm:px-6">
        <nav
          class="scrollbar-hide flex min-w-0 flex-1 gap-1 overflow-x-auto rounded-[var(--app-radius-xl)] border border-[var(--cinema-border)] bg-[var(--cinema-card)]/55 p-1 shadow-sm shadow-black/20"
          aria-label="Разделы профиля"
          style="scroll-snap-type: x proximity;"
        >
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            style="scroll-snap-align: start;"
            class="flex shrink-0 items-center gap-2 rounded-[var(--app-radius-lg)] px-3 py-2.5 text-xs font-semibold transition-[background,color,box-shadow] duration-200 sm:px-3.5 sm:text-[13px]"
            :class="
              activeTab === tab.id
                ? 'bg-emerald-500/[0.14] text-emerald-200 ring-1 ring-emerald-500/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]'
                : 'text-slate-500 hover:bg-white/[0.05] hover:text-slate-200'
            "
            @click="activeTab = tab.id"
          >
            <UIcon
              :name="tab.icon"
              class="size-4 shrink-0 sm:size-[15px]"
              :class="activeTab === tab.id ? 'text-emerald-400/95' : 'text-slate-500'"
            />
            {{ tab.label }}
          </button>
        </nav>

        <!-- Mobile logout -->
        <div class="flex shrink-0 sm:hidden">
          <button
            type="button"
            class="flex h-11 min-w-11 items-center justify-center rounded-[var(--app-radius-lg)] border border-[var(--cinema-border)] bg-[var(--cinema-card)]/55 text-red-400/55 transition-colors hover:border-red-500/25 hover:bg-red-500/10 hover:text-red-400"
            :disabled="logoutPending"
            title="Выйти"
            @click="handleLogout"
          >
            <UIcon name="lucide:log-out" class="size-[18px]" />
          </button>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════
         TAB CONTENT
    ═══════════════════════════════════════════════════════════════════ -->
    <div class="mx-auto max-w-2xl px-4 py-8 sm:px-6">

      <!-- ── ОБЗОР ──────────────────────────────────────────────────── -->
      <div v-show="activeTab === 'overview'" class="space-y-9">

        <!-- Level card -->
        <section>
          <h2 class="section-label">Уровень и прогресс</h2>
          <div v-if="gamLoading" class="h-28 animate-pulse rounded-2xl bg-white/4" />
          <LevelCard v-else-if="levelProgress" :progress="levelProgress" />
        </section>

        <!-- Stats -->
        <section>
          <h2 class="section-label">Статистика</h2>
          <ProfileStatsCards :stats="stats" :loading="statsLoading" />
        </section>

        <!-- Continue watching -->
        <section>
          <h2 class="section-label">Продолжить просмотр</h2>

          <div
            v-if="!loading && continueWatching.length === 0"
            class="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-white/[0.09] py-14 text-center"
          >
            <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/4">
              <UIcon name="lucide:play-circle" class="size-7 text-white/20" />
            </div>
            <div class="space-y-1">
              <p class="text-sm font-medium text-white/40">Вы ещё ничего не смотрели</p>
              <p class="text-xs text-white/20">Откройте каталог и начните</p>
            </div>
            <NuxtLink
              to="/catalog"
              class="mt-1 rounded-xl bg-emerald-500 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:shadow-emerald-400/30"
            >
              Открыть каталог
            </NuxtLink>
          </div>

          <div v-else class="grid grid-cols-3 gap-3 sm:grid-cols-4">
            <div
              v-for="item in continueWatching.slice(0, 8)"
              :key="item.id"
              class="group cursor-pointer"
              @click="navigateTo(`/title/${item.externalId}`)"
            >
              <!-- Poster -->
              <div
                class="relative aspect-[2/3] overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/6 transition-all duration-300 group-hover:ring-emerald-500/30 group-hover:shadow-lg group-hover:shadow-black/50"
              >
                <img
                  v-if="item.posterUrl"
                  :src="item.posterUrl"
                  :alt="item.title"
                  loading="lazy"
                  class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div v-else class="h-full w-full bg-gradient-to-br from-white/5 to-transparent" />

                <!-- Progress bar -->
                <div class="absolute inset-x-0 bottom-0 h-[3px] bg-black/60">
                  <div
                    class="h-full bg-emerald-400 transition-[width]"
                    :style="`width: ${progressPercent(item)}%`"
                  />
                </div>

                <!-- Hover play button -->
                <div class="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <div class="flex h-10 w-10 scale-75 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40 transition-transform duration-200 group-hover:scale-100">
                    <UIcon name="lucide:play" class="ml-0.5 size-4 text-white" />
                  </div>
                </div>
              </div>

              <p class="mt-2 truncate text-xs font-semibold leading-tight text-white/80">{{ item.title }}</p>
              <p v-if="item.episode" class="mt-0.5 text-[10px] text-white/35">
                Эп. {{ item.episode }}
                <span v-if="item.translationName"> · {{ item.translationName }}</span>
              </p>
            </div>
          </div>
        </section>
      </div>

      <!-- ── БИБЛИОТЕКА ──────────────────────────────────────────────── -->
      <div v-show="activeTab === 'library'">
        <LibrarySection :library="library" :loading="libLoading" />
      </div>

      <!-- ── ДОСТИЖЕНИЯ ──────────────────────────────────────────────── -->
      <div v-show="activeTab === 'achievements'">
        <AchievementList :achievements="achievements" :loading="achievLoading" />
      </div>

      <!-- ── ИСТОРИЯ ─────────────────────────────────────────────────── -->
      <div v-show="activeTab === 'history'">
        <div class="mb-5 flex items-center justify-between">
          <h2 class="section-label !mb-0">История просмотров</h2>
          <span
            v-if="historyTotal"
            class="rounded-full bg-white/8 px-2.5 py-0.5 text-xs tabular-nums text-white/40"
          >{{ historyTotal }}</span>
        </div>
        <ProfileHistoryList
          :items="history"
          :total="historyTotal"
          :loading="historyLoading"
          @load-more="fetchHistory(20, history.length)"
        />
      </div>
    </div>
  </template>

  <!-- Avatar picker modal -->
  <ProfileAvatarPicker
    v-if="showAvatarPicker"
    :current-avatar-url="profile?.avatarUrl ?? null"
    :current-preset-id="currentPresetId"
    @close="showAvatarPicker = false"
    @select-preset="onSelectPreset"
    @upload-file="onUploadFile"
  />
</template>

<style scoped>
/* ── Hero keyframes ──────────────────────────────────────────────────────── */
@keyframes heroSpin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

@keyframes heroPulse {
  0%, 100% { opacity: 0.42; }
  50%       { opacity: 0.82; }
}

@keyframes heroAvatarIn {
  0%   { opacity: 0; transform: scale(0.68); filter: blur(14px); }
  65%  { filter: blur(0); }
  100% { opacity: 1; transform: scale(1);    filter: blur(0);    }
}

@keyframes heroFadeUp {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0);     }
}

/* ── Hero entrance (fires once when profile mounts via v-else-if) ──────── */
.hero-avatar  { animation: heroAvatarIn 0.75s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
.hero-badge   { animation: heroFadeUp   0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.18s both; }
.hero-username{ animation: heroFadeUp   0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.28s both; }
.hero-badges  { animation: heroFadeUp   0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.38s both; }
.hero-level   { animation: heroFadeUp   0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.48s both; }
.hero-stats   { animation: heroFadeUp   0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.62s both; }

/* ── Utility ─────────────────────────────────────────────────────────────── */
.section-label {
  margin-bottom:   1rem;
  font-size:       11px;
  font-weight:     700;
  text-transform:  uppercase;
  letter-spacing:  0.1em;
  color:           rgba(255, 255, 255, 0.25);
}
</style>
