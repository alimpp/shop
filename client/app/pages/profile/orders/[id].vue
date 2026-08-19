<script setup lang="ts">
import ProfileShell from '~/components/profile/ProfileShell.vue'
import OrderDetailView from '~/features/orders/components/OrderDetailView.vue'
import { ordersController } from '~/features/orders/controllers/index.controller'
import { useOrdersDS } from '~/features/orders/data/index.store'

definePageMeta({ title: 'جزئیات سفارش', robots: 'noindex, nofollow' })

const route = useRoute()
const toast = useToast()
const ordersDS = useOrdersDS()

const orderId = String(route.params.id ?? '')
const loading = computed(() => ordersDS.getLoading)
const order = computed(() => ordersDS.getSelectedOrder)

async function loadOrder(): Promise<void> {
  const response = await ordersController.getMyOrder(orderId)
  if (!response.success) {
    toast.add({
      title: response.message || 'دریافت سفارش ناموفق بود',
      color: 'error'
    })
  }
}

onMounted(() => {
  loadOrder()
})
</script>

<template>
  <ProfileShell title="جزئیات سفارش">
    <div class="mb-4">
      <UButton
        to="/profile/orders"
        color="neutral"
        variant="ghost"
        icon="i-lucide-arrow-right"
      >
        بازگشت به سفارش‌ها
      </UButton>
    </div>

    <div
      v-if="loading && !order"
      class="flex justify-center py-16"
    >
      <UIcon
        name="i-lucide-loader-2"
        class="size-7 animate-spin text-primary"
      />
    </div>

    <div
      v-else-if="!order"
      class="rounded-2xl border border-default px-6 py-16 text-center text-sm text-toned"
    >
      سفارش یافت نشد.
    </div>

    <OrderDetailView
      v-else
      :order="order"
    />
  </ProfileShell>
</template>
