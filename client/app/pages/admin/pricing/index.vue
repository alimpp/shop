<script setup lang="ts">
import PricingProductRow from '~/features/pricing/components/PricingProductRow.vue'
import { pricingController } from '~/features/pricing/controllers/index.controller'
import { usePricingDS } from '~/features/pricing/data/index.store'
import type { TPricingSaveState } from '~/features/pricing/types/index.type'
import type { TUpdateProductPricingPayload } from '~/features/pricing/types/index.type'
import { categoriesController } from '~/features/categories/controllers/index.controller'
import { useCategoriesDS } from '~/features/categories/data/index.store'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const toast = useToast()
const pricingDS = usePricingDS()
const categoriesDS = useCategoriesDS()

const items = computed(() => pricingDS.getItems)
const meta = computed(() => pricingDS.getMeta)
const loading = computed(() => pricingDS.getLoading)
const categories = computed(() => categoriesDS.getCategories)

const searchInput = ref('')
const debouncedSearch = ref('')
const selectedCategoryId = ref('')
const lowStockOnly = ref(false)
const page = ref(1)

const saveStates = ref<Record<string, TPricingSaveState>>({})
let searchTimer: ReturnType<typeof setTimeout> | null = null
let savedTimers = new Map<string, ReturnType<typeof setTimeout>>()

function setSaveState(id: string, state: TPricingSaveState): void {
  saveStates.value = {
    ...saveStates.value,
    [id]: state
  }

  if (state === 'saved') {
    const existing = savedTimers.get(id)
    if (existing) {
      clearTimeout(existing)
    }

    savedTimers.set(
      id,
      setTimeout(() => {
        saveStates.value = {
          ...saveStates.value,
          [id]: 'idle'
        }
        savedTimers.delete(id)
      }, 1800)
    )
  }
}

async function fetchCategories(): Promise<void> {
  await categoriesController.getCategories()
}

async function fetchPricingProducts(): Promise<void> {
  const response = await pricingController.getPricingProducts({
    search: debouncedSearch.value.trim() || undefined,
    categoryId: selectedCategoryId.value || undefined,
    lowStockOnly: lowStockOnly.value || undefined,
    page: page.value,
    limit: 30
  })

  if (!response.success) {
    toast.add({
      title: response.message || 'دریافت لیست قیمت‌گذاری ناموفق بود',
      color: 'error'
    })
  }
}

function onSearchInput(): void {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }

  searchTimer = setTimeout(() => {
    debouncedSearch.value = searchInput.value
    page.value = 1
    fetchPricingProducts()
  }, 280)
}

async function handleSave(
  productId: string,
  payload: TUpdateProductPricingPayload | null
): Promise<void> {
  if (!payload) {
    setSaveState(productId, 'idle')
    return
  }

  setSaveState(productId, 'saving')

  const response = await pricingController.updateProductPricing(productId, payload)

  if (!response.success) {
    setSaveState(productId, 'error')
    toast.add({
      title: response.message || 'ذخیره قیمت‌گذاری ناموفق بود',
      color: 'error'
    })
    return
  }

  setSaveState(productId, 'saved')
}

function resetFilters(): void {
  searchInput.value = ''
  debouncedSearch.value = ''
  selectedCategoryId.value = ''
  lowStockOnly.value = false
  page.value = 1
  fetchPricingProducts()
}

onMounted(async () => {
  await Promise.all([fetchCategories(), fetchPricingProducts()])
})

onBeforeUnmount(() => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  savedTimers.forEach(timer => clearTimeout(timer))
  savedTimers.clear()
})

watch([selectedCategoryId, lowStockOnly], () => {
  page.value = 1
  fetchPricingProducts()
})

watch(page, () => {
  fetchPricingProducts()
})
</script>

<template>
  <UDashboardPanel id="admin-pricing">
    <template #header>
      <UDashboardNavbar title="قیمت‌گذاری">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-refresh-cw"
            :loading="loading"
            @click="fetchPricingProducts"
          >
            بروزرسانی
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <BaseDashboardPanelBody>
        <div class="mb-5 space-y-4">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 class="text-base font-black text-highlighted sm:text-lg">
                مدیریت سریع قیمت و موجودی
              </h2>
              <p class="mt-1 text-xs text-toned sm:text-sm">
                {{ meta.total.toLocaleString('fa-IR') }} محصول · ویرایش inline و ذخیره با Enter یا خروج از فیلد
              </p>
            </div>

            <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <UInput
                v-model="searchInput"
                icon="i-lucide-search"
                placeholder="جستجو نام، SKU یا واریانت"
                class="w-full sm:w-72"
                @update:model-value="onSearchInput"
              />

              <USelect
                v-model="selectedCategoryId"
                :items="[
                  { id: '', name: 'همه دسته‌ها' },
                  ...categories
                ]"
                value-key="id"
                label-key="name"
                class="w-full sm:w-48"
              />

              <label class="flex items-center gap-2 rounded-xl border border-default px-3 py-2 text-sm text-toned">
                <input
                  v-model="lowStockOnly"
                  type="checkbox"
                  class="size-4"
                >
                فقط موجودی کم
              </label>

              <UButton
                color="neutral"
                variant="ghost"
                icon="i-lucide-filter-x"
                @click="resetFilters"
              >
                پاک کردن فیلتر
              </UButton>
            </div>
          </div>

          <div class="hidden rounded-xl border border-default bg-default/20 px-4 py-2 text-[11px] text-toned sm:grid sm:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(88px,1fr))_auto] sm:gap-4">
            <span>محصول</span>
            <span>قیمت (تومان)</span>
            <span>قیمت تخفیف</span>
            <span>موجودی</span>
            <span class="text-left">وضعیت</span>
          </div>
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
          محصولی برای قیمت‌گذاری یافت نشد.
        </div>

        <div
          v-else
          class="space-y-3"
        >
          <PricingProductRow
            v-for="product in items"
            :key="product.id"
            :product="product"
            :saving="pricingDS.isSaving(product.id)"
            :save-state="saveStates[product.id] ?? 'idle'"
            @save="(payload) => handleSave(product.id, payload)"
          />
        </div>

        <div
          v-if="meta.totalPages > 1"
          class="mt-6 flex justify-center"
        >
          <UPagination
            v-model:page="page"
            :total="meta.total"
            :items-per-page="meta.limit"
          />
        </div>
      </BaseDashboardPanelBody>
    </template>
  </UDashboardPanel>
</template>
