<script setup lang="ts">
import OrderDetailView from '~/features/orders/components/OrderDetailView.vue'
import OrderTrackingAsk from '~/features/orders/components/OrderTrackingAsk.vue'
import type { OrderModel } from '~/features/orders/models/index.model'

const props = withDefaults(
  defineProps<{
    open: boolean
    loading: boolean
    order: OrderModel | null
    enableTracking?: boolean
  }>(),
  {
    enableTracking: false
  }
)

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

      <div
        v-else-if="order"
        class="space-y-4"
      >
        <OrderTrackingAsk
          v-if="enableTracking"
          :order="order"
        />

        <OrderDetailView
          :order="order"
          show-customer
        />
      </div>
    </template>
  </UModal>
</template>
