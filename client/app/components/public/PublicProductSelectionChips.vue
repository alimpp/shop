<script setup lang="ts">
import {
  buildProductSelectionChips,
  type ProductSelectionInput
} from '~/utils/productSelection'

const props = withDefaults(
  defineProps<{
    variant?: ProductSelectionInput['variant']
    selectedOptions?: ProductSelectionInput['selectedOptions']
    includeSku?: boolean
  }>(),
  {
    includeSku: true
  }
)

const chips = computed(() =>
  buildProductSelectionChips(
    {
      variant: props.variant,
      selectedOptions: props.selectedOptions
    },
    { includeSku: props.includeSku }
  )
)
</script>

<template>
  <div
    v-if="chips.length"
    class="flex flex-wrap gap-1.5"
  >
    <span
      v-for="chip in chips"
      :key="chip.key"
      class="rounded-lg bg-elevated px-2 py-1 text-[11px] font-medium text-toned ring-1 ring-default"
    >
      {{ chip.label }}
    </span>
  </div>
</template>
