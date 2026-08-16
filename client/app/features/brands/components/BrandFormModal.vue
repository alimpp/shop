<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import type { TBrand, TBrandPayload } from "../types/index.type";

interface TBrandFormState {
  name: string;
  slug: string;
  logo: string;
  description: string;
  isActive: boolean;
}

const props = defineProps<{
  open: boolean;
  brand: TBrand | null;
  submitting: boolean;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  submit: [payload: TBrandPayload, id: string | null];
}>();

const brandSchema = z.object({
  name: z.string().trim().min(2, "نام برند باید حداقل ۲ کاراکتر باشد").max(120, "نام برند باید حداکثر ۱۲۰ کاراکتر باشد"),
  slug: z.string().max(150, "اسلاگ برند باید حداکثر ۱۵۰ کاراکتر باشد"),
  logo: z.string().max(500, "آدرس لوگو باید حداکثر ۵۰۰ کاراکتر باشد"),
  description: z.string().max(4000, "توضیحات برند باید حداکثر ۴۰۰۰ کاراکتر باشد"),
  isActive: z.boolean()
});

type BrandSchema = z.output<typeof brandSchema>;

const state = reactive<TBrandFormState>({
  name: "",
  slug: "",
  logo: "",
  description: "",
  isActive: true
});

const modalOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit("update:open", value)
});

const isEditing = computed(() => Boolean(props.brand?.id));

function resetState(): void {
  state.name = "";
  state.slug = "";
  state.logo = "";
  state.description = "";
  state.isActive = true;
}

function syncState(brand: TBrand | null): void {
  if (!brand) {
    resetState();
    return;
  }

  state.name = brand.name;
  state.slug = brand.slug ?? "";
  state.logo = brand.logo ?? "";
  state.description = brand.description ?? "";
  state.isActive = brand.isActive;
}

function normalizePayload(data: BrandSchema): TBrandPayload {
  return {
    name: data.name.trim(),
    slug: data.slug.trim() || undefined,
    logo: data.logo.trim() || undefined,
    description: data.description.trim() || undefined,
    isActive: data.isActive
  };
}

function closeModal(): void {
  modalOpen.value = false;
}

function handleSubmit(event: FormSubmitEvent<BrandSchema>): void {
  emit("submit", normalizePayload(event.data), props.brand?.id ?? null);
}

watch(
  () => [props.open, props.brand] as const,
  ([isOpen, brand]) => {
    if (!isOpen) {
      resetState();
      return;
    }

    syncState(brand);
  },
  { immediate: true }
);
</script>

<template>
  <UModal v-model:open="modalOpen" :title="isEditing ? 'ویرایش برند' : 'ایجاد برند'">
    <template #body>
      <UForm
        :schema="brandSchema"
        :state="state"
        class="space-y-4"
        @submit="handleSubmit"
      >
        <UFormField label="نام برند" name="name">
          <UInput v-model="state.name" class="w-full" placeholder="مثلا اپل" />
        </UFormField>

        <UFormField label="اسلاگ" name="slug">
          <UInput v-model="state.slug" class="w-full" dir="ltr" placeholder="apple" />
        </UFormField>

        <UFormField label="لوگو" name="logo">
          <BaseFilePicker v-model="state.logo" />
        </UFormField>

        <UFormField label="توضیحات" name="description">
          <UTextarea
            v-model="state.description"
            class="w-full"
            :rows="4"
            placeholder="توضیح کوتاه برای برند"
          />
        </UFormField>

        <UCheckbox v-model="state.isActive" label="برند فعال باشد" />

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
            :icon="isEditing ? 'i-lucide-save' : 'i-lucide-folder-plus'"
            class="w-full justify-center"
            :loading="submitting"
          >
            {{ isEditing ? "ذخیره تغییرات" : "ایجاد برند" }}
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
