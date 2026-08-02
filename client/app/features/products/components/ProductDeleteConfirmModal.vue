<script setup lang="ts">
import type { TProduct } from "../types/index.type";

const props = defineProps<{
  open: boolean;
  product: TProduct | null;
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
</script>

<template>
  <UModal v-model:open="modalOpen" title="حذف محصول">
    <template #body>
      <div class="space-y-5">
        <p class="text-sm leading-6 text-muted">
          آیا از حذف محصول
          <span class="font-semibold text-highlighted">
            {{ product?.name ?? "انتخاب‌شده" }}
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
            @click="modalOpen = false"
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
            حذف محصول
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
