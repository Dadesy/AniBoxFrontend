<script setup lang="ts">
import type { ScheduleRelease } from '~/types/metadata'
import type { EpisodeProgress } from '~/types/content'
import { navigateToCard } from '~/composables/useMetadata'
import { KIND_LABELS, STATUS_LABELS } from '~/types/metadata'

const props = defineProps<{
  release: ScheduleRelease
  continueProgress?: EpisodeProgress | null
  highlight?: boolean
}>()

const { navigateToWatch } = useWatchTarget()

function statusLabel(status: string): string {
  const k = status.toLowerCase()
  return STATUS_LABELS[k as keyof typeof STATUS_LABELS] ?? status
}

function kindLabel(kind?: string): string {
  if (!kind) return ''
  return KIND_LABELS[kind as keyof typeof KIND_LABELS] ?? kind.toUpperCase()
}

async function onWatch(e: Event) {
  e.stopPropagation()
  if (props.release.externalId) {
    await navigateToWatch(props.release.externalId)
    return
  }
  await navigateToCard(props.release)
}

async function onDetail(e: Event) {
  e.stopPropagation()
  await navigateToCard(props.release)
}
</script>

<template>
  <article
    class="group relative flex gap-3 rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-transparent p-3 shadow-sm transition-[transform,box-shadow,border-color] motion-safe:duration-200 hover:border-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/[0.06] focus-within:border-emerald-500/30"
    :class="highlight ? 'ring-1 ring-emerald-500/35' : ''"
  >
    <button
      type="button"
      class="flex min-w-0 flex-1 gap-3 text-left"
      :aria-label="`Открыть ${release.titleRu || release.title}`"
      @click="onDetail"
    >
      <div
        class="relative h-[4.5rem] w-12 flex-shrink-0 overflow-hidden rounded-lg bg-white/5 sm:h-[5.25rem] sm:w-[3.25rem]"
      >
        <img
          v-if="release.posterUrl"
          :src="release.posterUrl"
          :alt="release.titleRu || release.title"
          loading="lazy"
          class="h-full w-full object-cover transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105"
        />
        <div v-else class="h-full w-full animate-pulse bg-white/10" />
      </div>

      <div class="min-w-0 flex-1 py-0.5">
        <div class="flex flex-wrap items-center gap-1.5">
          <span
            v-if="release.kind"
            class="rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500"
          >
            {{ kindLabel(release.kind) }}
          </span>
          <span
            class="rounded px-1.5 py-0.5 text-[10px] font-medium text-amber-400/90 ring-1 ring-amber-500/20"
          >
            {{ statusLabel(release.status) }}
          </span>
          <span
            v-if="release.externalId"
            class="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400/90"
          >
            В каталоге
          </span>
        </div>

        <h3
          class="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-zinc-100 sm:text-[15px]"
        >
          {{ release.titleRu || release.title }}
        </h3>

        <p class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-zinc-500">
          <span v-if="release.nextEpisode != null" class="text-zinc-400">
            Серия {{ release.nextEpisode }}
          </span>
          <span v-if="release.airTimeKnown && release.localTimeLabel" class="tabular-nums">
            {{ release.localTimeLabel }}
          </span>
          <span v-else-if="release.nextAirAt" class="text-zinc-600">Время уточняется</span>
        </p>

        <p
          v-if="continueProgress && release.externalId === continueProgress.externalId"
          class="mt-1 text-[11px] text-emerald-400/90"
        >
          Продолжить: с{{ continueProgress.season ?? 1 }} э{{ continueProgress.episode ?? 1 }}
          <span v-if="continueProgress.translationName" class="text-zinc-500">
            · {{ continueProgress.translationName }}
          </span>
        </p>
      </div>
    </button>

    <div class="flex flex-shrink-0 flex-col justify-center gap-1.5 sm:flex-row sm:items-center">
      <UButton
        v-if="continueProgress && release.externalId"
        size="xs"
        color="primary"
        variant="soft"
        class="min-w-[5.5rem] justify-center"
        @click="onWatch"
      >
        Продолжить
      </UButton>
      <UButton
        v-else
        size="xs"
        color="primary"
        class="min-w-[5.5rem] justify-center"
        @click="onWatch"
      >
        Смотреть
      </UButton>
      <UButton
        size="xs"
        color="neutral"
        variant="ghost"
        class="hidden sm:inline-flex"
        @click="onDetail"
      >
        Подробнее
      </UButton>
    </div>
  </article>
</template>
