<script setup lang="ts">
import PublicBlogProductCard from '~/components/public/PublicBlogProductCard.vue'
import type { TBlogPublicProduct } from '~/features/blogs/types/public.type'

defineProps<{
  products: TBlogPublicProduct[]
}>()
</script>

<template>
  <section
    v-if="products.length"
    class="space-y-4 rounded-3xl border border-default/80 bg-[#101010] p-4 sm:p-5"
  >
    <div class="space-y-1">
      <h2 class="text-base font-black text-highlighted sm:text-lg">
        محصولات مرتبط با این مقاله
      </h2>
      <p class="text-xs text-toned sm:text-sm">
        پیشنهاد خرید بر اساس موضوع مقاله و برندهای مرتبط
      </p>
    </div>

    <div class="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
      <PublicBlogProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
      />
    </div>
  </section>
</template>
