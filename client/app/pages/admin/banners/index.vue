<script setup lang="ts">
import { bannersController } from "~/features/banners/controllers/index.controller";
import BannerDeleteConfirmModal from "~/features/banners/components/BannerDeleteConfirmModal.vue";
import BannerFormModal from "~/features/banners/components/BannerFormModal.vue";
import BannersTable from "~/features/banners/components/BannersTable.vue";
import { BannersDS } from "~/features/banners/data/index.store";
import type { TBanner, TBannerPayload } from "~/features/banners/types/index.type";

definePageMeta({
  layout: "admin",
  middleware: "auth"
});

const bannersDS = BannersDS.getInstance();
const toast = useToast();

const isFormModalOpen = ref(false);
const isDeleteConfirmOpen = ref(false);
const editingBanner = ref<TBanner | null>(null);
const bannerPendingDelete = ref<TBanner | null>(null);

const banners = computed(() => bannersDS.getBanners);
const loading = computed(() => bannersDS.getLoading);
const submitting = computed(() => bannersDS.getSubmitting);

function openCreateModal(): void {
  editingBanner.value = null;
  bannersDS.setSelectedBanner(null);
  isFormModalOpen.value = true;
}

function openEditModal(banner: TBanner): void {
  editingBanner.value = banner;
  bannersDS.setSelectedBanner(banner);
  isFormModalOpen.value = true;
}

function openDeleteConfirm(banner: TBanner): void {
  bannerPendingDelete.value = banner;
  isDeleteConfirmOpen.value = true;
}

async function fetchBanners(): Promise<void> {
  const response = await bannersController.getBanners();

  if (!response.success) {
    toast.add({
      title: response.message || "دریافت بنرها ناموفق بود",
      color: "error"
    });
  }
}

async function handleFormSubmit(payload: TBannerPayload, id: string | null): Promise<void> {
  const response = id
    ? await bannersController.updateBanner(id, payload)
    : await bannersController.createBanner(payload);

  toast.add({
    title: response.message || (response.success
      ? id
        ? "بنر با موفقیت ویرایش شد"
        : "بنر با موفقیت ایجاد شد"
      : "عملیات با خطا مواجه شد"),
    color: response.success ? "success" : "error"
  });

  if (!response.success) {
    return;
  }

  await fetchBanners();
  isFormModalOpen.value = false;
}

async function handleDeleteConfirm(): Promise<void> {
  if (!bannerPendingDelete.value) {
    return;
  }

  const response = await bannersController.deleteBanner(bannerPendingDelete.value.id);

  toast.add({
    title: response.message || (response.success
      ? "بنر با موفقیت حذف شد"
      : "حذف بنر با خطا مواجه شد"),
    color: response.success ? "success" : "error"
  });

  if (!response.success) {
    return;
  }

  await fetchBanners();
  isDeleteConfirmOpen.value = false;
}

onMounted(async () => {
  await fetchBanners();
});

watch(isFormModalOpen, (isOpen) => {
  if (!isOpen) {
    editingBanner.value = null;
    bannersDS.setSelectedBanner(null);
  }
});

watch(isDeleteConfirmOpen, (isOpen) => {
  if (!isOpen) {
    bannerPendingDelete.value = null;
  }
});
</script>

<template>
  <UDashboardPanel id="banners">
    <template #header>
      <UDashboardNavbar title="بنرها">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            color="primary"
            icon="i-lucide-image-plus"
            @click="openCreateModal"
          >
            ایجاد بنر
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-refresh-cw"
            :loading="loading"
            @click="fetchBanners"
          >
            بروزرسانی
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <BaseDashboardPanelBody>
        <BannersTable
          :banners="banners"
          :loading="loading"
          :submitting="submitting"
          @edit="openEditModal"
          @delete="openDeleteConfirm"
        />

        <BannerFormModal
          v-model:open="isFormModalOpen"
          :banner="editingBanner"
          :submitting="submitting"
          @submit="handleFormSubmit"
        />

        <BannerDeleteConfirmModal
          v-model:open="isDeleteConfirmOpen"
          :banner="bannerPendingDelete"
          :submitting="submitting"
          @confirm="handleDeleteConfirm"
        />
      </BaseDashboardPanelBody>
    </template>
  </UDashboardPanel>
</template>
