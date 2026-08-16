<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { z } from "zod";
import type { TAttribute, TAttributePayload } from "../types/index.type";

interface TAttributeFormState {
  name: string;
  slug: string;
  isFilterable: boolean;
  sortOrder: number;
}

const props = defineProps<{
  open: boolean;
  attribute: TAttribute | null;
  submitting: boolean;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  submit: [payload: TAttributePayload, id: string | null];
}>();

const attributeSchema = z.object({
  name: z.string().trim().min(2, "نام ویژگی باید حداقل ۲ کاراکتر باشد").max(100, "نام ویژگی باید حداکثر ۱۰۰ کاراکتر باشد"),
  slug: z.string().max(120, "اسلاگ ویژگی باید حداکثر ۱۲۰ کاراکتر باشد"),
  isFilterable: z.boolean(),
  sortOrder: z.number().min(0, "ترتیب باید صفر یا بیشتر باشد")
});

type AttributeSchema = z.output<typeof attributeSchema>;

const state = reactive<TAttributeFormState>({
  name: "",
  slug: "",
  isFilterable: true,
  sortOrder: 0
});

const modalOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit("update:open", value)
});

const isEditing = computed(() => Boolean(props.attribute?.id));

function resetState(): void {
  state.name = "";
  state.slug = "";
  state.isFilterable = true;
  state.sortOrder = 0;
}

function syncState(attribute: TAttribute | null): void {
  if (!attribute) {
    resetState();
    return;
  }

  state.name = attribute.name;
  state.slug = attribute.slug ?? "";
  state.isFilterable = attribute.isFilterable;
  state.sortOrder = attribute.sortOrder ?? 0;
}

function normalizePayload(data: AttributeSchema): TAttributePayload {
  return {
    name: data.name.trim(),
    slug: data.slug.trim() || undefined,
    isFilterable: data.isFilterable,
    sortOrder: data.sortOrder
  };
}

function closeModal(): void {
  modalOpen.value = false;
}

function handleSubmit(event: FormSubmitEvent<AttributeSchema>): void {
  emit("submit", normalizePayload(event.data), props.attribute?.id ?? null);
}

watch(
  () => [props.open, props.attribute] as const,
  ([isOpen, attribute]) => {
    if (!isOpen) {
      resetState();
      return;
    }

    syncState(attribute);
  },
  { immediate: true }
);
</script>

<template>
  <UModal v-model:open="modalOpen" :title="isEditing ? 'ویرایش ویژگی' : 'ایجاد ویژگی'">
    <template #body>
      <UForm
        :schema="attributeSchema"
        :state="state"
        class="space-y-4"
        @submit="handleSubmit"
      >
        <UFormField label="نام ویژگی" name="name">
          <UInput v-model="state.name" class="w-full" placeholder="مثلا رنگ" />
        </UFormField>

        <UFormField label="اسلاگ" name="slug">
          <UInput v-model="state.slug" class="w-full" dir="ltr" placeholder="color" />
        </UFormField>

        <UFormField label="ترتیب نمایش" name="sortOrder">
          <UInput
            v-model.number="state.sortOrder"
            class="w-full"
            type="number"
            min="0"
            placeholder="0"
          />
        </UFormField>

        <UCheckbox v-model="state.isFilterable" label="این ویژگی در فیلترها نمایش داده شود" />

        <div class="grid grid-cols-2 gap-3 pt-2">
          <UButton
            type="button"
            color="neutral"
            variant="outline"
            icon="i-lucide-x"
            class="w-full justify-center"
            :disabled="submitting"
            @click="closeModal"
          >
            انصراف
          </UButton>
          <UButton
            type="submit"
            :icon="isEditing ? 'i-lucide-save' : 'i-lucide-plus'"
            class="w-full justify-center"
            :loading="submitting"
          >
            {{ isEditing ? "ذخیره تغییرات" : "ایجاد ویژگی" }}
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
