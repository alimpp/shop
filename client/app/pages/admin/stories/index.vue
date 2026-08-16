<script setup lang="ts">
import { storiesController } from "~/features/stories/controllers/index.controller";
import StoryDeleteConfirmModal from "~/features/stories/components/StoryDeleteConfirmModal.vue";
import StoryFormModal from "~/features/stories/components/StoryFormModal.vue";
import StoriesTable from "~/features/stories/components/StoriesTable.vue";
import { useStoriesDS } from "~/dataStore/index";
import type { TStory, TStoryPayload } from "~/features/stories/types/index.type";

definePageMeta({
  layout: "admin",
  middleware: "auth",
});

const storiesDS = useStoriesDS();
const toast = useToast();

const isFormModalOpen = ref(false);
const isDeleteConfirmOpen = ref(false);
const editingStory = ref<TStory | null>(null);
const storyPendingDelete = ref<TStory | null>(null);

const stories = computed(() => storiesDS.getStories);
const loading = computed(() => storiesDS.getLoading);
const submitting = computed(() => storiesDS.getSubmitting);

function openCreateModal(): void {
  editingStory.value = null;
  storiesDS.setSelectedStory(null);
  isFormModalOpen.value = true;
}

function openEditModal(story: TStory): void {
  editingStory.value = story;
  storiesDS.setSelectedStory(story);
  isFormModalOpen.value = true;
}

function openDeleteConfirm(story: TStory): void {
  storyPendingDelete.value = story;
  isDeleteConfirmOpen.value = true;
}

async function fetchStories(): Promise<void> {
  const response = await storiesController.getStories();

  if (!response.success) {
    toast.add({
      title: response.message || "دریافت استوری‌ها ناموفق بود",
      color: "error",
    });
  }
}

async function handleFormSubmit(payload: TStoryPayload, id: string | null): Promise<void> {
  const response = id
    ? await storiesController.updateStory(id, payload)
    : await storiesController.createStory(payload);

  toast.add({
    title: response.message || (response.success
      ? id
        ? "استوری با موفقیت ویرایش شد"
        : "استوری با موفقیت ایجاد شد"
      : "عملیات با خطا مواجه شد"),
    color: response.success ? "success" : "error",
  });

  if (!response.success) {
    return;
  }

  await fetchStories();
  isFormModalOpen.value = false;
}

async function handleDeleteConfirm(): Promise<void> {
  if (!storyPendingDelete.value) {
    return;
  }

  const response = await storiesController.deleteStory(storyPendingDelete.value.id);

  toast.add({
    title: response.message || (response.success
      ? "استوری با موفقیت حذف شد"
      : "حذف استوری با خطا مواجه شد"),
    color: response.success ? "success" : "error",
  });

  if (!response.success) {
    return;
  }

  await fetchStories();
  isDeleteConfirmOpen.value = false;
}

onMounted(async () => {
  await fetchStories();
});

watch(isFormModalOpen, (isOpen) => {
  if (!isOpen) {
    editingStory.value = null;
    storiesDS.setSelectedStory(null);
  }
});

watch(isDeleteConfirmOpen, (isOpen) => {
  if (!isOpen) {
    storyPendingDelete.value = null;
  }
});
</script>

<template>
  <UDashboardPanel id="stories">
    <template #header>
      <UDashboardNavbar title="استوری‌ها">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            color="primary"
            icon="i-lucide-image-plus"
            @click="openCreateModal"
          >
            ایجاد استوری
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-refresh-cw"
            :loading="loading"
            @click="fetchStories"
          >
            بروزرسانی
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <BaseDashboardPanelBody>
        <StoriesTable
          :stories="stories"
          :loading="loading"
          :submitting="submitting"
          @edit="openEditModal"
          @remove="openDeleteConfirm"
        />

        <StoryFormModal
          :open="isFormModalOpen"
          @update:open="(value) => isFormModalOpen = value"
          :story="editingStory"
          :submitting="submitting"
          @submit="handleFormSubmit"
        />

        <StoryDeleteConfirmModal
          :open="isDeleteConfirmOpen"
          @update:open="(value) => isDeleteConfirmOpen = value"
          :story="storyPendingDelete"
          :submitting="submitting"
          @confirm="handleDeleteConfirm"
        />
      </BaseDashboardPanelBody>
    </template>
  </UDashboardPanel>
</template>
