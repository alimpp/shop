<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { z } from "zod";
import type {
  TAttribute,
  TAttributeValue,
  TAttributeValuePayload
} from "../types/index.type";

interface TAttributeValueFormState {
  value: string;
  slug: string;
  sortOrder: number;
}

const props = defineProps<{
  open: boolean;
  attribute: TAttribute | null;
  valueItem: TAttributeValue | null;
  submitting: boolean;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  submit: [payload: TAttributeValuePayload, id: string | null, attributeId: string];
}>();

const attributeValueSchema = z.object({
  value: z.string().trim().min(1, "عنوان مقدار الزامی است").max(120, "عنوان مقدار باید حداکثر ۱۲۰ کاراکتر باشد"),
  slug: z.string().max(120, "اسلاگ مقدار باید حداکثر ۱۲۰ کاراکتر باشد"),
  sortOrder: z.number().min(0, "ترتیب باید صفر یا بیشتر باشد")
});

type AttributeValueSchema = z.output<typeof attributeValueSchema>;

const state = reactive<TAttributeValueFormState>({
  value: "",
  slug: "",
  sortOrder: 0
});

const modalOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit("update:open", value)
});

const isEditing = computed(() => Boolean(props.valueItem?.id));

const modalTitle = computed(() =>
  isEditing.value ? "ویرایش مقدار ویژگی" : "ایجاد مقدار ویژگی"
);

function resetState(): void {
  state.value = "";
  state.slug = "";
  state.sortOrder = 0;
}

function syncState(valueItem: TAttributeValue | null): void {
  if (!valueItem) {
    resetState();
    return;
  }

  state.value = valueItem.value;
  state.slug = valueItem.slug ?? "";
  state.sortOrder = valueItem.sortOrder ?? 0;
}

function normalizePayload(data: AttributeValueSchema): TAttributeValuePayload {
  return {
    value: data.value.trim(),
    slug: data.slug.trim() || undefined,
    sortOrder: data.sortOrder
  };
}

function closeModal(): void {
  modalOpen.value = false;
}

function handleSubmit(event: FormSubmitEvent<AttributeValueSchema>): void {
  if (!props.attribute?.id) {
    return;
  }

  emit(
    "submit",
    normalizePayload(event.data),
    props.valueItem?.id ?? null,
    props.attribute.id
  );
}

watch(
  () => [props.open, props.valueItem] as const,
  ([isOpen, valueItem]) => {
    if (!isOpen) {
      resetState();
      return;
    }

    syncState(valueItem);
  },
  { immediate: true }
);
</script>

<template>
  <UModal v-model:open="modalOpen" :title="modalTitle">
    <template #body>
      <div class="space-y-4">
        <div class="rounded-lg border border-default bg-default/30 px-3 py-2 text-sm text-toned">
          ویژگی انتخاب‌شده:
          <span class="font-semibold text-highlighted">
            {{ attribute?.name ?? "ثبت نشده" }}
          </span>
        </div>

        <UForm
          :schema="attributeValueSchema"
          :state="state"
          class="space-y-4"
          @submit="handleSubmit"
        >
          <UFormField label="عنوان مقدار" name="value">
            <UInput v-model="state.value" class="w-full" placeholder="مثلا قرمز" />
          </UFormField>

          <UFormField label="اسلاگ" name="slug">
            <UInput v-model="state.slug" class="w-full" dir="ltr" placeholder="red" />
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
              :disabled="!attribute"
            >
              {{ isEditing ? "ذخیره تغییرات" : "ایجاد مقدار" }}
            </UButton>
          </div>
        </UForm>
      </div>
    </template>
  </UModal>
</template>
