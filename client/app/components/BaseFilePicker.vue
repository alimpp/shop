<script setup lang="ts">
import { filesController } from "~/features/files/controllers/index.controller";
import { useFilesDS } from "~/dataStore/index";
import type { TFileItem } from "~/features/files/types/index.type";

const props = withDefaults(defineProps<{
  modelValue: string | string[];
  multiple?: boolean;
  disabled?: boolean;
}>(), {
  multiple: false,
  disabled: false
});

const emit = defineEmits<{
  "update:modelValue": [value: string | string[]];
}>();

const filesDS = useFilesDS();
const config = useRuntimeConfig();

const isModalOpen = ref(false);
const isLoading = ref(false);

const imageFiles = computed(() =>
  filesDS.getFiles.filter((file) => file.mimetype.startsWith("image/"))
);

const selectedValues = computed<string[]>(() =>
  Array.isArray(props.modelValue)
    ? props.modelValue.filter(Boolean)
    : props.modelValue
      ? [props.modelValue]
      : []
);

function extractFileId(value: string): string | null {
  const match = String(value).match(/\/files\/([0-9a-f-]{36})/i);
  return match?.[1] ?? null;
}

const selectedPreviews = computed(() => {
  return selectedValues.value.map((value) => {
    const id = extractFileId(value);
    const file = id
      ? imageFiles.value.find((item) => item.id === id)
      : imageFiles.value.find((item) => buildFileUrl(item) === value);

    return {
      key: id ?? value,
      url: value,
      name: file?.originalname
    };
  });
});

function buildFileUrl(file: TFileItem): string {
  const apiBase = String(config.public.apiBase ?? "http://localhost:4000").replace(
    /\/+$/,
    ""
  );

  return `${apiBase}/files/${file.id}`;
}

async function fetchImages(): Promise<void> {
  isLoading.value = true;

  try {
    await filesController.getFiles();
  } finally {
    isLoading.value = false;
  }
}

function openModal(): void {
  isModalOpen.value = true;
}

function closeModal(): void {
  isModalOpen.value = false;
}

function clearSelection(): void {
  emit("update:modelValue", props.multiple ? [] : "");
}

function isSelected(file: TFileItem): boolean {
  return selectedValues.value.includes(buildFileUrl(file));
}

function toggleSelection(file: TFileItem): void {
  const url = buildFileUrl(file);

  if (!props.multiple) {
    emit("update:modelValue", url);
    isModalOpen.value = false;
    return;
  }

  const next = new Set(selectedValues.value);
  if (next.has(url)) {
    next.delete(url);
  } else {
    next.add(url);
  }

  emit("update:modelValue", Array.from(next));
}

watch(isModalOpen, async (isOpen) => {
  if (isOpen) {
    await fetchImages();
  }
});
</script>

<template>
  <div class="space-y-3">
    <div
      v-if="selectedPreviews.length"
      class="grid gap-3"
      :class="multiple ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1'"
    >
      <div
        v-for="preview in selectedPreviews"
        :key="preview.key"
        class="overflow-hidden rounded-lg border border-default bg-elevated/30"
      >
        <div class="flex h-60 items-center justify-center bg-default/40 p-2">
          <img
            :src="preview.url"
            :alt="preview.name ?? 'selected image'"
            class="max-h-full w-full object-contain"
            loading="lazy"
            decoding="async"
          >
        </div>
        <div class="space-y-1 p-3">
          <p class="truncate text-sm font-medium text-highlighted">
            {{ preview.name ?? "تصویر انتخاب‌شده" }}
          </p>
          <p class="truncate text-xs text-muted" dir="ltr">
            {{ preview.url }}
          </p>
        </div>
      </div>
    </div>

    <div
      v-else
      class="rounded-lg border border-dashed border-default p-4 text-sm text-muted"
    >
      هنوز تصویری انتخاب نشده است.
    </div>

    <div class="flex items-center justify-end gap-2">
      <UButton
        type="button"
        color="neutral"
        variant="ghost"
        icon="i-lucide-trash-2"
        :disabled="disabled || !selectedValues.length"
        @click="clearSelection"
      >
        حذف انتخاب
      </UButton>
      <UButton
        type="button"
        color="primary"
        icon="i-lucide-image-plus"
        :disabled="disabled"
        @click="openModal"
      >
        {{ multiple ? "انتخاب تصاویر" : "انتخاب تصویر" }}
      </UButton>
    </div>

    <UModal v-model:open="isModalOpen" :title="multiple ? 'انتخاب تصاویر' : 'انتخاب تصویر'">
      <template #body>
        <div class="space-y-4">
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm text-muted">
              روی تصویر کلیک کنید تا انتخاب شود.
            </p>
            <UButton
              type="button"
              color="neutral"
              variant="outline"
              icon="i-lucide-refresh-cw"
              :loading="isLoading"
              @click="fetchImages"
            >
              بروزرسانی
            </UButton>
          </div>

          <div v-if="isLoading" class="py-10 text-center text-sm text-muted">
            در حال دریافت تصاویر...
          </div>

          <div
            v-else-if="!imageFiles.length"
            class="rounded-lg border border-dashed border-default p-8 text-center text-sm text-muted"
          >
            هنوز هیچ تصویر آپلود شده‌ای وجود ندارد.
          </div>

          <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <button
              v-for="file in imageFiles"
              :key="file.id"
              type="button"
              class="overflow-hidden rounded-lg border text-right transition-all"
              :class="isSelected(file)
                ? 'border-primary ring-2 ring-primary/30'
                : 'border-default hover:border-primary/60'"
              @click="toggleSelection(file)"
            >
              <div class="flex h-40 items-center justify-center bg-default/40 p-2">
                <img
                  :src="buildFileUrl(file)"
                  :alt="file.originalname"
                  class="max-h-full w-full object-contain"
                  loading="lazy"
                  decoding="async"
                >
              </div>
              <div class="space-y-1 p-3">
                <p class="truncate text-sm font-medium text-highlighted">
                  {{ file.originalname }}
                </p>
                <p class="truncate text-xs text-muted" dir="ltr">
                  {{ buildFileUrl(file) }}
                </p>
              </div>
            </button>
          </div>

          <div class="flex items-center justify-end gap-2">
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              icon="i-lucide-x"
              @click="closeModal"
            >
              بستن
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
