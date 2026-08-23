<script setup lang="ts">
import type { TDashboardChartPoint } from '../types/index.type'

const props = defineProps<{
  points: TDashboardChartPoint[]
}>()

const numberFormatter = new Intl.NumberFormat('fa-IR')

function formatPrice(value: number): string {
  return `${numberFormatter.format(value)} تومان`
}

function formatShortDate(value: string): string {
  const date = new Date(`${value}T00:00:00`)
  return new Intl.DateTimeFormat('fa-IR', {
    month: 'short',
    day: 'numeric'
  }).format(date)
}

const maxRevenue = computed(() =>
  Math.max(...props.points.map(point => point.revenue), 1)
)

const totalRevenue = computed(() =>
  props.points.reduce((sum, point) => sum + point.revenue, 0)
)

const totalOrders = computed(() =>
  props.points.reduce((sum, point) => sum + point.orders, 0)
)

const hoveredIndex = ref<number | null>(null)

const hoveredPoint = computed(() =>
  hoveredIndex.value === null ? null : props.points[hoveredIndex.value] ?? null
)
</script>

<template>
  <section class="rounded-2xl border border-default bg-elevated/40 p-4 sm:p-5">
    <div class="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 class="text-sm font-black text-highlighted sm:text-base">
          روند فروش ۳۰ روز اخیر
        </h3>
        <p class="mt-1 text-xs text-toned sm:text-sm">
          مجموع {{ formatPrice(totalRevenue) }} از {{ numberFormatter.format(totalOrders) }} سفارش
        </p>
      </div>

      <div
        v-if="hoveredPoint"
        class="rounded-xl border border-default bg-default/60 px-3 py-2 text-xs"
      >
        <p class="font-semibold text-highlighted">
          {{ formatShortDate(hoveredPoint.date) }}
        </p>
        <p class="text-toned">
          {{ formatPrice(hoveredPoint.revenue) }}
        </p>
        <p class="text-muted">
          {{ numberFormatter.format(hoveredPoint.orders) }} سفارش
        </p>
      </div>
    </div>

    <div class="flex h-44 items-end gap-1 sm:gap-1.5">
      <div
        v-for="(point, index) in points"
        :key="point.date"
        class="group relative flex min-w-0 flex-1 flex-col justify-end"
        @mouseenter="hoveredIndex = index"
        @mouseleave="hoveredIndex = null"
      >
        <div
          class="w-full rounded-t-md transition-all duration-200"
          :class="hoveredIndex === index ? 'bg-primary' : 'bg-primary/55 group-hover:bg-primary/80'"
          :style="{ height: `${Math.max((point.revenue / maxRevenue) * 100, point.revenue > 0 ? 8 : 2)}%` }"
        />
      </div>
    </div>

    <div class="mt-3 flex justify-between text-[10px] text-muted sm:text-xs">
      <span>{{ points[0] ? formatShortDate(points[0].date) : '' }}</span>
      <span>{{ points[Math.floor(points.length / 2)] ? formatShortDate(points[Math.floor(points.length / 2)].date) : '' }}</span>
      <span>{{ points[points.length - 1] ? formatShortDate(points[points.length - 1].date) : '' }}</span>
    </div>
  </section>
</template>
