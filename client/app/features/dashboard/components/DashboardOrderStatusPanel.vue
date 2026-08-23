<script setup lang="ts">
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS
} from '~/features/orders/types/index.type'
import type { TDashboardOrderStatusCount } from '../types/index.type'

const props = defineProps<{
  items: TDashboardOrderStatusCount[]
  total: number
}>()

const numberFormatter = new Intl.NumberFormat('fa-IR')

const sortedItems = computed(() =>
  [...props.items].sort((a, b) => b.count - a.count)
)

function percent(count: number): number {
  if (!props.total) return 0
  return Math.round((count / props.total) * 100)
}
</script>

<template>
  <section class="rounded-2xl border border-default bg-elevated/40 p-4 sm:p-5">
    <div class="mb-5">
      <h3 class="text-sm font-black text-highlighted sm:text-base">
        وضعیت سفارش‌ها
      </h3>
      <p class="mt-1 text-xs text-toned sm:text-sm">
        {{ numberFormatter.format(total) }} سفارش ثبت‌شده
      </p>
    </div>

    <div
      v-if="!sortedItems.length"
      class="rounded-xl border border-dashed border-default px-4 py-10 text-center text-sm text-toned"
    >
      هنوز سفارشی ثبت نشده است.
    </div>

    <div
      v-else
      class="space-y-4"
    >
      <div
        v-for="item in sortedItems"
        :key="item.status"
        class="space-y-2"
      >
        <div class="flex items-center justify-between gap-3 text-xs sm:text-sm">
          <div class="flex items-center gap-2">
            <UBadge
              :color="ORDER_STATUS_COLORS[item.status]"
              variant="subtle"
            >
              {{ ORDER_STATUS_LABELS[item.status] }}
            </UBadge>
          </div>
          <span class="font-semibold text-highlighted">
            {{ numberFormatter.format(item.count) }}
            <span class="text-toned">({{ numberFormatter.format(percent(item.count)) }}٪)</span>
          </span>
        </div>

        <div class="h-2 overflow-hidden rounded-full bg-default/60">
          <div
            class="h-full rounded-full bg-primary transition-all"
            :style="{ width: `${percent(item.count)}%` }"
          />
        </div>
      </div>
    </div>
  </section>
</template>
