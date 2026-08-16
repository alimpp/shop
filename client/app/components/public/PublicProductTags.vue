<script setup lang="ts">
import type { TProductTag } from "~/features/products/types/index.type";

defineProps<{
  tags: TProductTag[];
}>();
</script>

<template>
  <div
    v-if="tags.length"
    class="flex flex-wrap gap-2"
  >
    <NuxtLink
      v-for="tag in tags"
      :key="tag.id"
      to="/products"
      class="rounded-full bg-elevated px-3 py-1 text-xs text-toned transition-colors hover:text-primary"
    >
      #{{ tag.tag?.name }}
    </NuxtLink>
  </div>
</template>
