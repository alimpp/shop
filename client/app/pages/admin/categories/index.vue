<script setup lang="ts">
import { categoriesController } from "~/features/categories/controllers/index.controller";
import CategoriesTable from "~/features/categories/components/CategoriesTable.vue";
import CategoryFormModal from "~/features/categories/components/CategoryFormModal.vue";
import CategoryDeleteConfirmModal from "~/features/categories/components/CategoryDeleteConfirmModal.vue";
import { useCategoriesDS } from "~/dataStore";
import type { TCategory, TCategoryPayload } from "~/features/categories/types/index.type";

definePageMeta({
  layout: "admin",
  middleware: "auth"
});

const categoriesDS = useCategoriesDS();
const toast = useToast();

const isFormModalOpen = ref(false);
const isDeleteConfirmOpen = ref(false);
const editingCategory = ref<TCategory | null>(null);
const categoryPendingDelete = ref<TCategory | null>(null);

const categories = computed(() => categoriesDS.getCategories);
const loading = computed(() => categoriesDS.getLoading);
const submitting = computed(() => categoriesDS.getSubmitting);

const parentCategories = computed(() =>
  categories.value.filter((category) => category.id !== editingCategory.value?.id)
);

function openCreateModal(): void {
  editingCategory.value = null;
  categoriesDS.setSelectedCategory(null);
  isFormModalOpen.value = true;
}

function openEditModal(category: TCategory): void {
  editingCategory.value = category;
  categoriesDS.setSelectedCategory(category);
  isFormModalOpen.value = true;
}

function openDeleteConfirm(category: TCategory): void {
  categoryPendingDelete.value = category;
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

async function handleFormSubmit(
  payload: TCategoryPayload,
  id: string | null
): Promise<void> {
  console.log(payload);
  
  const response = id
    ? await categoriesController.updateCategory(id, payload)
    : await categoriesController.createCategory(payload);

  toast.add({
    title: response.message || (response.success
      ? id
          ? "دسته‌بندی با موفقیت ویرایش شد"
          : "دسته‌بندی با موفقیت ایجاد شد"
      : "عملیات با خطا مواجه شد"),
    color: response.success ? "success" : "error"
  });

  if (!response.success) {
    return;
  }

  await fetchCategories();
  isFormModalOpen.value = false;
}

async function handleDeleteConfirm(): Promise<void> {
  if (!categoryPendingDelete.value) {
    return;
  }

  const response = await categoriesController.deleteCategory(
    categoryPendingDelete.value.id
  );

  toast.add({
    title: response.message || (response.success
      ? "دسته‌بندی با موفقیت حذف شد"
      : "حذف دسته‌بندی با خطا مواجه شد"),
    color: response.success ? "success" : "error"
  });

  if (!response.success) {
    return;
  }

  if (editingCategory.value?.id === categoryPendingDelete.value.id) {
    editingCategory.value = null;
    categoriesDS.setSelectedCategory(null);
  }

  await fetchCategories();
  isDeleteConfirmOpen.value = false;
}

onMounted(async () => {
  await fetchCategories();
});

watch(isFormModalOpen, (isOpen) => {
  if (!isOpen) {
    editingCategory.value = null;
    categoriesDS.setSelectedCategory(null);
  }
});

watch(isDeleteConfirmOpen, (isOpen) => {
  if (!isOpen) {
    categoryPendingDelete.value = null;
  }
});
</script>

<template>
  <UDashboardPanel id="categories">
    <template #header>
      <UDashboardNavbar title="دسته‌بندی‌ها">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            color="primary"
            icon="i-lucide-folder-plus"
            @click="openCreateModal"
          >
            ایجاد دسته‌بندی
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-refresh-cw"
            :loading="loading"
            @click="fetchCategories"
          >
            بروزرسانی
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <BaseDashboardPanelBody>
        <CategoriesTable
          :categories="categories"
          :loading="loading"
          :submitting="submitting"
          @edit="openEditModal"
          @delete="openDeleteConfirm"
        />

        <CategoryFormModal
          v-model:open="isFormModalOpen"
          :category="editingCategory"
          :parent-categories="parentCategories"
          :submitting="submitting"
          @submit="handleFormSubmit"
        />

        <CategoryDeleteConfirmModal
          v-model:open="isDeleteConfirmOpen"
          :category="categoryPendingDelete"
          :submitting="submitting"
          @confirm="handleDeleteConfirm"
        />
      </BaseDashboardPanelBody>
    </template>
  </UDashboardPanel>
</template>
