<script setup lang="ts">
import PublicBlogProductRail from '~/components/public/PublicBlogProductRail.vue'
import PublicBlogRelated from '~/components/public/PublicBlogRelated.vue'
import { blogsPublicController } from '~/features/blogs/controllers/public.controller'
import type { TBlogPublicDetail, TBlogPublicCard } from '~/features/blogs/types/public.type'
import {
  DEFAULT_ROBOTS,
  NOINDEX_ROBOTS,
  SITE_NAME,
  formatBlogDate,
  resolveBlogCanonical,
  resolveBlogDescription,
  resolveBlogOgImage,
  resolveBlogSocialTitle,
  resolveBlogTitle,
  toAbsoluteUrl
} from '~/utils/seo'

definePageMeta({
  layout: 'default'
})

const route = useRoute()
const requestURL = useRequestURL()
const toast = useToast()
const slug = String(route.params.slug ?? '')

type BlogPagePayload = {
  ok: boolean
  message?: string
  blog: TBlogPublicDetail | null
  relatedBlogs: TBlogPublicCard[]
}

const { data, pending } = await useAsyncData<BlogPagePayload>(
  `blog-detail-${slug}`,
  async () => {
    const response = await blogsPublicController.getBlogBySlug(slug)

    if (!response.success || !response.data) {
      return {
        ok: false,
        message: response.message,
        blog: null,
        relatedBlogs: []
      }
    }

    return {
      ok: true,
      blog: response.data.blog,
      relatedBlogs: response.data.relatedBlogs
    }
  }
)

const blog = computed(() => data.value?.blog ?? null)
const relatedBlogs = computed(() => data.value?.relatedBlogs ?? [])
const notFound = computed(() => !pending.value && !blog.value)

const seoTitle = computed(() => resolveBlogTitle(blog.value))
const seoDescription = computed(() => resolveBlogDescription(blog.value))
const seoImage = computed(() => resolveBlogOgImage(blog.value, requestURL.origin))
const canonicalUrl = computed(() =>
  resolveBlogCanonical(blog.value, requestURL.origin, requestURL.href)
)

useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  ogTitle: () => resolveBlogSocialTitle(blog.value),
  ogDescription: seoDescription,
  ogImage: seoImage,
  ogSiteName: SITE_NAME,
  ogType: 'article',
  ogUrl: canonicalUrl,
  twitterCard: 'summary_large_image',
  twitterTitle: () => resolveBlogSocialTitle(blog.value),
  twitterDescription: seoDescription,
  twitterImage: seoImage,
  robots: () => (blog.value ? DEFAULT_ROBOTS : NOINDEX_ROBOTS),
  articlePublishedTime: () => blog.value?.publishedAt,
  articleModifiedTime: () => blog.value?.publishedAt
})

useHead({
  link: [{ key: 'canonical', rel: 'canonical', href: canonicalUrl }],
  meta: blog.value?.keywords
    ? [{ name: 'keywords', content: blog.value.keywords }]
    : []
})

useSchemaOrg(() => {
  if (!blog.value) return []

  const images = [seoImage.value].filter(Boolean)

  return [
    defineArticle({
      headline: blog.value.title,
      description: seoDescription.value,
      image: images,
      datePublished: blog.value.publishedAt,
      dateModified: blog.value.publishedAt,
      author: {
        '@type': 'Organization',
        name: SITE_NAME
      },
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME
      },
      mainEntityOfPage: canonicalUrl.value
    }),
    defineBreadcrumb({
      itemListElement: [
        { name: 'خانه', item: requestURL.origin },
        { name: 'مجله', item: `${requestURL.origin}/blog` },
        { name: blog.value.title, item: canonicalUrl.value }
      ]
    })
  ]
})

onMounted(() => {
  if (!data.value?.ok && data.value?.message) {
    toast.add({
      title: data.value.message || 'دریافت مقاله ناموفق بود',
      color: 'error'
    })
  }
})
</script>

