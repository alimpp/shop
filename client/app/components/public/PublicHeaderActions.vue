<script setup lang="ts">
import { cartController } from '~/features/cart/controllers/index.controller'
import { useCartDS } from '~/features/cart/data/index.store'

const token = useCookie<string | null>('token')
const cartDS = useCartDS()

const cartCount = computed(() => cartDS.getTotalQuantity)

const actions = computed(() => [
  {
    key: 'profile',
    icon: 'i-lucide-user-round',
    label: token.value ? 'پروفایل' : 'ورود',
    to: token.value ? '/profile' : '/auth/login-by-phone'
  },
  {
    key: 'cart',
    icon: 'i-lucide-shopping-cart',
    label: 'سبد خرید',
    to: '/cart',
    badge: token.value ? cartCount.value : 0
  },
  {
    key: 'search',
    icon: 'iconamoon:search',
    label: 'جستجو',
    to: '/search'
  }
])

function goTo(path: string): void {
  navigateTo(path)
}

onMounted(() => {
  if (!token.value || cartDS.getHydrated) return

  const schedule =
    typeof window.requestIdleCallback === 'function'
      ? window.requestIdleCallback
      : (cb: () => void) => window.setTimeout(cb, 1)

  schedule(() => {
    cartController.getCart({ silent: true })
  })
})
</script>

<template>
  <div class="flex items-center gap-2">
    <UButton
      v-for="action in actions"
      :key="action.key"
      color="neutral"
      variant="ghost"
      square
      :aria-label="action.label"
      class="relative shrink-0"
      @click="goTo(action.to)"
    >
      <UIcon
        :name="action.icon"
        class="size-5"
      />
      <span
        v-if="action.badge"
        class="absolute -top-0.5 -end-0.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-4 text-white"
      >
        {{ action.badge > 99 ? '۹۹+' : action.badge.toLocaleString('fa-IR') }}
      </span>
    </UButton>
  </div>
</template>
