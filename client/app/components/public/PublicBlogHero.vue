<script setup lang="ts">
import type { TBlogPublicCard } from '~/features/blogs/types/public.type'
import { formatBlogDate } from '~/utils/seo'

defineProps<{
  blog: TBlogPublicCard
}>()
</script>

<template>
  <section class="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-[#151515] via-[#101010] to-[#0b0b0b]">
    <div class="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
      <div class="relative min-h-[220px] overflow-hidden sm:min-h-[280px] lg:min-h-[360px]">
        <NuxtImg
          v-if="blog.coverImage"
          :src="blog.coverImage"
          :alt="blog.title"
          class="h-full w-full object-cover"
          loading="eager"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:bg-gradient-to-l lg:from-black/75 lg:via-black/25 lg:to-transparent" />
      </div>

      <div class="flex flex-col justify-center gap-4 p-5 sm:p-6 lg:p-8">
        <div class="flex flex-wrap items-center gap-2">
          <span class="rounded-full bg-primary/15 px-3 py-1 text-[11px] font-bold text-primary sm:text-xs">
            مقاله ویژه
          </span>
          <span class="text-[11px] text-toned sm:text-xs">
            {{ blog.readingMinutes }} دقیقه مطالعه
          </span>
        </div>

        <h2 class="text-xl font-black leading-8 text-highlighted sm:text-2xl lg:text-3xl">
          {{ blog.title }}
        </h2>

        <p class="line-clamp-4 text-sm leading-7 text-toned sm:text-base">
          {{ blog.summary }}
        </p>

        <div class="flex flex-wrap items-center gap-3 text-xs text-muted">
          <span v-if="blog.publishedAt">{{ formatBlogDate(blog.publishedAt) }}</span>
          <span>{{ blog.viewCount.toLocaleString('fa-IR') }} بازدید</span>
        </div>

        <div>
          <UButton
            :to="`/blog/${blog.slug}`"
            color="primary"
            size="lg"
            trailing-icon="i-lucide-arrow-left"
            class="w-full sm:w-auto"
          >
            مطالعه مقاله
          </UButton>
        </div>
      </div>
    </div>
  </section>
</template>
