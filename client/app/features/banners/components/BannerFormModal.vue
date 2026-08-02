<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import type { TBanner, TBannerPayload } from "../types/index.type";

interface TBannerFormState {
  title: string;
  subtitle: string;
  imageUrl: string;
  link: string;
  description: string;
  isActive: boolean;
}

const props = defineProps<{
  open: boolean;
  banner: TBanner | null;
  submitting: boolean;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  submit: [payload: TBannerPayload, id: string | null];
}>();

function isValidUrl(value: string): boolean {
  if (!value) {
    return true;
  }

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

const bannerSchema = z.object({
  title: z.string().trim().min(2, "عنوان بنر باید حداقل ۲ کاراکتر باشد").max(180, "عنوان بنر باید حداکثر ۱۸۰ کاراکتر باشد"),
  subtitle: z.string().max(220, "ساب‌تایتل باید حداکثر ۲۲۰ کاراکتر باشد"),
  imageUrl: z.string().trim()
    .min(1, "تصویر بنر الزامی است")
    .max(500, "آدرس تصویر باید حداکثر ۵۰۰ کاراکتر باشد")
    .refine((value) => isValidUrl(value), "تصویر باید یک لینک معتبر باشد"),
  link: z.string().trim()
    .max(1000, "لینک بنر باید حداکثر ۱۰۰۰ کاراکتر باشد")
    .refine((value) => isValidUrl(value), "آدرس باید یک لینک معتبر باشد"),
  description: z.string().max(4000, "توضیحات بنر باید حداکثر ۴۰۰۰ کاراکتر باشد"),
  isActive: z.boolean()
});

type BannerSchema = z.output<typeof bannerSchema>;

const state = reactive<TBannerFormState>({
  title: "",
  subtitle: "",
  imageUrl: "",
  link: "",
  description: "",
  isActive: true
});

const modalOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit("update:open", value)
});

const isEditing = computed(() => Boolean(props.banner?.id));

function resetState(): void {
  state.title = "";
  state.subtitle = "";
  state.imageUrl = "";
  state.link = "";
  state.description = "";
  state.isActive = true;
}

function syncState(banner: TBanner | null): void {
  if (!banner) {
    resetState();
    return;
  }

  state.title = banner.title;
  state.subtitle = banner.subtitle ?? "";
  state.imageUrl = banner.imageUrl ?? "";
  state.link = banner.link ?? "";
  state.description = banner.description ?? "";
  state.isActive = banner.isActive;
}

function normalizePayload(data: BannerSchema): TBannerPayload {
  return {
    title: data.title.trim(),
    subtitle: data.subtitle.trim() || undefined,
    imageUrl: data.imageUrl.trim(),
    link: data.link.trim() || undefined,
    description: data.description.trim() || undefined,
    isActive: data.isActive
  };
}

function closeModal(): void {
  modalOpen.value = false;
}

function handleSubmit(event: FormSubmitEvent<BannerSchema>): void {
  emit("submit", normalizePayload(event.data), props.banner?.id ?? null);
}

watch(
  () => [props.open, props.banner] as const,
  ([isOpen, banner]) => {
    if (!isOpen) {
      resetState();
      return;
    }

    syncState(banner);
  },
  { immediate: true }
);
</script>

<template>
  <UModal v-model:open="modalOpen" :title="isEditing ? 'ویرایش بنر' : 'ایجاد بنر'">
    <template #body>
      <UForm
        :schema="bannerSchema"
        :state="state"
        class="space-y-4"
        @submit="handleSubmit"
      >
        <UFormField label="عنوان" name="title">
          <UInput v-model="state.title" class="w-full" placeholder="مثلا پیشنهاد ویژه تابستان" />
        </UFormField>

        <UFormField label="ساب‌تایتل" name="subtitle">
          <UInput v-model="state.subtitle" class="w-full" placeholder="یک متن کوتاه زیر عنوان" />
        </UFormField>

        <UFormField label="تصویر بنر" name="imageUrl">
          <BaseFilePicker v-model="state.imageUrl" />
        </UFormField>

        <UFormField label="لینک" name="link">
          <UInput
            v-model="state.link"
            class="w-full"
            dir="ltr"
            placeholder="https://example.com/products/sale"
          />
        </UFormField>

        <UFormField label="توضیحات" name="description">
          <UTextarea
            v-model="state.description"
            class="w-full"
            :rows="4"
            placeholder="توضیحات کامل‌تر برای بنر"
          />
        </UFormField>

        <UCheckbox v-model="state.isActive" label="بنر فعال باشد" />

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
            :icon="isEditing ? 'i-lucide-save' : 'i-lucide-image-plus'"
            class="w-full justify-center"
            :loading="submitting"
          >
            {{ isEditing ? "ذخیره تغییرات" : "ایجاد بنر" }}
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
