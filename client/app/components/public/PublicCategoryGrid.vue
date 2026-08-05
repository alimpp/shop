<script setup lang="ts">
import type { TCategory } from '~/features/categories/types/index.type';

interface Props {
  categories: TCategory[];
}

const props = withDefaults(defineProps<Props>(), {
  categories: () => [],
});

const activeCategories = computed(() =>
  props.categories.filter((category) => category.isActive && category.image),
);
</script>

<template>
  <div v-if="activeCategories.length > 0" class="px-4 sm:px-6 lg:px-8">
    <div class="mx-auto flex w-full max-w-6xl flex-wrap justify-center gap-4">
      <div
        v-for="category in activeCategories"
        :key="category.id"
        data-category-item
        class="group w-[calc(50%-0.5rem)] cursor-pointer sm:w-[calc(25%-0.75rem)]"
      >
        <div class="flex flex-col items-center gap-3">
          <div
            class="overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg"
          >
            <NuxtImg
              :src="category.image"
              :alt="category.name"
              class="w-[130px] object-cover sm:h-24 sm:w-24"
              loading="lazy"
              decoding="async"
            />
          </div>
          <p
            class="text-center text-[16px] font-bold text-[#565656] sm:text-[18px]"
          >
            {{ category.name }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
