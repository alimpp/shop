<script setup lang="ts">
import { SITE_NAME, resolveSiteOgImage } from '~/utils/seo'

definePageMeta({
  layout: 'default',
  title: 'حریم خصوصی'
})

const requestURL = useRequestURL()

useSeoMeta({
  title: `حریم خصوصی | ${SITE_NAME}`,
  description: `نحوه جمع‌آوری و استفاده از اطلاعات کاربران در ${SITE_NAME}`,
  ogTitle: `حریم خصوصی | ${SITE_NAME}`,
  ogDescription: `نحوه جمع‌آوری و استفاده از اطلاعات کاربران در ${SITE_NAME}`,
  ogImage: () => resolveSiteOgImage(requestURL.origin, 'legal'),
  ogImageType: 'image/png',
  ogSiteName: SITE_NAME,
  ogType: 'website',
  ogUrl: () => requestURL.href,
  twitterCard: 'summary_large_image',
  twitterImage: () => resolveSiteOgImage(requestURL.origin, 'legal')
})

useHead({
  link: [{ key: 'canonical', rel: 'canonical', href: () => `${requestURL.origin}/privacy` }]
})
</script>

<template>
  <div
    class="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8"
    dir="rtl"
  >
    <h1 class="text-2xl font-black text-highlighted sm:text-3xl">
      حریم خصوصی
    </h1>

    <div class="mt-8 space-y-6 text-sm leading-8 text-toned">
      <section class="space-y-2">
        <h2 class="text-base font-bold text-highlighted">
          اطلاعاتی که جمع می‌کنیم
        </h2>
        <p>
          برای ارائه خدمات خرید، اطلاعات تماس، آدرس ارسال، سابقه سفارش و در صورت نیاز
          رفتارهای مرتبط با محصول (مثل بازدید و علاقه‌مندی) ذخیره می‌شود.
        </p>
      </section>

      <section class="space-y-2">
        <h2 class="text-base font-bold text-highlighted">
          نحوه استفاده
        </h2>
        <p>
          از این اطلاعات برای پردازش سفارش، پشتیبانی، بهبود پیشنهاد محصولات و اطلاع‌رسانی وضعیت سفارش استفاده می‌کنیم.
          اطلاعات شما به اشخاص ثالث فروخته نمی‌شود.
        </p>
      </section>

      <section class="space-y-2">
        <h2 class="text-base font-bold text-highlighted">
          امنیت
        </h2>
        <p>
          دسترسی به داده‌ها محدود به نقش‌های لازم است و تلاش می‌کنیم از روش‌های متعارف برای محافظت از اطلاعات استفاده کنیم.
          در صورت نیاز می‌توانید از طریق صفحه تماس با ما درخواست اصلاح یا حذف اطلاعات غیرضروری بدهید.
        </p>
      </section>

      <UButton
        to="/contact"
        color="neutral"
        variant="soft"
      >
        تماس با ما
      </UButton>
    </div>
  </div>
</template>
