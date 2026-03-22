<script setup lang="ts">
import type { LevelProgressDto, LevelTier } from '~/types/gamification'
import { TIER_COLORS }                      from '~/types/gamification'
import ExpProgressBar                        from '~/components/gamification/ExpProgressBar.vue'

const props = defineProps<{ progress: LevelProgressDto }>()

const TIER_ICONS: Record<LevelTier, string> = {
  bronze: 'lucide:shield',
  silver: 'lucide:award',
  gold:   'lucide:crown',
  neon:   'lucide:zap',
}

const tierIcon   = computed(() => TIER_ICONS[props.progress.tier])
const tierColor  = computed(() => TIER_COLORS[props.progress.tier])
</script>

<template>
  <div
    class="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-white/[0.03] to-transparent p-5 sm:p-6"
    :style="`border-color: ${tierColor.border};`"
  >
    <!-- Glow orb -->
    <div
      class="pointer-events-none absolute -left-10 -top-10 h-48 w-48 rounded-full opacity-12 blur-3xl"
      aria-hidden="true"
      :style="`background: ${tierColor.glow};`"
    />
    <!-- Shimmer line at top -->
    <div
      class="pointer-events-none absolute inset-x-0 top-0 h-px opacity-60"
      aria-hidden="true"
      :style="`background: linear-gradient(90deg, transparent, ${tierColor.text}, transparent);`"
    />

    <div class="relative flex items-center gap-5">

      <!-- Level badge -->
      <div class="shrink-0">
        <div
          class="relative flex h-[70px] w-[70px] flex-col items-center justify-center rounded-2xl border-2 sm:h-[78px] sm:w-[78px]"
          :style="`border-color: ${tierColor.border}; box-shadow: 0 0 24px ${tierColor.glow};`"
        >
          <!-- Tier icon top -->
          <UIcon
            :name="tierIcon"
            class="mb-0.5 size-4 opacity-80 sm:size-5"
            :style="`color: ${tierColor.text};`"
          />
          <!-- Level number -->
          <span
            class="text-2xl font-black leading-none tabular-nums tracking-tighter sm:text-[1.75rem]"
            :style="`color: ${tierColor.text};`"
          >
            {{ progress.level }}
          </span>
        </div>
      </div>

      <!-- Info column -->
      <div class="min-w-0 flex-1 space-y-2.5">
        <div class="flex items-baseline justify-between gap-2">
          <span class="truncate text-base font-bold text-white sm:text-[1.05rem]">
            {{ progress.levelTitle }}
          </span>
          <span
            class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            :style="`color: ${tierColor.text}; background: ${tierColor.glow.replace(/[\d.]+\)$/, '0.12)')};`"
          >
            {{ progress.tier }}
          </span>
        </div>

        <ExpProgressBar :pct="progress.progressPct" :show-label="true" :animate="true" />

        <div class="flex items-center gap-1.5 text-xs">
          <span class="font-semibold text-white/75">
            {{ progress.exp.toLocaleString('ru-RU') }} EXP
          </span>
          <span class="text-white/20">·</span>
          <span class="text-white/35">
            ещё {{ progress.expToNext.toLocaleString('ru-RU') }} до следующего
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
