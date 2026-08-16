<script setup lang="ts">
import type { TProductAttributeWithValues } from "~/features/products/types/index.type";

const props = defineProps<{
  searchInput: string;
  selectedCategoryId: string;
  selectedBrandId: string;
  attributeSelections: Record<string, string[]>;
  categories: Array<{ id: string; name: string }>;
  brands: Array<{ id: string; name: string }>;
  filterAttributes: TProductAttributeWithValues[];
}>();

const emit = defineEmits<{
  removeSearch: [];
  removeCategory: [];
  removeBrand: [];
  removeAttributeValue: [attributeId: string, valueId: string];
  clear: [];
}>();

const selectedCategory = computed(() =>
  props.categories.find((c) => c.id === props.selectedCategoryId),
);

const selectedBrand = computed(() =>
  props.brands.find((b) => b.id === props.selectedBrandId),
);

const attributeChips = computed(() =>
  props.filterAttributes.flatMap((attribute) =>
    (props.attributeSelections[attribute.id] ?? []).map((valueId) => ({
      attributeId: attribute.id,
      valueId,
      label:
        attribute.values.find((value) => value.id === valueId)?.value ?? "",
    })),
  ),
);

const hasActiveFilters = computed(
  () =>
    Boolean(props.searchInput.trim()) ||
    Boolean(props.selectedCategoryId) ||
    Boolean(props.selectedBrandId) ||
    attributeChips.value.length > 0,
);
</script>

<template>
  <div
    v-if="hasActiveFilters"
    class="no-scrollbar flex w-full flex-nowrap items-center gap-2 overflow-x-auto"
  >
    <span
      v-if="searchInput.trim()"
      class="flex max-w-[260px] shrink-0 justify-center items-center border bg-primary-900 text-primary border-primary px-3 h-[43px] rounded-[5px] text-muted"
    >
      <UIcon name="wordpress:list" class="size-5 shrink-0" />
      <span class="min-w-0 flex-1 truncate text-[14px] px-1">جستجو: {{ searchInput.trim() }}</span>
      <UIcon name="i-lucide-x" class="size-4 shrink-0 cursor-pointer" @click="emit('removeSearch')" />
    </span>

    <div
      v-if="selectedCategory"
      class="flex max-w-[260px] shrink-0 justify-center items-center border bg-primary-900 text-primary border-primary px-3 h-[43px] rounded-[5px] text-muted"
    >
      <UIcon name="wordpress:list" class="size-5 shrink-0" />
      <span class="min-w-0 flex-1 truncate text-[14px] px-1">{{ selectedCategory.name }}</span>
      <UIcon name="i-lucide-x" class="size-4 shrink-0 cursor-pointer" @click="emit('removeCategory')" />
    </div>

    <span
      v-if="selectedBrand"
      class="flex max-w-[260px] shrink-0 justify-center items-center border bg-primary-900 text-primary border-primary px-3 h-[43px] rounded-[5px] text-muted"
    >
      <UIcon name="wordpress:list" class="size-5 shrink-0" />
      <span class="min-w-0 flex-1 truncate text-[14px] px-1">{{ selectedBrand.name }}</span>
      <UIcon name="i-lucide-x" class="size-4 shrink-0 cursor-pointer" @click="emit('removeBrand')" />
    </span>

    <span
      v-for="chip in attributeChips"
      :key="`${chip.attributeId}-${chip.valueId}`"
      class="flex max-w-[260px] shrink-0 justify-center items-center border bg-primary-900 text-primary border-primary px-3 h-[43px] rounded-[5px] text-muted"
    >
      <UIcon name="wordpress:list" class="size-5 shrink-0" />
      <span class="min-w-0 flex-1 truncate text-[14px] px-1">{{ chip.label }}</span>
      <UIcon name="i-lucide-x" class="size-4 shrink-0 cursor-pointer" @click="emit('removeAttributeValue', chip.attributeId, chip.valueId)" />
    </span>

    <button
      type="button"
      class="shrink-0 text-xs font-medium text-primary transition-colors hover:text-primary/70"
      @click="emit('clear')"
    >
      پاک کردن همه
    </button>
  </div>
</template>

<style scoped>
.no-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
  touch-action: pan-x pan-y;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
