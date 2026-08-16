<script setup lang="ts">
defineProps<{
  isOutOfStock: boolean;
  favorited: boolean;
}>();

const emit = defineEmits<{
  addToCart: [];
  toggleFavorite: [];
}>();
</script>

<template>
  <div class="flex flex-col justify-center-center gap-4">
    <UButton
      class="flex justify-center items-center min-w-44 bg-primary h-[50px]"
      size="md"
      icon="i-lucide-shopping-cart"
      :disabled="isOutOfStock"
      @click="emit('addToCart')"
    >
      افزودن به سبد خرید
    </UButton>

    <UButton
      v-if="!favorited"
      class="flex justify-center items-center min-w-44 bg-red-900 text-red-400 h-[50px]"
      size="md"
      icon="mdi:heart-outline"
      :disabled="isOutOfStock"
      @click="emit('toggleFavorite')"
    >
      افزودن به علاقه مندی ها
    </UButton>
  </div>
</template>
