<script setup lang="ts">
import { cartController } from '~/features/cart/controllers/index.controller'
import { useCartDS } from '~/features/cart/data/index.store'
import type { CartItemModel } from '~/features/cart/models/index.model'

withDefaults(
  defineProps<{
    embedded?: boolean
  }>(),
  {
    embedded: false
  }
)

const toast = useToast()
const cartDS = useCartDS()
const token = useCookie<string | null>('token')

const items = computed(() => cartDS.getItems)
const loading = computed(() => cartDS.getLoading)
const submitting = computed(() => cartDS.getSubmitting)
const totalQuantity = computed(() => cartDS.getTotalQuantity)
const totalPrice = computed(() => cartDS.getTotalPrice)
const itemCount = computed(() => cartDS.getItemCount)

const updatingItemId = ref<string | null>(null)

function formatPrice(value: number): string {
  return new Intl.NumberFormat('fa-IR').format(value)
}

function variantLabel(item: CartItemModel): string {
  return item.variantLabel
}

async function ensureAuth(): Promise<boolean> {
  if (token.value) return true

  toast.add({
    title: 'برای مشاهده سبد خرید وارد حساب شوید',
    color: 'warning'
  })
  await navigateTo('/auth/login-by-phone')
  return false
}

async function loadCart(): Promise<void> {
  if (!(await ensureAuth())) return

  const response = await cartController.getCart()
  if (!response.success) {
    toast.add({
      title: response.message || 'دریافت سبد خرید ناموفق بود',
      color: 'error'
    })
  }
}

async function changeQuantity(item: CartItemModel, next: number): Promise<void> {
  if (next < 1 || submitting.value) return

  updatingItemId.value = item.id
  const response = await cartController.updateItem(item.id, { quantity: next })
  updatingItemId.value = null

  if (!response.success) {
    toast.add({
      title: response.message || 'بروزرسانی تعداد ناموفق بود',
      color: 'error'
    })
  }
}

async function removeItem(item: CartItemModel): Promise<void> {
  if (submitting.value) return

  updatingItemId.value = item.id
  const response = await cartController.removeItem(item.id)
  updatingItemId.value = null

  if (!response.success) {
    toast.add({
      title: response.message || 'حذف آیتم ناموفق بود',
      color: 'error'
    })
    return
  }

  toast.add({
    title: 'آیتم از سبد حذف شد',
    color: 'success'
  })
}

async function clearCart(): Promise<void> {
  if (submitting.value || !items.value.length) return

  const response = await cartController.clearCart()
  if (!response.success) {
    toast.add({
      title: response.message || 'خالی کردن سبد ناموفق بود',
      color: 'error'
    })
    return
  }

  toast.add({
    title: 'سبد خرید خالی شد',
    color: 'success'
  })
}

onMounted(() => {
  loadCart()
})
</script>

