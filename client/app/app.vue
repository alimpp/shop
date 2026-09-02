<script setup lang="ts">
const colorMode = useColorMode()

const route = useRoute()
const requestURL = useRequestURL()

const isNoindexPage = computed(() =>
  ['/admin', '/auth', '/profile', '/cart'].some((prefix) =>
    route.path.startsWith(prefix)
  )
)

const defaultOgImage = computed(
  () => `${requestURL.origin}/image/og/default.png`
)

useSeoMeta({
  robots: () =>
    isNoindexPage.value
      ? 'noindex, nofollow'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  ogImage: () => defaultOgImage.value,
  ogImageAlt: 'فروشگاه دیجیتال',
  ogImageType: 'image/png',
  twitterCard: 'summary_large_image',
  twitterImage: () => defaultOgImage.value
})

const color = computed(() =>
  colorMode.value === 'dark'
    ? '#121212'
    : 'white'
)

useHead({
  htmlAttrs: {
    lang: 'fa',
    dir: 'rtl',
    prefix: 'og: https://ogp.me/ns#'
  },

  titleTemplate: (titleChunk?: string) =>
    titleChunk
      ? `${titleChunk} | فروشگاه دیجیتال`
      : 'فروشگاه دیجیتال - خرید آنلاین لپ‌تاپ، موبایل و لوازم دیجیتال',

  meta: [
    { charset: 'utf-8' },

    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1'
    },

    {
      key: 'theme-color',
      name: 'theme-color',
      content: color
    },

    {
      name: 'description',
      content:
        'خرید آنلاین لپ‌تاپ، موبایل، مانیتور و لوازم دیجیتال با ضمانت اصالت، بهترین قیمت و ارسال سریع به سراسر ایران.'
    },

    { property: 'og:site_name', content: 'فروشگاه دیجیتال' },
    { property: 'og:locale', content: 'fa_IR' },
    { property: 'og:title', content: 'فروشگاه دیجیتال' },
    {
      property: 'og:description',
      content:
        'خرید آنلاین لپ‌تاپ، موبایل، مانیتور و لوازم دیجیتال با ضمانت اصالت، بهترین قیمت و ارسال سریع به سراسر ایران.'
    },

    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'فروشگاه دیجیتال' },
    {
      name: 'twitter:description',
      content:
        'خرید آنلاین لپ‌تاپ، موبایل، مانیتور و لوازم دیجیتال با ضمانت اصالت، بهترین قیمت و ارسال سریع به سراسر ایران.'
    }
  ],

  link: [
    {
      rel: 'icon',
      href: '/favicon.ico'
    },

    {
      key: 'canonical',
      rel: 'canonical',
      href: () => `${requestURL.origin}${route.path}`
    }
  ]
})
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator />
    <AppGlobalLoader />

    <NuxtLayout>
      <NuxtPage :key="route.fullPath" />
    </NuxtLayout>
  </UApp>
</template>