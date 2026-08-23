<script setup lang="ts">
import PricingInlineField from './PricingInlineField.vue'
import type { TPricingProduct, TPricingSaveState } from '../types/index.type'
import {
  buildPricingPayload,
  createPricingDraft,
  isPricingDraftDirty,
  type TPricingDraft
} from '../utils/pricingDraft'

const props = defineProps<{
  product: TPricingProduct
  saving: boolean
  saveState: TPricingSaveState
}>()

const emit = defineEmits<{
  save: [payload: ReturnType<typeof buildPricingPayload>]
}>()

const expanded = ref(false)
const draft = ref<TPricingDraft>(createPricingDraft(props.product))

watch(
  () => props.product,
  (product) => {
    draft.value = createPricingDraft(product)
  },
  { deep: true }
)

const isDirty = computed(() => isPricingDraftDirty(props.product, draft.value))
const hasVariants = computed(() => props.product.variants.length > 0)

const variantStockSum = computed(() =>
  props.product.variants.reduce((sum, variant) => {
    const row = draft.value.variants[variant.id]
    return sum + Number(row?.stock ?? variant.stock ?? 0)
  }, 0)
)

const rowClass = computed(() => {
  if (props.saveState === 'error') {
    return 'border-error/40 bg-error/5'
  }
  if (props.saveState === 'saved') {
    return 'border-success/30 bg-success/5'
  }
  if (isDirty.value || props.saveState === 'dirty') {
    return 'border-primary/30 bg-primary/5'
  }
  return 'border-default bg-elevated/40'
})

function commitProduct(): void {
  const payload = buildPricingPayload(props.product, draft.value)
  emit('save', payload)
}

function commitVariant(variantId: string): void {
  if (!draft.value.variants[variantId]) {
    return
  }
  const payload = buildPricingPayload(props.product, draft.value)
  emit('save', payload)
}

function toggleExpanded(): void {
  if (!hasVariants.value) {
    return
  }
  expanded.value = !expanded.value
}
</script>

<template>
  <article
    class="rounded-2xl border transition-colors"
    :class="rowClass"
  >
    <div class="grid gap-3 p-3 sm:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(88px,1fr))_auto] sm:items-end sm:gap-4 sm:p-4">
      <button
        type="button"
        class="flex min-w-0 items-center gap-3 text-right"
        :class="hasVariants ? 'cursor-pointer' : 'cursor-default'"
        @click="toggleExpanded"
      >
        <div class="size-12 shrink-0 overflow-hidden rounded-xl border border-default bg-default/40">
          <img
            v-if="product.image"
            :src="resolveAssetUrl(product.image)"
            :alt="product.name"
            class="size-full object-cover"
          >
          <div
            v-else
            class="flex size-full items-center justify-center text-muted"
          >
            <UIcon name="i-lucide-image" class="size-4" />
          </div>
        </div>

        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-bold text-highlighted">
            {{ product.name }}
          </p>
          <p class="truncate text-xs text-toned" dir="ltr">
            {{ product.sku }}
          </p>
          <p
            v-if="hasVariants"
            class="mt-1 text-[11px] text-muted"
          >
            {{ product.variantCount }} واریانت
            <span v-if="expanded"> · مجموع موجودی {{ variantStockSum.toLocaleString('fa-IR') }}</span>
          </p>
        </div>

        <UIcon
          v-if="hasVariants"
          name="i-lucide-chevron-down"
          class="size-4 shrink-0 text-muted transition-transform"
          :class="expanded ? 'rotate-180' : ''"
        />
      </button>

      <PricingInlineField
        v-model="draft.price"
        label="قیمت"
        :disabled="saving"
        compact
        @commit="commitProduct"
      />

      <PricingInlineField
        v-model="draft.salePrice"
        label="تخفیف"
        :disabled="saving"
        compact
        @commit="commitProduct"
      />

      <PricingInlineField
        v-model="draft.stock"
        label="موجودی"
        :disabled="saving || hasVariants"
        compact
        @commit="commitProduct"
      />

      <div class="flex items-end justify-end gap-2 pb-0.5">
        <UIcon
          v-if="saving"
          name="i-lucide-loader-2"
          class="size-4 animate-spin text-primary"
        />
        <UIcon
          v-else-if="saveState === 'saved'"
          name="i-lucide-check"
          class="size-4 text-success"
        />
        <UIcon
          v-else-if="saveState === 'error'"
          name="i-lucide-alert-circle"
          class="size-4 text-error"
        />
        <UButton
          v-else-if="isDirty"
          size="xs"
          color="primary"
          :disabled="saving"
          @click="commitProduct"
        >
          ذخیره
        </UButton>
      </div>
    </div>

    <div
      v-if="hasVariants && expanded"
      class="border-t border-default/80 px-3 pb-3 pt-2 sm:px-4 sm:pb-4"
    >
      <div class="mb-2 hidden text-[11px] text-toned sm:grid sm:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(88px,1fr))_auto] sm:gap-4">
        <span>واریانت</span>
        <span>قیمت</span>
        <span>تخفیف</span>
        <span>موجودی</span>
        <span />
      </div>

      <div class="space-y-2">
        <div
          v-for="variant in product.variants"
          :key="variant.id"
          class="grid gap-3 rounded-xl border border-default/70 bg-default/20 p-3 sm:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(88px,1fr))_auto] sm:items-end sm:gap-4"
        >
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold text-highlighted">
              {{ variant.name }}
            </p>
            <p class="truncate text-xs text-toned" dir="ltr">
              {{ variant.sku }}
            </p>
          </div>

          <PricingInlineField
            v-if="draft.variants[variant.id]"
            v-model="draft.variants[variant.id].price"
            label="قیمت"
            :disabled="saving"
            compact
            @commit="commitVariant(variant.id)"
          />

          <PricingInlineField
            v-if="draft.variants[variant.id]"
            v-model="draft.variants[variant.id].salePrice"
            label="تخفیف"
            :disabled="saving"
            compact
            @commit="commitVariant(variant.id)"
          />

          <PricingInlineField
            v-if="draft.variants[variant.id]"
            v-model="draft.variants[variant.id].stock"
            label="موجودی"
            :disabled="saving"
            compact
            @commit="commitVariant(variant.id)"
          />

          <div class="hidden sm:block" />
        </div>
      </div>

      <p class="mt-3 text-[11px] text-muted">
        با تغییر موجودی واریانت‌ها، موجودی کل محصول خودکار همگام می‌شود.
      </p>
    </div>
  </article>
</template>
