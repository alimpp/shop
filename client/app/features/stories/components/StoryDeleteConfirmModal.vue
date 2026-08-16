<script setup lang="ts">
import type { TStory } from '../types/index.type';

const props = defineProps<{
  open: boolean;
  story: TStory | null;
  submitting: boolean;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  confirm: [];
}>();

const modalOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value),
});

function handleConfirm(): void {
  emit('confirm');
}
</script>

<template>
  <UModal v-model:open="modalOpen" title="حذف استوری">
    <template #body>
      <div class="space-y-4">
        <p>
          آیا از حذف استوری
          <strong>{{ props.story?.imageUrl ? 'با عکس ' + props.story.imageUrl : ' مورد انتخاب‌شده' }}</strong>
          مطمئن هستید؟
        </p>
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
          حذف استوری
        </UButton>
      </div>
    </template>
  </UModal>
</template>
