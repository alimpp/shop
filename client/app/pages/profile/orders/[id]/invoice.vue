<script setup lang="ts">
import ProfileShell from '~/components/profile/ProfileShell.vue'
import OrderInvoiceView from '~/features/orders/components/OrderInvoiceView.vue'
import { ordersController } from '~/features/orders/controllers/index.controller'
import { useOrdersDS } from '~/features/orders/data/index.store'

definePageMeta({ title: 'فاکتور سفارش', robots: 'noindex, nofollow' })

const route = useRoute()
const toast = useToast()
const ordersDS = useOrdersDS()

const orderId = String(route.params.id ?? '')
const loading = ref(true)
const order = computed(() => ordersDS.getSelectedOrder)

async function loadOrder(): Promise<void> {
  loading.value = true
  const response = await ordersController.getMyOrder(orderId)
  if (!response.success) {
    toast.add({
      title: response.message || 'دریافت فاکتور ناموفق بود',
      color: 'error'
    })
  }
  loading.value = false
}

onMounted(() => {
  void loadOrder()
})
</script>

<template>
  <ProfileShell
    title="فاکتور سفارش"
    :back-to="`/profile/orders/${orderId}`"
  >
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
      فاکتور یافت نشد.
    </div>

    <OrderInvoiceView
      v-else
      :order="order"
    />
  </ProfileShell>
</template>
