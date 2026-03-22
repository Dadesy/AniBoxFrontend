<script setup lang="ts">
import ProfileStatsCards   from '~/components/profile/StatsCards.vue'
import ProfileHistoryList  from '~/components/profile/HistoryList.vue'
import ProfileAvatarPicker from '~/components/profile/AvatarPicker.vue'
import LevelCard           from '~/components/gamification/LevelCard.vue'
import AchievementList     from '~/components/gamification/AchievementList.vue'
import LibrarySection      from '~/components/library/LibrarySection.vue'
import { useProfile }      from '~/composables/useProfile'
import { useGamification } from '~/composables/useGamification'
import { useLibrary }      from '~/composables/useLibrary'
import type { EpisodeProgress } from '~/types/content'
import { PRESET_AVATAR_SEEDS }  from '~/types/user'
import { TIER_COLORS }          from '~/types/gamification'

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
  { id: 'overview',      label: 'Обзор',      icon: 'lucide:layout-dashboard' },
  { id: 'library',       label: 'Библиотека', icon: 'lucide:bookmark'         },
  { id: 'achievements',  label: 'Достижения', icon: 'lucide:trophy'           },
  { id: 'history',       label: 'История',    icon: 'lucide:history'          },
]

// ── Tier color tokens for inline styles ───────────────────────────────────
const tierColors = computed(() => {
  const tier = levelProgress.value?.tier ?? 'bronze'
  return TIER_COLORS[tier]
})

const currentPresetId = computed<string | null>(() => {
  if (!profile.value?.avatarUrl || profile.value.avatarType !== 'preset') return null
  const found = PRESET_AVATAR_SEEDS.find(
    (p) => profile.value!.avatarUrl!.includes(`seed=${encodeURIComponent(p.seed)}`),
  )
  return found?.id ?? null
})

const unlockedCount = computed(() => achievements.value.filter((a) => a.unlocked).length)

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
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'short',
  })
}

// ── Quick stats for hero strip ────────────────────────────────────────────
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
    value: String(unlockedCount.value),
    accent: true,
  },
  {
    label: 'уровень',
    value: levelProgress.value ? String(levelProgress.value.level) : '—',
    accent: true,
  },
])
</script>