<template>
  <div class="min-w-0 overflow-x-hidden">
    <div
      v-if="pending"
      class="flex justify-center py-20"
    >
      <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-primary" />
    </div>

    <div
      v-else-if="notFound"
      class="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6"
    >
      <h1 class="text-xl font-black text-highlighted sm:text-2xl">
        مقاله یافت نشد
      </h1>
      <p class="mt-3 text-sm text-toned">
        ممکن است این مقاله حذف شده یا آدرس آن تغییر کرده باشد.
      </p>
      <UButton
        to="/blog"
        class="mt-6"
        color="primary"
      >
        بازگشت به مجله
      </UButton>
    </div>

    <article
      v-else-if="blog"
      class="pb-12"
    >
      <header class="relative overflow-hidden border-b border-default/70">
        <div class="absolute inset-0">
          <NuxtImg
            v-if="blog.coverImage"
            :src="blog.coverImage"
            :alt="blog.title"
            class="h-full w-full object-cover opacity-35"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-[#0a0a0a]/70" />
        </div>

        <div class="relative mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
          <nav class="mb-5 flex flex-wrap items-center gap-2 text-[11px] text-toned sm:text-xs">
            <NuxtLink to="/" class="hover:text-primary">خانه</NuxtLink>
            <UIcon name="i-lucide-chevron-left" class="size-3" />
            <NuxtLink to="/blog" class="hover:text-primary">مجله</NuxtLink>
            <UIcon name="i-lucide-chevron-left" class="size-3" />
            <span class="line-clamp-1 text-muted">{{ blog.title }}</span>
          </nav>

          <h1 class="text-2xl font-black leading-10 text-highlighted sm:text-3xl lg:text-4xl">
            {{ blog.title }}
          </h1>

          <p class="mt-4 text-sm leading-7 text-toned sm:text-base">
            {{ blog.summary }}
          </p>

          <div class="mt-5 flex flex-wrap items-center gap-3 text-xs text-muted sm:text-sm">
            <span v-if="blog.publishedAt">{{ formatBlogDate(blog.publishedAt) }}</span>
            <span>{{ blog.readingMinutes }} دقیقه مطالعه</span>
            <span>{{ blog.viewCount.toLocaleString('fa-IR') }} بازدید</span>
          </div>
        </div>
      </header>

      <div class="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_220px] lg:py-10">
        <div class="min-w-0 space-y-8">
          <div class="space-y-8">
            <section
              v-for="(section, index) in blog.sections"
              :key="section.id"
              :id="`section-${index}`"
              class="scroll-mt-24 space-y-4"
            >
              <h2 class="text-lg font-black text-highlighted sm:text-xl">
                {{ section.title }}
              </h2>

              <NuxtImg
                v-if="section.imageUrl"
                :src="toAbsoluteUrl(section.imageUrl, requestURL.origin)"
                :alt="section.title"
                class="max-h-80 w-full rounded-2xl object-cover"
                loading="lazy"
              />

              <div class="space-y-4 text-sm leading-8 text-toned sm:text-base sm:leading-8">
                <p
                  v-for="(paragraph, paragraphIndex) in section.description.split('\n').filter(Boolean)"
                  :key="`${section.id}-${paragraphIndex}`"
                >
                  {{ paragraph }}
                </p>
              </div>
            </section>
          </div>

          <PublicBlogProductRail :products="blog.products" />
          <PublicBlogRelated :blogs="relatedBlogs" />
        </div>

        <aside class="hidden lg:block">
          <div class="sticky top-28 space-y-4 rounded-2xl border border-default/80 bg-[#101010] p-4">
            <h3 class="text-sm font-black text-highlighted">
              فهرست مطالب
            </h3>
            <nav class="space-y-2">
              <a
                v-for="(section, index) in blog.sections"
                :key="`toc-${section.id}`"
                :href="`#section-${index}`"
                class="block text-xs leading-6 text-toned transition-colors hover:text-primary"
              >
                {{ section.title }}
              </a>
            </nav>
          </div>
        </aside>
      </div>
    </article>
  </div>
</template>
