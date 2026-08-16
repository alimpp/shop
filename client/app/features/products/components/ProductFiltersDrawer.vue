<script setup lang="ts">
import type { TCategory } from "~/features/categories/types/index.type";
import type {
  TProductAttributeWithValues,
  TProductBrandRef,
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
  set: (value: boolean) => emit("update:open", value),
});

const searchInputModel = computed({
  get: () => props.searchInput,
  set: (value: string) => emit("update:searchInput", value),
});

const selectedCategoryIdModel = computed({
  get: () => props.selectedCategoryId,
  set: (value: string) => emit("update:selectedCategoryId", value),
});

const selectedBrandIdModel = computed({
  get: () => props.selectedBrandId,
  set: (value: string) => emit("update:selectedBrandId", value),
});

const sortedCategories = computed(() =>
  [...props.categories].sort((a, b) => a.name.localeCompare(b.name, "fa")),
);

const sortedBrands = computed(() =>
  [...props.brands].sort((a, b) => a.name.localeCompare(b.name, "fa")),
);

function getCategoryItems(): Array<{ label: string; value: string }> {
  return sortedCategories.value.map((c) => ({ label: c.name, value: c.id }));
}

function getBrandItems(): Array<{ label: string; value: string }> {
  return sortedBrands.value.map((b) => ({ label: b.name, value: b.id }));
}

const selectedCategoryForSelect = computed({
  get: () => (props.selectedCategoryId ? props.selectedCategoryId : null),
  set: (value: string | null) => emit("update:selectedCategoryId", value ?? ""),
});

const selectedBrandForSelect = computed({
  get: () => (props.selectedBrandId ? props.selectedBrandId : null),
  set: (value: string | null) => emit("update:selectedBrandId", value ?? ""),
});

function getAttributeItems(
  attribute: TProductAttributeWithValues,
): Array<{ label: string; value: string }> {
  return (attribute.values ?? []).map((value) => ({
    label: value.value,
    value: value.id,
  }));
}

function getAttributeSelection(attributeId: string): string[] {
  return props.attributeSelections[attributeId] ?? [];
}

function updateAttributeSelection(
  attributeId: string,
  value: string[] | undefined,
): void {
  const nextSelections: Record<string, string[]> = {
    ...props.attributeSelections,
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
  <USlideover v-model:open="openModel" title="فیلتر محصولات">
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
          <USelect
            v-model="selectedCategoryForSelect"
            :items="getCategoryItems()"
            value-key="value"
            label-key="label"
            :ui="{
              base: 'px-3',
              value: 'truncate text-default',
              placeholder: 'truncate text-dimmed',
            }"
            placeholder="همه دسته‌بندی‌ها"
            class="w-full"
          />
        </UFormField>

        <UFormField label="برند" name="brandId">
          <USelect
            v-model="selectedBrandForSelect"
            :items="getBrandItems()"
            value-key="value"
            label-key="label"
            :ui="{
              value: 'truncate text-default',
              placeholder: 'truncate text-dimmed',
            }"
            placeholder="همه برندها"
            class="w-full"
          />
        </UFormField>

        <div
          v-if="filterAttributes.length"
          class="grid grid-cols-1 gap-3 border-t border-default pt-4"
        >
          <UFormField
            v-for="attribute in filterAttributes"
            :key="attribute.id"
            :label="attribute.name"
            class="w-full"
          >
            <USelect
              class="w-full"
              :model-value="getAttributeSelection(attribute.id)"
              multiple
              value-key="value"
              label-key="label"
              :items="getAttributeItems(attribute)"
              :ui="{
                value: 'truncate text-default',
                placeholder: 'truncate text-dimmed',
              }"
              :placeholder="`انتخاب ${attribute.name}`"
              @update:model-value="
                updateAttributeSelection(attribute.id, $event)
              "
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
