<script setup lang="ts">
const actions = [
  {
    label: 'سفارش‌های در انتظار',
    description: 'بررسی و تایید سفارش‌های جدید',
    icon: 'i-lucide-shopping-bag',
    to: '/admin/orders',
    color: 'warning' as const
  },
  {
    label: 'چت پشتیبانی',
    description: 'پاسخ به پیام‌های خوانده‌نشده',
    icon: 'i-lucide-message-circle',
    to: '/admin/chat',
    color: 'primary' as const
  },
  {
    label: 'افزودن محصول',
    description: 'ثبت محصول جدید در فروشگاه',
    icon: 'i-lucide-package-plus',
    to: '/admin/products',
    color: 'success' as const
  },
  {
    label: 'مدیریت بنرها',
    description: 'بروزرسانی صفحه اصلی',
    icon: 'i-lucide-images',
    to: '/admin/banners',
    color: 'info' as const
  }
]
</script>

<template>
  <section class="rounded-2xl border border-default bg-elevated/40 p-4 sm:p-5">
    <div class="mb-5">
      <h3 class="text-sm font-black text-highlighted sm:text-base">
        دسترسی سریع
      </h3>
      <p class="mt-1 text-xs text-toned sm:text-sm">
        میانبرهای پرکاربرد مدیریت فروشگاه
      </p>
    </div>

    <div class="grid gap-3 sm:grid-cols-2">
      <UButton
        v-for="action in actions"
        :key="action.to"
        :to="action.to"
        color="neutral"
        variant="outline"
        class="h-auto justify-start rounded-xl px-4 py-3 text-right"
      >
        <div class="flex w-full items-start gap-3">
          <div
            class="flex size-10 shrink-0 items-center justify-center rounded-xl"
            :class="{
              'bg-warning/10 text-warning': action.color === 'warning',
              'bg-primary/10 text-primary': action.color === 'primary',
              'bg-success/10 text-success': action.color === 'success',
              'bg-info/10 text-info': action.color === 'info'
            }"
          >
            <UIcon :name="action.icon" class="size-5" />
          </div>

          <div class="min-w-0 text-right">
            <p class="text-sm font-semibold text-highlighted">
              {{ action.label }}
            </p>
            <p class="mt-0.5 text-xs text-toned">
              {{ action.description }}
            </p>
          </div>
        </div>
      </UButton>
    </div>
  </section>
</template>
