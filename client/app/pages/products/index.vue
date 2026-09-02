<script setup lang="ts">
import { categoriesController } from '~/features/categories/controllers/index.controller'
import { productsController } from '~/features/products/controllers/index.controller'
import type { TCategory } from '~/features/categories/types/index.type'
import type {
  TProduct,
  TProductAttributeWithValues,
  TProductBrandRef,
  TProductListMeta,
  TProductListQuery
} from '~/features/products/types/index.type'
import { SITE_NAME } from '~/utils/seo'

const toast = useToast()
const requestURL = useRequestURL()
const route = useRoute()
const { track } = useBehaviorTracker()
let filterTrackTimer: ReturnType<typeof setTimeout> | null = null

const isFiltersOpen = ref(false)
const currentPage = ref(1)
const itemsPerPage = 12

const searchInput = ref('')
const debouncedSearch = ref('')
const selectedCategoryId = ref('')
const selectedBrandId = ref('')
const attributeSelections = reactive<Record<string, string[]>>({})
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

const categories = ref<TCategory[]>([])
const brands = ref<TProductBrandRef[]>([])
const filterAttributes = ref<TProductAttributeWithValues[]>([])
const products = ref<TProduct[]>([])
const productsMeta = ref<TProductListMeta | null>(null)
const loading = ref(false)

const totalProducts = computed(() => productsMeta.value?.total ?? 0)
const rangeStart = computed(() =>
  totalProducts.value ? (currentPage.value - 1) * itemsPerPage + 1 : 0
)
const rangeEnd = computed(() =>
  Math.min(currentPage.value * itemsPerPage, totalProducts.value)
)

const activeCategory = computed(() =>
  categories.value.find(c => c.id === selectedCategoryId.value)
)
const activeBrand = computed(() =>
  brands.value.find(b => b.id === selectedBrandId.value)
)

const seoTitle = computed(() => {
  const parts: string[] = []

  if (debouncedSearch.value.trim()) {
    parts.push(`خرید ${debouncedSearch.value.trim()}`)
  }

  if (activeCategory.value) {
    parts.push(`خرید ${activeCategory.value.name}`)
  }

  if (activeBrand.value) {
    parts.push(`${activeBrand.value.name}`)
  }

  if (currentPage.value > 1) {
    parts.push(`صفحه ${currentPage.value}`)
  }

  return parts.length
    ? parts.join(' | ')
    : 'خرید لپ‌تاپ، موبایل و لوازم دیجیتال'
})

const seoDescription = computed(() => {
  const parts: string[] = []

  if (activeCategory.value) {
    parts.push(`خرید آنلاین ${activeCategory.value.name} با بهترین قیمت در ${SITE_NAME}.`)
  }

  if (activeBrand.value) {
    parts.push(`محصولات اصل ${activeBrand.value.name} با ضمانت اصالت کالا در ${SITE_NAME}.`)
  }

  if (debouncedSearch.value.trim()) {
    parts.push(`نتایج جستجوی «${debouncedSearch.value.trim()}» در ${SITE_NAME}.`)
  }

  return parts.length
    ? parts.join(' ')
    : 'خرید آنلاین لپ‌تاپ، موبایل، مانیتور و لوازم جانبی دیجیتال با ضمانت اصالت کالا، قیمت رقابتی و ارسال سریع به سراسر ایران.'
})

useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  ogTitle: () => `${seoTitle.value} | ${SITE_NAME}`,
  ogDescription: seoDescription,
  ogSiteName: SITE_NAME,
  ogType: 'website',
  ogUrl: () => requestURL.href,
  twitterTitle: () => `${seoTitle.value} | ${SITE_NAME}`,
  twitterDescription: seoDescription
})

useHead({
  link: [
    {
      key: 'canonical',
      rel: 'canonical',
      href: () => requestURL.href
    }
  ]
})

useSchemaOrg(() => [
  defineItemList({
    name: seoTitle.value,
    itemListElement: products.value.map((product, index) =>
      defineListItem({
        name: product.name,
        url: `${requestURL.origin}/products/${product.slug}`,
        position: (currentPage.value - 1) * itemsPerPage + index + 1
      })
    )
  })
])

const hasActiveFilters = computed(
  () =>
    Boolean(searchInput.value.trim()) ||
    Boolean(selectedCategoryId.value) ||
    Boolean(selectedBrandId.value) ||
    Object.values(attributeSelections).some(ids => ids.length > 0)
)

function resetAttributeSelections(): void {
  Object.keys(attributeSelections).forEach((key) => {
    delete attributeSelections[key]
  })
}

function buildAttributeValueIds(): string[] {
  return Array.from(
    new Set(
      Object.values(attributeSelections)
        .flatMap(ids => ids ?? [])
        .filter(Boolean)
    )
  )
}

function buildFiltersQuery(): Omit<TProductListQuery, 'page' | 'limit'> {
  const attributeValueIds = buildAttributeValueIds()

  return {
    search: debouncedSearch.value.trim() || undefined,
    categoryId: selectedCategoryId.value || undefined,
    brandId: selectedBrandId.value || undefined,
    attributeValueIds: attributeValueIds.length ? attributeValueIds : undefined
  }
}

