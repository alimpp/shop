<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    page: number;
    itemsPerPage: number;
    total: number;
    label: string;
  }>(),
  {
    page: 1
  }
);

const emit = defineEmits<{
  "update:page": [value: number];
}>();

const safeTotal = computed(() => Math.max(0, props.total));
const pageCount = computed(() =>
  Math.max(1, Math.ceil(safeTotal.value / props.itemsPerPage))
);
const rangeStart = computed(() =>
  safeTotal.value ? (props.page - 1) * props.itemsPerPage + 1 : 0
);
const rangeEnd = computed(() =>
  Math.min(props.page * props.itemsPerPage, safeTotal.value)
);

const currentPage = computed({
  get: () => props.page,
  set: (value: number) => emit("update:page", value)
});
</script>

<template>
  <div class="mt-4 flex flex-col gap-3 border-t border-default pt-4 md:flex-row md:items-center md:justify-between">
    <p class="text-sm text-muted">
      نمایش {{ rangeStart }} تا {{ rangeEnd }} از {{ safeTotal }} {{ label }}
    </p>

    <div class="flex items-center justify-between gap-3 self-stretch md:self-auto">
      <UBadge color="neutral" variant="soft">
        صفحه {{ currentPage }} از {{ pageCount }}
      </UBadge>

      <UPagination
        v-if="safeTotal > props.itemsPerPage"
        v-model:page="currentPage"
        :items-per-page="props.itemsPerPage"
        :total="safeTotal"
        size="sm"
        show-edges
      />
    </div>
  </div>
</template>
