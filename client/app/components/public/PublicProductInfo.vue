<script setup lang="ts">
import type { TProduct } from "~/features/products/types/index.type";

defineProps<{
  product: TProduct;
  liked: boolean;
  likeCount: number;
  likeLoading: boolean;
  commentCount: number;
  viewCount: number;
  ratingAvg?: number;
  ratingCount?: number;
}>();

const emit = defineEmits<{
  like: [];
}>();

const { formatCurrency } = useCurrencyFormatter();
</script>

<template>
  <div>
    <h1 class="text-2xl font-black leading-10 text-highlighted sm:text-3xl">
      {{ product.name }}
    </h1>

    <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-toned">
      <span
        v-if="product.brand"
        class="inline-flex items-center gap-1.5"
      >
        <UIcon
          name="i-lucide-store"
          class="size-4"
        />
        برند: {{ product.brand.name }}
      </span>

      <span
        v-if="product.category"
        class="inline-flex items-center gap-1.5"
      >
        <UIcon
          name="i-lucide-tag"
          class="size-4"
        />
        دسته بندی: {{ product.category.name }}
      </span>
    </div>

    <div
      v-if="(ratingCount ?? 0) > 0"
      class="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-400/10 px-3 py-1.5 text-sm text-amber-500"
    >
      <UIcon
        name="i-lucide-star"
        class="size-4 fill-amber-400 text-amber-400"
      />
      <span class="font-bold tabular-nums">
        {{ (ratingAvg ?? 0).toLocaleString('fa-IR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) }}
      </span>
      <span class="text-xs text-toned">
        ({{ (ratingCount ?? 0).toLocaleString('fa-IR') }} امتیاز)
      </span>
    </div>

    <div class="mt-3 flex flex-wrap items-center gap-4">
      <UButton
        color="neutral"
        variant="ghost"
        size="sm"
        :loading="likeLoading"
        :aria-label="'لایک محصول'"
        class="text-toned"
        @click="emit('like')"
      >
        <template #leading>
          <UIcon
            name="i-lucide-heart"
            class="size-4"
            :class="liked ? 'fill-red-500 text-red-500' : ''"
          />
        </template>
        {{ likeCount }} لایک
      </UButton>

      <span class="inline-flex items-center gap-1.5 text-sm text-toned">
        <UIcon
          name="i-lucide-message-circle"
          class="size-4"
        />
        {{ commentCount }} کامنت
      </span>

      <span class="inline-flex items-center gap-1.5 text-sm text-toned">
        <UIcon
          name="i-lucide-eye"
          class="size-4"
        />
        {{ formatCurrency(viewCount) }} بازدید
      </span>
    </div>
  </div>
</template>
