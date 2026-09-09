<script setup lang="ts">
import { stockMovementsController } from '~/features/stock-movements/controllers/index.controller'
import type {
  TStockMovement,
  TStockMovementListMeta,
  TStockMovementReason
} from '~/features/stock-movements/types/index.type'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const toast = useToast()
const loading = ref(false)
const items = ref<TStockMovement[]>([])
const search = ref('')
const selectedReason = ref<TStockMovementReason | 'all'>('all')
const page = ref(1)
let searchTimer: ReturnType<typeof setTimeout> | null = null

const meta = ref<TStockMovementListMeta>({
  total: 0,
  page: 1,
  limit: 30,
  totalPages: 1
})

const reasonItems = [
  { label: 'همه دلایل', value: 'all' },
  { label: 'ثبت سفارش', value: 'order_placed' },
  { label: 'لغو سفارش', value: 'order_cancelled' },
  { label: 'مرجوع سفارش', value: 'order_returned' },
  { label: 'بازگشت موجودی سفارش', value: 'order_restocked' },
  { label: 'ویرایش ادمین', value: 'admin_update' },
  { label: 'قیمت‌گذاری ادمین', value: 'admin_pricing' }
]

const numberFormatter = new Intl.NumberFormat('fa-IR')

function formatDate(value?: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleString('fa-IR')
}

function changeColor(value: number): 'success' | 'error' | 'neutral' {
  if (value > 0) return 'success'
  if (value < 0) return 'error'
  return 'neutral'
}

async function fetchItems(): Promise<void> {
  loading.value = true
  const response = await stockMovementsController.getMovements({
    page: page.value,
    limit: 30,
    search: search.value.trim() || undefined,
    reason: selectedReason.value === 'all' ? undefined : selectedReason.value
  })
  loading.value = false

  if (!response.success || !response.data) {
    toast.add({
      title: response.message || 'دریافت تاریخچه موجودی ناموفق بود',
      color: 'error'
    })
    return
  }

  items.value = response.data.items
  meta.value = response.data.meta
}

function goToPage(nextPage: number): void {
  if (nextPage < 1 || nextPage > meta.value.totalPages) return
  page.value = nextPage
  void fetchItems()
}

watch(selectedReason, () => {
  page.value = 1
  void fetchItems()
})

watch(search, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    page.value = 1
    void fetchItems()
  }, 400)
})

onMounted(() => {
  void fetchItems()
})

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
})
</script>

<template>
  <UDashboardPanel id="admin-stock-history">
    <template #header>
      <UDashboardNavbar title="تاریخچه موجودی">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            to="/admin/stock"
            color="neutral"
            variant="outline"
            icon="i-lucide-triangle-alert"
          >
            هشدار موجودی
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-refresh-cw"
            :loading="loading"
            @click="fetchItems"
          >
            بروزرسانی
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <BaseDashboardPanelBody>
        <div class="mb-4 flex flex-wrap items-center gap-2">
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="جستجو در نام محصول، واریانت یا سفارش..."
            class="max-w-md flex-1"
          />
          <USelect
            v-model="selectedReason"
            :items="reasonItems"
            class="w-52"
          />
        </div>

        <div
          v-if="loading && !items.length"
          class="flex justify-center py-16"
        >
          <UIcon
            name="i-lucide-loader-2"
            class="size-7 animate-spin text-primary"
          />
        </div>

        <div
          v-else-if="!items.length"
          class="rounded-2xl border border-dashed border-default px-6 py-16 text-center text-sm text-toned"
        >
          هنوز تغییری در موجودی ثبت نشده است.
        </div>

        <div
          v-else
          class="overflow-x-auto rounded-2xl border border-default"
        >
          <table class="min-w-full text-sm">
            <thead class="bg-elevated/60 text-toned">
              <tr>
                <th class="px-4 py-3 text-start font-medium">
                  زمان
                </th>
                <th class="px-4 py-3 text-start font-medium">
                  محصول
                </th>
                <th class="px-4 py-3 text-start font-medium">
                  تغییر
                </th>
                <th class="px-4 py-3 text-start font-medium">
                  قبل → بعد
                </th>
                <th class="px-4 py-3 text-start font-medium">
                  دلیل
                </th>
                <th class="px-4 py-3 text-start font-medium">
                  عامل
                </th>
                <th class="px-4 py-3 text-start font-medium">
                  یادداشت
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in items"
                :key="item.id"
                class="border-t border-default"
              >
                <td class="px-4 py-3 text-toned whitespace-nowrap">
                  {{ formatDate(item.createdAt) }}
                </td>
                <td class="px-4 py-3">
                  <p class="font-medium text-highlighted">
                    {{ item.productName || '—' }}
                  </p>
                  <p
                    v-if="item.variantName"
                    class="text-xs text-toned"
                  >
                    {{ item.variantName }}
                  </p>
                </td>
                <td class="px-4 py-3">
                  <UBadge
                    :color="changeColor(item.quantityChange)"
                    variant="subtle"
                  >
                    {{ item.quantityChange > 0 ? '+' : '' }}{{ numberFormatter.format(item.quantityChange) }}
                  </UBadge>
                </td>
                <td
                  class="px-4 py-3 text-toned"
                  dir="ltr"
                >
                  {{ numberFormatter.format(item.stockBefore) }}
                  →
                  {{ numberFormatter.format(item.stockAfter) }}
                </td>
                <td class="px-4 py-3 text-highlighted">
                  {{ item.reasonLabel }}
                </td>
                <td class="px-4 py-3 text-toned">
                  {{ item.actorLabel }}
                </td>
                <td class="px-4 py-3 text-toned max-w-xs truncate">
                  {{ item.note || '—' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="meta.totalPages > 1"
          class="mt-6 flex items-center justify-center gap-2"
        >
          <UButton
            color="neutral"
            variant="soft"
            :disabled="page <= 1 || loading"
            @click="goToPage(page - 1)"
          >
            قبلی
          </UButton>
          <span class="text-sm text-toned">
            صفحه {{ numberFormatter.format(page) }} از
            {{ numberFormatter.format(meta.totalPages) }}
          </span>
          <UButton
            color="neutral"
            variant="soft"
            :disabled="page >= meta.totalPages || loading"
            @click="goToPage(page + 1)"
          >
            بعدی
          </UButton>
        </div>
      </BaseDashboardPanelBody>
    </template>
  </UDashboardPanel>
</template>
