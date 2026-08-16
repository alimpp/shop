<script setup lang="ts">
import type { TProductMedia } from "~/features/products/types/index.type";

const props = defineProps<{
  medias: TProductMedia[];
  name: string;
  discountPercent: number;
  selectedMediaIndex: number;
}>();

const emit = defineEmits<{
  "update:selectedMediaIndex": [value: number];
}>();

const mainImageUrl = computed(() => {
  const media = props.medias[props.selectedMediaIndex];
  return media?.url ?? props.medias[0]?.url ?? "";
});
</script>

<template>
  <div class="space-y-4">
    <div class="relative aspect-square overflow-hidden rounded-2xl bg-elevated">
      <NuxtImg
        v-if="mainImageUrl"
        :src="mainImageUrl"
        :alt="name"
        class="h-full w-full object-cover"
        loading="lazy"
      />
      <div
        v-else
        class="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800"
      >
        <UIcon
          name="i-lucide-image"
          class="size-12 text-gray-400"
        />
      </div>

      <span
        v-if="discountPercent > 0"
        class="absolute right-3 top-3 rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg"
      >
        ٪{{ discountPercent }} تخفیف
      </span>
    </div>

    <div
      v-if="medias.length > 1"
      class="flex gap-3 overflow-x-auto pb-2 no-scrollbar"
    >
      <button
        v-for="(media, index) in medias"
        :key="media.id"
        type="button"
        class="size-20 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 transition-all"
        :class="index === selectedMediaIndex ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'"
        :aria-label="`تصویر ${index + 1}`"
        @click="emit('update:selectedMediaIndex', index)"
      >
        <img
          :src="media.url"
          :alt="media.alt || name"
          class="h-full w-full object-cover"
          loading="lazy"
        >
      </button>
    </div>
  </div>
</template>
