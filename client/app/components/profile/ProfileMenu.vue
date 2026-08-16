<script setup lang="ts">
import { useUserProfileDS } from '~/dataStore'
import type { TUserProfile } from '~/features/profile/user/types/index.type'

const route = useRoute()
const token = useCookie<string | null>('token')

const profileDS = useUserProfileDS()

const user = computed<TUserProfile | null>(() => profileDS.getUser)

const fullName = computed(() => {
  const name = `${user.value?.fristname ?? ''} ${user.value?.lastname ?? ''}`.trim()
  return name || user.value?.phone || ''
})

interface ProfileMenuItem {
  key: string
  icon: string
  label: string
  description: string
  to: string
}

const menuItems: ProfileMenuItem[] = [
  {
    key: 'update',
    icon: 'i-lucide-user-round',
    label: 'ویرایش اطلاعات کاربری',
    description: 'نام، ایمیل و تصویر پروفایل خود را به‌روزرسانی کنید',
    to: '/profile/update'
  },
  {
    key: 'cart',
    icon: 'i-lucide-shopping-cart',
    label: 'سبد خرید',
    description: 'محصولات انتخابی شما در سبد خرید',
    to: '/profile/cart'
  },
  {
    key: 'favorites',
    icon: 'i-lucide-heart',
    label: 'علاقه مندی ها',
    description: 'محصولاتی که دوست دارید',
    to: '/profile/favorites'
  },
  {
    key: 'notifications',
    icon: 'i-lucide-bell',
    label: 'اعلانات',
    description: 'آخرین اطلاعیه‌ها و پیام‌ها',
    to: '/profile/notifications'
  },
  {
    key: 'orders',
    icon: 'i-lucide-package',
    label: 'سفارشات',
    description: 'تاریخچه سفارش‌های ثبت‌شده',
    to: '/profile/orders'
  },
  {
    key: 'addresses',
    icon: 'i-lucide-map-pin',
    label: 'آدرس‌های ارسال شما',
    description: '',
    to: '/profile/addresses'
  },
  {
    key: 'payments',
    icon: 'i-lucide-credit-card',
    label: 'پرداخت ها',
    description: 'روش‌ها و تاریخچه پرداخت',
    to: '/profile/payments'
  },
  {
    key: 'support',
    icon: 'i-lucide-message-circle',
    label: 'چت پشتیبانی',
    description: 'گفتگو با تیم پشتیبانی',
    to: '/profile/support'
  }
]

function isActive(item: ProfileMenuItem): boolean {
  return route.path === item.to
}

function logout(): void {
  token.value = null
  localStorage.clear()
  profileDS.reset()
  navigateTo('/')
}
</script>

<template>
  <div class="mx-auto w-full max-w-4xl">
    <div class="mb-8 flex flex-col items-center gap-3 text-center">
      <UAvatar
        :src="user?.avatarUrl || undefined"
        :icon="user?.avatarUrl ? undefined : 'i-lucide-user-round'"
        :alt="fullName"
        size="2xl"
        color="primary"
      />
      <div>
        <p class="text-base font-bold text-highlighted">
          {{ fullName }}
        </p>
        <p
          class="mt-1 text-sm text-toned"
          dir="ltr"
        >
          {{ user?.phone }}
        </p>
      </div>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <NuxtLink
        v-for="item in menuItems"
        :key="item.key"
        :to="item.to"
        class="group flex flex-col gap-2 rounded-2xl border border-default bg-elevated p-5 transition-all hover:border-primary/40 hover:bg-elevated/70"
        :class="isActive(item) ? 'border-primary/50' : ''"
      >
        <div class="flex items-center justify-between">
          <span
            class="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"
          >
            <UIcon
              :name="item.icon"
              class="size-5"
            />
          </span>
          <UIcon
            name="i-lucide-corner-left-up"
            class="size-4 -scale-x-100 text-toned opacity-40 transition-all group-hover:text-primary group-hover:opacity-100"
          />
        </div>

        <div>
          <h3 class="text-sm font-bold text-highlighted">
            {{ item.label }}
          </h3>
          <p class="mt-1 text-xs leading-6 text-toned">
            {{ item.description }}
          </p>
        </div>
      </NuxtLink>

      <button
        type="button"
        class="group flex flex-col gap-2 rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-start transition-all hover:bg-red-500/10"
        @click="logout"
      >
        <div class="flex items-center justify-between">
          <span
            class="flex size-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500"
          >
            <UIcon
              name="i-lucide-log-out"
              class="size-5"
            />
          </span>
          <UIcon
            name="i-lucide-corner-left-up"
            class="size-4 -scale-x-100 text-red-500 opacity-40 transition-opacity group-hover:opacity-100"
          />
        </div>

        <div>
          <h3 class="text-sm font-bold text-red-500">
            خروج
          </h3>
          <p class="mt-1 text-xs leading-6 text-toned">
            خروج از حساب کاربری
          </p>
        </div>
      </button>
    </div>
  </div>
</template>
