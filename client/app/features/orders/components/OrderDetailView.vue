<script setup lang="ts">
import type { OrderModel } from '../models/index.model'
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_FLOW,
  ORDER_STATUS_LABELS,
  type TOrderStatus
} from '../types/index.type'
import {
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS
} from '~/features/payments/types/index.type'

const props = withDefaults(
  defineProps<{
    order: OrderModel
    showCustomer?: boolean
  }>(),
  {
    showCustomer: false
  }
)

const steps = computed(() => {
  if (props.order.status === 'cancelled' || props.order.status === 'returned') {
    return [...ORDER_STATUS_FLOW, props.order.status]
  }
  return ORDER_STATUS_FLOW
})

function formatPrice(value: number): string {
  return `${new Intl.NumberFormat('fa-IR').format(value)} تومان`
}

function stepState(status: TOrderStatus): 'done' | 'current' | 'todo' {
  const current = props.order.status

  if (current === 'cancelled' || current === 'returned') {
    if (status === current) return 'current'
    if (ORDER_STATUS_FLOW.includes(status)) return 'done'
    return 'todo'
  }

  const currentIndex = ORDER_STATUS_FLOW.indexOf(current)
  const stepIndex = ORDER_STATUS_FLOW.indexOf(status)

  if (stepIndex < currentIndex) return 'done'
  if (stepIndex === currentIndex) return 'current'
  return 'todo'
}

function stepClass(status: TOrderStatus): string {
  const state = stepState(status)
  if (status === 'cancelled') return 'bg-error text-white'
  if (status === 'returned') return 'bg-neutral text-white'
  if (state === 'done') {
    if (status === 'success') return 'bg-success text-white'
    return 'bg-primary text-white'
  }
  if (state === 'current') {
    if (status === 'success') return 'bg-success text-white'
    return 'bg-primary/15 text-primary ring-2 ring-primary/40'
  }
  return 'bg-elevated text-muted'
}
</script>

