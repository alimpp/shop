<script setup lang="ts">
const props = defineProps<{
  url: string;
  label?: string;
}>();

const open = ref(false);

function openModal(): void {
  open.value = true;
}

function closeModal(): void {
  open.value = false;
}
</script>

<template>
  <div>
    <UButton
      type="button"
      color="neutral"
      variant="ghost"
      size="sm"
      icon="i-lucide-eye"
      @click="openModal"
    >
      {{ label ?? "مشاهده" }}
    </UButton>

    <UModal v-model:open="open" title="تصویر دسته‌بندی">
      <template #body>
        <div class="space-y-4">
          <div class="flex items-center justify-center rounded-lg border border-default bg-default/40 p-3">
            <img
              :src="url"
              alt="category image"
              class="max-h-[70vh] w-full object-contain"
              loading="lazy"
              decoding="async"
            >
          </div>

          <div class="flex items-center justify-end">
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
