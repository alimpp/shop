<script setup lang="ts">
import type { TProduct } from "~/features/products/types/index.type";

defineProps<{
  product: TProduct;
}>();
</script>

<template>
  <nav
    class="mb-6 flex flex-wrap items-center gap-2 text-sm text-toned"
    aria-label="breadcrumb"
  >
    <NuxtLink
      to="/"
      class="transition-colors hover:text-primary"
    >
      خانه
    </NuxtLink>
    <UIcon
      name="i-lucide-chevron-left"
      class="size-4"
    />
    <NuxtLink
      to="/products"
      class="transition-colors hover:text-primary"
    >
      محصولات
    </NuxtLink>
    <template v-if="product.category">
      <UIcon
        name="i-lucide-chevron-left"
        class="size-4"
      />
      <NuxtLink
        :to="`/products?categoryId=${product.category.id}`"
        class="transition-colors hover:text-primary"
      >
        {{ product.category.name }}
      </NuxtLink>
    </template>
    <UIcon
      name="i-lucide-chevron-left"
      class="size-4"
    />
    <span class="font-semibold text-highlighted">{{ product.name }}</span>
  </nav>
</template>