<template>
  <div class="space-y-6">
    <section class="overflow-hidden rounded-3xl border border-default bg-gradient-to-bl from-primary/10 via-elevated/60 to-transparent">
      <div class="flex flex-wrap items-start justify-between gap-4 p-5 sm:p-6">
        <div class="min-w-0 space-y-2">
          <p class="text-xs font-medium tracking-wide text-toned">
            شماره سفارش
          </p>
          <h2 class="text-xl font-black text-highlighted sm:text-2xl">
            {{ order.orderNumber }}
          </h2>
          <p class="text-sm text-toned">
            {{ order.formattedDate }}
          </p>
        </div>
        <div class="space-y-3 text-left">
          <UBadge
            :color="ORDER_STATUS_COLORS[order.status]"
            variant="subtle"
            size="lg"
          >
            {{ ORDER_STATUS_LABELS[order.status] }}
          </UBadge>
          <p class="text-base font-black text-primary">
            {{ formatPrice(order.paidAmount) }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-px border-t border-default bg-default/40 sm:grid-cols-4">
        <div class="bg-default/80 px-4 py-3">
          <p class="text-[11px] text-toned">
            تعداد اقلام
          </p>
          <p class="mt-1 text-sm font-bold text-highlighted">
            {{ order.itemCount.toLocaleString('fa-IR') }}
          </p>
        </div>
        <div class="bg-default/80 px-4 py-3">
          <p class="text-[11px] text-toned">
            مجموع تعداد
          </p>
          <p class="mt-1 text-sm font-bold text-highlighted">
            {{ order.totalQuantity.toLocaleString('fa-IR') }}
          </p>
        </div>
        <div class="bg-default/80 px-4 py-3">
          <p class="text-[11px] text-toned">
            شهر ارسال
          </p>
          <p class="mt-1 truncate text-sm font-bold text-highlighted">
            {{ order.address.city || '—' }}
          </p>
        </div>
        <div class="bg-default/80 px-4 py-3">
          <p class="text-[11px] text-toned">
            وضعیت پرداخت
          </p>
          <div class="mt-1">
            <UBadge
              v-if="order.payment"
              :color="PAYMENT_STATUS_COLORS[order.payment.status]"
              variant="subtle"
              size="sm"
            >
              {{ PAYMENT_STATUS_LABELS[order.payment.status] }}
            </UBadge>
            <p
              v-else
              class="text-sm font-bold text-highlighted"
            >
              —
            </p>
          </div>
        </div>
      </div>

      <div
        v-if="order.discountAmount > 0 || order.payment?.trackingCode"
        class="space-y-1 border-t border-default px-4 py-3 text-xs text-toned"
      >
        <p v-if="order.discountAmount > 0">
          تخفیف
          <span v-if="order.discountCode">({{ order.discountCode }})</span>:
          {{ formatPrice(order.discountAmount) }}
          — جمع قبل تخفیف {{ formatPrice(order.subtotalAmount) }}
        </p>
        <p
          v-if="order.payment?.trackingCode"
          dir="ltr"
        >
          کد تراکنش: {{ order.payment.trackingCode }}
        </p>
      </div>
    </section>

    <section class="rounded-3xl border border-default bg-elevated/30 p-5">
      <h3 class="mb-4 text-sm font-bold text-highlighted">
        وضعیت سفارش
      </h3>
      <ol class="flex flex-wrap items-center gap-2">
        <li
          v-for="(status, index) in steps"
          :key="status"
          class="flex items-center gap-2"
        >
          <span
            class="inline-flex size-8 items-center justify-center rounded-full text-xs font-black"
            :class="stepClass(status)"
          >
            {{ (index + 1).toLocaleString('fa-IR') }}
          </span>
          <span class="text-xs font-medium text-highlighted">
            {{ ORDER_STATUS_LABELS[status] }}
          </span>
          <span
            v-if="index < steps.length - 1"
            class="mx-1 hidden h-px w-6 bg-default sm:block"
          />
        </li>
      </ol>
    </section>

    <div class="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
      <section class="space-y-3">
        <h3 class="text-sm font-bold text-highlighted">
          اقلام سفارش
        </h3>
        <article
          v-for="item in order.items"
          :key="item.id"
          class="flex gap-4 rounded-2xl border border-default bg-default/40 p-4"
        >
          <div class="size-20 shrink-0 overflow-hidden rounded-2xl bg-elevated">
            <NuxtImg
              v-if="item.productImage"
              :src="item.productImage"
              :alt="item.productName"
              class="size-full object-cover"
            />
            <div
              v-else
              class="flex size-full items-center justify-center"
            >
              <UIcon
                name="i-lucide-package"
                class="size-6 text-muted"
              />
            </div>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-bold text-highlighted">
              {{ item.productName }}
            </p>
            <PublicProductSelectionChips
              class="mt-1"
              :variant="item.variant"
              :selected-options="item.selectedOptions"
              :include-sku="false"
            />
            <p
              v-if="item.variant?.sku"
              class="mt-1 text-[11px] text-muted"
              dir="ltr"
            >
              SKU: {{ item.variant.sku }}
            </p>
            <div class="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-toned">
              <span>
                تعداد {{ item.quantity.toLocaleString('fa-IR') }}
                × {{ formatPrice(item.unitPrice) }}
              </span>
              <span class="font-bold text-highlighted">
                {{ formatPrice(item.lineTotal) }}
              </span>
            </div>
          </div>
        </article>
      </section>

      <aside class="space-y-4">
        <section
          v-if="showCustomer && order.user"
          class="rounded-2xl border border-default bg-default/40 p-4"
        >
          <h3 class="text-sm font-bold text-highlighted">
            مشتری
          </h3>
          <p class="mt-2 text-sm font-medium text-highlighted">
            {{ order.customerName || 'کاربر' }}
          </p>
          <p
            v-if="order.user.phone"
            class="mt-1 text-xs text-toned"
            dir="ltr"
          >
            {{ order.user.phone }}
          </p>
        </section>

        <section class="rounded-2xl border border-default bg-default/40 p-4">
          <h3 class="text-sm font-bold text-highlighted">
            آدرس ارسال
          </h3>
          <p class="mt-2 text-sm font-medium text-highlighted">
            {{ order.address.name }}
          </p>
          <p class="mt-1 text-xs leading-6 text-toned">
            {{ order.address.summary }}
          </p>
          <p
            class="mt-2 text-xs text-muted"
            dir="ltr"
          >
            کد پستی: {{ order.address.postalCode }}
          </p>
        </section>
      </aside>
    </div>
  </div>
</template>
