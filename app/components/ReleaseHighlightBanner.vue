<template>
  <Transition name="tag">
    <div
      v-if="show"
      :class="rootClass"
      role="status"
      aria-live="polite"
    >
      <!--
        Шапка: без flex-wrap — иначе крестик уезжает на вторую строку на узких lg.
        Кнопка absolute справа; строка с текстом с min-w-0 + truncate.
      -->
      <template v-if="placement === 'header'">
        <div class="relative w-full min-w-0 pr-6">
          <p :class="headerLineClass">
            <UIcon
              name="lucide:sparkles"
              class="size-3 shrink-0 text-emerald-500/70"
              aria-hidden="true"
            />
            <span class="min-w-0 flex-1 truncate text-right">
              <span
                v-if="fresh?.version"
                :class="versionClass"
              >
                {{ fresh.version }}
              </span>
              <span
                v-if="fresh?.version"
                class="select-none opacity-50"
                aria-hidden="true"
              >
                ·
              </span>
              <NuxtLink
                to="/updates"
                :class="linkClass"
              >
                что нового
              </NuxtLink>
              <a
                v-if="fresh?.versionUrl"
                :href="fresh.versionUrl"
                :class="externalClass"
                target="_blank"
                rel="noopener noreferrer"
                title="Релиз"
              >
                ↗
              </a>
            </span>
          </p>
          <button
            type="button"
            :class="[closeClass, 'absolute right-0 top-1/2 -translate-y-1/2']"
            aria-label="Скрыть напоминание об обновлении"
            @click="dismissed = true"
          >
            <UIcon name="lucide:x" class="size-2.5 sm:size-3" />
          </button>
        </div>
      </template>
      <p
        v-else
        :class="lineClass"
      >
        <span
          v-if="fresh?.version"
          :class="versionClass"
        >
          {{ fresh.version }}
        </span>
        <span
          v-if="fresh?.version"
          class="select-none opacity-50"
          aria-hidden="true"
        >
          ·
        </span>
        <NuxtLink
          to="/updates"
          :class="linkClass"
        >
          что нового
        </NuxtLink>
        <a
          v-if="fresh?.versionUrl"
          :href="fresh.versionUrl"
          :class="externalClass"
          target="_blank"
          rel="noopener noreferrer"
          title="Релиз"
        >
          ↗
        </a>
        <button
          type="button"
          :class="closeClass"
          aria-label="Скрыть напоминание об обновлении"
          @click="dismissed = true"
        >
          <UIcon name="lucide:x" class="size-2.5 sm:size-3" />
        </button>
      </p>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { ChangelogApiResponse } from '~/types/changelog'

const props = withDefaults(
  defineProps<{
    /** header — в шапке справа; page — тихая строка под карточкой на главной (мобилка) */
    placement?: 'header' | 'page'
  }>(),
  { placement: 'page' },
)

const { bootOverlayRemoved } = useAppLoader()
const dismissed = ref(false)

const { data } = useFetch<ChangelogApiResponse>('/api/changelog', {
  key: 'changelog',
})

const fresh = computed(() => data.value?.freshRelease ?? null)

const show = computed(
  () =>
    bootOverlayRemoved.value &&
    !!fresh.value &&
    !dismissed.value,
)

const rootClass = computed(() =>
  props.placement === 'header'
    ? 'w-full min-w-0 max-w-[9.5rem] xl:max-w-[11rem]'
    : 'flex justify-center pt-0.5 opacity-[0.42] transition-opacity duration-200 hover:opacity-[0.78] focus-within:opacity-[0.85] sm:justify-end sm:pr-0.5',
)

/** Одна строка в шапке: крестик вне потока (absolute), текст режется с … */
const headerLineClass =
  'flex w-full min-w-0 flex-nowrap items-center justify-end gap-x-1 text-[10px] leading-tight text-slate-400 xl:text-[11px]'

const lineClass =
  'inline-flex max-w-full flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 text-[8px] leading-none text-white/40 sm:justify-end sm:text-[9px] sm:text-white/45'

const versionClass = computed(() =>
  props.placement === 'header'
    ? 'font-mono tabular-nums text-slate-500 xl:text-slate-400'
    : 'font-mono tabular-nums text-white/35 sm:text-white/40',
)

const linkClass = computed(() =>
  props.placement === 'header'
    ? 'shrink-0 rounded-sm font-medium text-emerald-500/85 underline decoration-emerald-500/25 underline-offset-2 transition-colors hover:text-emerald-400 hover:decoration-emerald-400/40 focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500/30'
    : 'rounded-sm font-medium text-white/45 underline decoration-white/12 underline-offset-2 transition-colors hover:text-white/65 hover:decoration-white/25 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/15',
)

const externalClass = computed(() =>
  props.placement === 'header'
    ? 'shrink-0 text-slate-500 transition-colors hover:text-slate-300'
    : 'hidden shrink-0 rounded-sm text-white/30 underline decoration-transparent underline-offset-2 transition-colors hover:text-white/50 sm:inline',
)

const closeClass = computed(() =>
  props.placement === 'header'
    ? 'inline-flex size-6 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-white/8 hover:text-slate-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/15'
    : 'ml-0.5 inline-flex size-4 items-center justify-center rounded text-white/25 transition-colors hover:bg-white/5 hover:text-white/45 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/10',
)
</script>

<style scoped>
.tag-enter-active,
.tag-leave-active {
  transition: opacity 0.2s ease;
}
.tag-enter-from,
.tag-leave-to {
  opacity: 0;
}
</style>
