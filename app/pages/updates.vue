<script setup lang="ts">
import type {
  ChangelogApiResponse,
  ChangelogRelease,
  ChangelogSection,
} from '~/types/changelog'

/** Порядок секций внутри карточки релиза */
const SECTION_ORDER = ['Реализовано', 'Изменено', 'Исправлено']

function sortReleaseSections(sections: ChangelogSection[]): ChangelogSection[] {
  return [...sections].sort((a, b) => {
    const ia = SECTION_ORDER.indexOf(a.title)
    const ib = SECTION_ORDER.indexOf(b.title)
    const va = ia === -1 ? 999 : ia
    const vb = ib === -1 ? 999 : ib
    if (va !== vb) return va - vb
    return a.title.localeCompare(b.title, 'ru')
  })
}

function withSortedSections(rel: ChangelogRelease): ChangelogRelease {
  return { ...rel, sections: sortReleaseSections(rel.sections) }
}

const { pageTitle } = useSiteBranding()
const cfg = useRuntimeConfig()
const siteUrl = cfg.public.siteUrl as string
const ogImage = `${siteUrl}/og-image.png`

usePageCanonical('/updates')

const updatesTitle = computed(() => pageTitle('Обновления'))
const updatesDesc =
  'Узнайте, что нового на сайте: удобство, каталог, просмотр и мелкие исправления — коротко и по делу.'

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
const entriesSorted = computed(() => entries.value.map(withSortedSections))
const plannedSections = computed(() => data.value?.planned ?? null)
const isEmpty = computed(
  () =>
    !pending.value &&
    entries.value.length === 0 &&
    !(plannedSections.value && plannedSections.value.length > 0),
)
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10 lg:px-8">
    <header class="mb-10">
      <h1 class="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        Обновления
      </h1>
      <div class="mt-3 max-w-xl space-y-2 text-sm leading-relaxed text-slate-400">
        <p>
          Здесь мы собираем <span class="font-medium text-slate-300">главные изменения</span>
          — что стало удобнее, что добавили и что поправили. Без лишнего технического жаргона:
          раз в какое-то время заглядывайте, если интересно, чем сайт живёт.
        </p>
        <p class="text-xs text-slate-500">
          После крупного обновления несколько дней может показываться короткое напоминание
          сверху страницы — чтобы не пропустить новости.
        </p>
      </div>
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
        Пока нечего показать — список обновлений появится, как только мы его опубликуем.
        Загляните позже.
      </p>
    </div>

    <ol
      v-else
      class="space-y-10"
    >
      <li
        v-for="rel in entriesSorted"
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

    <section
      v-if="plannedSections && plannedSections.length > 0"
      class="mt-12 rounded-2xl border border-dashed border-violet-500/25 bg-violet-950/20 p-6 sm:p-8"
      aria-labelledby="planned-heading"
    >
      <div class="mb-4 border-b border-violet-500/15 pb-4">
        <h2
          id="planned-heading"
          class="text-lg font-bold text-violet-200"
        >
          Запланировано
        </h2>
        <p class="mt-1 text-xs leading-relaxed text-violet-300/70">
          Это не привязано к номеру версии и дате релиза — просто идеи и направления, над которыми работаем.
        </p>
      </div>
      <div class="space-y-6">
        <div
          v-for="sec in plannedSections"
          :key="sec.title"
        >
          <h3
            v-if="plannedSections.length > 1 || sec.title !== 'Запланировано'"
            class="mb-3 text-xs font-bold uppercase tracking-wider text-violet-400/90"
          >
            {{ sec.title }}
          </h3>
          <ul
            class="list-inside list-disc space-y-2 text-sm leading-relaxed text-violet-100/90 marker:text-violet-400/80"
          >
            <li
              v-for="(item, idx) in sec.items"
              :key="idx"
              class="pl-1"
            >
              {{ item }}
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>
