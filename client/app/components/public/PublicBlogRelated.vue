<script setup lang="ts">
import PublicBlogCard from '~/components/public/PublicBlogCard.vue'
import type { TBlogPublicCard } from '~/features/blogs/types/public.type'

defineProps<{
  blogs: TBlogPublicCard[]
  title?: string
}>()
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <h2 class="text-base font-black text-highlighted sm:text-lg">
        {{ title || 'مقالات پیشنهادی' }}
      </h2>
      <NuxtLink
        to="/blog"
        class="text-xs font-semibold text-primary sm:text-sm"
      >
        همه مقالات
      </NuxtLink>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <PublicBlogCard
        v-for="blog in blogs"
        :key="blog.id"
        :blog="blog"
      />
    </div>
  </section>
</template>
