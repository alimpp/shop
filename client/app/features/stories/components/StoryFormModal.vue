<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import type { TStory, TStoryPayload } from '../types/index.type';

interface TStoryFormState {
  imageUrl: string;
  duration: number;
  isActive: boolean;
}

const props = defineProps<{
  open: boolean;
  story: TStory | null;
  submitting: boolean;
}>();

const emit = defineEmits<{
  (event: 'update:open', value: boolean): void;
  (event: 'submit', payload: TStoryPayload, id: string | null): void;
}>();

const storySchema = z.object({
  imageUrl: z.string().trim()
    .min(1, 'آدرس تصویر الزامی است')
    .max(500, 'آدرس تصویر باید حداکثر ۵۰۰ کاراکتر باشد'),
  duration: z.number().int('مدت زمان باید یک عدد صحیح باشد').min(1, 'مدت زمان حداقل باید ۱ ثانیه باشد'),
  isActive: z.boolean(),
});

type StorySchema = z.output<typeof storySchema>;

const state = reactive<TStoryFormState>({
  imageUrl: '',
  duration: 10,
  isActive: true,
});

const modalOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value),
});

const isEditing = computed(() => Boolean(props.story?.id));

function resetState(): void {
  state.imageUrl = '';
  state.duration = 10;
  state.isActive = true;
}

function syncState(story: TStory | null): void {
  if (!story) {
    resetState();
    return;
  }

  state.imageUrl = story.imageUrl;
  state.duration = story.duration;
  state.isActive = story.isActive;
}

function normalizePayload(data: StorySchema): TStoryPayload {
  return {
    imageUrl: data.imageUrl.trim(),
    duration: data.duration,
    isActive: data.isActive,
  };
}

function closeModal(): void {
  modalOpen.value = false;
}

function handleSubmit(event: FormSubmitEvent<StorySchema>): void {
  emit('submit', normalizePayload(event.data), props.story?.id ?? null);
}

watch(
  () => [props.open, props.story] as const,
  ([isOpen, story]) => {
    if (!isOpen) {
      resetState();
      return;
    }

    syncState(story);
  },
  { immediate: true },
);
</script>

<template>
  <UModal v-model:open="modalOpen" :title="isEditing ? 'ویرایش استوری' : 'ایجاد استوری'">
    <template #body>
      <UForm
        :schema="storySchema"
        :state="state"
        class="space-y-4"
        @submit="handleSubmit"
      >
        <UFormField label="آدرس تصویر" name="imageUrl">
          <BaseFilePicker v-model="state.imageUrl" />
        </UFormField>

        <UFormField label="مدت نمایش (ثانیه)" name="duration">
          <UInput
            v-model.number="state.duration"
            type="number"
            min="1"
            class="w-full"
            placeholder="مثلا ۱۰"
          />
        </UFormField>

        <UCheckbox v-model="state.isActive" label="استوری فعال باشد" />

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
            :icon="isEditing ? 'i-lucide-save' : 'i-lucide-plus-circle'"
            class="w-full justify-center"
            :loading="submitting"
          >
            {{ isEditing ? 'ذخیره تغییرات' : 'ایجاد استوری' }}
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
