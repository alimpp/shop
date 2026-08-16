<script setup lang="ts">
definePageMeta({
  title: "سبد خرید",
  robots: "noindex, nofollow",
  description: "مشاهده سبد خرید شما در فروشگاه اینترنتی پرایم"
});
</script>

<template>
  <section class="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8" dir="rtl">
    <UCard :ui="{ body: 'p-6 sm:p-8' }">
      <div class="space-y-4">
        <p class="text-sm font-bold text-primary">
          سبد خرید
        </p>
        <h1 class="text-2xl font-black text-highlighted">
          صفحه سبد خرید آماده اتصال به داده‌های واقعی است
        </h1>
        <p class="text-sm leading-7 text-toned">
          مسیر ناوبری سبد خرید از هدر عمومی فعال شده و این صفحه به عنوان ساختار پایه
          برای ادامه توسعه فروشگاه در نظر گرفته شده است.
        </p>
      </div>
    </UCard>
  </section>
</template>
