<template>
  <a
    :href="item.url"
    target="_blank"
    rel="noopener noreferrer"
    class="group flex flex-col gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 transition-all duration-300 hover:border-white/[0.13] hover:bg-white/[0.04] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/35 no-underline"
  >
    <!-- Header: author + date -->
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2 min-w-0">
        <img
          v-if="item.author.avatarUrl"
          :src="item.author.avatarUrl"
          :alt="item.author.nickname"
          class="h-6 w-6 rounded-full bg-white/10 object-cover shrink-0"
          loading="lazy"
          @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
        />
        <span class="truncate text-xs text-slate-500">{{ item.author.nickname }}</span>
      </div>
      <time class="shrink-0 text-[10px] text-slate-600">{{ formattedDate }}</time>
    </div>

    <!-- Title -->
    <h3 class="line-clamp-2 text-sm font-semibold leading-snug text-zinc-200 group-hover:text-white transition-colors">
      {{ item.title }}
    </h3>

    <!-- Body preview -->
    <p class="line-clamp-2 text-xs leading-relaxed text-slate-500">
      {{ stripped }}
    </p>

    <!-- Footer: linked anime + comments -->
    <div class="flex items-center justify-between gap-2 mt-auto">
      <span
        v-if="item.linkedAnime"
        class="truncate rounded-md bg-white/6 px-2 py-1 text-[10px] text-slate-400"
      >
        {{ item.linkedAnime.titleRu || item.linkedAnime.title }}
      </span>
      <div class="ml-auto flex items-center gap-1 shrink-0 text-[10px] text-slate-600">
        <UIcon name="lucide:message-square" class="size-3" />
        {{ item.commentsCount }}
      </div>
    </div>
  </a>
</template>

<script setup lang="ts">
import type { NewsItem } from '~/types/metadata'

const props = defineProps<{ item: NewsItem }>()

const formattedDate = computed(() => {
  try {
    return new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'short' }).format(
      new Date(props.item.createdAt),
    )
  } catch {
    return ''
  }
})

// Strip HTML tags for body preview
const stripped = computed(() =>
  props.item.body.replace(/<[^>]*>/g, '').trim().slice(0, 160),
)
</script>
