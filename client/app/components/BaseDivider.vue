<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
  }>(),
  {
    subtitle: undefined,
  },
);
</script>

<template>
  <div class="flex flex-col items-center gap-2">
    <div class="flex items-center justify-center gap-3 sm:gap-4">
      <div class="h-px w-12 bg-[#565656] sm:w-14 md:w-[60px]" />

      <span class="whitespace-nowrap text-[18px] font-bold text-[#565656] sm:text-[22px]">
        {{ title }}
      </span>

      <div class="h-px w-12 bg-[#565656] sm:w-14 md:w-[60px]" />
    </div>

    <p v-if="subtitle" class="text-center text-[13px] text-[#565656] sm:text-sm"> 
      {{ subtitle }}
    </p>
  </div>
</template>
