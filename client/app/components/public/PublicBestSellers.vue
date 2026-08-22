<script setup lang="ts">
import { ProductsDS } from '~/features/products/data/index.store';

const productsDS = ProductsDS.getInstance();
const products = computed(() => productsDS.getProducts);
</script>

<template>
  <div v-if="products.length > 0" class="space-y-6 px-4 sm:px-6 lg:px-8">
    <div class="mx-auto grid w-full max-w-6xl grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
      <PublicProductCard v-for="product in products" :key="product.id" :product="product" />
    </div>
  </div>
</template>
