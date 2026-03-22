<script setup lang="ts">
import type { Collection } from '~/types/metadata'

defineProps<{ collections: Collection[] }>()

// ── Per-collection accent palette (cycling by index) ─────────────────────
const ACCENTS = [
  { r: 34,  g: 197, b: 94,  hex: '#22c55e' }, // emerald
  { r: 59,  g: 130, b: 246, hex: '#3b82f6' }, // blue
  { r: 249, g: 115, b: 22,  hex: '#f97316' }, // orange
  { r: 167, g: 139, b: 250, hex: '#a78bfa' }, // violet
  { r: 236, g: 72,  b: 153, hex: '#ec4899' }, // pink
  { r: 251, g: 191, b: 36,  hex: '#fbbf24' }, // amber
] as const

function accent(idx: number) {
  return ACCENTS[idx % ACCENTS.length]!
}
function accentRgba(idx: number, opacity: number): string {
  const { r, g, b } = accent(idx)
  return `rgba(${r},${g},${b},${opacity})`
}

// Pad poster list to exactly `n` slots
function padPosters(col: Collection, n: number) {
  const out: Array<{ posterUrl?: string; title?: string }> = col.items.slice(0, n)
  while (out.length < n) out.push({})
  return out
}
</script>

<template>
  <section>
    <!--
      Layout:
      · mobile (<sm) — horizontal scroll, card 164×180px  (app-shelf UX)
      · sm–lg        — 2-col grid, cards fixed height 160px
      · lg+          — 4-col grid; first card spans 2 cols (featured)
    -->
    <div
      class="
        scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-1
        sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0
        lg:grid-cols-4
      "
    >
      <div
        v-for="(col, idx) in collections"
        :key="col.id"
        class="
          group relative shrink-0 cursor-pointer overflow-hidden rounded-2xl
          w-[164px] h-[180px]
          sm:w-auto sm:h-[160px]
          lg:h-[180px]
          transition-transform duration-300 hover:-translate-y-0.5
        "
        :class="idx === 0 ? 'lg:col-span-2' : ''"
        :style="`box-shadow: 0 4px 28px rgba(0,0,0,0.55);`"
        @click="navigateTo(col.seeAllHref ?? '/catalog')"
      >

        <!-- ══ POSTER MOSAIC — full-bleed background ══════════════════ -->

        <!-- Featured (idx 0 on lg): large-left + 2-stacked-right -->
        <template v-if="idx === 0">
          <div class="absolute inset-0 flex">
            <!-- Large left poster -->
            <div class="h-full w-[58%] overflow-hidden">
              <img
                v-if="padPosters(col, 3)[0]?.posterUrl"
                :src="padPosters(col, 3)[0]!.posterUrl"
                alt=""
                loading="lazy"
                referrerpolicy="no-referrer"
                class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div v-else class="h-full w-full bg-white/[0.05]" />
            </div>
            <!-- Divider -->
            <div class="w-px bg-black/50" aria-hidden="true" />
            <!-- 2 stacked right posters -->
            <div class="flex h-full flex-1 flex-col">
              <template v-for="(item, pi) in padPosters(col, 3).slice(1)" :key="pi">
                <div
                  class="relative flex-1 overflow-hidden"
                  :class="pi === 0 ? 'border-b border-black/50' : ''"
                >
                  <img
                    v-if="item.posterUrl"
                    :src="item.posterUrl"
                    alt=""
                    loading="lazy"
                    referrerpolicy="no-referrer"
                    class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div v-else class="h-full w-full bg-white/[0.03]" />
                </div>
              </template>
            </div>
          </div>
        </template>

        <!-- Standard (idx > 0): 2 × 2 poster grid -->
        <template v-else>
          <div class="absolute inset-0 grid grid-cols-2 grid-rows-2">
            <div
              v-for="(item, pi) in padPosters(col, 4)"
              :key="pi"
              class="overflow-hidden"
              :class="[
                pi === 0 ? 'border-r border-b border-black/50' : '',
                pi === 1 ? 'border-b border-black/50' : '',
                pi === 2 ? 'border-r border-black/50' : '',
              ]"
            >
              <img
                v-if="item.posterUrl"
                :src="item.posterUrl"
                alt=""
                loading="lazy"
                referrerpolicy="no-referrer"
                class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div v-else class="h-full w-full bg-white/[0.04]" />
            </div>
          </div>
        </template>

        <!-- ══ ACCENT TINT (per-collection colour from palette) ═══════ -->
        <div
          class="pointer-events-none absolute inset-0"
          aria-hidden="true"
          :style="`background: radial-gradient(ellipse 90% 65% at 100% 0%, ${accentRgba(idx, 0.24)} 0%, transparent 65%);`"
        />

        <!-- ══ GRADIENT SCRIM — text legibility ════════════════════════ -->
        <div
          class="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style="background: linear-gradient(to top, rgba(4,4,8,0.97) 0%, rgba(4,4,8,0.52) 44%, rgba(4,4,8,0.06) 100%);"
        />

        <!-- ══ HOVER BRIGHTEN ══════════════════════════════════════════ -->
        <div
          class="pointer-events-none absolute inset-0 bg-white/0 transition-colors duration-300 group-hover:bg-white/[0.04]"
          aria-hidden="true"
        />

        <!-- ══ TOP ACCENT LINE — glows on hover ════════════════════════ -->
        <div
          class="pointer-events-none absolute inset-x-0 top-0 h-[2px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden="true"
          :style="`background: linear-gradient(90deg, transparent 0%, ${accent(idx).hex} 50%, transparent 100%);`"
        />

        <!-- ══ CONTENT OVERLAY — bottom ════════════════════════════════ -->
        <div class="absolute inset-x-0 bottom-0 p-3">
          <div class="flex items-end justify-between gap-2">
            <div class="min-w-0 flex-1">

              <!-- Icon + count row -->
              <div class="mb-1.5 flex items-center gap-1.5">
                <div
                  class="flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-[5px]"
                  :style="`
                    background: ${accentRgba(idx, 0.18)};
                    border: 1px solid ${accentRgba(idx, 0.38)};
                  `"
                >
                  <UIcon
                    :name="col.icon ?? 'lucide:layers'"
                    class="size-[10px]"
                    :style="`color: ${accent(idx).hex};`"
                  />
                </div>
                <span class="text-[10px] font-semibold tabular-nums text-white/38">
                  {{ col.items.length }}+ тайтлов
                </span>
              </div>

              <!-- Collection title -->
              <p class="truncate text-[13px] font-bold leading-tight text-white">
                {{ col.title }}
              </p>

              <!-- Subtitle (featured only) -->
              <p
                v-if="col.subtitle && idx === 0"
                class="mt-0.5 truncate text-[11px] text-white/38"
              >
                {{ col.subtitle }}
              </p>
            </div>

            <!-- Arrow circle button -->
            <div
              class="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border border-white/[0.14] bg-black/35 transition-all duration-200 group-hover:border-white/28 group-hover:bg-white/10"
            >
              <UIcon
                name="lucide:arrow-right"
                class="size-3 text-white/42 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-white/80"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
