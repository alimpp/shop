<script setup lang="ts">
import { SITE_NAME, resolveSiteOgImage } from '~/utils/seo'

definePageMeta({
  layout: 'default',
  title: 'قوانین و مقررات'
})

const requestURL = useRequestURL()

useSeoMeta({
  title: `قوانین و مقررات | ${SITE_NAME}`,
  description: `شرایط استفاده از فروشگاه اینترنتی ${SITE_NAME}`,
  ogTitle: `قوانین و مقررات | ${SITE_NAME}`,
  ogDescription: `شرایط استفاده از فروشگاه اینترنتی ${SITE_NAME}`,
  ogImage: () => resolveSiteOgImage(requestURL.origin, 'legal'),
  ogImageType: 'image/png',
  ogSiteName: SITE_NAME,
  ogType: 'website',
  ogUrl: () => requestURL.href,
  twitterCard: 'summary_large_image',
  twitterImage: () => resolveSiteOgImage(requestURL.origin, 'legal')
})

useHead({
  link: [{ key: 'canonical', rel: 'canonical', href: () => `${requestURL.origin}/terms` }]
})
</script>

<template>
  <div
    class="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8"
    dir="rtl"
  >
    <h1 class="text-2xl font-black text-highlighted sm:text-3xl">
      قوانین و مقررات
    </h1>

    <div class="mt-8 space-y-6 text-sm leading-8 text-toned">
      <section class="space-y-2">
        <h2 class="text-base font-bold text-highlighted">
          استفاده از فروشگاه
        </h2>
        <p>
          با ثبت‌نام و خرید از {{ SITE_NAME }}، شما این شرایط را می‌پذیرید.
          اطلاعات حساب کاربری باید صحیح باشد و مسئولیت حفظ اطلاعات ورود با شماست.
        </p>
      </section>

      <section class="space-y-2">
        <h2 class="text-base font-bold text-highlighted">
          سفارش و پرداخت
        </h2>
        <p>
          ثبت سفارش پس از انتخاب آدرس و تایید مبلغ انجام می‌شود.
          تا زمان راه‌اندازی درگاه بانکی، پرداخت در لحظه ثبت سفارش به‌عنوان انجام‌شده ثبت می‌گردد
          و جزئیات تراکنش در بخش پرداخت‌ها قابل مشاهده است.
        </p>
      </section>

      <section class="space-y-2">
        <h2 class="text-base font-bold text-highlighted">
          ارسال
        </h2>
        <p>
          هزینه ارسال در قیمت نهایی لحاظ شده و ارسال توسط تیم فروشگاه انجام می‌شود.
          زمان تحویل بسته به مقصد و موجودی کالا اعلام خواهد شد.
        </p>
      </section>

      <section class="space-y-2">
        <h2 class="text-base font-bold text-highlighted">
          مرجوعی
        </h2>
        <p>
          اگر به هر دلیلی محصول برای شما ارسال نشد یا مرجوع شد، از سمت پشتیبانی با شما تماس گرفته می‌شود و مبلغ عودت داده می‌شود.
          جزئیات بیشتر در صفحه
          <NuxtLink
            to="/returns"
            class="text-primary hover:underline"
          >
            شرایط مرجوعی
          </NuxtLink>
          آمده است.
        </p>
      </section>
    </div>
  </div>
</template>
