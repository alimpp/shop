<script setup lang="ts">
import type { TProductSpecification } from "~/features/products/types/index.type";

defineProps<{
  description: string;
  specifications?: TProductSpecification[];
}>();
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-2">
    <div class="rounded-2xl border border-default p-6 sm:p-8">
      <h2 class="mb-4 flex items-center gap-2 text-lg font-black text-highlighted">
        <UIcon
          name="i-lucide-align-right"
          class="size-5 text-primary"
        />
        توضیحات محصول
      </h2>
      <div class="message-body text-sm leading-8 text-toned">
        {{ description }}
      </div>
      <slot name="after-description" />
    </div>

    <div
      v-if="specifications?.length"
      class="rounded-2xl border border-default p-6 sm:p-8"
    >
      <h2 class="mb-4 flex items-center gap-2 text-lg font-black text-highlighted">
        <UIcon
          name="i-lucide-list-checks"
          class="size-5 text-primary"
        />
        مشخصات محصول
      </h2>
      <dl class="divide-y divide-default overflow-hidden rounded-xl border border-default">
        <div
          v-for="spec in specifications"
          :key="spec.title"
          class="flex items-center justify-between gap-4 bg-elevated/40 px-4 py-3"
        >
          <dt class="text-sm font-semibold text-highlighted">
            {{ spec.title }}
          </dt>
          <dd class="text-sm text-toned">
            {{ spec.value }}
          </dd>
        </div>
      </dl>
    </div>
  </div>
</template>