<template>
  <div :class="embedded ? 'space-y-6' : 'mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6 lg:px-8'" dir="rtl">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p
          v-if="!embedded"
          class="text-sm font-bold text-primary"
        >
          سبد خرید
        </p>
        <h1
          class="mt-1 text-2xl font-black text-highlighted"
          :class="embedded ? 'text-xl' : ''"
        >
          {{ embedded ? 'محصولات انتخابی شما' : 'سبد خرید شما' }}
        </h1>
        <p class="mt-1 text-sm text-toned">
          هر وریانت به‌صورت جداگانه در سبد نگه‌داری می‌شود.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-refresh-cw"
          :loading="loading"
          @click="loadCart"
        >
          تازه‌سازی
        </UButton>
        <UButton
          v-if="items.length"
          color="error"
          variant="soft"
          icon="i-lucide-trash-2"
          :loading="submitting && !updatingItemId"
          @click="clearCart"
        >
          خالی کردن سبد
        </UButton>
      </div>
    </div>

    <div
      v-if="loading && !items.length"
      class="space-y-4"
    >
      <USkeleton
        v-for="index in 3"
        :key="index"
        class="h-32 w-full rounded-2xl"
      />
    </div>

    <div
      v-else-if="!items.length"
      class="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-default bg-elevated/40 px-6 py-16 text-center"
    >
      <div class="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <UIcon
          name="i-lucide-shopping-bag"
          class="size-8"
        />
      </div>
      <div class="space-y-2">
        <h2 class="text-lg font-black text-highlighted">
          سبد خرید خالی است
        </h2>
        <p class="max-w-sm text-sm leading-7 text-toned">
          محصول موردنظر را انتخاب کنید و وریانت دلخواه را به سبد اضافه کنید.
        </p>
      </div>
      <UButton
        to="/products"
        color="primary"
        icon="i-lucide-store"
      >
        مشاهده محصولات
      </UButton>
    </div>

    <div
      v-else
      class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]"
    >
      <div class="space-y-3">
        <article
          v-for="item in items"
          :key="item.id"
          class="overflow-hidden rounded-2xl border border-default bg-default/40"
        >
          <div class="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch">
            <NuxtLink
              :to="`/products/${item.product.slug}`"
              class="block shrink-0 overflow-hidden rounded-xl bg-elevated"
            >
              <NuxtImg
                v-if="item.thumbnail"
                :src="item.thumbnail"
                :alt="item.product.name"
                class="h-28 w-full object-cover sm:h-full sm:w-28"
                loading="lazy"
              />
              <div
                v-else
                class="flex h-28 w-full items-center justify-center sm:h-full sm:w-28"
              >
                <UIcon
                  name="i-lucide-image"
                  class="size-8 text-toned"
                />
              </div>
            </NuxtLink>

            <div class="flex min-w-0 flex-1 flex-col gap-3">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0 space-y-1">
                  <NuxtLink
                    :to="`/products/${item.product.slug}`"
                    class="line-clamp-2 text-sm font-bold text-highlighted hover:text-primary"
                  >
                    {{ item.product.name }}
                  </NuxtLink>
                  <p
                    v-if="variantLabel(item)"
                    class="text-xs leading-6 text-toned"
                  >
                    {{ variantLabel(item) }}
                  </p>
                  <p
                    v-if="item.variant?.sku"
                    class="text-[11px] text-muted"
                    dir="ltr"
                  >
                    SKU: {{ item.variant.sku }}
                  </p>
                </div>

                <UButton
                  color="error"
                  variant="ghost"
                  size="sm"
                  icon="i-lucide-x"
                  :loading="updatingItemId === item.id"
                  @click="removeItem(item)"
                />
              </div>

              <div class="mt-auto flex flex-wrap items-center justify-between gap-3">
                <div class="flex items-center gap-2 rounded-xl border border-default bg-elevated/60 p-1">
                  <UButton
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    square
                    icon="i-lucide-minus"
                    :disabled="item.quantity <= 1 || submitting"
                    :loading="updatingItemId === item.id"
                    @click="changeQuantity(item, item.quantity - 1)"
                  />
                  <span
                    class="min-w-8 text-center text-sm font-bold text-highlighted"
                    dir="ltr"
                  >
                    {{ item.quantity.toLocaleString('fa-IR') }}
                  </span>
                  <UButton
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    square
                    icon="i-lucide-plus"
                    :disabled="submitting"
                    :loading="updatingItemId === item.id"
                    @click="changeQuantity(item, item.quantity + 1)"
                  />
                </div>

                <div class="text-left" dir="ltr">
                  <p
                    v-if="item.variant && item.variant.salePrice != null && item.variant.salePrice < item.variant.price"
                    class="text-xs text-muted line-through"
                  >
                    {{ formatPrice(item.variant.price) }}
                  </p>
                  <p class="text-sm font-black text-primary">
                    {{ formatPrice(item.lineTotal) }}
                    <span class="text-xs font-medium text-toned">تومان</span>
                  </p>
                  <p class="text-[11px] text-muted">
                    واحد: {{ formatPrice(item.unitPrice) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>

      <aside class="h-fit rounded-2xl border border-default bg-elevated/50 p-5 lg:sticky lg:top-24">
        <h2 class="text-base font-black text-highlighted">
          خلاصه سفارش
        </h2>

        <dl class="mt-4 space-y-3 text-sm">
          <div class="flex items-center justify-between gap-3">
            <dt class="text-toned">تعداد وریانت‌ها</dt>
            <dd class="font-bold text-highlighted">
              {{ itemCount.toLocaleString('fa-IR') }}
            </dd>
          </div>
          <div class="flex items-center justify-between gap-3">
            <dt class="text-toned">جمع تعداد</dt>
            <dd class="font-bold text-highlighted">
              {{ totalQuantity.toLocaleString('fa-IR') }}
            </dd>
          </div>
          <div class="border-t border-default pt-3">
            <div class="flex items-center justify-between gap-3">
              <dt class="font-bold text-highlighted">مبلغ قابل پرداخت</dt>
              <dd
                class="text-base font-black text-primary"
                dir="ltr"
              >
                {{ formatPrice(totalPrice) }}
                <span class="text-xs font-medium text-toned">تومان</span>
              </dd>
            </div>
          </div>
        </dl>

        <UButton
          class="mt-5 w-full justify-center"
          color="primary"
          size="lg"
          icon="i-lucide-credit-card"
          disabled
        >
          ادامه خرید (به‌زودی)
        </UButton>
      </aside>
    </div>
  </div>
</template>
