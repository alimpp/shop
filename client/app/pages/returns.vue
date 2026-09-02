<script setup lang="ts">
import { SITE_NAME, resolveSiteOgImage } from '~/utils/seo'

definePageMeta({
  layout: 'default',
  title: 'شرایط مرجوعی'
})

const requestURL = useRequestURL()

useSeoMeta({
  title: `شرایط مرجوعی | ${SITE_NAME}`,
  description: `قوانین مرجوعی و عودت وجه در ${SITE_NAME}`,
  ogTitle: `شرایط مرجوعی | ${SITE_NAME}`,
  ogDescription: `قوانین مرجوعی و عودت وجه در ${SITE_NAME}`,
  ogImage: () => resolveSiteOgImage(requestURL.origin, 'legal'),
  ogImageType: 'image/png',
  ogSiteName: SITE_NAME,
  ogType: 'website',
  ogUrl: () => requestURL.href,
  twitterCard: 'summary_large_image',
  twitterImage: () => resolveSiteOgImage(requestURL.origin, 'legal')
})

useHead({
  link: [{ key: 'canonical', rel: 'canonical', href: () => `${requestURL.origin}/returns` }]
})
</script>

<template>
  <div
    class="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8"
    dir="rtl"
  >
    <h1 class="text-2xl font-black text-highlighted sm:text-3xl">
      شرایط مرجوعی و عودت وجه
    </h1>

    <div class="mt-8 space-y-6 text-sm leading-8 text-toned">
      <p class="rounded-2xl border border-primary/20 bg-primary/5 p-5 text-highlighted">
        اگر به هر دلیلی محصول برای شما ارسال نشد یا مرجوع شد، از سمت پشتیبانی با شما تماس گرفته می‌شود و مبلغ عودت داده می‌شود.
      </p>

      <section class="space-y-2">
        <h2 class="text-base font-bold text-highlighted">
          پیگیری توسط پشتیبانی
        </h2>
        <p>
          نیازی نیست خودتان فرایند لغو یا مرجوعی را از داخل حساب انجام دهید.
          در صورت بروز هر مشکل در ارسال یا تحویل، تیم پشتیبانی موضوع را بررسی می‌کند،
          با شما تماس می‌گیرد و در صورت تایید، مبلغ را برمی‌گرداند.
        </p>
      </section>

      <section class="space-y-2">
        <h2 class="text-base font-bold text-highlighted">
          زمان عودت
        </h2>
        <p>
          پس از تایید مرجوعی یا عدم ارسال، مبلغ پرداخت‌شده به همان روش پرداخت به شما بازگردانده می‌شود.
          جزئیات تراکنش را می‌توانید در بخش پرداخت‌های پروفایل ببینید.
        </p>
      </section>

      <UButton
        to="/contact"
        color="primary"
        variant="soft"
        icon="i-lucide-headset"
      >
        تماس با پشتیبانی
      </UButton>
    </div>
  </div>
</template>
