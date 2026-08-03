<script setup lang="ts">
import { categoriesController } from "~/features/categories/controllers/index.controller";
import { useCategoriesDS, useProductsDS } from "~/dataStore";
import { productsController } from "~/features/products/controllers/index.controller";
import ProductsTable from "~/features/products/components/ProductsTable.vue";
import ProductFormModal from "~/features/products/components/ProductFormModal.vue";
import ProductDeleteConfirmModal from "~/features/products/components/ProductDeleteConfirmModal.vue";
import ProductDetailsModal from "~/features/products/components/ProductDetailsModal.vue";
import ProductFiltersDrawer from "~/features/products/components/ProductFiltersDrawer.vue";
import type { TProduct, TProductAttributeWithValues, TProductBrandRef, TProductListQuery, TProductPayload } from "~/features/products/types/index.type";

definePageMeta({
  layout: "admin",
  middleware: "auth"
});

const productsDS = useProductsDS();
const categoriesDS = useCategoriesDS();
const toast = useToast();

const isFormModalOpen = ref(false);
const isDetailsModalOpen = ref(false);
const isDeleteConfirmOpen = ref(false);
const isFiltersDrawerOpen = ref(false);
const editingProduct = ref<TProduct | null>(null);
const viewingProduct = ref<TProduct | null>(null);
const productPendingDelete = ref<TProduct | null>(null);

const brands = ref<TProductBrandRef[]>([]);
const attributes = ref<TProductAttributeWithValues[]>([]);
const filterAttributes = ref<TProductAttributeWithValues[]>([]);
const productsMeta = ref<{ total: number; page: number; limit: number; totalPages: number } | null>(null);

const currentPage = ref(1);
const itemsPerPage = 5;

const searchInput = ref("");
const debouncedSearch = ref("");
const selectedCategoryId = ref<string>("");
const selectedBrandId = ref<string>("");
const attributeSelections = reactive<Record<string, string[]>>({});
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

const products = computed(() => productsDS.getProducts);
const categories = computed(() => categoriesDS.getCategories);
const loading = computed(() => productsDS.getLoading);
const submitting = computed(() => productsDS.getSubmitting);

const totalProducts = computed(() => productsMeta.value?.total ?? 0);
function resetAttributeSelections(): void {
  Object.keys(attributeSelections).forEach((key) => {
    delete attributeSelections[key];
  });
}

function buildAttributeValueIds(): string[] {
  return Array.from(
    new Set(
      Object.values(attributeSelections)
        .flatMap((ids) => ids ?? [])
        .filter(Boolean)
    )
  );
}

function buildFiltersQuery(): Omit<TProductListQuery, "page" | "limit"> {
  const attributeValueIds = buildAttributeValueIds();

  return {
    search: debouncedSearch.value.trim() || undefined,
    categoryId: selectedCategoryId.value || undefined,
    brandId: selectedBrandId.value || undefined,
    attributeValueIds: attributeValueIds.length ? attributeValueIds : undefined
  };
}

function buildProductsQuery(): TProductListQuery {
  return {
    ...buildFiltersQuery(),
    page: currentPage.value,
    limit: itemsPerPage
  };
}

function openCreateModal(): void {
  editingProduct.value = null;
  productsDS.setSelectedProduct(null);
  isFormModalOpen.value = true;
}

function openEditModal(product: TProduct): void {
  editingProduct.value = product;
  productsDS.setSelectedProduct(product);
  isFormModalOpen.value = true;
}

async function openDetailsModal(product: TProduct): Promise<void> {
  const response = await productsController.getProductById(product.id);

  if (!response.success) {
    toast.add({
      title: response.message || "دریافت جزئیات محصول ناموفق بود",
      color: "error"
    });
    return;
  }

  viewingProduct.value = response.data;
  isDetailsModalOpen.value = true;
}

