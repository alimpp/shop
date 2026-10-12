<script setup lang="ts">
import PublicPageBreadcrumb from '~/components/public/PublicPageBreadcrumb.vue'
import PublicPageHero from '~/components/public/PublicPageHero.vue'
import PublicPageSection from '~/components/public/PublicPageSection.vue'
import { faqsController } from '~/features/faqs/controllers/index.controller'
import type { TFaq } from '~/features/faqs/types/index.type'
import {
  DEFAULT_ROBOTS,
  SITE_NAME,
  buildCanonicalUrl,
  clampMetaDescription,
  resolvePageSocialTitle,
  resolveSiteLogoUrl
} from '~/utils/seo'

definePageMeta({
  layout: 'default'
})

const requestURL = useRequestURL()
const search = ref('')
const openItems = ref<string[]>([])

const { data, pending } = await useAsyncData('public-faqs', async () => {
  const response = await faqsController.getPublicFaqs({ limit: 100 })
  return {
    ok: response.success,
    items: response.data?.items ?? [],
    message: response.message
  }
})

const items = computed(() => data.value?.items ?? [])

const filteredItems = computed(() => {
  const q = search.value.trim()
  if (!q) return items.value
  return items.value.filter(item =>
    item.question.includes(q)
    || item.answer.includes(q)
    || (item.category ?? '').includes(q)
  )
})

const grouped = computed(() => {
  const map = new Map<string, TFaq[]>()
  for (const item of filteredItems.value) {
    const key = item.category?.trim() || 'عمومی'
    const list = map.get(key) ?? []
    list.push(item)
    map.set(key, list)
  }
  return Array.from(map.entries())
})

const seoTitle = 'سوالات متداول'
const seoDescription = clampMetaDescription(
  `پاسخ سوالات پرتکرار درباره خرید، ارسال، پرداخت و پشتیبانی در ${SITE_NAME}.`
)
const canonical = computed(() => buildCanonicalUrl(requestURL.origin, '/faq'))

useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  ogTitle: () => resolvePageSocialTitle(seoTitle),
  ogDescription: seoDescription,
  ogImage: () => resolveSiteLogoUrl(requestURL.origin),
  ogSiteName: SITE_NAME,
  ogType: 'website',
  ogUrl: canonical,
  twitterCard: 'summary_large_image',
  robots: DEFAULT_ROBOTS
})

useHead({
  link: [{ key: 'canonical', rel: 'canonical', href: canonical }]
})

useSchemaOrg(() => [
  defineWebPage({
    name: seoTitle,
    description: seoDescription
  }),
  {
    '@type': 'FAQPage',
    mainEntity: filteredItems.value.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  }
])
</script>

<template>
  <div class="min-w-0 overflow-x-hidden">
    <PublicPageHero
      brand="سوالات متداول"
      headline="پاسخ شفاف به سوال‌های پرتکرار خرید"
      support="از ثبت سفارش و پرداخت تا ارسال و پشتیبانی؛ همه چیز را اینجا پیدا کنید."
      :primary-cta="{ label: 'تماس با پشتیبانی', to: '/contact' }"
      :secondary-cta="{ label: 'مشاهده محصولات', to: '/products' }"
      visual-label="راهنمای خرید"
    />

    <PublicPageSection>
      <PublicPageBreadcrumb
        :items="[
          { label: 'خانه', to: '/' },
          { label: 'سوالات متداول' }
        ]"
      />

      <div class="mx-auto mt-8 max-w-3xl">
        <UInput
          v-model="search"
          icon="i-lucide-search"
          placeholder="جستجو در سوالات..."
          class="w-full"
          size="lg"
        />
      </div>

      <div
        v-if="pending"
        class="flex justify-center py-16"
      >
        <UIcon
          name="i-lucide-loader-2"
          class="size-7 animate-spin text-primary"
        />
      </div>

      <div
        v-else-if="!filteredItems.length"
        class="mx-auto mt-10 max-w-3xl rounded-2xl border border-dashed border-default px-6 py-16 text-center text-sm text-toned"
      >
        سوالی یافت نشد.
      </div>

      <div
        v-else
        class="mx-auto mt-10 max-w-3xl space-y-8"
      >
        <section
          v-for="[category, faqs] in grouped"
          :key="category"
        >
          <h2 class="mb-4 text-lg font-black text-highlighted">
            {{ category }}
          </h2>
          <UAccordion
            v-model="openItems"
            type="multiple"
            :items="faqs.map(item => ({
              label: item.question,
              value: item.id,
              content: item.answer
            }))"
            :ui="{
              item: 'border border-default rounded-2xl mb-3 overflow-hidden',
              trigger: 'px-4 py-3 text-sm font-bold text-highlighted',
              body: 'px-4 pb-4 text-sm leading-7 text-toned'
            }"
          />
        </section>
      </div>
    </PublicPageSection>
  </div>
</template>
