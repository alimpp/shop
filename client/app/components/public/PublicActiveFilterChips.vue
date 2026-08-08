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
  props.filterAttributes.flatMap(
    (attribute) =>
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
    <span class="shrink-0 text-xs font-medium text-muted">فیلترهای اعمال شده:</span>

    <span
      v-if="searchInput.trim()"
      class="inline-flex max-w-full shrink-0 items-center gap-1.5 rounded-[2px] border border-default bg-elevated px-3 py-1 text-xs text-muted"
    >
      <span class="text-[14px]">جستجو: {{ searchInput.trim() }}</span>
      <button
        type="button"
        class="shrink-0 text-default transition-colors hover:text-error"
        aria-label="حذف جستجو"
        @click="emit('removeSearch')"
      >
        <UIcon name="i-lucide-x" class="size-4" />
      </button>
    </span>

    <span
      v-if="selectedCategory"
      class="flex max-w-full shrink-0 justify-center items-center gap-1.5 rounded-[2px] border border-default bg-elevated px-3 py-1 text-xs text-muted"
    >
      <span class="text-[14px]">{{ selectedCategory.name }}</span>
      <button
        type="button"
        class="shrink-0 text-default transition-colors hover:text-error"
        aria-label="حذف دسته‌بندی"
        @click="emit('removeCategory')"
      >
        <UIcon name="i-lucide-x" class="size-4" />
      </button>
    </span>

    <span
      v-if="selectedBrand"
      class="inline-flex max-w-full shrink-0 items-center gap-1.5 rounded-[2px] border border-default bg-elevated px-3 py-1 text-xs text-muted"
    >
      <span class="text-[14px]">{{ selectedBrand.name }}</span>
      <button
        type="button"
        class="shrink-0 text-default transition-colors hover:text-error"
        aria-label="حذف برند"
        @click="emit('removeBrand')"
      >
        <UIcon name="i-lucide-x" class="size-4" />
      </button>
    </span>

    <span
      v-for="chip in attributeChips"
      :key="`${chip.attributeId}-${chip.valueId}`"
      class="inline-flex max-w-full shrink-0 items-center gap-1.5 rounded-[2px] border border-default bg-elevated px-3 py-1 text-xs text-muted"
    >
      <span class="text-[14px]">{{ chip.label }}</span>
      <button
        type="button"
        class="shrink-0 text-default transition-colors hover:text-error"
        aria-label="حذف فیلتر"
        @click="emit('removeAttributeValue', chip.attributeId, chip.valueId)"
      >
        <UIcon name="i-lucide-x" class="size-4" />
      </button>
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