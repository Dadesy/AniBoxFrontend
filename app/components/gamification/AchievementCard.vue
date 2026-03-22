<script setup lang="ts">
import type { AchievementDto } from '~/types/gamification'
import anime                   from 'animejs/lib/anime.es.js'
import { useReducedMotion }    from '~/composables/useReducedMotion'

const props = defineProps<{
  achievement: AchievementDto
  index?:      number   // position in list → entrance stagger delay
}>()

// ── Rarity system ─────────────────────────────────────────────────────────
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
  label:       string
  textClass:   string
  hexColor:    string
  borderStyle: string
  bgStyle:     string
  glowStyle:   string
  shimmer:     boolean
}> = {
  common: {
    label:       'Обычное',
    textClass:   'text-zinc-400',
    hexColor:    '#a1a1aa',
    borderStyle: 'border-color: rgba(113,113,122,0.25)',
    bgStyle:     'background: rgba(24,24,28,0.6)',
    glowStyle:   '',
    shimmer:     false,
  },
  uncommon: {
    label:       'Редкое',
    textClass:   'text-emerald-400',
    hexColor:    '#22c55e',
    borderStyle: 'border-color: rgba(34,197,94,0.30)',
    bgStyle:     'background: rgba(5,46,22,0.35)',
    glowStyle:   'box-shadow: 0 0 18px rgba(34,197,94,0.08)',
    shimmer:     false,
  },
  rare: {
    label:       'Ценное',
    textClass:   'text-sky-400',
    hexColor:    '#38bdf8',
    borderStyle: 'border-color: rgba(56,189,248,0.35)',
    bgStyle:     'background: rgba(7,36,62,0.40)',
    glowStyle:   'box-shadow: 0 0 22px rgba(56,189,248,0.10)',
    shimmer:     false,
  },
  epic: {
    label:       'Эпическое',
    textClass:   'text-violet-400',
    hexColor:    '#a78bfa',
    borderStyle: 'border-color: rgba(167,139,250,0.40)',
    bgStyle:     'background: rgba(30,12,60,0.45)',
    glowStyle:   'box-shadow: 0 0 24px rgba(167,139,250,0.14)',
    shimmer:     false,
  },
  legendary: {
    label:       'Легендарное',
    textClass:   'text-amber-400',
    hexColor:    '#fbbf24',
    borderStyle: 'border-color: rgba(251,191,36,0.50)',
    bgStyle:     'background: rgba(45,26,0,0.50)',
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

// ── Particle burst (module-level, no closure overhead) ────────────────────
function burstParticles(origin: HTMLElement, color: string): void {
  const rect = origin.getBoundingClientRect()
  const cx   = rect.left + rect.width  / 2
  const cy   = rect.top  + rect.height / 2
  const N    = 14

  // Pre-bake angles so X/Y are consistent per particle
  const angles = Array.from({ length: N }, (_, i) =>
    (i / N) * Math.PI * 2 + (Math.random() - 0.5) * 0.9,
  )
  const dists = Array.from({ length: N }, () => 38 + Math.random() * 52)

  // Main colored particles
  const dots = Array.from({ length: N }, (_, i) => {
    const el  = document.createElement('div')
    const sz  = 3 + (i % 4)
    // every 5th dot is white (sparkle effect)
    const col = i % 5 === 0 ? 'rgba(255,255,255,0.92)' : color
    el.style.cssText = [
      'position:fixed', 'pointer-events:none', 'border-radius:50%',
      'z-index:9999',
      `width:${sz}px`, `height:${sz}px`,
      `background:${col}`,
      `left:${cx}px`, `top:${cy}px`,
      'transform:translate(-50%,-50%)',
      'will-change:transform,opacity',
    ].join(';')
    document.body.appendChild(el)
    return el
  })

  anime({
    targets:    dots,
    translateX: (_: unknown, i: number) => Math.cos(angles[i]!) * dists[i]!,
    translateY: (_: unknown, i: number) => Math.sin(angles[i]!) * dists[i]! - 18,
    scale: [
      { value: 1.4,  duration: 80 },
      { value: 0,    duration: 380, easing: 'easeInQuart' },
    ],
    opacity: [
      { value: 1 },
      { value: 0, duration: 220, delay: 340, easing: 'linear' },
    ],
    easing:   'easeOutExpo',
    duration: 580,
    delay:    anime.stagger(16),
    complete: () => dots.forEach(p => p.remove()),
  })

  // Tiny white sparks rising upward
  const sparks = Array.from({ length: 7 }, () => {
    const el = document.createElement('div')
    el.style.cssText = [
      'position:fixed', 'pointer-events:none', 'border-radius:50%',
      'z-index:9999', 'width:2px', 'height:2px',
      'background:rgba(255,255,255,0.88)',
      `left:${cx}px`, `top:${cy}px`,
      'transform:translate(-50%,-50%)',
    ].join(';')
    document.body.appendChild(el)
    return el
  })

  anime({
    targets:    sparks,
    translateX: () => (Math.random() - 0.5) * 100,
    translateY: () => -(30 + Math.random() * 80),
    opacity:    [1, 0],
    easing:     'easeOutQuart',
    duration:   750,
    delay:      anime.stagger(35, { start: 80 }),
    complete:   () => sparks.forEach(p => p.remove()),
  })
}

// ── Entrance + burst via IntersectionObserver ─────────────────────────────
const cardRef    = ref<HTMLElement>()
const hasPlayed  = ref(false)
const { reducedMotion } = useReducedMotion()

onMounted(() => {
  if (!import.meta.client || !cardRef.value) return

  if (reducedMotion.value) return   // respect OS setting

  // Start invisible — the observer will animate in
  cardRef.value.style.opacity   = '0'
  cardRef.value.style.transform = 'translateY(18px) scale(0.95)'

  const staggerDelay = Math.min((props.index ?? 0) * 60, 360)

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting || hasPlayed.value) return
      hasPlayed.value = true
      observer.disconnect()

      // Entrance animation
      setTimeout(() => {
        anime({
          targets:    cardRef.value,
          opacity:    [0, 1],
          translateY: [18, 0],
          scale:      [0.95, 1],
          easing:     'easeOutQuart',
          duration:   420,
        })

        // Particle burst for unlocked cards (after entrance starts)
        if (props.achievement.unlocked && cardRef.value) {
          setTimeout(() => {
            burstParticles(cardRef.value!, cfg.value.hexColor)
          }, 280)
        }
      }, staggerDelay)
    },
    { threshold: 0.12 },
  )

  observer.observe(cardRef.value)
  onUnmounted(() => observer.disconnect())
})
</script>

<template>
  <div
    ref="cardRef"
    class="ach-card group relative overflow-hidden rounded-2xl border p-4 transition-all duration-300"
    :class="[achievement.unlocked ? 'hover:-translate-y-0.5 hover:shadow-xl' : 'opacity-45']"
    :style="`${cfg.borderStyle}; ${cfg.bgStyle}; ${cfg.glowStyle};`"
  >
    <!-- Legendary animated shimmer sweep -->
    <div
      v-if="cfg.shimmer && achievement.unlocked"
      class="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-amber-400/8 to-transparent"
      aria-hidden="true"
    />

    <!-- Top rarity accent line -->
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
  60%  { transform: translateX(100%);  }
  100% { transform: translateX(100%);  }
}
</style>
