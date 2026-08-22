<script setup lang="ts">
import OrderDetailView from '~/features/orders/components/OrderDetailView.vue'
import type { OrderModel } from '~/features/orders/models/index.model'

const props = defineProps<{
  open: boolean
  loading: boolean
  order: OrderModel | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'after-leave': []
}>()

const modalOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value),
})
</script>

<template>
  <UModal
    v-model:open="modalOpen"
    title="جزئیات سفارش"
    :description="order?.orderNumber"
    :ui="{ content: 'sm:max-w-4xl' }"
    @after-leave="emit('after-leave')"
  >
    <template #body>
      <div
        v-if="loading && !order"
        class="flex justify-center py-12"
      >
        <UIcon
          name="i-lucide-loader-2"
          class="size-7 animate-spin text-primary"
        />
      </div>

      <OrderDetailView
        v-else-if="order"
        :order="order"
        show-customer
      />
    </template>
  </UModal>
</template>
