<script setup lang="ts">
import type { TProductAttributeWithValues } from '~/features/products/types/index.type'

const props = defineProps<{
  searchInput: string
  selectedCategoryId: string
  selectedBrandId: string
  attributeSelections: Record<string, string[]>
  categories: Array<{ id: string; name: string }>
  brands: Array<{ id: string; name: string }>
  filterAttributes: TProductAttributeWithValues[]
}>()

const emit = defineEmits<{
  removeSearch: []
  removeCategory: []
  removeBrand: []
  removeAttributeValue: [attributeId: string, valueId: string]
  clear: []
}>()

const selectedCategory = computed(() =>
  props.categories.find(c => c.id === props.selectedCategoryId)
)

const selectedBrand = computed(() =>
  props.brands.find(b => b.id === props.selectedBrandId)
)

const attributeChips = computed(() =>
  props.filterAttributes.flatMap(attribute =>
    (props.attributeSelections[attribute.id] ?? []).map((valueId) => {
      const valueLabel =
        attribute.values.find(value => value.id === valueId)?.value ?? ''
      return {
        attributeId: attribute.id,
        valueId,
        label: valueLabel
          ? `${attribute.name} ${valueLabel}`
          : attribute.name
      }
    })
  )
)

const hasActiveFilters = computed(
  () =>
    Boolean(props.searchInput.trim())
    || Boolean(props.selectedCategoryId)
    || Boolean(props.selectedBrandId)
    || attributeChips.value.length > 0
)
</script>

<template>
  <div
    v-if="hasActiveFilters"
    class="no-scrollbar flex w-full flex-nowrap items-center gap-2 overflow-x-auto"
  >
    <button
      v-if="searchInput.trim()"
      type="button"
      class="inline-flex max-w-[240px] shrink-0 items-center gap-2 rounded-xl bg-primary/15 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/25"
      @click="emit('removeSearch')"
    >
      <span class="min-w-0 truncate">جستجو: {{ searchInput.trim() }}</span>
      <UIcon
        name="i-lucide-x"
        class="size-3.5 shrink-0"
      />
    </button>

    <button
      v-if="selectedCategory"
      type="button"
      class="inline-flex max-w-[240px] shrink-0 items-center gap-2 rounded-xl bg-elevated px-3 py-2 text-xs font-medium text-highlighted transition-colors hover:bg-primary/10 hover:text-primary"
      @click="emit('removeCategory')"
    >
      <span class="min-w-0 truncate">{{ selectedCategory.name }}</span>
      <UIcon
        name="i-lucide-x"
        class="size-3.5 shrink-0 opacity-70"
      />
    </button>

    <button
      v-if="selectedBrand"
      type="button"
      class="inline-flex max-w-[240px] shrink-0 items-center gap-2 rounded-xl bg-elevated px-3 py-2 text-xs font-medium text-highlighted transition-colors hover:bg-primary/10 hover:text-primary"
      @click="emit('removeBrand')"
    >
      <span class="min-w-0 truncate">{{ selectedBrand.name }}</span>
      <UIcon
        name="i-lucide-x"
        class="size-3.5 shrink-0 opacity-70"
      />
    </button>

    <button
      v-for="chip in attributeChips"
      :key="`${chip.attributeId}-${chip.valueId}`"
      type="button"
      class="inline-flex max-w-[260px] shrink-0 items-center gap-2 rounded-xl bg-elevated px-3 py-2 text-xs font-medium text-highlighted transition-colors hover:bg-primary/10 hover:text-primary"
      @click="emit('removeAttributeValue', chip.attributeId, chip.valueId)"
    >
      <span class="min-w-0 truncate">{{ chip.label }}</span>
      <UIcon
        name="i-lucide-x"
        class="size-3.5 shrink-0 opacity-70"
      />
    </button>

    <button
      type="button"
      class="shrink-0 px-1 text-xs font-medium text-primary transition-colors hover:text-primary/70"
      @click="emit('clear')"
    >
      پاک کردن همه
    </button>
  </div>
</template>
