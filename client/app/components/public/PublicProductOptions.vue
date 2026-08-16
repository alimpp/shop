<script setup lang="ts">
import type { TProductOption } from "~/features/products/types/index.type";

defineProps<{
  options: TProductOption[];
  selected: Record<string, string>;
}>();

const emit = defineEmits<{
  select: [key: string, valueId: string];
}>();

function optionKey(option: TProductOption): string {
  return option.attribute?.slug ?? option.attributeId;
}
</script>

<template>
  <div
    v-for="option in options"
    :key="option.id"
    class="space-y-2"
  >
    <p class="text-sm font-bold text-highlighted">
      {{ option.attribute?.name }}
    </p>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="value in option.values"
        :key="value.id"
        type="button"
        class="cursor-pointer rounded-xl border px-4 py-2 text-sm transition-all"
        :class="
          selected[optionKey(option)] === value.id
            ? 'border-primary bg-primary/10 font-semibold text-primary'
            : 'border-default text-toned hover:border-primary/50'
        "
        @click="emit('select', optionKey(option), value.id)"
      >
        {{ value.attributeValue?.value }}
      </button>
    </div>
  </div>
</template>
