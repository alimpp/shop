<script setup lang="ts">
defineProps<{
  originalPrice: number | null;
  displayPrice: number;
  discountPercent: number;
}>();

const { formatCurrency } = useCurrencyFormatter();
</script>

<template>
  <div
    class="flex flex-col gap-3 rounded-2xl border border-default bg-elevated/50 p-4"
  >
    <div class="flex justify-between w-full">
      <span
        class="text-[18px] text-primary"
      >
        قیمت محصول
      </span>
      <span
        class="text-[16px] text-primary"
      >
        {{ formatCurrency(originalPrice ?? displayPrice) }} تومان
      </span>
    </div>

    <div
      v-if="discountPercent > 0"
      class="flex justify-between w-full"
    >
      <span
        class="text-[18px] font-black text-red-900 flex items-center"
      >
        قیمت با تخفیف
        <span
          class="rounded-full mx-1 bg-red-900 px-3 py-1.5 text-xs font-bold text-white shadow-lg flex items-center justify-center"
        >
          ٪{{ discountPercent }} تخفیف
        </span>
      </span>
      <span
        class="text-[20px] font-black text-red-900"
      >
        {{ formatCurrency(displayPrice) }} تومان
      </span>
    </div>
  </div>
</template>
