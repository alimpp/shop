<script setup lang="ts">
import type { TBanner } from "../types/index.type";

const props = defineProps<{
  open: boolean;
  banner: TBanner | null;
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
  <UModal v-model:open="modalOpen" title="حذف بنر">
    <template #body>
      <div class="space-y-5">
        <p class="text-sm leading-6 text-muted">
          آیا از حذف بنر
          <span class="font-semibold text-highlighted">
            {{ banner?.title ?? "انتخاب‌شده" }}
          </span>
          مطمئن هستید؟
        </p>

        <div class="grid grid-cols-2 gap-3">
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
            type="button"
            color="error"
            icon="i-lucide-trash-2"
            class="w-full justify-center"
            :loading="submitting"
            @click="emit('confirm')"
          >
            حذف بنر
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
