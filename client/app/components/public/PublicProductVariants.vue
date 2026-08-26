<script setup lang="ts">
import type { TProductVariant } from '~/features/products/types/index.type'

const props = defineProps<{
  variants: TProductVariant[]
  selectedId: string
}>()

const emit = defineEmits<{
  select: [variantId: string]
}>()

function formatPrice(value: number): string {
  return new Intl.NumberFormat('fa-IR').format(value)
}

function isOutOfStock(variant: TProductVariant): boolean {
  if (!variant.manageStock || variant.allowBackorder) return false
  return (variant.stock ?? 0) <= 0
}

function variantLabel(variant: TProductVariant): string {
  return variant.name?.trim() || variant.sku
}
</script>

<template>
  <div class="space-y-2">
    <p class="text-sm font-bold text-highlighted">
      انتخاب مدل
    </p>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="variant in variants"
        :key="variant.id"
        type="button"
        class="min-w-0 rounded-xl border px-3 py-2 text-sm transition-all sm:px-4"
        :class="[
          selectedId === variant.id
            ? 'border-primary bg-primary/10 font-semibold text-primary'
            : 'border-default text-toned hover:border-primary/50',
          isOutOfStock(variant)
            ? 'cursor-not-allowed opacity-50'
            : 'cursor-pointer'
        ]"
        :disabled="isOutOfStock(variant)"
        @click="emit('select', variant.id)"
      >
        <span class="block truncate">{{ variantLabel(variant) }}</span>
        <span
          v-if="variant.price > 0"
          class="mt-0.5 block text-[11px] font-normal opacity-80"
        >
          {{ formatPrice(variant.salePrice ?? variant.price) }} تومان
        </span>
        <span
          v-if="isOutOfStock(variant)"
          class="mt-0.5 block text-[10px] text-error"
        >
          ناموجود
        </span>
      </button>
    </div>
  </div>
</template>
