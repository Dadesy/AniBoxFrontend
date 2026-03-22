<script setup lang="ts">
import type { AchievementDto } from '~/types/gamification'

const props = defineProps<{ achievement: AchievementDto }>()

// ── Rarity based on EXP reward ────────────────────────────────────────────
type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

function getRarity(exp: number): Rarity {
  if (exp <= 25)  return 'common'
  if (exp <= 75)  return 'uncommon'
  if (exp <= 150) return 'rare'
  if (exp <= 350) return 'epic'
  return 'legendary'
}

const rarity = computed<Rarity>(() => getRarity(props.achievement.expReward))

const RARITY_CONFIG: Record<Rarity, {
  label: string
  textClass: string
  borderStyle: string
  bgStyle: string
  glowStyle: string
  shimmer: boolean
}> = {
  common: {
    label:       'Обычное',
    textClass:   'text-zinc-400',
    borderStyle: 'border-color: rgba(113,113,122,0.25)',
    bgStyle:     'background: rgba(24,24,28,0.6)',
    glowStyle:   '',
    shimmer:     false,
  },
  uncommon: {
    label:       'Редкое',
    textClass:   'text-emerald-400',
    borderStyle: 'border-color: rgba(34,197,94,0.3)',
    bgStyle:     'background: rgba(5,46,22,0.35)',
    glowStyle:   'box-shadow: 0 0 18px rgba(34,197,94,0.08)',
    shimmer:     false,
  },
  rare: {
    label:       'Ценное',
    textClass:   'text-sky-400',
    borderStyle: 'border-color: rgba(56,189,248,0.35)',
    bgStyle:     'background: rgba(7,36,62,0.4)',
    glowStyle:   'box-shadow: 0 0 22px rgba(56,189,248,0.1)',
    shimmer:     false,
  },
  epic: {
    label:       'Эпическое',
    textClass:   'text-violet-400',
    borderStyle: 'border-color: rgba(167,139,250,0.4)',
    bgStyle:     'background: rgba(30,12,60,0.45)',
    glowStyle:   'box-shadow: 0 0 24px rgba(167,139,250,0.14)',
    shimmer:     false,
  },
  legendary: {
    label:       'Легендарное',
    textClass:   'text-amber-400',
    borderStyle: 'border-color: rgba(251,191,36,0.5)',
    bgStyle:     'background: rgba(45,26,0,0.5)',
    glowStyle:   'box-shadow: 0 0 32px rgba(251,191,36,0.18)',
    shimmer:     true,
  },
}

const cfg = computed(() => RARITY_CONFIG[rarity.value])

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'short',
  })
}
</script>

<template>
  <div
    class="group relative overflow-hidden rounded-2xl border p-4 transition-all duration-300"
    :class="[
      achievement.unlocked ? 'hover:-translate-y-0.5 hover:shadow-xl' : 'opacity-45',
    ]"
    :style="`${cfg.borderStyle}; ${cfg.bgStyle}; ${cfg.glowStyle};`"
  >
    <!-- Legendary animated shimmer -->
    <div
      v-if="cfg.shimmer && achievement.unlocked"
      class="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-amber-400/8 to-transparent"
      aria-hidden="true"
    />

    <!-- Top rarity line -->
    <div
      v-if="achievement.unlocked"
      class="pointer-events-none absolute inset-x-0 top-0 h-px"
      :class="cfg.textClass.replace('text-', 'bg-').replace('-400', '-500/40')"
      aria-hidden="true"
    />

    <div class="flex items-start gap-3">

      <!-- Icon container -->
      <div
        class="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl transition-transform duration-300"
        :class="[
          achievement.unlocked ? 'group-hover:scale-110' : 'grayscale',
          cfg.textClass.replace('text-', 'bg-').replace('-400', '-500/10'),
        ]"
      >
        <!-- Emoji icon from backend -->
        <span class="leading-none" :class="achievement.unlocked ? '' : 'opacity-40'">
          {{ achievement.icon }}
        </span>

        <!-- Lock badge -->
        <div
          v-if="!achievement.unlocked"
          class="absolute -bottom-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full border border-white/10 bg-[#111115]"
        >
          <UIcon name="lucide:lock" class="size-2.5 text-white/35" />
        </div>
      </div>

      <!-- Body -->
      <div class="min-w-0 flex-1 space-y-1">

        <!-- Title row -->
        <div class="flex items-center justify-between gap-2">
          <p
            class="truncate text-sm font-bold leading-tight"
            :class="achievement.unlocked ? 'text-white' : 'text-white/50'"
          >
            {{ achievement.title }}
          </p>
          <!-- Rarity pill -->
          <span
            class="hidden shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider sm:inline-block"
            :class="[cfg.textClass, cfg.textClass.replace('text-', 'bg-').replace('-400', '-500/10')]"
          >
            {{ cfg.label }}
          </span>
        </div>

        <!-- Description -->
        <p class="text-[11px] leading-snug text-white/38">
          {{ achievement.description }}
        </p>

        <!-- Footer: EXP + date -->
        <div class="flex items-center justify-between pt-0.5">
          <span
            class="text-[11px] font-bold"
            :class="achievement.unlocked ? cfg.textClass : 'text-white/25'"
          >
            +{{ achievement.expReward }} EXP
          </span>
          <span
            v-if="achievement.unlocked && achievement.unlockedAt"
            class="text-[10px] text-white/25"
          >
            {{ formatDate(achievement.unlockedAt) }}
          </span>
          <span v-else-if="!achievement.unlocked" class="text-[10px] text-white/20">
            Не получено
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes shimmer {
  0%   { transform: translateX(-100%); }
  60%  { transform: translateX(100%); }
  100% { transform: translateX(100%); }
}
</style>
