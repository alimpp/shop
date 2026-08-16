<script setup lang="ts">
import AttributeDeleteConfirmModal from "~/features/attributes/components/AttributeDeleteConfirmModal.vue";
import AttributeFormModal from "~/features/attributes/components/AttributeFormModal.vue";
import AttributesTable from "~/features/attributes/components/AttributesTable.vue";
import AttributeValueDeleteConfirmModal from "~/features/attributes/components/AttributeValueDeleteConfirmModal.vue";
import AttributeValueFormModal from "~/features/attributes/components/AttributeValueFormModal.vue";
import { attributesController } from "~/features/attributes/controllers/index.controller";
import { useAttributesDS } from "~/dataStore";
import type {
  TAttribute,
  TAttributePayload,
  TAttributeValue,
  TAttributeValuePayload
} from "~/features/attributes/types/index.type";

definePageMeta({
  layout: "admin",
  middleware: "auth"
});

const attributesDS = useAttributesDS();
const toast = useToast();

const isAttributeFormModalOpen = ref(false);
const isAttributeDeleteConfirmOpen = ref(false);
const isValueFormModalOpen = ref(false);
const isValueDeleteConfirmOpen = ref(false);

const editingAttribute = ref<TAttribute | null>(null);
const attributePendingDelete = ref<TAttribute | null>(null);
const activeAttributeForValue = ref<TAttribute | null>(null);
const editingValue = ref<TAttributeValue | null>(null);
const attributeOfValuePendingDelete = ref<TAttribute | null>(null);
const valuePendingDelete = ref<TAttributeValue | null>(null);

const attributes = computed(() => attributesDS.getAttributes);
const loading = computed(() => attributesDS.getLoading);
const submitting = computed(() => attributesDS.getSubmitting);

function openCreateAttributeModal(): void {
  editingAttribute.value = null;
  attributesDS.setSelectedAttribute(null);
  isAttributeFormModalOpen.value = true;
}

function openEditAttributeModal(attribute: TAttribute): void {
  editingAttribute.value = attribute;
  attributesDS.setSelectedAttribute(attribute);
  isAttributeFormModalOpen.value = true;
}

function openAttributeDeleteConfirm(attribute: TAttribute): void {
  attributePendingDelete.value = attribute;
  attributesDS.setSelectedAttribute(attribute);
  isAttributeDeleteConfirmOpen.value = true;
}

function openCreateValueModal(attribute: TAttribute): void {
  activeAttributeForValue.value = attribute;
  editingValue.value = null;
  attributesDS.setSelectedAttribute(attribute);
  attributesDS.setSelectedAttributeValue(null);
  isValueFormModalOpen.value = true;
}

function openEditValueModal(attribute: TAttribute, value: TAttributeValue): void {
  activeAttributeForValue.value = attribute;
  editingValue.value = value;
  attributesDS.setSelectedAttribute(attribute);
  attributesDS.setSelectedAttributeValue(value);
  isValueFormModalOpen.value = true;
}

function openValueDeleteConfirm(attribute: TAttribute, value: TAttributeValue): void {
  attributeOfValuePendingDelete.value = attribute;
  valuePendingDelete.value = value;
  attributesDS.setSelectedAttribute(attribute);
  attributesDS.setSelectedAttributeValue(value);
  isValueDeleteConfirmOpen.value = true;
}

async function fetchAttributes(): Promise<void> {
  const response = await attributesController.getAttributes();

  if (!response.success) {
    toast.add({
      title: response.message || "دریافت ویژگی‌ها ناموفق بود",
      color: "error"
    });
  }
}

async function handleAttributeFormSubmit(
  payload: TAttributePayload,
  id: string | null
): Promise<void> {
  const response = id
    ? await attributesController.updateAttribute(id, payload)
    : await attributesController.createAttribute(payload);

  toast.add({
    title: response.message || (response.success
      ? id
        ? "ویژگی با موفقیت ویرایش شد"
        : "ویژگی با موفقیت ایجاد شد"
      : "عملیات با خطا مواجه شد"),
    color: response.success ? "success" : "error"
  });

  if (!response.success) {
    return;
  }

  await fetchAttributes();
  isAttributeFormModalOpen.value = false;
}

