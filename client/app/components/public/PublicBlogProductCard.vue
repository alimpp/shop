<script setup lang="ts">
import type { TBlogPublicProduct } from '~/features/blogs/types/public.type'

const props = defineProps<{
  product: TBlogPublicProduct
}>()

const hasDiscount = computed(
  () =>
    typeof props.product.salePrice === 'number'
    && props.product.salePrice > 0
    && props.product.salePrice < props.product.price
)

const displayPrice = computed(() =>
  hasDiscount.value ? props.product.salePrice! : props.product.price
)

function formatPrice(value: number): string {
  return `${new Intl.NumberFormat('fa-IR').format(value)} تومان`
}
</script>

<template>
  <NuxtLink
    :to="`/products/${product.slug}`"
    class="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-default/80 bg-[#151515] transition-all hover:border-primary/35"
  >
    <div class="relative aspect-square overflow-hidden bg-default/30">
      <NuxtImg
        v-if="product.image"
        :src="resolveAssetUrl(product.image)"
        :alt="product.name"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <div
        v-else
        class="flex h-full items-center justify-center text-muted"
      >
        <UIcon name="i-lucide-image" class="size-8" />
      </div>

      <span
        v-if="product.brand"
        class="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm"
      >
        {{ product.brand.name }}
      </span>
    </div>

    <div class="flex flex-1 flex-col gap-1.5 p-3">
      <h4 class="line-clamp-2 text-xs font-bold leading-5 text-highlighted sm:text-sm">
        {{ product.name }}
      </h4>
      <p
        v-if="product.category"
        class="text-[11px] text-toned"
      >
        {{ product.category.name }}
      </p>
      <div class="mt-auto pt-1">
        <del
          v-if="hasDiscount"
          class="block text-[10px] text-toned"
        >
          {{ formatPrice(product.price) }}
        </del>
        <p class="text-sm font-black text-primary">
          {{ formatPrice(displayPrice) }}
        </p>
      </div>
    </div>
  </NuxtLink>
</template>
