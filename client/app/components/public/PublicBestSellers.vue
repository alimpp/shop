<script setup lang="ts">
import PublicProductRail from '~/components/public/PublicProductRail.vue'
import { productsController } from '~/features/products/controllers/index.controller'
import type { TProduct } from '~/features/products/types/index.type'

const products = ref<TProduct[]>([])
const loading = ref(true)

onMounted(async () => {
  loading.value = true
  const response = await productsController.getBestsellers(12)
  products.value = response.success ? (response.data ?? []) : []
  loading.value = false
})
</script>

<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <div
      v-if="loading"
      class="no-scrollbar flex gap-3 overflow-x-auto md:px-10"
    >
      <div
        v-for="index in 6"
        :key="index"
        class="h-64 w-[158px] shrink-0 rounded-[5px] bg-elevated/60 sm:w-[180px]"
      />
    </div>
    <PublicProductRail
      v-else
      :products="products"
    />
  </div>
</template>
