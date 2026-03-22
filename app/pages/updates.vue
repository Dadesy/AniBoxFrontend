<script setup lang="ts">
import type { ChangelogApiResponse } from '~/types/changelog'

const { pageTitle } = useSiteBranding()
const cfg = useRuntimeConfig()
const siteUrl = cfg.public.siteUrl as string
const ogImage = `${siteUrl}/og-image.png`

usePageCanonical('/updates')

const updatesTitle = computed(() => pageTitle('Обновления'))
const updatesDesc =
  'Журнал изменений: новые функции и исправления по версиям.'

useSeoMeta({
  title: updatesTitle,
  description: updatesDesc,
  ogTitle: updatesTitle,
  ogDescription: updatesDesc,
  ogUrl: `${siteUrl}/updates`,
  ogImage,
  twitterCard: 'summary_large_image',
  twitterTitle: updatesTitle,
  twitterDescription: updatesDesc,
  twitterImage: ogImage,
  robots: 'index, follow',
})

const { data, pending, error } = await useFetch<ChangelogApiResponse>(
  '/api/changelog',
  { key: 'changelog' },
)

const entries = computed(() => data.value?.entries ?? [])
const isEmpty = computed(() => !pending.value && entries.value.length === 0)
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10 lg:px-8">
    <header class="mb-10">
      <h1 class="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        Обновления
      </h1>
      <p class="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
        Краткий список того, что менялось на сайте. Он собирается из файла
        <code class="rounded bg-white/10 px-1.5 py-0.5 text-xs text-green-300">
          CHANGELOG.md
        </code>
        в корне приложения: добавьте блок версии и пункты — после деплоя они появятся здесь
        (в продакшене нужна пересборка).
      </p>
    </header>

    <div
      v-if="pending"
      class="space-y-6"
      aria-busy="true"
    >
      <div
        v-for="i in 3"
        :key="i"
        class="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6"
      >
        <div class="mb-4 h-6 w-40 animate-pulse rounded bg-white/10" />
        <div class="space-y-2">
          <div class="h-4 w-full animate-pulse rounded bg-white/5" />
          <div class="h-4 w-5/6 animate-pulse rounded bg-white/5" />
        </div>
      </div>
    </div>

    <div
      v-else-if="error"
      class="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-6 text-sm text-amber-200"
    >
      Не удалось загрузить список обновлений. Попробуйте обновить страницу позже.
    </div>

    <div
      v-else-if="isEmpty"
      class="rounded-2xl border border-dashed border-white/10 p-10 text-center"
    >
      <UIcon
        name="lucide:file-text"
        class="mx-auto mb-4 size-12 text-slate-600"
      />
      <p class="text-slate-400">
        Пока нет записей. Добавьте в
        <code class="text-green-400">CHANGELOG.md</code>
        заголовок вида
        <code class="text-green-400">## [ [2.75.1](URL) ] - 22.01.2026</code>
        и список изменений.
      </p>
    </div>

    <ol
      v-else
      class="space-y-10"
    >
      <li
        v-for="rel in entries"
        :key="(rel.versionUrl ?? '') + rel.version + (rel.date ?? '')"
        class="rounded-2xl border border-white/[0.06] bg-cinema-card/40 p-6 sm:p-8"
      >
        <div class="mb-6 flex flex-wrap items-baseline gap-3 border-b border-white/[0.06] pb-4">
          <h2 class="text-xl font-bold text-white">
            <a
              v-if="rel.versionUrl"
              :href="rel.versionUrl"
              class="transition-colors hover:text-green-400"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ rel.version }}
              <span class="ml-1 text-sm font-normal text-slate-500">↗</span>
            </a>
            <template v-else>
              {{ rel.version }}
            </template>
          </h2>
          <time
            v-if="rel.date"
            class="text-sm text-slate-500"
            :datetime="rel.dateTimeAttr ?? undefined"
          >
            {{ rel.date }}
          </time>
        </div>

        <div class="space-y-6">
          <section
            v-for="sec in rel.sections"
            :key="sec.title"
          >
            <h3 class="mb-3 text-xs font-bold uppercase tracking-wider text-green-400/90">
              {{ sec.title }}
            </h3>
            <ul class="list-inside list-disc space-y-2 text-sm leading-relaxed text-slate-300 marker:text-green-500/80">
              <li
                v-for="(item, idx) in sec.items"
                :key="idx"
                class="pl-1"
              >
                {{ item }}
              </li>
            </ul>
          </section>
        </div>
      </li>
    </ol>
  </div>
</template>