async function handleAttributeDeleteConfirm(): Promise<void> {
  if (!attributePendingDelete.value) {
    return;
  }

  const response = await attributesController.deleteAttribute(attributePendingDelete.value.id);

  toast.add({
    title: response.message || (response.success
      ? "ویژگی با موفقیت حذف شد"
      : "حذف ویژگی با خطا مواجه شد"),
    color: response.success ? "success" : "error"
  });

  if (!response.success) {
    return;
  }

  await fetchAttributes();
  isAttributeDeleteConfirmOpen.value = false;
}

async function handleValueFormSubmit(
  payload: TAttributeValuePayload,
  id: string | null,
  attributeId: string
): Promise<void> {
  const response = id
    ? await attributesController.updateValue(id, payload)
    : await attributesController.createValue(attributeId, payload);

  toast.add({
    title: response.message || (response.success
      ? id
        ? "مقدار ویژگی با موفقیت ویرایش شد"
        : "مقدار ویژگی با موفقیت ایجاد شد"
      : "عملیات با خطا مواجه شد"),
    color: response.success ? "success" : "error"
  });

  if (!response.success) {
    return;
  }

  await fetchAttributes();
  isValueFormModalOpen.value = false;
}

async function handleValueDeleteConfirm(): Promise<void> {
  if (!attributeOfValuePendingDelete.value || !valuePendingDelete.value) {
    return;
  }

  const response = await attributesController.deleteValue(
    attributeOfValuePendingDelete.value.id,
    valuePendingDelete.value.id
  );

  toast.add({
    title: response.message || (response.success
      ? "مقدار ویژگی با موفقیت حذف شد"
      : "حذف مقدار ویژگی با خطا مواجه شد"),
    color: response.success ? "success" : "error"
  });

  if (!response.success) {
    return;
  }

  await fetchAttributes();
  isValueDeleteConfirmOpen.value = false;
}

onMounted(async () => {
  await fetchAttributes();
});

watch(isAttributeFormModalOpen, (isOpen) => {
  if (!isOpen) {
    editingAttribute.value = null;
    attributesDS.setSelectedAttribute(null);
  }
});

watch(isAttributeDeleteConfirmOpen, (isOpen) => {
  if (!isOpen) {
    attributePendingDelete.value = null;
  }
});

watch(isValueFormModalOpen, (isOpen) => {
  if (!isOpen) {
    activeAttributeForValue.value = null;
    editingValue.value = null;
    attributesDS.setSelectedAttributeValue(null);
  }
});

watch(isValueDeleteConfirmOpen, (isOpen) => {
  if (!isOpen) {
    attributeOfValuePendingDelete.value = null;
    valuePendingDelete.value = null;
    attributesDS.setSelectedAttributeValue(null);
  }
});
</script>

<template>
  <UDashboardPanel id="attributes">
    <template #header>
      <UDashboardNavbar title="ویژگی‌ها">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            color="primary"
            icon="i-lucide-list-plus"
            @click="openCreateAttributeModal"
          >
            ایجاد ویژگی
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-refresh-cw"
            :loading="loading"
            @click="fetchAttributes"
          >
            بروزرسانی
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <BaseDashboardPanelBody>
        <AttributesTable
          :attributes="attributes"
          :loading="loading"
          :submitting="submitting"
          @edit="openEditAttributeModal"
          @delete="openAttributeDeleteConfirm"
          @add-value="openCreateValueModal"
          @edit-value="openEditValueModal"
          @delete-value="openValueDeleteConfirm"
        />

        <AttributeFormModal
          v-model:open="isAttributeFormModalOpen"
          :attribute="editingAttribute"
          :submitting="submitting"
          @submit="handleAttributeFormSubmit"
        />

        <AttributeDeleteConfirmModal
          v-model:open="isAttributeDeleteConfirmOpen"
          :attribute="attributePendingDelete"
          :submitting="submitting"
          @confirm="handleAttributeDeleteConfirm"
        />

        <AttributeValueFormModal
          v-model:open="isValueFormModalOpen"
          :attribute="activeAttributeForValue"
          :value-item="editingValue"
          :submitting="submitting"
          @submit="handleValueFormSubmit"
        />

        <AttributeValueDeleteConfirmModal
          v-model:open="isValueDeleteConfirmOpen"
          :attribute="attributeOfValuePendingDelete"
          :value-item="valuePendingDelete"
          :submitting="submitting"
          @confirm="handleValueDeleteConfirm"
        />
      </BaseDashboardPanelBody>
    </template>
  </UDashboardPanel>
</template>
