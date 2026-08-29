<script setup lang="ts">
import PublicContactForm from '~/components/public/PublicContactForm.vue'
import PublicPageHero from '~/components/public/PublicPageHero.vue'
import PublicPageSection from '~/components/public/PublicPageSection.vue'
import { contactContent } from '~/content/contact.content'
import {
  DEFAULT_ROBOTS,
  SITE_NAME,
  toAbsoluteUrl
} from '~/utils/seo'

definePageMeta({
  layout: 'default'
})

const requestURL = useRequestURL()
const canonical = computed(() => `${requestURL.origin}/contact`)
const content = contactContent

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
    '@type': 'ContactPage',
    name: content.seo.title,
    description: content.seo.description,
    url: canonical.value
  }),
  defineOrganization({
    name: SITE_NAME,
    url: requestURL.origin,
    logo: toAbsoluteUrl('/image/logo/logo.png', requestURL.origin),
    email: 'support@vistashop.ir',
    telephone: '+98-21-91091234',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'تهران',
      streetAddress: 'خیابان ولیعصر، پلاک ۱۲۴۰',
      addressCountry: 'IR'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+98-21-91091234',
      contactType: 'customer support',
      availableLanguage: ['Persian', 'fa'],
      areaServed: 'IR'
    }
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
      visual-label="پشتیبانی واقعی، پاسخ شفاف"
    />

    <div class="space-y-16 pt-14 sm:space-y-20 sm:pt-20">
      <PublicPageSection
        :title="content.channels.title"
        :support="content.channels.support"
      >
        <div class="grid gap-3 sm:grid-cols-2">
          <a
            v-for="item in content.channels.items"
            :key="item.key"
            :href="item.href"
            :target="item.key === 'address' ? '_blank' : undefined"
            :rel="item.key === 'address' ? 'noopener noreferrer' : undefined"
            class="group flex items-start gap-4 rounded-2xl border border-default bg-elevated/30 px-4 py-5 transition-colors hover:border-primary/40 hover:bg-primary/5 sm:px-5"
          >
            <span class="mt-0.5 inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:-translate-y-0.5">
              <UIcon
                :name="item.icon"
                class="size-5"
              />
            </span>
            <span class="min-w-0 space-y-1">
              <span class="block text-xs font-medium text-muted">
                {{ item.label }}
              </span>
              <span class="block text-sm font-bold text-highlighted sm:text-base">
                {{ item.value }}
              </span>
              <span class="block text-xs leading-6 text-toned">
                {{ item.hint }}
              </span>
            </span>
          </a>
        </div>
      </PublicPageSection>

      <PublicPageSection :title="content.hours.title">
        <div class="max-w-xl divide-y divide-default/80 border-y border-default/80">
          <div
            v-for="row in content.hours.rows"
            :key="row.day"
            class="flex items-center justify-between gap-4 py-4 text-sm sm:text-base"
          >
            <span class="font-medium text-highlighted">
              {{ row.day }}
            </span>
            <span class="text-toned">
              {{ row.time }}
            </span>
          </div>
        </div>
      </PublicPageSection>

      <section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-12">
          <div class="space-y-4 lg:sticky lg:top-28">
            <h2 class="text-2xl font-black text-highlighted sm:text-3xl">
              مستقیم بنویسید
            </h2>
            <p class="text-sm leading-8 text-toned sm:text-base">
              اگر سوال تخصصی دربارهٔ لپ‌تاپ، مانیتور یا وضعیت سفارش دارید، فرم را پر کنید تا پشتیبانی پیگیری کند.
            </p>
            <div class="hidden overflow-hidden rounded-[1.75rem] border border-default bg-[#101010] lg:block">
              <div class="relative aspect-[5/4]">
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(0,193,106,0.2),transparent_50%),linear-gradient(180deg,#141414,transparent)]" />
                <div class="absolute inset-0 flex flex-col justify-end gap-2 p-6">
                  <p class="text-sm font-bold text-primary">
                    پشتیبانی {{ content.brand }}
                  </p>
                  <p class="text-base font-black leading-7 text-highlighted">
                    پاسخگویی در ساعات اداری، پیگیری سفارش و مشاوره خرید
                  </p>
                </div>
              </div>
            </div>
          </div>

          <PublicContactForm />
        </div>
      </section>
    </div>
  </div>
</template>