function buildProductsQuery(): TProductListQuery {
  return {
    ...buildFiltersQuery(),
    status: 'published',
    isActive: true,
    page: currentPage.value,
    limit: itemsPerPage
  }
}

async function fetchCategories(): Promise<void> {
  const response = await categoriesController.getCategories()

  if (!response.success) {
    toast.add({
      title: response.message || 'دریافت دسته‌بندی‌ها ناموفق بود',
      color: 'error'
    })
    return
  }

  categories.value = response.data?.items ?? []
}

async function fetchBrands(): Promise<void> {
  const response = await productsController.getBrands()

  if (!response.success) {
    toast.add({
      title: response.message || 'دریافت برندها ناموفق بود',
      color: 'error'
    })
    return
  }

  brands.value = response.data ?? []
}

async function fetchFilterAttributes(): Promise<void> {
  const response = await productsController.getFilterAttributes(
    buildFiltersQuery()
  )

  if (!response.success) {
    toast.add({
      title: response.message || 'دریافت فیلترهای ویژگی ناموفق بود',
      color: 'error'
    })
    return
  }

  filterAttributes.value = (response.data ?? []).filter(
    attribute => attribute.isFilterable !== false
  )

  const allowedValueIds = new Set(
    filterAttributes.value.flatMap(attribute =>
      (attribute.values ?? []).map(value => value.id)
    )
  )

  Object.keys(attributeSelections).forEach((attributeId) => {
    attributeSelections[attributeId] = (
      attributeSelections[attributeId] ?? []
    ).filter(id => allowedValueIds.has(id))
    if (!attributeSelections[attributeId].length) {
      delete attributeSelections[attributeId]
    }
  })
}

async function fetchProducts(): Promise<void> {
  loading.value = true

  const response = await productsController.getProducts(buildProductsQuery())

  loading.value = false

  if (!response.success) {
    toast.add({
      title: response.message || 'دریافت محصولات ناموفق بود',
      color: 'error'
    })
    return
  }

  products.value = response.data?.items ?? []
  productsMeta.value = response.data?.meta ?? null
}

function updateAttributeSelections(value: Record<string, string[]>): void {
  resetAttributeSelections()
  Object.entries(value).forEach(([key, ids]) => {
    attributeSelections[key] = ids
  })
}

function clearFilters(): void {
  searchInput.value = ''
  debouncedSearch.value = ''
  selectedCategoryId.value = ''
  selectedBrandId.value = ''
  resetAttributeSelections()
  currentPage.value = 1
}

function removeSearch(): void {
  searchInput.value = ''
}

function removeCategory(): void {
  selectedCategoryId.value = ''
}

function removeBrand(): void {
  selectedBrandId.value = ''
}

function removeAttributeValue(attributeId: string, valueId: string): void {
  const current = attributeSelections[attributeId] ?? []
  const next = current.filter(id => id !== valueId)

  if (!next.length) {
    delete attributeSelections[attributeId]
  } else {
    attributeSelections[attributeId] = next
  }
}

watch(searchInput, (value) => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }

  searchDebounceTimer = setTimeout(() => {
    debouncedSearch.value = value
  }, 350)
})

watch(selectedCategoryId, () => {
  resetAttributeSelections()
})

watch([debouncedSearch, selectedCategoryId, selectedBrandId], async () => {
  const shouldFetchProducts = currentPage.value === 1
  currentPage.value = 1
  await fetchFilterAttributes()
  if (shouldFetchProducts) {
    await fetchProducts()
  }
  scheduleFilterTrack()
})

watch(
  () => JSON.stringify(attributeSelections),
  async () => {
    const shouldFetchProducts = currentPage.value === 1
    currentPage.value = 1
    await fetchFilterAttributes()
    if (shouldFetchProducts) {
      await fetchProducts()
    }
    scheduleFilterTrack()
  }
)

function scheduleFilterTrack(): void {
  if (filterTrackTimer) clearTimeout(filterTrackTimer)
  filterTrackTimer = setTimeout(() => {
    if (!hasActiveFilters.value) return
    track('filter', {
      metadata: {
        search: debouncedSearch.value.trim() || null,
        categoryId: selectedCategoryId.value || null,
        brandId: selectedBrandId.value || null,
        attributeValueIds: Object.values(attributeSelections).flat()
      }
    })
  }, 800)
}

watch(currentPage, async () => {
  await fetchProducts()
})

onMounted(async () => {
  const categoryFromQuery = String(route.query.category ?? '')
  const brandFromQuery = String(route.query.brand ?? '')
  if (categoryFromQuery) {
    selectedCategoryId.value = categoryFromQuery
  }
  if (brandFromQuery) {
    selectedBrandId.value = brandFromQuery
  }

  await Promise.all([
    fetchCategories(),
    fetchBrands(),
    fetchFilterAttributes(),
    fetchProducts()
  ])
})
</script>

