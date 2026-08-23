<script setup lang="ts">
import type { TDashboardTopProduct } from '../types/index.type'

defineProps<{
  items: TDashboardTopProduct[]
}>()

const numberFormatter = new Intl.NumberFormat('fa-IR')

function formatPrice(value: number): string {
  return `${numberFormatter.format(value)} تومان`
}
</script>

<template>
  <section class="rounded-2xl border border-default bg-elevated/40 p-4 sm:p-5">
    <div class="mb-5 flex items-center justify-between gap-3">
      <div>
        <h3 class="text-sm font-black text-highlighted sm:text-base">
          پرفروش‌ترین محصولات
        </h3>
        <p class="mt-1 text-xs text-toned sm:text-sm">
          بر اساس تعداد فروش
        </p>
      </div>

      <UButton
        to="/admin/products"
        color="neutral"
        variant="ghost"
        size="sm"
        trailing-icon="i-lucide-arrow-left"
      >
        محصولات
      </UButton>
    </div>

    <div
      v-if="!items.length"
      class="rounded-xl border border-dashed border-default px-4 py-10 text-center text-sm text-toned"
    >
      هنوز فروشی ثبت نشده است.
    </div>

    <div
      v-else
      class="space-y-3"
    >
      <article
        v-for="(product, index) in items"
        :key="product.id"
        class="flex items-center gap-3 rounded-xl border border-default/80 bg-default/20 p-3"
      >
        <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-black text-primary">
          {{ numberFormatter.format(index + 1) }}
        </div>

        <div class="size-12 shrink-0 overflow-hidden rounded-xl border border-default bg-default/40">
          <img
            v-if="product.image"
            :src="resolveAssetUrl(product.image)"
            :alt="product.name"
            class="size-full object-cover"
          >
          <div
            v-else
            class="flex size-full items-center justify-center text-muted"
          >
            <UIcon name="i-lucide-image" class="size-4" />
          </div>
        </div>

        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold text-highlighted">
            {{ product.name }}
          </p>
          <p class="text-xs text-toned">
            {{ numberFormatter.format(product.soldCount) }} فروش
            · موجودی {{ numberFormatter.format(product.stock) }}
          </p>
        </div>

        <div class="text-left">
          <p class="text-xs font-bold text-primary">
            {{ formatPrice(product.revenue || product.price) }}
          </p>
        </div>
      </article>
    </div>
  </section>
</template>
