<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

import type { TCategory, TCategoryPayload } from "../types/index.type";

interface TCategoryFormState {
  name: string;
  description: string;
  image: string;
  parentId: string;
  isActive: boolean;
  sortOrder: number;
}

const props = defineProps<{
  open: boolean;
  category: TCategory | null;
  parentCategories: TCategory[];
  submitting: boolean;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  submit: [payload: TCategoryPayload, id: string | null];
}>();

const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "نام دسته‌بندی باید حداقل ۲ کاراکتر باشد")
    .max(100, "نام دسته‌بندی باید حداکثر ۱۰۰ کاراکتر باشد"),
  description: z
    .string()
    .max(1000, "توضیحات باید حداکثر ۱۰۰۰ کاراکتر باشد"),
  image: z
    .string()
    .max(2048, "آدرس تصویر باید حداکثر ۲۰۴۸ کاراکتر باشد"),
  parentId: z.union([
    z.literal(""),
    z
      .string()
      .regex(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
        "شناسه والد معتبر نیست"
      )
  ]),
  isActive: z.boolean(),
  sortOrder: z.coerce
    .number()
    .int("ترتیب باید عدد صحیح باشد")
    .min(0, "ترتیب باید حداقل ۰ باشد")
    .max(9999, "ترتیب باید حداکثر ۹۹۹۹ باشد")
});

type CategorySchema = z.output<typeof categorySchema>;

const state = reactive<TCategoryFormState>({
  name: "",
  description: "",
  image: "",
  parentId: "",
  isActive: true,
  sortOrder: 0
});

const modalOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit("update:open", value)
});

const isEditing = computed(() => Boolean(props.category?.id));
const modalTitle = computed(() =>
  isEditing.value ? "ویرایش دسته‌بندی" : "ایجاد دسته‌بندی"
);
const modalDescription = computed(() =>
  isEditing.value
    ? `در حال ویرایش: ${props.category?.name ?? ""}`
    : "اطلاعات دسته‌بندی جدید را وارد کنید."
);

function resetState(): void {
  state.name = "";
  state.description = "";
  state.image = "";
  state.parentId = "";
  state.isActive = true;
  state.sortOrder = 0;
}

function syncState(category: TCategory | null): void {
  if (!category) {
    resetState();
    return;
  }

  state.name = category.name;
  state.description = category.description ?? "";
  state.image = category.image ?? "";
  state.parentId = category.parentId ?? "";
  state.isActive = category.isActive;
  state.sortOrder = category.sortOrder ?? 0;
}

function normalizePayload(data: CategorySchema): TCategoryPayload {
  return {
    name: data.name.trim(),
    description: data.description.trim() || undefined,
    image: data.image.trim() || undefined,
    parentId: data.parentId || undefined,
    isActive: data.isActive,
    sortOrder: data.sortOrder
  };
}

function closeModal(): void {
  modalOpen.value = false;
}

function handleSubmit(event: FormSubmitEvent<CategorySchema>): void {
  emit("submit", normalizePayload(event.data), props.category?.id ?? null);
}

watch(
  () => [props.open, props.category] as const,
  ([isOpen, category]) => {
    if (!isOpen) {
      resetState();
      return;
    }

    syncState(category);
  },
  { immediate: true }
);
</script>

<template>
  <UModal v-model:open="modalOpen" :title="modalTitle">
    <template #body>
      <div class="space-y-4">
        <div>
          <p class="text-sm text-muted">
            {{ modalDescription }}
          </p>
        </div>

        <UForm
          :schema="categorySchema"
          :state="state"
          class="space-y-4"
          @submit="handleSubmit"
        >
          <UFormField label="نام دسته‌بندی" name="name">
            <UInput
              v-model="state.name"
              class="w-full"
              placeholder="مثلا پوشاک"
            />
          </UFormField>

          <UFormField label="توضیحات" name="description">
            <UTextarea
              v-model="state.description"
              class="w-full"
              :rows="4"
              placeholder="توضیح کوتاه برای دسته‌بندی"
            />
          </UFormField>

          <UFormField label="تصویر" name="image">
            <BaseFilePicker v-model="state.image" />
          </UFormField>

          <UFormField label="والد" name="parentId">
            <select
              v-model="state.parentId"
              class="w-full rounded-md border border-default bg-default px-3 py-2 text-sm outline-none"
            >
              <option value="">بدون والد</option>
              <option
                v-for="category in parentCategories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
          </UFormField>

          <UFormField label="ترتیب نمایش" name="sortOrder">
            <UInput
              v-model.number="state.sortOrder"
              class="w-full"
              type="number"
              min="0"
              max="9999"
            />
          </UFormField>

          <UCheckbox
            v-model="state.isActive"
            label="دسته‌بندی فعال باشد"
          />

          <div class="flex items-center justify-end gap-2 pt-2">
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              icon="i-lucide-x"
              :disabled="submitting"
              @click="closeModal"
            >
              انصراف
            </UButton>
            <UButton
              type="submit"
              :icon="isEditing ? 'i-lucide-save' : 'i-lucide-folder-plus'"
              :loading="submitting"
            >
              {{ isEditing ? "ذخیره تغییرات" : "ایجاد دسته‌بندی" }}
            </UButton>
          </div>
        </UForm>
      </div>
    </template>
  </UModal>
</template>
