<script setup lang="ts">
import PublicContactForm from '~/components/public/PublicContactForm.vue'
import PublicPageBreadcrumb from '~/components/public/PublicPageBreadcrumb.vue'
import PublicPageHero from '~/components/public/PublicPageHero.vue'
import PublicPageSection from '~/components/public/PublicPageSection.vue'
import { contactContent } from '~/content/contact.content'
import {
  DEFAULT_ROBOTS,
  SITE_NAME,
  buildCanonicalUrl,
  clampMetaDescription,
  resolvePageSocialTitle,
  resolveSiteLogoUrl,
  toAbsoluteUrl
} from '~/utils/seo'

definePageMeta({
  layout: 'default'
})

const requestURL = useRequestURL()
const content = contactContent
const identity = content.identity

const canonical = computed(() =>
  buildCanonicalUrl(requestURL.origin, content.seo.path)
)
const seoTitle = computed(() => content.seo.title)
const seoSocialTitle = computed(() =>
  resolvePageSocialTitle(content.seo.socialTitle || content.seo.title)
)
const seoDescription = computed(() =>
  clampMetaDescription(content.seo.description)
)
const seoImage = computed(() =>
  toAbsoluteUrl(content.seo.ogImage, requestURL.origin) || resolveSiteLogoUrl(requestURL.origin)
)
const seoImageAlt = computed(() => content.seo.ogImageAlt)

useSeoMeta({
  title: () => seoTitle.value,
  description: () => seoDescription.value,
  robots: DEFAULT_ROBOTS,
  author: SITE_NAME,
  ogTitle: () => seoSocialTitle.value,
  ogDescription: () => seoDescription.value,
  ogImage: () => seoImage.value,
  ogImageAlt: () => seoImageAlt.value,
  ogImageType: 'image/png',
  ogUrl: () => canonical.value,
  ogSiteName: SITE_NAME,
  ogLocale: 'fa_IR',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: () => seoSocialTitle.value,
  twitterDescription: () => seoDescription.value,
  twitterImage: () => seoImage.value,
  twitterImageAlt: () => seoImageAlt.value
})

useHead(() => ({
  link: [
    {
      key: 'canonical',
      rel: 'canonical',
      href: canonical.value
    },
    {
      key: 'alternate-fa',
      rel: 'alternate',
      hreflang: 'fa-IR',
      href: canonical.value
    },
    {
      key: 'alternate-x-default',
      rel: 'alternate',
      hreflang: 'x-default',
      href: canonical.value
    }
  ],
  meta: [
    {
      key: 'keywords',
      name: 'keywords',
      content: content.seo.keywords
    },
    {
      key: 'og:image:secure_url',
      property: 'og:image:secure_url',
      content: seoImage.value
    },
    {
      key: 'geo.region',
      name: 'geo.region',
      content: 'IR-23'
    },
    {
      key: 'geo.placename',
      name: 'geo.placename',
      content: identity.address.addressLocality
    }
  ]
}))

useSchemaOrg(() => {
  const origin = requestURL.origin
  const logo = resolveSiteLogoUrl(origin)
  const pageUrl = canonical.value
  const address = defineAddress({
    streetAddress: identity.address.streetAddress,
    addressLocality: identity.address.addressLocality,
    addressRegion: identity.address.addressRegion,
    addressCountry: identity.address.addressCountry
  })

  const openingHoursSpecification = identity.openingHours.map(slot =>
    defineOpeningHours({
      dayOfWeek: [...slot.dayOfWeek],
      opens: slot.opens,
      closes: slot.closes
    })
  )

  return [
    defineWebPage({
      '@type': 'ContactPage',
      name: seoSocialTitle.value,
      description: seoDescription.value,
      url: pageUrl,
      inLanguage: 'fa-IR',
      isPartOf: {
        '@type': 'WebSite',
        name: SITE_NAME,
        url: origin
      },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: seoImage.value,
        caption: seoImageAlt.value
      },
      mainEntity: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: origin,
        email: identity.email,
        telephone: identity.telephone
      }
    }),
    defineOrganization({
      name: SITE_NAME,
      url: origin,
      logo,
      image: logo,
      email: identity.email,
      telephone: identity.telephone,
      address,
      contactPoint: [
        {
          '@type': 'ContactPoint',
          telephone: identity.telephone,
          contactType: 'customer support',
          availableLanguage: ['fa', 'Persian'],
          areaServed: 'IR',
          email: identity.email
        },
        {
          '@type': 'ContactPoint',
          telephone: identity.mobile,
          contactType: 'customer support',
          availableLanguage: ['fa', 'Persian'],
          areaServed: 'IR'
        }
      ]
    }),
    defineLocalBusiness({
      '@type': 'Store',
      name: SITE_NAME,
      url: origin,
      image: logo,
      email: identity.email,
      telephone: identity.telephone,
      address,
      openingHoursSpecification,
      priceRange: '$$',
      currenciesAccepted: 'IRR',
      paymentAccepted: 'Cash, Credit Card',
      areaServed: {
        '@type': 'Country',
        name: 'Iran'
      }
    }),
    defineBreadcrumb({
      itemListElement: [
        defineListItem({ name: 'خانه', url: origin, position: 1 }),
        defineListItem({ name: 'تماس با ما', url: pageUrl, position: 2 })
      ]
    })
  ]
})
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

      <section
        id="contact-form-section"
        class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-labelledby="contact-form-heading"
      >
        <div class="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-12">
          <div class="space-y-4 lg:sticky lg:top-28">
            <h2
              id="contact-form-heading"
              class="text-2xl font-black text-highlighted sm:text-3xl"
            >
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
