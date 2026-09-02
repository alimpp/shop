<script setup lang="ts">
import PublicBlogCard from '~/components/public/PublicBlogCard.vue'
import PublicBlogHero from '~/components/public/PublicBlogHero.vue'
import { blogsPublicController } from '~/features/blogs/controllers/public.controller'
import type { TBlogPublicCard } from '~/features/blogs/types/public.type'
import {
  DEFAULT_ROBOTS,
  SITE_NAME,
  resolveSiteOgImage
} from '~/utils/seo'

definePageMeta({
  layout: 'default'
})

const requestURL = useRequestURL()
const route = useRoute()
const toast = useToast()

const searchInput = ref(String(route.query.q ?? ''))
const debouncedSearch = ref(searchInput.value.trim())
const page = ref(Number(route.query.page ?? 1) || 1)
let searchTimer: ReturnType<typeof setTimeout> | null = null

const { data, pending } = await useAsyncData(
  () => `blog-list-${debouncedSearch.value}-${page.value}`,
  async () => {
    const response = await blogsPublicController.getPublicBlogs({
      search: debouncedSearch.value || undefined,
      page: page.value,
      limit: 12
    })

    if (!response.success || !response.data) {
      return {
        ok: false,
        message: response.message,
        items: [] as TBlogPublicCard[],
        meta: { total: 0, page: 1, limit: 12, totalPages: 0 }
      }
    }

    return {
      ok: true,
      items: response.data.items,
      meta: response.data.meta
    }
  },
  { watch: [debouncedSearch, page] }
)

const blogs = computed(() => data.value?.items ?? [])
const meta = computed(() => data.value?.meta ?? { total: 0, page: 1, limit: 12, totalPages: 0 })
const featuredBlog = computed(() => blogs.value.find(blog => blog.isFeatured) ?? blogs.value[0] ?? null)
const gridBlogs = computed(() => {
  if (!featuredBlog.value || debouncedSearch.value || page.value > 1) {
    return blogs.value
  }
  return blogs.value.filter(blog => blog.id !== featuredBlog.value?.id)
})

const seoTitle = computed(() => {
  if (debouncedSearch.value) {
    return `جستجوی «${debouncedSearch.value}» در مجله ${SITE_NAME}`
  }
  if (page.value > 1) {
    return `مجله فروشگاه | صفحه ${page.value}`
  }
  return 'مجله فروشگاه | راهنمای خرید لپ‌تاپ و مانیتور'
})

const seoDescription = computed(() =>
  debouncedSearch.value
    ? `نتایج جستجوی «${debouncedSearch.value}» در مقالات تخصصی لپ‌تاپ، مانیتور و لوازم دیجیتال ${SITE_NAME}.`
    : 'مقالات تخصصی خرید لپ‌تاپ و مانیتور، راهنمای انتخاب، مقایسه مشخصات و نکات مهم قبل از خرید آنلاین در فروشگاه دیجیتال.'
)

useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  ogTitle: () => `${seoTitle.value} | ${SITE_NAME}`,
  ogDescription: seoDescription,
  ogImage: () => resolveSiteOgImage(requestURL.origin, 'blog'),
  ogImageAlt: 'مجله فروشگاه دیجیتال',
  ogImageType: 'image/png',
  ogSiteName: SITE_NAME,
  ogType: 'website',
  ogUrl: () => requestURL.href,
  twitterCard: 'summary_large_image',
  twitterTitle: () => `${seoTitle.value} | ${SITE_NAME}`,
  twitterDescription: seoDescription,
  twitterImage: () => resolveSiteOgImage(requestURL.origin, 'blog'),
  robots: DEFAULT_ROBOTS
})

useHead({
  link: [{ key: 'canonical', rel: 'canonical', href: () => requestURL.href }]
})

useSchemaOrg(() => [
  defineWebPage({
    name: seoTitle.value,
    description: seoDescription.value
  }),
  defineItemList({
    itemListElement: blogs.value.map((blog, index) =>
      defineListItem({
        position: index + 1,
        item: {
          '@type': 'BlogPosting',
          name: blog.title,
          url: `${requestURL.origin}/blog/${blog.slug}`
        }
      })
    )
  })
])

function onSearchInput(): void {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    debouncedSearch.value = searchInput.value.trim()
    page.value = 1
  }, 300)
}

watch([debouncedSearch, page], async () => {
  await navigateTo({
    path: '/blog',
    query: {
      ...(debouncedSearch.value ? { q: debouncedSearch.value } : {}),
      ...(page.value > 1 ? { page: String(page.value) } : {})
    }
  })
})

onMounted(() => {
  if (!data.value?.ok && data.value?.message) {
    toast.add({
      title: data.value.message || 'دریافت مقالات ناموفق بود',
      color: 'error'
    })
  }
})

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
})
</script>

<template>
  <div class="min-w-0 overflow-x-hidden">
    <section class="border-b border-default/70 bg-gradient-to-b from-primary/10 via-transparent to-transparent">
      <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div class="max-w-3xl space-y-3">
          <p class="text-xs font-bold text-primary sm:text-sm">
            مجله تخصصی فروشگاه
          </p>
          <h1 class="text-2xl font-black leading-9 text-highlighted sm:text-3xl lg:text-4xl">
            راهنمای خرید لپ‌تاپ و مانیتور
          </h1>
          <p class="text-sm leading-7 text-toned sm:text-base">
            مقالات کاربردی برای انتخاب هوشمندانه، مقایسه مشخصات فنی و خرید مطمئن آنلاین.
          </p>
        </div>

        <div class="mt-6 max-w-xl">
          <UInput
            v-model="searchInput"
            icon="i-lucide-search"
            placeholder="جستجو در مقالات..."
            size="lg"
            class="w-full"
            @update:model-value="onSearchInput"
          />
        </div>
      </div>
    </section>

    <div class="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div
        v-if="pending && !blogs.length"
        class="flex justify-center py-16"
      >
        <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-primary" />
      </div>

      <template v-else>
        <PublicBlogHero
          v-if="featuredBlog && !debouncedSearch && page === 1"
          :blog="featuredBlog"
        />

        <section class="space-y-4">
          <div class="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 class="text-base font-black text-highlighted sm:text-lg">
                {{ debouncedSearch ? 'نتایج جستجو' : 'آخرین مقالات' }}
              </h2>
              <p class="mt-1 text-xs text-toned sm:text-sm">
                {{ meta.total.toLocaleString('fa-IR') }} مقاله
              </p>
            </div>
          </div>

          <div
            v-if="!gridBlogs.length"
            class="rounded-2xl border border-dashed border-default px-4 py-14 text-center text-sm text-toned"
          >
            مقاله‌ای یافت نشد.
          </div>

          <div
            v-else
            class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          >
            <PublicBlogCard
              v-for="blog in gridBlogs"
              :key="blog.id"
              :blog="blog"
            />
          </div>
        </section>

        <div
          v-if="meta.totalPages > 1"
          class="flex justify-center pt-2"
        >
          <UPagination
            v-model:page="page"
            :total="meta.total"
            :items-per-page="meta.limit"
          />
        </div>
      </template>
    </div>
  </div>
</template>
