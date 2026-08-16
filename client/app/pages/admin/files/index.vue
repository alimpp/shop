<script setup lang="ts">
import { filesController } from "~/features/files/controllers/index.controller";
import FilesTable from "~/features/files/components/FilesTable.vue";
import FileUploadModal from "~/features/files/components/FileUploadModal.vue";
import FileDeleteConfirmModal from "~/features/files/components/FileDeleteConfirmModal.vue";
import { useFilesDS } from "~/dataStore/index";
import type { TFileItem } from "~/features/files/types/index.type";

definePageMeta({
  layout: "admin",
  middleware: "auth"
});

const filesDS = useFilesDS();
const toast = useToast();

const isUploadModalOpen = ref(false);
const isDeleteConfirmOpen = ref(false);
const filePendingDelete = ref<TFileItem | null>(null);

const files = computed(() => filesDS.getFiles);
const loading = computed(() => filesDS.getLoading);
const submitting = computed(() => filesDS.getSubmitting);

function openUploadModal(): void {
  isUploadModalOpen.value = true;
}

function openDeleteConfirm(file: TFileItem): void {
  filePendingDelete.value = file;
  isDeleteConfirmOpen.value = true;
}

async function fetchFiles(): Promise<void> {
  const response = await filesController.getFiles();

  if (!response.success) {
    toast.add({
      title: response.message || "دریافت فایل‌ها ناموفق بود",
      color: "error"
    });
  }
}

async function handleUpload(file: File): Promise<void> {
  const response = await filesController.uploadFile(file);

  toast.add({
    title: response.message || (response.success
      ? "فایل با موفقیت آپلود شد"
      : "آپلود فایل با خطا مواجه شد"),
    color: response.success ? "success" : "error"
  });

  if (!response.success) {
    return;
  }

  await fetchFiles();
  isUploadModalOpen.value = false;
}

async function handleDeleteConfirm(): Promise<void> {
  if (!filePendingDelete.value) {
    return;
  }

  const response = await filesController.deleteFile(filePendingDelete.value.id);

  toast.add({
    title: response.message || (response.success
      ? "فایل با موفقیت حذف شد"
      : "حذف فایل با خطا مواجه شد"),
    color: response.success ? "success" : "error"
  });

  if (!response.success) {
    return;
  }

  await fetchFiles();
  isDeleteConfirmOpen.value = false;
}

onMounted(async () => {
  await fetchFiles();
});

watch(isDeleteConfirmOpen, (isOpen) => {
  if (!isOpen) {
    filePendingDelete.value = null;
  }
});
</script>

<template>
  <UDashboardPanel id="files">
    <template #header>
      <UDashboardNavbar title="فایل‌ها">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            color="primary"
            icon="i-lucide-upload"
            @click="openUploadModal"
          >
            آپلود فایل
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-refresh-cw"
            :loading="loading"
            @click="fetchFiles"
          >
            بروزرسانی
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <BaseDashboardPanelBody>
        <FilesTable
          :files="files"
          :loading="loading"
          :submitting="submitting"
          @delete="openDeleteConfirm"
        />

        <FileUploadModal
          v-model:open="isUploadModalOpen"
          :submitting="submitting"
          @submit="handleUpload"
        />

        <FileDeleteConfirmModal
          v-model:open="isDeleteConfirmOpen"
          :file="filePendingDelete"
          :submitting="submitting"
          @confirm="handleDeleteConfirm"
        />
      </BaseDashboardPanelBody>
    </template>
  </UDashboardPanel>
</template>
