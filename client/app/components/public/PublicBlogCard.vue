<script setup lang="ts">
import type { TBlogPublicCard } from '~/features/blogs/types/public.type'
import { formatBlogDate } from '~/utils/seo'

defineProps<{
  blog: TBlogPublicCard
  featured?: boolean
}>()
</script>

<template>
  <article
    class="group flex h-full flex-col overflow-hidden rounded-2xl border border-default/80 bg-[#121212] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
  >
    <NuxtLink
      :to="`/blog/${blog.slug}`"
      class="relative block aspect-[16/10] overflow-hidden bg-default/40"
    >
      <NuxtImg
        v-if="blog.coverImage"
        :src="blog.coverImage"
        :alt="blog.title"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
        decoding="async"
      />

      <div
        v-else
        class="flex h-full items-center justify-center text-muted"
      >
        <UIcon name="i-lucide-image" class="size-10" />
      </div>

      <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

      <div class="absolute right-3 top-3 flex flex-wrap gap-2">
        <span
          v-if="featured || blog.isFeatured"
          class="rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-white sm:text-xs"
        >
          ویژه
        </span>
        <span class="rounded-full bg-black/55 px-2.5 py-1 text-[10px] text-white backdrop-blur-sm sm:text-xs">
          {{ blog.readingMinutes }} دقیقه مطالعه
        </span>
      </div>
    </NuxtLink>

    <div class="flex flex-1 flex-col gap-2 p-3.5 sm:p-4">
      <div class="flex flex-wrap items-center gap-2 text-[11px] text-toned sm:text-xs">
        <span v-if="blog.publishedAt">{{ formatBlogDate(blog.publishedAt) }}</span>
        <span v-if="blog.publishedAt">·</span>
        <span>{{ blog.viewCount.toLocaleString('fa-IR') }} بازدید</span>
      </div>

      <NuxtLink :to="`/blog/${blog.slug}`" class="block">
        <h3
          class="line-clamp-2 text-sm font-black leading-6 text-highlighted transition-colors group-hover:text-primary sm:text-base"
        >
          {{ blog.title }}
        </h3>
      </NuxtLink>

      <p class="line-clamp-3 flex-1 text-xs leading-6 text-toned sm:text-sm">
        {{ blog.summary }}
      </p>

      <NuxtLink
        :to="`/blog/${blog.slug}`"
        class="mt-1 inline-flex items-center gap-1 text-xs font-bold text-primary sm:text-sm"
      >
        ادامه مطلب
        <UIcon name="i-lucide-arrow-left" class="size-3.5 transition-transform group-hover:-translate-x-0.5" />
      </NuxtLink>
    </div>
  </article>
</template>