<template>
  <!-- ── Loading ──────────────────────────────────────────────────────── -->
  <div v-if="loading" class="flex min-h-[70vh] flex-col items-center justify-center gap-4">
    <div class="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-emerald-400" />
    <p class="text-xs text-white/25">Загрузка профиля...</p>
  </div>

  <!-- ── Error ────────────────────────────────────────────────────────── -->
  <div v-else-if="error" class="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center px-6">
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

    <!-- ════════════════════════════════════════════════════════════
         HERO SECTION
    ════════════════════════════════════════════════════════════ -->
    <div class="relative overflow-hidden">

      <!-- Animated tier-tinted background -->
      <div
        class="pointer-events-none absolute inset-0"
        aria-hidden="true"
        :style="`
          background:
            radial-gradient(ellipse 80% 120% at 50% -10%,
              ${tierColors.glow} 0%, transparent 65%),
            linear-gradient(180deg, #101014 0%, #0a0a0e 100%);
        `"
      />
      <!-- Noise grain overlay for depth -->
      <div
        class="pointer-events-none absolute inset-0 opacity-[0.035]"
        aria-hidden="true"
        style="background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJuIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC42NSIgbnVtT2N0YXZlcz0iMyIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNuKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==);"
      />

      <div class="relative mx-auto max-w-2xl px-4 pb-8 pt-10 sm:px-6 sm:pt-14">

        <!-- Avatar + info row -->
        <div class="flex flex-col items-center gap-5 sm:flex-row sm:items-end sm:gap-7">

          <!-- Avatar -->
          <button
            class="group relative shrink-0"
            title="Сменить аватар"
            @click="showAvatarPicker = true"
          >
            <!-- Tier glow halo -->
            <div
              class="absolute -inset-2 rounded-full opacity-50 blur-lg transition-opacity group-hover:opacity-80"
              aria-hidden="true"
              :style="`background: ${tierColors.glow};`"
            />
            <!-- Rotating conic ring -->
            <div
              class="absolute -inset-[3px] animate-[spin_8s_linear_infinite] rounded-full"
              aria-hidden="true"
              :style="`background: conic-gradient(from 0deg, transparent 0%, ${tierColors.text} 30%, transparent 60%, ${tierColors.text} 80%, transparent 100%); opacity: 0.7;`"
            />
            <!-- Static ring -->
            <div
              class="absolute -inset-[2px] rounded-full"
              aria-hidden="true"
              :style="`background: ${tierColors.border.replace('0.35)', '0.4)')};`"
            />
            <!-- Avatar image -->
            <div class="relative h-[88px] w-[88px] overflow-hidden rounded-full bg-[#1a1a20] sm:h-[100px] sm:w-[100px]">
              <img
                v-if="profile.avatarUrl"
                :src="profile.avatarUrl"
                alt="Аватар"
                class="h-full w-full object-cover"
              />
              <div
                v-else
                class="flex h-full w-full items-center justify-center text-3xl font-black"
                :style="`color: ${tierColors.text};`"
              >
                {{ profile.email[0]?.toUpperCase() }}
              </div>
              <!-- Camera overlay -->
              <div class="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <UIcon name="lucide:camera" class="size-5 text-white" />
              </div>
            </div>
          </button>

          <!-- Name & badges -->
          <div class="flex flex-1 flex-col items-center gap-2.5 sm:items-start sm:pb-1">
            <h1 class="text-lg font-extrabold tracking-tight text-white sm:text-xl">
              {{ profile.email }}
            </h1>

            <div class="flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
              <!-- Role -->
              <span
                v-if="profile.role === 'ADMIN'"
                class="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-400"
              >
                <UIcon name="lucide:shield-check" class="size-3" />
                Администратор
              </span>
              <span
                v-else
                class="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400"
              >
                <UIcon name="lucide:user-round" class="size-3" />
                Пользователь
              </span>

              <!-- Level -->
              <span
                v-if="levelProgress"
                class="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold"
                :style="`color: ${tierColors.text}; border-color: ${tierColors.border}; background: ${tierColors.glow.replace(/[\d.]+\)$/, '0.08)')};`"
              >
                <UIcon name="lucide:zap" class="size-3" />
                Ур.&nbsp;{{ levelProgress.level }} · {{ levelProgress.levelTitle }}
              </span>

              <!-- Member since -->
              <span v-if="profile.createdAt" class="text-[11px] text-white/28">
                c {{ fmtShort(profile.createdAt) }}
              </span>
            </div>
          </div>

          <!-- Logout button (desktop) -->
          <button
            class="hidden shrink-0 items-center gap-1.5 self-start rounded-xl border border-red-500/20 px-3 py-2 text-xs font-medium text-red-400/60 transition-all hover:border-red-500/40 hover:bg-red-500/8 hover:text-red-400 sm:inline-flex"
            :disabled="logoutPending"
            @click="handleLogout"
          >
            <UIcon name="lucide:log-out" class="size-3.5" />
            {{ logoutPending ? 'Выход...' : 'Выйти' }}
          </button>
        </div>

        <!-- ── Quick stats strip ──────────────────────────────────── -->
        <div class="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-4">
          <div
            v-for="stat in quickStats"
            :key="stat.label"
            class="flex flex-col items-center gap-0.5 rounded-2xl border border-white/[0.07] bg-white/[0.03] py-3 px-1 backdrop-blur-sm"
          >
            <span
              class="text-base font-black tabular-nums leading-none"
              :style="stat.accent ? `color: ${tierColors.text}` : 'color: white'"
            >
              {{ stat.value }}
            </span>
            <span class="mt-0.5 text-center text-[10px] leading-tight text-white/30">{{ stat.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════════════════════════════════════
         STICKY TAB NAVIGATION
    ════════════════════════════════════════════════════════════ -->
    <div
      class="sticky z-30 border-b border-white/[0.07] bg-[#0a0a0e]/85 backdrop-blur-md"
      style="top: var(--app-header-offset-mobile, 64px);"
    >
      <div class="mx-auto max-w-2xl px-4 sm:px-6">
        <nav class="scrollbar-hide -mb-px flex overflow-x-auto" aria-label="Разделы профиля">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            class="flex shrink-0 items-center gap-1.5 border-b-2 px-3.5 py-3.5 text-xs font-semibold transition-colors sm:px-4 sm:text-[13px]"
            :class="activeTab === tab.id
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-white/38 hover:text-white/65'"
            @click="activeTab = tab.id"
          >
            <UIcon :name="tab.icon" class="size-3.5 shrink-0" />
            {{ tab.label }}
          </button>

          <!-- Mobile logout -->
          <div class="ml-auto flex shrink-0 items-center px-3 sm:hidden">
            <button
              class="flex items-center gap-1 py-3 text-[11px] font-medium text-red-400/50 transition-colors hover:text-red-400"
              :disabled="logoutPending"
              @click="handleLogout"
            >
              <UIcon name="lucide:log-out" class="size-3.5" />
              {{ logoutPending ? '...' : 'Выйти' }}
            </button>
          </div>
        </nav>
      </div>
    </div>

    <!-- ════════════════════════════════════════════════════════════
         TAB CONTENT
    ════════════════════════════════════════════════════════════ -->
    <div class="mx-auto max-w-2xl px-4 py-8 sm:px-6">

      <!-- ── ОБЗОР ──────────────────────────────────────────────── -->
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
              <div class="relative aspect-[2/3] overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/6 transition-all duration-300 group-hover:ring-emerald-500/30 group-hover:shadow-lg group-hover:shadow-black/50">
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

                <!-- Hover play -->
                <div class="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <div class="flex h-10 w-10 scale-75 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40 transition-transform duration-200 group-hover:scale-100">
                    <UIcon name="lucide:play" class="ml-0.5 size-4 text-white" />
                  </div>
                </div>
              </div>

              <!-- Info -->
              <p class="mt-2 truncate text-xs font-semibold leading-tight text-white/80">{{ item.title }}</p>
              <p v-if="item.episode" class="mt-0.5 text-[10px] text-white/35">
                Эп. {{ item.episode }}
                <span v-if="item.translationName"> · {{ item.translationName }}</span>
              </p>
            </div>
          </div>
        </section>
      </div>

      <!-- ── БИБЛИОТЕКА ─────────────────────────────────────────── -->
      <div v-show="activeTab === 'library'">
        <LibrarySection :library="library" :loading="libLoading" />
      </div>

      <!-- ── ДОСТИЖЕНИЯ ─────────────────────────────────────────── -->
      <div v-show="activeTab === 'achievements'">
        <AchievementList :achievements="achievements" :loading="achievLoading" />
      </div>

      <!-- ── ИСТОРИЯ ────────────────────────────────────────────── -->
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

  <!-- Avatar picker -->
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
/* Без @apply: в Tailwind v4 в SFC нужен @reference; явные стили стабильнее для Vite */
.section-label {
  margin-bottom: 1rem;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.25);
}
</style>
