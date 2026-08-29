<script setup lang="ts">
import PublicPageHero from '~/components/public/PublicPageHero.vue'
import PublicPageSection from '~/components/public/PublicPageSection.vue'
import { aboutContent } from '~/content/about.content'
import {
  DEFAULT_ROBOTS,
  SITE_NAME,
  toAbsoluteUrl
} from '~/utils/seo'

definePageMeta({
  layout: 'default'
})

const requestURL = useRequestURL()
const canonical = computed(() => `${requestURL.origin}/about`)
const content = aboutContent

useSeoMeta({
  title: content.seo.title,
  description: content.seo.description,
  keywords: content.seo.keywords,
  ogTitle: content.seo.title,
  ogDescription: content.seo.description,
  ogSiteName: SITE_NAME,
  ogType: 'website',
  ogUrl: canonical,
  ogLocale: 'fa_IR',
  twitterCard: 'summary_large_image',
  twitterTitle: content.seo.title,
  twitterDescription: content.seo.description,
  robots: DEFAULT_ROBOTS
})

useHead({
  link: [
    {
      key: 'canonical',
      rel: 'canonical',
      href: canonical
    }
  ]
})

useSchemaOrg(() => [
  defineWebPage({
    '@type': 'AboutPage',
    name: content.seo.title,
    description: content.seo.description,
    url: canonical.value
  }),
  defineOrganization({
    name: SITE_NAME,
    url: requestURL.origin,
    logo: toAbsoluteUrl('/image/logo/logo.png', requestURL.origin),
    description: content.seo.description
  })
])
</script>

<template>
  <div
    class="pb-16"
    dir="rtl"
  >
    <PublicPageHero
      :brand="content.brand"
      :headline="content.hero.headline"
      :support="content.hero.support"
      :primary-cta="content.hero.primaryCta"
      :secondary-cta="content.hero.secondaryCta"
      visual-label="همراه مطمئن خرید دیجیتال"
    />

    <div class="space-y-16 pt-14 sm:space-y-20 sm:pt-20">
      <PublicPageSection
        :title="content.story.title"
        :support="content.story.lead"
      >
        <div class="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <div class="relative min-h-[220px] overflow-hidden rounded-[1.75rem] border border-primary/15 bg-[#101010] sm:min-h-[280px]">
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,193,106,0.22),transparent_45%),linear-gradient(160deg,#141414,transparent)]" />
            <div class="absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:18px_18px]" />
            <div class="relative flex h-full min-h-[220px] flex-col justify-end gap-3 p-6 sm:min-h-[280px] sm:p-8">
              <p class="text-sm font-bold text-primary">
                از انتخاب تا تحویل
              </p>
              <p class="max-w-xs text-lg font-black leading-8 text-highlighted">
                شفافیت در مشخصات، قیمت و پشتیبانی
              </p>
            </div>
          </div>

          <div class="space-y-5 text-sm leading-8 text-toned sm:text-base sm:leading-9">
            <p
              v-for="(paragraph, index) in content.story.paragraphs"
              :key="index"
            >
              {{ paragraph }}
            </p>
          </div>
        </div>
      </PublicPageSection>

      <PublicPageSection
        :title="content.values.title"
        :support="content.values.support"
      >
        <ol class="divide-y divide-default/80 border-y border-default/80">
          <li
            v-for="(item, index) in content.values.items"
            :key="item.title"
            class="grid gap-3 py-6 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:gap-6 sm:py-8"
          >
            <span
              class="font-black text-primary"
              dir="ltr"
            >
              {{ String(index + 1).padStart(2, '0') }}
            </span>
            <div class="space-y-2">
              <h3 class="text-lg font-black text-highlighted">
                {{ item.title }}
              </h3>
              <p class="max-w-2xl text-sm leading-8 text-toned sm:text-base">
                {{ item.text }}
              </p>
            </div>
          </li>
        </ol>
      </PublicPageSection>

      <PublicPageSection :title="content.promise.title">
        <p class="max-w-3xl text-base leading-9 text-toned sm:text-lg sm:leading-10">
          {{ content.promise.text }}
        </p>
      </PublicPageSection>

      <section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-to-bl from-primary/15 via-[#121212] to-[#0d0d0d] px-6 py-10 sm:px-10 sm:py-12">
          <div class="pointer-events-none absolute -left-10 top-0 size-40 rounded-full bg-primary/20 blur-3xl" />
          <div class="relative max-w-2xl space-y-4">
            <h2 class="text-2xl font-black text-highlighted sm:text-3xl">
              {{ content.closing.title }}
            </h2>
            <p class="text-sm leading-8 text-toned sm:text-base">
              {{ content.closing.text }}
            </p>
            <div class="flex flex-wrap gap-3 pt-2">
              <UButton
                :to="content.closing.primaryCta.to"
                color="primary"
                size="lg"
                trailing-icon="i-lucide-arrow-left"
              >
                {{ content.closing.primaryCta.label }}
              </UButton>
              <UButton
                :to="content.closing.secondaryCta.to"
                color="neutral"
                variant="outline"
                size="lg"
              >
                {{ content.closing.secondaryCta.label }}
              </UButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