<template>
  <div
    dir="rtl"
    class="flex h-[calc(100dvh-5rem)] flex-col overflow-hidden bg-default md:h-[calc(100dvh-6rem)]"
  >
    <div class="flex min-h-0 flex-1 overflow-hidden">
      <aside
        class="hidden w-72 shrink-0 flex-col overflow-hidden bg-elevated/30 lg:flex xl:w-80"
      >
        <div class="flex-1 space-y-5 overflow-y-auto p-5">
          <div class="space-y-1">
            <h2 class="text-sm font-bold text-highlighted">
              فیلترها
            </h2>
            <p class="text-xs text-muted">
              دسته‌بندی، برند و ویژگی‌ها
            </p>
          </div>

          <PublicProductFilters
            :search-input="searchInput"
            :selected-category-id="selectedCategoryId"
            :selected-brand-id="selectedBrandId"
            :attribute-selections="attributeSelections"
            :categories="categories"
            :brands="brands"
            :filter-attributes="filterAttributes"
            @update:search-input="searchInput = $event"
            @update:selected-category-id="selectedCategoryId = $event"
            @update:selected-brand-id="selectedBrandId = $event"
            @update:attribute-selections="updateAttributeSelections"
            @clear="clearFilters"
          />

          <button
            type="button"
            class="text-xs font-medium text-primary transition-colors hover:text-primary/70"
            @click="clearFilters"
          >
            پاک کردن همه فیلترها
          </button>
        </div>

        <div class="shrink-0 px-5 py-4">
          <p
            v-if="!loading && products.length > 0"
            class="text-sm text-muted"
          >
            {{ totalProducts.toLocaleString('fa-IR') }} محصول یافت شد
          </p>
        </div>
      </aside>

      <section class="flex min-h-0 min-w-0 flex-1 flex-col">
        <div
          :class="[
            'flex shrink-0 items-center gap-3 bg-default px-4 py-3 lg:px-6',
            hasActiveFilters ? '' : 'lg:hidden'
          ]"
        >
          <UButton
            color="neutral"
            variant="soft"
            icon="i-lucide-sliders-horizontal"
            class="shrink-0 lg:hidden"
            @click="isFiltersOpen = true"
          >
            فیلترها
          </UButton>

          <PublicActiveFilterChips
            v-if="hasActiveFilters"
            class="min-w-0 flex-1"
            :search-input="searchInput"
            :selected-category-id="selectedCategoryId"
            :selected-brand-id="selectedBrandId"
            :attribute-selections="attributeSelections"
            :categories="categories"
            :brands="brands"
            :filter-attributes="filterAttributes"
            @remove-search="removeSearch"
            @remove-category="removeCategory"
            @remove-brand="removeBrand"
            @remove-attribute-value="removeAttributeValue"
            @clear="clearFilters"
          />
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto">
          <div
            v-if="loading"
            class="mx-auto grid w-full max-w-6xl grid-cols-2 gap-3 p-4 sm:gap-4 md:grid-cols-3 lg:p-6 xl:grid-cols-4"
          >
            <PublicProductCardSkeleton
              v-for="index in itemsPerPage"
              :key="index"
            />
          </div>

          <div
            v-else
            class="mx-auto grid w-full max-w-6xl grid-cols-2 gap-3 p-4 sm:gap-4 md:grid-cols-3 lg:p-6 xl:grid-cols-4"
          >
            <PublicProductCard
              v-for="product in products"
              :key="product.id"
              :product="product"
            />

            <div
              v-if="products.length === 0"
              class="col-span-full flex flex-col items-center justify-center gap-3 py-20 text-center"
            >
              <UIcon
                name="i-lucide-package-search"
                class="size-12 text-dimmed"
              />
              <p class="text-sm text-muted">
                محصولی با این فیلترها یافت نشد
              </p>
              <UButton
                color="neutral"
                variant="soft"
                size="sm"
                @click="clearFilters"
              >
                پاک کردن فیلترها
              </UButton>
            </div>
          </div>
        </div>

      </section>
    </div>

    <USlideover
      v-model:open="isFiltersOpen"
      title="فیلتر محصولات"
      side="right"
    >
      <template #body>
        <div
          class="flex flex-col gap-6"
          dir="rtl"
        >
          <PublicProductFilters
            :search-input="searchInput"
            :selected-category-id="selectedCategoryId"
            :selected-brand-id="selectedBrandId"
            :attribute-selections="attributeSelections"
            :categories="categories"
            :brands="brands"
            :filter-attributes="filterAttributes"
            @update:search-input="searchInput = $event"
            @update:selected-category-id="selectedCategoryId = $event"
            @update:selected-brand-id="selectedBrandId = $event"
            @update:attribute-selections="updateAttributeSelections"
            @clear="clearFilters"
          />

          <div class="flex items-center justify-between gap-3">
            <button
              type="button"
              class="text-xs font-medium text-primary"
              @click="clearFilters"
            >
              پاک کردن
            </button>
            <UButton
              color="primary"
              class="min-w-[7rem] justify-center"
              @click="isFiltersOpen = false"
            >
              اعمال
            </UButton>
          </div>
        </div>
      </template>
    </USlideover>
  </div>
</template>
