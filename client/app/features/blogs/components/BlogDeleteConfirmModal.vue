<script setup lang="ts">
import type { TBlog } from "../types/index.type";

const props = defineProps<{
  open: boolean;
  blog: TBlog | null;
  submitting: boolean;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  confirm: [];
}>();

const modalOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit("update:open", value),
});

function handleConfirm(): void {
  emit("confirm");
}
</script>

<template>
  <UModal v-model:open="modalOpen" title="حذف بلاگ">
    <template #body>
      <div class="space-y-4">
        <p>
          آیا از حذف بلاگ
          <strong>{{ props.blog?.title ? `«${props.blog.title}»` : ' مورد انتخاب‌شده' }}</strong>
          مطمئن هستید؟
        </p>
        <p class="text-sm text-muted">بخش‌ها و ارتباط با محصولات این بلاگ نیز حذف خواهند شد.</p>
      </div>
    </template>

    <template #footer>
      <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <UButton
          color="neutral"
          variant="outline"
          class="w-full sm:w-auto"
          :disabled="submitting"
          @click="modalOpen = false"
        >
          انصراف
        </UButton>
        <UButton
          color="error"
          class="w-full sm:w-auto"
          :loading="submitting"
          @click="handleConfirm"
        >
          حذف بلاگ
        </UButton>
      </div>
    </template>
  </UModal>
</template>
