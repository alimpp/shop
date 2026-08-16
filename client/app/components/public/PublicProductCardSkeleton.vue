<script setup lang="ts"></script>

<template>
  <div
    class="flex h-full animate-pulse flex-col overflow-hidden rounded-[5px] bg-[#151515]"
  >
    <div class="relative aspect-square w-full overflow-hidden bg-gray-200" />

    <div class="flex flex-1 flex-col gap-1.5 p-3">
      <div class="h-3.5 w-3/4 rounded-md bg-gray-300" />
      <div class="h-2.5 w-1/2 rounded-md bg-gray-300" />

      <div class="mt-auto flex flex-col gap-1 pt-1.5">
        <div class="h-3 w-1/3 rounded-md bg-gray-300" />
        <div class="h-4 w-2/5 rounded-md bg-gray-200" />
      </div>
    </div>
  </div>
</template>