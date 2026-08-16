<script setup lang="ts">
import type { TProduct } from '~/features/products/types/index.type';

const props = defineProps<{
  product: TProduct;
}>();

const mainImageUrl = computed(() => {
  const thumbnail = props.product.medias.find((media) => media.isThumbnail);
  return thumbnail?.url || props.product.medias[0]?.url || '';
});

const hasDiscount = computed(
  () =>
    typeof props.product.salePrice === 'number' &&
    props.product.salePrice > 0 &&
    props.product.salePrice < props.product.price,
);

const displayPrice = computed(() =>
  hasDiscount.value ? props.product.salePrice! : props.product.price,
);

const discountPercent = computed(() => {
  if (!hasDiscount.value || props.product.price <= 0) return 0;
  return Math.round((1 - props.product.salePrice! / props.product.price) * 100);
});

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fa-IR').format(value);
}
</script>

<template>
  <NuxtLink
    :to="`/products/${product.slug}`"
    data-product-card
    class="group flex h-full flex-col overflow-hidden rounded-[5px] bg-[#151515] shadow-xs shadow-primary/10 transition-all duration-300 text-[#fff]"
  >
    <div class="relative aspect-square w-full overflow-hidden bg-gray-100">
      <NuxtImg
        v-if="mainImageUrl"
        :src="mainImageUrl"
        :alt="product.name"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
        decoding="async"
      />

      <UIcon
        v-else
        name="i-lucide-image"
        class="absolute inset-0 m-auto h-10 w-10 text-gray-300"
      />

      <span
        v-if="hasDiscount"
        class="absolute left-2 top-2 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm"
      >
        ٪{{ discountPercent }}
      </span>
    </div>

    <div class="flex flex-1 flex-col gap-1.5 p-3">
      <h3 class="line-clamp-2 text-sm font-bold">
        {{ product.name }}
      </h3>

      <p v-if="product.category" class="text-xs">
        {{ product.category.name }}
      </p>

      <div class="mt-auto flex flex-col pt-1.5">
        <del
          v-if="hasDiscount"
          class="text-xs font-normal"
        >
          {{ formatCurrency(product.price) }} تومان
        </del>

        <span
          class="font-bold"
          :class="hasDiscount ? 'text-base text-red-600' : 'text-base text-[#fff]'"
        >
          {{ formatCurrency(displayPrice) }} تومان
        </span>
      </div>
    </div>
  </NuxtLink>
</template>