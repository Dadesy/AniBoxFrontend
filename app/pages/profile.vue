<template>
  <div class="profile-page">
    <!-- Loading state -->
    <div v-if="loading" class="profile-loading">
      <div class="loading-spinner" />
    </div>

    <template v-else-if="profile">
      <!-- Header -->
      <div class="profile-header">
        <div class="avatar-area">
          <button class="avatar-btn" title="Сменить аватар" @click="showAvatarPicker = true">
            <img
              v-if="profile.avatarUrl"
              :src="profile.avatarUrl"
              alt="Аватар"
              class="avatar-img"
            />
            <div v-else class="avatar-fallback">
              {{ profile.email[0]?.toUpperCase() }}
            </div>
            <div class="avatar-overlay">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
          </button>

          <div class="profile-meta">
            <h1 class="profile-email">{{ profile.email }}</h1>
            <div class="profile-badges">
              <span class="badge" :class="profile.role === 'ADMIN' ? 'badge-admin' : 'badge-user'">
                {{ profile.role === 'ADMIN' ? 'Администратор' : 'Пользователь' }}
              </span>
              <span v-if="profile.lastLoginAt" class="badge-light">
                Последний вход: {{ formatDate(profile.lastLoginAt) }}
              </span>
            </div>
          </div>
        </div>

        <button class="logout-btn" :class="{ pending: logoutPending }" @click="handleLogout">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Выйти
        </button>
      </div>

      <!-- Stats -->
      <section class="profile-section">
        <h2 class="section-title">Статистика</h2>
        <ProfileStatsCards :stats="stats" :loading="statsLoading" />
      </section>

      <!-- Continue watching -->
      <section v-if="continueWatching.length > 0" class="profile-section">
        <h2 class="section-title">Продолжить просмотр</h2>
        <div class="continue-grid">
          <div
            v-for="item in continueWatching"
            :key="item.id"
            class="continue-card"
            @click="navigateTo(`/title/${item.externalId}`)"
          >
            <div class="continue-poster">
              <img v-if="item.posterUrl" :src="item.posterUrl" :alt="item.title" loading="lazy" />
              <div v-else class="poster-fallback" />
              <div class="continue-play">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              </div>
            </div>
            <div class="continue-info">
              <p class="continue-title">{{ item.title }}</p>
              <p class="continue-meta">
                <span v-if="item.episode">Эп. {{ item.episode }}</span>
                <span v-if="item.translationName"> · {{ item.translationName }}</span>
              </p>
              <div class="mini-progress">
                <div
                  class="mini-progress-fill"
                  :style="{ width: progressPercent(item) + '%' }"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- History -->
      <section class="profile-section">
        <div class="section-header">
          <h2 class="section-title">История просмотров</h2>
          <span class="section-count">{{ historyTotal }}</span>
        </div>
        <ProfileHistoryList
          :items="history"
          :total="historyTotal"
          :loading="historyLoading"
          @load-more="fetchHistory(20, history.length)"
        />
      </section>
    </template>

    <!-- Error -->
    <div v-else-if="error" class="profile-error">
      <p>{{ error }}</p>
      <button class="retry-btn" @click="init">Повторить</button>
    </div>

    <!-- Avatar picker modal -->
    <ProfileAvatarPicker
      v-if="showAvatarPicker"
      :current-avatar-url="profile?.avatarUrl ?? null"
      :current-preset-id="currentPresetId"
      @close="showAvatarPicker = false"
      @select-preset="onSelectPreset"
      @upload-file="onUploadFile"
    />
  </div>
</template>

<script setup lang="ts">
import ProfileStatsCards from '~/components/profile/StatsCards.vue'
import ProfileHistoryList from '~/components/profile/HistoryList.vue'
import ProfileAvatarPicker from '~/components/profile/AvatarPicker.vue'
import { useProfile } from '~/composables/useProfile'
import type { EpisodeProgress } from '~/types/content'
import { PRESET_AVATAR_SEEDS } from '~/types/user'

definePageMeta({ middleware: 'auth' })

const { user, logout } = useAuth()

const {
  profile,
  stats,
  history,
  historyTotal,
  continueWatching,
  loading,
  statsLoading,
  historyLoading,
  error,
  init,
  fetchHistory,
  setPresetAvatar,
  uploadAvatar,
} = useProfile()

const showAvatarPicker = ref(false)
const logoutPending    = ref(false)

// Determine which preset is currently active
const currentPresetId = computed<string | null>(() => {
  if (!profile.value || profile.value.avatarType !== 'preset' || !profile.value.avatarUrl) return null
  const found = PRESET_AVATAR_SEEDS.find(p => profile.value!.avatarUrl!.includes(`seed=${encodeURIComponent(p.seed)}`))
  return found?.id ?? null
})

