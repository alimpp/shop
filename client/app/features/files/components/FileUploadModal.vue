<script setup lang="ts">
const props = defineProps<{
  open: boolean;
  submitting: boolean;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  submit: [file: File];
}>();

const modalOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit("update:open", value)
});

const selectedFile = ref<File | null>(null);

function closeModal(): void {
  modalOpen.value = false;
}

function onFileChange(event: Event): void {
  const input = event.target as HTMLInputElement | null;
  selectedFile.value = input?.files?.item(0) ?? null;
}

function submit(): void {
  if (!selectedFile.value) {
    return;
  }

  emit("submit", selectedFile.value);
}

watch(
  () => modalOpen.value,
  (isOpen) => {
    if (!isOpen) {
      selectedFile.value = null;
    }
  }
);
</script>

<template>
  <UModal v-model:open="modalOpen" title="آپلود فایل">
    <template #body>
      <div class="space-y-4">
        <div>
          <p class="text-sm text-muted">
            یک فایل را انتخاب کنید و سپس آپلود را بزنید.
          </p>
        </div>

        <div class="space-y-2">
          <input
            type="file"
            class="w-full rounded-md border border-default bg-default px-3 py-2 text-sm outline-none"
            :disabled="submitting"
            @change="onFileChange"
          />

          <p v-if="selectedFile" class="text-sm text-toned">
            فایل انتخاب‌شده: {{ selectedFile.name }}
          </p>
        </div>

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
            type="button"
            color="primary"
            icon="i-lucide-upload"
            :disabled="!selectedFile"
            :loading="submitting"
            @click="submit"
          >
            آپلود
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
