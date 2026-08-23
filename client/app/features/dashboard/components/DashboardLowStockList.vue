<script setup lang="ts">
import type { TDashboardLowStockProduct } from '../types/index.type'

defineProps<{
  items: TDashboardLowStockProduct[]
}>()

const numberFormatter = new Intl.NumberFormat('fa-IR')
</script>

<template>
  <section class="rounded-2xl border border-default bg-elevated/40 p-4 sm:p-5">
    <div class="mb-5 flex items-center justify-between gap-3">
      <div>
        <h3 class="text-sm font-black text-highlighted sm:text-base">
          هشدار موجودی کم
        </h3>
        <p class="mt-1 text-xs text-toned sm:text-sm">
          محصولات منتشرشده با موجودی ۵ یا کمتر
        </p>
      </div>

      <UButton
        to="/admin/products"
        color="neutral"
        variant="ghost"
        size="sm"
        trailing-icon="i-lucide-arrow-left"
      >
        مدیریت
      </UButton>
    </div>

    <div
      v-if="!items.length"
      class="rounded-xl border border-dashed border-default px-4 py-10 text-center text-sm text-toned"
    >
      محصولی با موجودی کم ندارید.
    </div>

    <div
      v-else
      class="space-y-3"
    >
      <article
        v-for="product in items"
        :key="product.id"
        class="flex items-center gap-3 rounded-xl border border-default/80 bg-default/20 p-3"
      >
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
          <p class="text-xs text-toned" dir="ltr">
            {{ product.sku }}
          </p>
        </div>

        <UBadge
          :color="product.stock === 0 ? 'error' : 'warning'"
          variant="subtle"
        >
          {{ numberFormatter.format(product.stock) }} عدد
        </UBadge>
      </article>
    </div>
  </section>
</template>
