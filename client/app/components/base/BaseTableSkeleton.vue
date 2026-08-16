<script setup lang="ts">
withDefaults(
  defineProps<{
    rows?: number;
    tableClass?: string;
    rowClass?: string;
  }>(),
  {
    rows: 5,
    tableClass: "min-w-full border-separate border-spacing-0 text-right text-sm",
    rowClass: ""
  }
);
</script>

<template>
  <table :class="tableClass">
    <thead>
      <tr>
        <slot name="header" />
      </tr>
    </thead>

    <tbody>
      <tr
        v-for="index in rows"
        :key="index"
        :class="['animate-pulse', rowClass]"
      >
        <slot name="row" :index="index" />
      </tr>
    </tbody>
  </table>
</template>
