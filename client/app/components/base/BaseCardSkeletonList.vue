<script setup lang="ts">
withDefaults(
  defineProps<{
    count?: number;
    itemClass?: string;
    listClass?: string;
  }>(),
  {
    count: 5,
    itemClass: "",
    listClass: "space-y-3"
  }
);
</script>

<template>
  <div :class="listClass">
    <div
      v-for="index in count"
      :key="index"
      :class="['animate-pulse rounded-xl border border-default bg-default/20 p-4', itemClass]"
    >
      <slot name="item" :index="index" />
    </div>
  </div>
</template>
