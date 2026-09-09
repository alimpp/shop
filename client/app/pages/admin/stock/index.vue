<script setup lang="ts">
import { dashboardController } from '~/features/dashboard/controllers/index.controller'
import type {
  TLowStockFilter,
  TLowStockItem,
  TLowStockListMeta
} from '~/features/dashboard/types/index.type'
import { resolveAssetUrl } from '~/utils/resolveApiBase'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const toast = useToast()
const loading = ref(false)
const items = ref<TLowStockItem[]>([])
const search = ref('')
const selectedFilter = ref<TLowStockFilter>('all')
const page = ref(1)
let searchTimer: ReturnType<typeof setTimeout> | null = null

const meta = ref<TLowStockListMeta>({
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 1,
  threshold: 5,
  lowCount: 0,
  outCount: 0
})

const filterItems = [
  { label: 'همه هشدارها', value: 'all' },
  { label: 'موجودی کم', value: 'low' },
  { label: 'تمام‌شده', value: 'out' }
]

const numberFormatter = new Intl.NumberFormat('fa-IR')

function formatPrice(value: number): string {
  return `${numberFormatter.format(value)} تومان`
}

async function fetchItems(): Promise<void> {
  loading.value = true
  const response = await dashboardController.getLowStockProducts({
    page: page.value,
    limit: 20,
    filter: selectedFilter.value,
    search: search.value.trim() || undefined
  })
  loading.value = false

  if (!response.success || !response.data) {
    toast.add({
      title: response.message || 'دریافت هشدار موجودی ناموفق بود',
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

watch(selectedFilter, () => {
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
  <UDashboardPanel id="admin-stock">
    <template #header>
      <UDashboardNavbar title="هشدار موجودی">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            to="/admin/stock-history"
            color="neutral"
            variant="outline"
            icon="i-lucide-history"
          >
            تاریخچه موجودی
          </UButton>
          <UButton
            to="/admin/pricing?lowStockOnly=1"
            color="primary"
            variant="soft"
            icon="i-lucide-tags"
          >
            قیمت‌گذاری سریع
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
        <div class="mb-5 grid gap-3 sm:grid-cols-3">
          <div class="rounded-2xl border border-default bg-elevated/40 p-4">
            <p class="text-xs text-toned">
              آستانه هشدار
            </p>
            <p class="mt-1 text-lg font-black text-highlighted">
              ≤ {{ numberFormatter.format(meta.threshold) }} عدد
            </p>
          </div>
          <div class="rounded-2xl border border-warning/30 bg-warning/5 p-4">
            <p class="text-xs text-toned">
              موجودی کم
            </p>
            <p class="mt-1 text-lg font-black text-warning">
              {{ numberFormatter.format(meta.lowCount) }}
            </p>
          </div>
          <div class="rounded-2xl border border-error/30 bg-error/5 p-4">
            <p class="text-xs text-toned">
              تمام‌شده
            </p>
            <p class="mt-1 text-lg font-black text-error">
              {{ numberFormatter.format(meta.outCount) }}
            </p>
          </div>
        </div>

        <div class="mb-4 flex flex-wrap items-center gap-2">
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="جستجو در نام یا SKU..."
            class="max-w-md flex-1"
          />
          <USelect
            v-model="selectedFilter"
            :items="filterItems"
            class="w-44"
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
          محصولی در این فیلتر یافت نشد.
        </div>

        <div
          v-else
          class="space-y-3"
        >
          <article
            v-for="product in items"
            :key="product.id"
            class="flex flex-wrap items-center gap-4 rounded-2xl border border-default bg-elevated/40 p-4"
          >
            <div class="size-14 shrink-0 overflow-hidden rounded-xl border border-default bg-default/40">
              <img
                v-if="product.image"
                :src="resolveAssetUrl(product.image)"
                :alt="product.name"
                class="size-full object-cover"
              >
              <div
                v-else
                class="flex size-full items-center justify-center text-muted"
              >
                <UIcon
                  name="i-lucide-image"
                  class="size-5"
                />
              </div>
            </div>

            <div class="min-w-0 flex-1 space-y-1">
              <p class="truncate text-sm font-black text-highlighted">
                {{ product.name }}
              </p>
              <p
                class="text-xs text-toned"
                dir="ltr"
              >
                {{ product.sku }}
              </p>
              <p class="text-xs text-muted">
                {{ product.categoryName || 'بدون دسته‌بندی' }}
                ·
                {{ formatPrice(product.price) }}
              </p>
            </div>

            <UBadge
              :color="product.isOutOfStock ? 'error' : 'warning'"
              variant="subtle"
              size="lg"
            >
              {{ product.isOutOfStock ? 'تمام‌شده' : 'موجودی کم' }}
              ·
              {{ numberFormatter.format(product.stock) }}
            </UBadge>

            <div class="flex flex-wrap gap-2">
              <UButton
                :to="`/admin/pricing?search=${encodeURIComponent(product.sku || product.name)}`"
                color="primary"
                variant="soft"
                size="sm"
                icon="i-lucide-tags"
              >
                قیمت‌گذاری
              </UButton>
              <UButton
                :to="`/products/${product.slug}`"
                target="_blank"
                color="neutral"
                variant="ghost"
                size="sm"
                icon="i-lucide-external-link"
              >
                مشاهده
              </UButton>
            </div>
          </article>
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
