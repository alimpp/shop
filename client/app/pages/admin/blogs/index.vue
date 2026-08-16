<script setup lang="ts">
import { blogsController } from "~/features/blogs/controllers/index.controller";
import BlogDeleteConfirmModal from "~/features/blogs/components/BlogDeleteConfirmModal.vue";
import BlogFormModal from "~/features/blogs/components/BlogFormModal.vue";
import BlogsTable from "~/features/blogs/components/BlogsTable.vue";
import { useBlogsDS } from "~/dataStore/index";
import type { TBlog, TBlogPayload } from "~/features/blogs/types/index.type";

definePageMeta({
  layout: "admin",
  middleware: "auth",
});

const blogsDS = useBlogsDS();
const toast = useToast();

const isFormModalOpen = ref(false);
const isDeleteConfirmOpen = ref(false);
const editingBlog = ref<TBlog | null>(null);
const blogPendingDelete = ref<TBlog | null>(null);

const blogs = computed(() => blogsDS.getBlogs);
const loading = computed(() => blogsDS.getLoading);
const submitting = computed(() => blogsDS.getSubmitting);

function openCreateModal(): void {
  editingBlog.value = null;
  blogsDS.setSelectedBlog(null);
  isFormModalOpen.value = true;
}

function openEditModal(blog: TBlog): void {
  editingBlog.value = blog;
  blogsDS.setSelectedBlog(blog);
  isFormModalOpen.value = true;
}

function openDeleteConfirm(blog: TBlog): void {
  blogPendingDelete.value = blog;
  isDeleteConfirmOpen.value = true;
}

async function fetchBlogs(): Promise<void> {
  const response = await blogsController.getBlogs();

  if (!response.success) {
    toast.add({
      title: response.message || "دریافت بلاگ‌ها ناموفق بود",
      color: "error",
    });
  }
}

async function handleFormSubmit(payload: TBlogPayload, id: string | null): Promise<void> {
  const response = id
    ? await blogsController.updateBlog(id, payload)
    : await blogsController.createBlog(payload);

  toast.add({
    title: response.message || (response.success
      ? id
        ? "بلاگ با موفقیت ویرایش شد"
        : "بلاگ با موفقیت ایجاد شد"
      : "عملیات با خطا مواجه شد"),
    color: response.success ? "success" : "error",
  });

  if (!response.success) {
    return;
  }

  await fetchBlogs();
  isFormModalOpen.value = false;
}

async function handleDeleteConfirm(): Promise<void> {
  if (!blogPendingDelete.value) {
    return;
  }

  const response = await blogsController.deleteBlog(blogPendingDelete.value.id);

  toast.add({
    title: response.message || (response.success
      ? "بلاگ با موفقیت حذف شد"
      : "حذف بلاگ با خطا مواجه شد"),
    color: response.success ? "success" : "error",
  });

  if (!response.success) {
    return;
  }

  await fetchBlogs();
  isDeleteConfirmOpen.value = false;
}

onMounted(async () => {
  await fetchBlogs();
});

watch(isFormModalOpen, (isOpen) => {
  if (!isOpen) {
    editingBlog.value = null;
    blogsDS.setSelectedBlog(null);
  }
});

watch(isDeleteConfirmOpen, (isOpen) => {
  if (!isOpen) {
    blogPendingDelete.value = null;
  }
});
</script>

<template>
  <UDashboardPanel id="blogs">
    <template #header>
      <UDashboardNavbar title="بلاگ‌ها">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            color="primary"
            icon="i-lucide-file-plus-2"
            @click="openCreateModal"
          >
            ایجاد بلاگ
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-refresh-cw"
            :loading="loading"
            @click="fetchBlogs"
          >
            بروزرسانی
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <BaseDashboardPanelBody>
        <BlogsTable
          :blogs="blogs"
          :loading="loading"
          :submitting="submitting"
          @edit="openEditModal"
          @remove="openDeleteConfirm"
        />

        <BlogFormModal
          :open="isFormModalOpen"
          @update:open="(value) => isFormModalOpen = value"
          :blog="editingBlog"
          :submitting="submitting"
          @submit="handleFormSubmit"
        />

        <BlogDeleteConfirmModal
          :open="isDeleteConfirmOpen"
          @update:open="(value) => isDeleteConfirmOpen = value"
          :blog="blogPendingDelete"
          :submitting="submitting"
          @confirm="handleDeleteConfirm"
        />
      </BaseDashboardPanelBody>
    </template>
  </UDashboardPanel>
</template>
