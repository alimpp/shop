<script setup lang="ts">
import OrderDetailModal from '~/features/orders/components/OrderDetailModal.vue'
import { ordersController } from '~/features/orders/controllers/index.controller'
import { useOrdersDS } from '~/features/orders/data/index.store'
import type { OrderModel } from '~/features/orders/models/index.model'
import type { TOrderStatus } from '~/features/orders/types/index.type'
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS
} from '~/features/orders/types/index.type'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const toast = useToast()
const ordersDS = useOrdersDS()

const orders = computed(() => ordersDS.getOrders)
const loading = computed(() => ordersDS.getLoading)
const submitting = computed(() => ordersDS.getSubmitting)
const selectedOrder = computed(() => ordersDS.getSelectedOrder)
const detailOpen = ref(false)
const detailLoading = ref(false)

const ALL_STATUSES_VALUE = 'all'

const statusFilter = ref(ALL_STATUSES_VALUE)

const statusItems = (
  Object.entries(ORDER_STATUS_LABELS) as Array<[TOrderStatus, string]>
).map(([value, label]) => ({ value, label }))

const filterItems = [
  { value: ALL_STATUSES_VALUE, label: 'همه وضعیت‌ها' },
  ...statusItems
]

function formatPrice(value: number): string {
  return `${new Intl.NumberFormat('fa-IR').format(value)} تومان`
}

function resetDetailState(): void {
  detailOpen.value = false
  detailLoading.value = false
  ordersDS.setSelectedOrder(null)
}

async function fetchOrders(): Promise<void> {
  const response = await ordersController.getAdminOrders({
    page: 1,
    limit: 50,
    status: statusFilter.value !== ALL_STATUSES_VALUE
      ? (statusFilter.value as TOrderStatus)
      : undefined
  })

  if (!response.success) {
    toast.add({
      title: response.message || 'دریافت سفارش‌ها ناموفق بود',
      color: 'error'
    })
  }
}

async function openDetail(order: OrderModel): Promise<void> {
  detailOpen.value = true
  detailLoading.value = true

  const response = await ordersController.getAdminOrder(order.id)

  detailLoading.value = false

  if (!response.success) {
    toast.add({
      title: response.message || 'دریافت جزئیات سفارش ناموفق بود',
      color: 'error'
    })
    resetDetailState()
  }
}

async function handleStatusChange(
  order: OrderModel,
  status: TOrderStatus
): Promise<void> {
  if (order.status === status) return

  const response = await ordersController.updateOrderStatus(order.id, { status })
  toast.add({
    title:
      response.message
      || (response.success ? 'وضعیت سفارش بروزرسانی شد' : 'بروزرسانی وضعیت ناموفق بود'),
    color: response.success ? 'success' : 'error'
  })
}

onMounted(() => {
  fetchOrders()
})

onBeforeRouteLeave(() => {
  resetDetailState()
})

onUnmounted(() => {
  resetDetailState()
})

watch(statusFilter, () => {
  fetchOrders()
})
</script>

<template>
  <UDashboardPanel id="admin-orders">
    <template #header>
      <UDashboardNavbar title="سفارش‌ها">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <USelect
            v-model="statusFilter"
            :items="filterItems"
            class="w-48"
          />
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-refresh-cw"
            :loading="loading"
            @click="fetchOrders"
          >
            بروزرسانی
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <BaseDashboardPanelBody>
        <div
          v-if="loading && !orders.length"
          class="flex justify-center py-16"
        >
          <UIcon
            name="i-lucide-loader-2"
            class="size-7 animate-spin text-primary"
          />
        </div>

        <div
          v-else-if="!orders.length"
          class="rounded-2xl border border-dashed border-default px-6 py-16 text-center text-sm text-toned"
        >
          سفارشی یافت نشد.
        </div>

        <div
          v-else
          class="space-y-3"
        >
          <article
            v-for="order in orders"
            :key="order.id"
            class="rounded-2xl border border-default bg-elevated/40 p-5 transition-colors hover:border-primary/30"
          >
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div class="min-w-0 space-y-1">
                <p class="text-sm font-black text-highlighted">
                  {{ order.orderNumber }}
                </p>
                <p class="text-xs text-toned">
                  {{ order.customerName || 'کاربر' }}
                  <span v-if="order.user?.phone"> · {{ order.user.phone }}</span>
                </p>
                <p class="text-xs text-toned">
                  {{ order.formattedDate }} · {{ order.address.city }}
                </p>
                <p class="text-sm font-bold text-primary">
                  {{ formatPrice(order.paidAmount) }}
                </p>
              </div>

              <div class="flex flex-col items-end gap-2">
                <UBadge
                  :color="ORDER_STATUS_COLORS[order.status]"
                  variant="subtle"
                >
                  {{ ORDER_STATUS_LABELS[order.status] }}
                </UBadge>
                <USelect
                  :model-value="order.status"
                  :items="statusItems"
                  class="w-48"
                  :disabled="submitting"
                  @update:model-value="(value: TOrderStatus) => handleStatusChange(order, value)"
                />
                <UButton
                  color="neutral"
                  variant="soft"
                  size="sm"
                  icon="i-lucide-eye"
                  @click="openDetail(order)"
                >
                  جزئیات
                </UButton>
              </div>
            </div>
          </article>
        </div>

        <OrderDetailModal
          v-if="detailOpen || selectedOrder"
          v-model:open="detailOpen"
          :loading="detailLoading"
          :order="selectedOrder"
          @after-leave="resetDetailState"
        />
      </BaseDashboardPanelBody>
    </template>
  </UDashboardPanel>
</template>
