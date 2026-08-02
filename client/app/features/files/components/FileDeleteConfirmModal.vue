<script setup lang="ts">
import type { TFileItem } from "../types/index.type";

const props = defineProps<{
  open: boolean;
  file: TFileItem | null;
  submitting: boolean;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  confirm: [];
}>();

const modalOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit("update:open", value)
});

function closeModal(): void {
  modalOpen.value = false;
}
</script>

<template>
  <UModal v-model:open="modalOpen" title="حذف فایل">
    <template #body>
      <div class="space-y-5">
        <p class="text-sm text-muted">
          آیا از حذف فایل
          <span class="font-bold text-highlighted">
            {{ file?.originalname ?? "انتخاب‌شده" }}
          </span>
          مطمئن هستید؟
        </p>

        <div class="flex items-center justify-end gap-2">
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
            color="error"
            icon="i-lucide-trash-2"
            :loading="submitting"
            @click="emit('confirm')"
          >
            حذف فایل
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