function openDeleteConfirm(product: TProduct): void {
  productPendingDelete.value = product;
  isDeleteConfirmOpen.value = true;
}

async function fetchCategories(): Promise<void> {
  const response = await categoriesController.getCategories();

  if (!response.success) {
    toast.add({
      title: response.message || "دریافت دسته‌بندی‌ها ناموفق بود",
      color: "error"
    });
  }
}

async function fetchProducts(): Promise<void> {
  const response = await productsController.getProducts(buildProductsQuery());

  if (!response.success) {
    toast.add({
      title: response.message || "دریافت محصولات ناموفق بود",
      color: "error"
    });
    return;
  }

  productsMeta.value = response.data?.meta ?? null;
}

async function fetchFilterAttributes(): Promise<void> {
  const response = await productsController.getFilterAttributes(buildFiltersQuery());

  if (!response.success) {
    toast.add({
      title: response.message || "دریافت فیلترهای ویژگی ناموفق بود",
      color: "error"
    });
    return;
  }

  filterAttributes.value = (response.data ?? []).filter((attribute) => attribute.isFilterable !== false);

  const allowedValueIds = new Set(
    filterAttributes.value.flatMap((attribute) =>
      (attribute.values ?? []).map((value) => value.id)
    )
  );

  Object.keys(attributeSelections).forEach((attributeId) => {
    attributeSelections[attributeId] = (attributeSelections[attributeId] ?? []).filter((id) => allowedValueIds.has(id));
    if (!attributeSelections[attributeId].length) {
      delete attributeSelections[attributeId];
    }
  });
}

async function fetchBrands(): Promise<void> {
  const response = await productsController.getBrands();

  if (!response.success) {
    toast.add({
      title: response.message || "دریافت برندها ناموفق بود",
      color: "error"
    });
    return;
  }

  brands.value = response.data ?? [];
}

async function fetchAttributes(): Promise<void> {
  const response = await productsController.getAttributes();

  if (!response.success) {
    toast.add({
      title: response.message || "دریافت ویژگی‌ها ناموفق بود",
      color: "error"
    });
    return;
  }

  attributes.value = response.data ?? [];
}

async function refreshPage(): Promise<void> {
  await Promise.all([
    fetchCategories(),
    fetchBrands(),
    fetchAttributes(),
    fetchFilterAttributes(),
    fetchProducts()
  ]);
}

function clearFilters(): void {
  searchInput.value = "";
  debouncedSearch.value = "";
  selectedCategoryId.value = "";
  selectedBrandId.value = "";
  resetAttributeSelections();
  currentPage.value = 1;
}

function openFiltersDrawer(): void {
  isFiltersDrawerOpen.value = true;
}

function updateAttributeSelections(value: Record<string, string[]>): void {
  resetAttributeSelections();
  Object.entries(value).forEach(([key, ids]) => {
    attributeSelections[key] = ids;
  });
}

watch(searchInput, (value) => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }

  searchDebounceTimer = setTimeout(() => {
    debouncedSearch.value = value;
  }, 350);
});

watch(selectedCategoryId, () => {
  resetAttributeSelections();
});

watch([debouncedSearch, selectedCategoryId, selectedBrandId], async () => {
  const shouldFetchProducts = currentPage.value === 1;
  currentPage.value = 1;
  await fetchFilterAttributes();
  if (shouldFetchProducts) {
    await fetchProducts();
  }
});

watch(
  () => JSON.stringify(attributeSelections),
  async () => {
    const shouldFetchProducts = currentPage.value === 1;
    currentPage.value = 1;
    await fetchFilterAttributes();
    if (shouldFetchProducts) {
      await fetchProducts();
    }
  }
);

watch(currentPage, async () => {
  await fetchProducts();
});

