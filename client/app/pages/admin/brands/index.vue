<script setup lang="ts">
import { brandsController } from "~/features/brands/controllers/index.controller";
import BrandDeleteConfirmModal from "~/features/brands/components/BrandDeleteConfirmModal.vue";
import BrandFormModal from "~/features/brands/components/BrandFormModal.vue";
import BrandsTable from "~/features/brands/components/BrandsTable.vue";
import { useBrandsDS } from "~/dataStore/index";
import type { TBrand, TBrandPayload } from "~/features/brands/types/index.type";

definePageMeta({
  layout: "admin",
  middleware: "auth"
});

const brandsDS = useBrandsDS();
const toast = useToast();

const isFormModalOpen = ref(false);
const isDeleteConfirmOpen = ref(false);
const editingBrand = ref<TBrand | null>(null);
const brandPendingDelete = ref<TBrand | null>(null);

const brands = computed(() => brandsDS.getBrands);
const loading = computed(() => brandsDS.getLoading);
const submitting = computed(() => brandsDS.getSubmitting);

function openCreateModal(): void {
  editingBrand.value = null;
  brandsDS.setSelectedBrand(null);
  isFormModalOpen.value = true;
}

function openEditModal(brand: TBrand): void {
  editingBrand.value = brand;
  brandsDS.setSelectedBrand(brand);
  isFormModalOpen.value = true;
}

function openDeleteConfirm(brand: TBrand): void {
  brandPendingDelete.value = brand;
  isDeleteConfirmOpen.value = true;
}

async function fetchBrands(): Promise<void> {
  const response = await brandsController.getBrands();

  if (!response.success) {
    toast.add({
      title: response.message || "دریافت برندها ناموفق بود",
      color: "error"
    });
  }
}

async function handleFormSubmit(payload: TBrandPayload, id: string | null): Promise<void> {
  const response = id
    ? await brandsController.updateBrand(id, payload)
    : await brandsController.createBrand(payload);

  toast.add({
    title: response.message || (response.success
      ? id
        ? "برند با موفقیت ویرایش شد"
        : "برند با موفقیت ایجاد شد"
      : "عملیات با خطا مواجه شد"),
    color: response.success ? "success" : "error"
  });

  if (!response.success) {
    return;
  }

  await fetchBrands();
  isFormModalOpen.value = false;
}

async function handleDeleteConfirm(): Promise<void> {
  if (!brandPendingDelete.value) {
    return;
  }

  const response = await brandsController.deleteBrand(brandPendingDelete.value.id);

  toast.add({
    title: response.message || (response.success
      ? "برند با موفقیت حذف شد"
      : "حذف برند با خطا مواجه شد"),
    color: response.success ? "success" : "error"
  });

  if (!response.success) {
    return;
  }

  await fetchBrands();
  isDeleteConfirmOpen.value = false;
}

onMounted(async () => {
  await fetchBrands();
});

watch(isFormModalOpen, (isOpen) => {
  if (!isOpen) {
    editingBrand.value = null;
    brandsDS.setSelectedBrand(null);
  }
});

watch(isDeleteConfirmOpen, (isOpen) => {
  if (!isOpen) {
    brandPendingDelete.value = null;
  }
});
</script>

<template>
  <UDashboardPanel id="brands">
    <template #header>
      <UDashboardNavbar title="برندها">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            color="primary"
            icon="i-lucide-badge-plus"
            @click="openCreateModal"
          >
            ایجاد برند
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-refresh-cw"
            :loading="loading"
            @click="fetchBrands"
          >
            بروزرسانی
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <BaseDashboardPanelBody>
        <BrandsTable
          :brands="brands"
          :loading="loading"
          :submitting="submitting"
          @edit="openEditModal"
          @delete="openDeleteConfirm"
        />

        <BrandFormModal
          v-model:open="isFormModalOpen"
          :brand="editingBrand"
          :submitting="submitting"
          @submit="handleFormSubmit"
        />

        <BrandDeleteConfirmModal
          v-model:open="isDeleteConfirmOpen"
          :brand="brandPendingDelete"
          :submitting="submitting"
          @confirm="handleDeleteConfirm"
        />
      </BaseDashboardPanelBody>
    </template>
  </UDashboardPanel>
</template>
