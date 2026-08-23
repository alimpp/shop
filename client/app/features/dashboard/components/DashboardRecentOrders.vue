<script setup lang="ts">
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS
} from '~/features/orders/types/index.type'
import type { TDashboardRecentOrder } from '../types/index.type'

defineProps<{
  items: TDashboardRecentOrder[]
}>()

const numberFormatter = new Intl.NumberFormat('fa-IR')

function formatPrice(value: number): string {
  return `${numberFormatter.format(value)} تومان`
}

function formatDate(value: string | Date): string {
  const date = new Date(value)
  return new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}
</script>

<template>
  <section class="rounded-2xl border border-default bg-elevated/40 p-4 sm:p-5">
    <div class="mb-5 flex items-center justify-between gap-3">
      <div>
        <h3 class="text-sm font-black text-highlighted sm:text-base">
          آخرین سفارش‌ها
        </h3>
        <p class="mt-1 text-xs text-toned sm:text-sm">
          ۸ سفارش اخیر فروشگاه
        </p>
      </div>

      <UButton
        to="/admin/orders"
        color="neutral"
        variant="ghost"
        size="sm"
        trailing-icon="i-lucide-arrow-left"
      >
        همه
      </UButton>
    </div>

    <div
      v-if="!items.length"
      class="rounded-xl border border-dashed border-default px-4 py-10 text-center text-sm text-toned"
    >
      سفارشی ثبت نشده است.
    </div>

    <div
      v-else
      class="space-y-3"
    >
      <article
        v-for="order in items"
        :key="order.id"
        class="rounded-xl border border-default/80 bg-default/20 p-4"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0 space-y-1">
            <p class="text-sm font-black text-highlighted">
              {{ order.orderNumber }}
            </p>
            <p class="text-xs text-toned">
              {{ order.customerName || 'کاربر' }}
              <span v-if="order.phone"> · {{ order.phone }}</span>
            </p>
            <p class="text-xs text-muted">
              {{ formatDate(order.created_at) }}
              · {{ numberFormatter.format(order.itemCount) }} قلم
            </p>
          </div>

          <div class="flex flex-col items-end gap-2">
            <UBadge
              :color="ORDER_STATUS_COLORS[order.status]"
              variant="subtle"
            >
              {{ ORDER_STATUS_LABELS[order.status] }}
            </UBadge>
            <p class="text-sm font-bold text-primary">
              {{ formatPrice(order.paidAmount) }}
            </p>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
