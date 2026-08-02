<script setup lang="ts">
import type { TCategory } from "~/features/categories/types/index.type";
import type {
  TProductAttributeWithValues,
  TProductBrandRef
} from "../types/index.type";

const props = defineProps<{
  open: boolean;
  searchInput: string;
  selectedCategoryId: string;
  selectedBrandId: string;
  attributeSelections: Record<string, string[]>;
  categories: TCategory[];
  brands: TProductBrandRef[];
  filterAttributes: TProductAttributeWithValues[];
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  "update:searchInput": [value: string];
  "update:selectedCategoryId": [value: string];
  "update:selectedBrandId": [value: string];
  "update:attributeSelections": [value: Record<string, string[]>];
  clear: [];
}>();

const openModel = computed({
  get: () => props.open,
  set: (value: boolean) => emit("update:open", value)
});

const searchInputModel = computed({
  get: () => props.searchInput,
  set: (value: string) => emit("update:searchInput", value)
});

const selectedCategoryIdModel = computed({
  get: () => props.selectedCategoryId,
  set: (value: string) => emit("update:selectedCategoryId", value)
});

const selectedBrandIdModel = computed({
  get: () => props.selectedBrandId,
  set: (value: string) => emit("update:selectedBrandId", value)
});

const sortedCategories = computed(() =>
  [...props.categories].sort((a, b) => a.name.localeCompare(b.name, "fa"))
);

const sortedBrands = computed(() =>
  [...props.brands].sort((a, b) => a.name.localeCompare(b.name, "fa"))
);

function getAttributeItems(attribute: TProductAttributeWithValues): Array<{ label: string; value: string }> {
  return (attribute.values ?? []).map((value) => ({
    label: value.value,
    value: value.id
  }));
}

function getAttributeSelection(attributeId: string): string[] {
  return props.attributeSelections[attributeId] ?? [];
}

function updateAttributeSelection(attributeId: string, value: string[] | undefined): void {
  const nextSelections: Record<string, string[]> = {
    ...props.attributeSelections
  };

  if (!value?.length) {
    delete nextSelections[attributeId];
  } else {
    nextSelections[attributeId] = value;
  }

  emit("update:attributeSelections", nextSelections);
}

function closeDrawer(): void {
  emit("update:open", false);
}

function clearFilters(): void {
  emit("clear");
}
</script>

<template>
  <USlideover
    v-model:open="openModel"
    title="فیلتر محصولات"
  >
    <template #body>
      <div class="space-y-4">
        <UFormField label="جستجو" name="search">
          <UInput
            v-model="searchInputModel"
            class="w-full"
            placeholder="نام محصول، SKU (مثلا لنوو)"
          />
        </UFormField>

        <UFormField label="دسته‌بندی" name="categoryId">
          <select
            v-model="selectedCategoryIdModel"
            class="w-full rounded-md border border-default bg-default px-3 py-2 text-sm outline-none"
          >
            <option value="">همه دسته‌بندی‌ها</option>
            <option
              v-for="category in sortedCategories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </UFormField>

        <UFormField label="برند" name="brandId">
          <select
            v-model="selectedBrandIdModel"
            class="w-full rounded-md border border-default bg-default px-3 py-2 text-sm outline-none"
          >
            <option value="">همه برندها</option>
            <option
              v-for="brand in sortedBrands"
              :key="brand.id"
              :value="brand.id"
            >
              {{ brand.name }}
            </option>
          </select>
        </UFormField>

        <div
          v-if="filterAttributes.length"
          class="grid grid-cols-1 gap-3 border-t border-default pt-4"
        >
          <UFormField
            v-for="attribute in filterAttributes"
            :key="attribute.id"
            :label="attribute.name"
          >
            <USelectMenu
              :model-value="getAttributeSelection(attribute.id)"
              multiple
              value-key="value"
              :items="getAttributeItems(attribute)"
              :placeholder="`انتخاب ${attribute.name}`"
              @update:model-value="updateAttributeSelection(attribute.id, $event)"
            />
          </UFormField>
        </div>

        <div class="grid grid-cols-2 gap-3 border-t border-default pt-4">
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-x"
            class="w-full justify-center"
            @click="clearFilters"
          >
            پاک کردن
          </UButton>
          <UButton
            color="primary"
            icon="i-lucide-check"
            class="w-full justify-center"
            @click="closeDrawer"
          >
            بستن
          </UButton>
        </div>
      </div>
    </template>
  </USlideover>
</template>
