<script setup lang="ts">
import ProfileShell from '~/components/profile/ProfileShell.vue'
import { ordersController } from '~/features/orders/controllers/index.controller'
import { useOrdersDS } from '~/features/orders/data/index.store'
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  type TOrderStatus
} from '~/features/orders/types/index.type'

definePageMeta({ title: 'سفارشات', robots: 'noindex, nofollow' })

const toast = useToast()
const ordersDS = useOrdersDS()

const orders = computed(() => ordersDS.getOrders)
const loading = computed(() => ordersDS.getLoading)

function formatPrice(value: number): string {
  return `${new Intl.NumberFormat('fa-IR').format(value)} تومان`
}

async function loadOrders(): Promise<void> {
  const response = await ordersController.getMyOrders({ page: 1, limit: 50 })
  if (!response.success) {
    toast.add({
      title: response.message || 'دریافت سفارش‌ها ناموفق بود',
      color: 'error'
    })
  }
}

function statusColor(status: TOrderStatus) {
  return ORDER_STATUS_COLORS[status] ?? 'neutral'
}

onMounted(() => {
  loadOrders()
})
</script>

<template>
  <ProfileShell title="سفارشات">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-xl font-black text-highlighted">
          سفارش‌های شما
        </h2>
        <p class="mt-1 text-sm text-toned">
          وضعیت و جزئیات سفارش‌های ثبت‌شده
        </p>
      </div>
      <UButton
        color="neutral"
        variant="ghost"
        icon="i-lucide-refresh-cw"
        :loading="loading"
        @click="loadOrders"
      >
        تازه‌سازی
      </UButton>
    </div>

    <div
      v-if="loading && !orders.length"
      class="space-y-3"
    >
      <USkeleton
        v-for="index in 3"
        :key="index"
        class="h-28 w-full rounded-2xl"
      />
    </div>

    <div
      v-else-if="!orders.length"
      class="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-default px-6 py-16 text-center"
    >
      <UIcon
        name="i-lucide-package"
        class="size-10 text-toned"
      />
      <p class="text-sm text-toned">
        هنوز سفارشی ثبت نکرده‌اید.
      </p>
      <UButton
        to="/cart"
        color="primary"
      >
        رفتن به سبد خرید
      </UButton>
    </div>

    <div
      v-else
      class="space-y-3"
    >
      <NuxtLink
        v-for="order in orders"
        :key="order.id"
        :to="`/profile/orders/${order.id}`"
        class="block rounded-2xl border border-default bg-elevated/40 p-5 transition-colors hover:border-primary/40"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <p class="text-sm font-black text-highlighted">
              {{ order.orderNumber }}
            </p>
            <p class="mt-1 text-xs text-toned">
              {{ order.formattedDate }}
            </p>
            <p class="mt-2 text-xs text-toned">
              {{ order.itemCount.toLocaleString('fa-IR') }} قلم ·
              {{ order.address?.city || '—' }}
            </p>
          </div>
          <div class="space-y-2 text-left">
            <UBadge
              :color="statusColor(order.status)"
              variant="subtle"
            >
              {{ ORDER_STATUS_LABELS[order.status] }}
            </UBadge>
            <p
              class="text-sm font-black text-primary"
              dir="ltr"
            >
              {{ formatPrice(order.paidAmount) }}
            </p>
          </div>
          <UIcon
            name="i-lucide-chevron-left"
            class="size-4 shrink-0 self-center text-muted"
          />
        </div>
      </NuxtLink>
    </div>
  </ProfileShell>
</template>