// ── Init ─────────────────────────────────────────────────────────────────────
onMounted(() => { init() })

// ── Avatar ───────────────────────────────────────────────────────────────────
async function onSelectPreset(presetId: string): Promise<void> {
  showAvatarPicker.value = false
  await setPresetAvatar(presetId)
}

async function onUploadFile(file: File): Promise<void> {
  showAvatarPicker.value = false
  await uploadAvatar(file)
}

// ── Logout ───────────────────────────────────────────────────────────────────
async function handleLogout(): Promise<void> {
  logoutPending.value = true
  try { await logout() }
  finally { logoutPending.value = false }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function progressPercent(item: EpisodeProgress): number {
  if (!item.duration) return 0
  return Math.min(100, Math.round((item.currentTime / item.duration) * 100))
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}
</script>

<style scoped>
.profile-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 20px 64px;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* Loading */
.profile-loading {
  display: flex;
  justify-content: center;
  padding: 80px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255,255,255,.1);
  border-top-color: var(--color-primary, #22c55e);
  border-radius: 50%;
  animation: spin .8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Header */
.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.avatar-area {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar-btn {
  position: relative;
  width: 88px;
  height: 88px;
  border-radius: 50%;
  border: 3px solid var(--color-primary, #22c55e);
  overflow: hidden;
  cursor: pointer;
  padding: 0;
  background: var(--surface-2, #141418);
  flex-shrink: 0;
  transition: border-color .2s;
}

.avatar-btn:hover { border-color: #4ade80; }

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary, #22c55e);
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,.55);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity .2s;
  color: #fff;
}

.avatar-btn:hover .avatar-overlay { opacity: 1; }

.profile-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.profile-email {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
  color: #fff;
}

.profile-badges {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: .72rem;
  font-weight: 600;
  letter-spacing: .03em;
}

.badge-admin {
  background: rgba(234,179,8,.15);
  color: #fbbf24;
  border: 1px solid rgba(234,179,8,.25);
}

.badge-user {
  background: rgba(var(--color-primary-rgb, 34 197 94) / .12);
  color: var(--color-primary, #22c55e);
  border: 1px solid rgba(var(--color-primary-rgb, 34 197 94) / .2);
}

.badge-light {
  font-size: .72rem;
  color: rgba(255,255,255,.4);
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 1px solid rgba(239,68,68,.3);
  border-radius: 99px;
  background: transparent;
  color: rgba(239,68,68,.8);
  font-size: .85rem;
  cursor: pointer;
  transition: border-color .2s, color .2s, background .2s;
}

.logout-btn:hover {
  border-color: rgba(239,68,68,.7);
  color: #ef4444;
  background: rgba(239,68,68,.08);
}

.logout-btn.pending { opacity: .6; pointer-events: none; }

/* Section */
.profile-section { display: flex; flex-direction: column; gap: 16px; }

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
  letter-spacing: -.01em;
}

.section-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 20px;
  padding: 0 6px;
  background: rgba(255,255,255,.1);
  border-radius: 99px;
  font-size: .72rem;
  color: rgba(255,255,255,.5);
}

/* Continue watching grid */
.continue-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.continue-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
}

.continue-poster {
  position: relative;
  width: 100%;
  aspect-ratio: 2/3;
  border-radius: 10px;
  overflow: hidden;
  background: var(--surface-2, #141418);
}

.continue-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform .25s;
}

.continue-card:hover .continue-poster img { transform: scale(1.04); }

.poster-fallback {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1a22, #111115);
}

.continue-play {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,.5);
  opacity: 0;
  transition: opacity .2s;
  color: #fff;
}

.continue-card:hover .continue-play { opacity: 1; }

.continue-info { padding: 0 2px; }

.continue-title {
  font-size: .8rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.continue-meta {
  font-size: .72rem;
  color: rgba(255,255,255,.45);
  margin: 0 0 6px;
}

.mini-progress {
  height: 3px;
  background: rgba(255,255,255,.1);
  border-radius: 99px;
  overflow: hidden;
}

.mini-progress-fill {
  height: 100%;
  background: var(--color-primary, #22c55e);
  border-radius: 99px;
}

/* Error */
.profile-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 60px 20px;
  color: rgba(255,255,255,.5);
}

.retry-btn {
  padding: 10px 24px;
  border: 1px solid rgba(255,255,255,.2);
  border-radius: 99px;
  background: transparent;
  color: #fff;
  cursor: pointer;
  font-size: .85rem;
  transition: border-color .2s;
}

.retry-btn:hover { border-color: var(--color-primary, #22c55e); }
</style>
