<template>
  <!-- Прямая ссылка, если бэкенд уже прислал Kodik / anilibria externalId -->
  <NuxtLink
    v-if="content.slug || content.externalId"
    :to="directHref"
    class="group block w-full rounded-[var(--app-radius-lg)] transition-transform motion-reduce:transition-none active:scale-[0.98] motion-reduce:active:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-green)]/45"
    @pointerenter="onEnter"
    @pointerleave="onLeave"
  >
    <CardInner
      :content="content"
      :priority="priority"
      :trailer-url="trailerUrl"
      :preview-active="isActive"
    />
  </NuxtLink>

  <!--
    Как HeroSlider: без externalId данные всё равно есть (Shikimori id / название).
    Резолв через /content/resolve или переход в поиск — та же логика, что navigateToCard().
    Раньше здесь был только «нет плеера» и неактивная карточка — это выглядело как баг фронта.
  -->
  <button
    v-else-if="canTryNavigate"
    type="button"
    class="group block w-full cursor-pointer rounded-[var(--app-radius-lg)] text-left transition-transform motion-reduce:transition-none active:scale-[0.98] motion-reduce:active:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-green)]/45 disabled:pointer-events-none disabled:opacity-50"
    :disabled="navigating"
    @pointerenter="onEnter"
    @pointerleave="onLeave"
    @click="onFallbackNavigate"
  >
    <CardInner
      :content="content"
      :priority="priority"
      :trailer-url="trailerUrl"
      :preview-active="isActive"
    />
  </button>

  <!-- Нет ни id, ни названия — действительно нечего открыть -->
  <div v-else class="block rounded-[var(--app-radius-lg)] opacity-75">
    <CardInner :content="content" :no-play="true" />
  </div>
</template>

<script setup lang="ts">
import CardInner from '~/components/content/TitleCardInner.vue'
import { navigateToCard } from '~/composables/useMetadata'
import type { CatalogCard } from '~/types/content'
import type { NormalizedAnimeCard } from '~/types/metadata'

const props = defineProps<{
  content:   CatalogCard
  /**
   * Pass true for the first few cards visible above the fold.
   * Disables lazy loading so browsers fetch them with high priority (LCP).
   */
  priority?: boolean
}>()

type CardInput = CatalogCard & Partial<Pick<NormalizedAnimeCard, 'source' | 'alias'>>

function pickNonEmptyString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value !== 'string') continue
    const trimmed = value.trim()
    if (trimmed.length > 0) return trimmed
  }
  return null
}

/** Есть шанс открыть страницу тайтла через resolve (как на герое), а не «мёртвая» карточка */
const canTryNavigate = computed(() => {
  const c = props.content as CardInput
  if (pickNonEmptyString(c.externalId)) return false

  const rawId = c.shikimoriId ?? c.id
  if (rawId !== null && rawId !== undefined && String(rawId).trim().length > 0) return true

  if (c.source === 'anilibria' && pickNonEmptyString(c.alias)) return true
  if (pickNonEmptyString(c.titleRu, c.title)) return true
  return false
})

const navigating = ref(false)

const directHref = computed(() => {
  const slug = pickNonEmptyString((props.content as CardInput).slug)
  if (slug) return `/anime/${encodeURIComponent(slug)}`
  return `/title/${encodeURIComponent(props.content.externalId!)}`
})

function buildNavCard(): NormalizedAnimeCard {
  const c = props.content as CardInput
  const rawId = String(c.shikimoriId ?? c.id ?? '').trim()
  const source: NormalizedAnimeCard['source'] =
    c.source === 'anilibria' || c.source === 'yanitv' || c.source === 'shikimori'
      ? c.source
      : 'shikimori'

  return {
    id: rawId || c.alias || '',
    slug: pickNonEmptyString(c.slug) ?? undefined,
    source,
    title: pickNonEmptyString(c.title, c.titleRu) ?? 'Без названия',
    titleRu: pickNonEmptyString(c.titleRu) ?? undefined,
    posterUrl: pickNonEmptyString(c.posterUrl) ?? '',
    status: c.status ?? 'released',
    year: c.year,
    kind: c.kind,
    score: c.score,
    externalId: pickNonEmptyString(c.externalId) ?? undefined,
    alias: pickNonEmptyString(c.alias) ?? undefined,
  }
}

async function onFallbackNavigate(): Promise<void> {
  if (navigating.value) return
  navigating.value = true
  try {
    await navigateToCard(buildNavCard())
  } finally {
    navigating.value = false
  }
}

// ── Video preview ─────────────────────────────────────────────────────────────

/**
 * Unique card ID for the global preview singleton.
 * Falls back gracefully through all available identifiers.
 */
const cardId = computed(
  () =>
    pickNonEmptyString(
      props.content.externalId,
      props.content.shikimoriId,
      props.content.id,
      props.content.title,
    ) ?? 'unknown-card',
)

const { scheduleActivate, deactivate, isActive: makeIsActive } = useActivePreview()
const isActive = makeIsActive(cardId.value)

/** Trailer URL fetched lazily on first hover (never re-fetched for the same card). */
const trailerUrl  = ref<string | null>(null)
const trailFetched = ref(false)

const apiUrl = useApiUrl()

async function fetchTrailerOnce(): Promise<void> {
  if (trailFetched.value) return
  trailFetched.value = true

  // CatalogCard uses shikimoriId; NormalizedAnimeCard (home page) uses id as shikimori ID
  const shikimoriId = pickNonEmptyString(props.content.shikimoriId, props.content.id)
  if (!shikimoriId) return

  try {
    const data = await $fetch<{ trailerUrl: string | null }>(
      `${apiUrl}/metadata/trailer/${shikimoriId}`,
    )
    trailerUrl.value = data.trailerUrl
  } catch {
    // Non-critical — preview silently not available
  }
}

function onEnter(): void {
  void fetchTrailerOnce()
  scheduleActivate(cardId.value)
}

function onLeave(): void {
  deactivate(cardId.value)
}
</script>
