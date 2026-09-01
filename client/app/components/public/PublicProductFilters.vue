<script setup lang="ts">
import type {
  TProductAttributeWithValues,
  TProductBrandRef
} from '~/features/products/types/index.type'
import type { TCategory } from '~/features/categories/types/index.type'

const props = defineProps<{
  searchInput: string
  selectedCategoryId: string
  selectedBrandId: string
  attributeSelections: Record<string, string[]>
  categories: TCategory[]
  brands: TProductBrandRef[]
  filterAttributes: TProductAttributeWithValues[]
}>()

const emit = defineEmits<{
  'update:searchInput': [value: string]
  'update:selectedCategoryId': [value: string]
  'update:selectedBrandId': [value: string]
  'update:attributeSelections': [value: Record<string, string[]>]
  clear: []
}>()

const searchInputModel = computed({
  get: () => props.searchInput,
  set: (value: string) => emit('update:searchInput', value)
})

const selectedCategoryForSelect = computed<string | undefined>({
  get: () => (props.selectedCategoryId ? props.selectedCategoryId : undefined),
  set: (value: string | undefined) =>
    emit('update:selectedCategoryId', value ?? '')
})

const selectedBrandForSelect = computed<string | undefined>({
  get: () => (props.selectedBrandId ? props.selectedBrandId : undefined),
  set: (value: string | undefined) => emit('update:selectedBrandId', value ?? '')
})

const sortedCategories = computed(() =>
  [...props.categories].sort((a, b) => a.name.localeCompare(b.name, 'fa'))
)

const sortedBrands = computed(() =>
  [...props.brands].sort((a, b) => a.name.localeCompare(b.name, 'fa'))
)

function getCategoryItems(): Array<{ label: string; value: string }> {
  return sortedCategories.value.map(c => ({ label: c.name, value: c.id }))
}

function getBrandItems(): Array<{ label: string; value: string }> {
  return sortedBrands.value.map(b => ({ label: b.name, value: b.id }))
}

function isValueSelected(attributeId: string, valueId: string): boolean {
  return (props.attributeSelections[attributeId] ?? []).includes(valueId)
}

function toggleAttributeValue(attributeId: string, valueId: string): void {
  const current = props.attributeSelections[attributeId] ?? []
  const next = current.includes(valueId)
    ? current.filter(id => id !== valueId)
    : [...current, valueId]

  const nextSelections: Record<string, string[]> = {
    ...props.attributeSelections
  }

  if (!next.length) {
    delete nextSelections[attributeId]
  } else {
    nextSelections[attributeId] = next
  }

  emit('update:attributeSelections', nextSelections)
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <p class="text-xs font-medium text-muted">
        جستجو در این لیست
      </p>
      <UInput
        v-model="searchInputModel"
        icon="i-lucide-search"
        class="w-full"
        placeholder="نام محصول یا SKU"
      />
    </div>

    <div class="space-y-2">
      <p class="text-xs font-medium text-muted">
        دسته‌بندی
      </p>
      <USelect
        v-model="selectedCategoryForSelect"
        :items="getCategoryItems()"
        value-key="value"
        label-key="label"
        placeholder="همه دسته‌بندی‌ها"
        class="w-full"
      />
    </div>

    <div class="space-y-2">
      <p class="text-xs font-medium text-muted">
        برند
      </p>
      <USelect
        v-model="selectedBrandForSelect"
        :items="getBrandItems()"
        value-key="value"
        label-key="label"
        placeholder="همه برندها"
        class="w-full"
      />
    </div>

    <div
      v-for="attribute in filterAttributes"
      :key="attribute.id"
      class="space-y-3"
    >
      <p class="text-xs font-medium text-muted">
        {{ attribute.name }}
      </p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="value in attribute.values"
          :key="value.id"
          type="button"
          class="rounded-xl px-3 py-2 text-xs font-medium transition-colors"
          :class="
            isValueSelected(attribute.id, value.id)
              ? 'bg-primary text-white'
              : 'bg-elevated text-toned hover:bg-primary/10 hover:text-primary'
          "
          @click="toggleAttributeValue(attribute.id, value.id)"
        >
          {{ value.value }}
        </button>
      </div>
    </div>
  </div>
</template>