async function handleFormSubmit(
  payload: TProductPayload,
  id: string | null
): Promise<void> {
  const response = id
    ? await productsController.updateProduct(id, payload)
    : await productsController.createProduct(payload);

  toast.add({
    title: response.message || (response.success
      ? id
        ? "محصول با موفقیت ویرایش شد"
        : "محصول با موفقیت ایجاد شد"
      : "عملیات با خطا مواجه شد"),
    color: response.success ? "success" : "error"
  });

  if (!response.success) {
    return;
  }

  await fetchProducts();
  isFormModalOpen.value = false;
}

async function handleDeleteConfirm(): Promise<void> {
  if (!productPendingDelete.value) {
    return;
  }

  const response = await productsController.deleteProduct(
    productPendingDelete.value.id
  );

  toast.add({
    title: response.message || (response.success
      ? "محصول با موفقیت حذف شد"
      : "حذف محصول با خطا مواجه شد"),
    color: response.success ? "success" : "error"
  });

  if (!response.success) {
    return;
  }

  if (editingProduct.value?.id === productPendingDelete.value.id) {
    editingProduct.value = null;
    productsDS.setSelectedProduct(null);
  }

  await fetchProducts();
  isDeleteConfirmOpen.value = false;
}

onMounted(async () => {
  await refreshPage();
});

watch(isFormModalOpen, (isOpen) => {
  if (!isOpen) {
    editingProduct.value = null;
    productsDS.setSelectedProduct(null);
  }
});

watch(isDeleteConfirmOpen, (isOpen) => {
  if (!isOpen) {
    productPendingDelete.value = null;
  }
});

watch(isDetailsModalOpen, (isOpen) => {
  if (!isOpen) {
    viewingProduct.value = null;
  }
});
</script>

<template>
  <UDashboardPanel id="products">
    <template #header>
      <UDashboardNavbar title="محصولات">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            color="primary"
            icon="i-lucide-package-plus"
            @click="openCreateModal"
          >
            ایجاد محصول
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-sliders-horizontal"
            @click="openFiltersDrawer"
          >
           <span>فیلترها</span>
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-refresh-cw"
            :loading="loading"
            @click="refreshPage"
          >
            <span>بروزرسانی</span>
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <BaseDashboardPanelBody>
        <ProductsTable
          :products="products"
          :loading="loading"
          :submitting="submitting"
          @view="openDetailsModal"
          @edit="openEditModal"
          @delete="openDeleteConfirm"
        />

        <UCard class="mt-4">
          <BasePaginationFooter
            v-model:page="currentPage"
            :items-per-page="itemsPerPage"
            :total="totalProducts"
            label="محصول"
          />
        </UCard>

        <ProductDetailsModal
          v-model:open="isDetailsModalOpen"
          :product="viewingProduct"
        />

        <ProductFiltersDrawer
          :open="isFiltersDrawerOpen"
          :search-input="searchInput"
          :selected-category-id="selectedCategoryId"
          :selected-brand-id="selectedBrandId"
          :attribute-selections="attributeSelections"
          :categories="categories"
          :brands="brands"
          :filter-attributes="filterAttributes"
          @update:open="isFiltersDrawerOpen = $event"
          @update:search-input="searchInput = $event"
          @update:selected-category-id="selectedCategoryId = $event"
          @update:selected-brand-id="selectedBrandId = $event"
          @update:attribute-selections="updateAttributeSelections"
          @clear="clearFilters"
        />

        <ProductFormModal
          v-model:open="isFormModalOpen"
          :product="editingProduct"
          :categories="categories"
          :brands="brands"
          :attributes="attributes"
          :submitting="submitting"
          @submit="handleFormSubmit"
        />

        <ProductDeleteConfirmModal
          v-model:open="isDeleteConfirmOpen"
          :product="productPendingDelete"
          :submitting="submitting"
          @confirm="handleDeleteConfirm"
        />
      </BaseDashboardPanelBody>
    </template>
  </UDashboardPanel>
</template>

<style scoped>
@media (max-width: 767px) {
  span{display: none;}
}
</style>