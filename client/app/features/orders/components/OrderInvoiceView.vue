<script setup lang="ts">
import type { OrderModel } from '../models/index.model'
import { SITE_NAME } from '~/utils/seo'
import { ORDER_STATUS_LABELS } from '../types/index.type'
import { PAYMENT_STATUS_LABELS } from '~/features/payments/types/index.type'

defineProps<{
  order: OrderModel
}>()

function formatPrice(value: number): string {
  return `${new Intl.NumberFormat('fa-IR').format(value)} تومان`
}

function printInvoice(): void {
  window.print()
}
</script>

<template>
  <div>
    <div class="mb-4 flex flex-wrap gap-2 print:hidden">
      <UButton
        color="primary"
        icon="i-lucide-printer"
        @click="printInvoice"
      >
        چاپ / ذخیره PDF
      </UButton>
    </div>

    <div
      class="invoice-sheet rounded-2xl border border-default bg-white p-6 text-[#111] sm:p-8"
      dir="rtl"
    >
      <div class="flex flex-wrap items-start justify-between gap-4 border-b border-black/10 pb-5">
        <div>
          <p class="text-sm font-bold text-emerald-700">
            {{ SITE_NAME }}
          </p>
          <h1 class="mt-1 text-2xl font-black">
            فاکتور فروش
          </h1>
          <p class="mt-2 text-sm text-black/60">
            شماره سفارش: {{ order.orderNumber }}
          </p>
        </div>
        <div class="text-sm text-black/70">
          <p>{{ order.formattedDate }}</p>
          <p class="mt-1">
            وضعیت: {{ ORDER_STATUS_LABELS[order.status] }}
          </p>
          <p
            v-if="order.payment"
            class="mt-1"
          >
            پرداخت: {{ PAYMENT_STATUS_LABELS[order.payment.status] }}
          </p>
        </div>
      </div>

      <div class="mt-5 grid gap-4 sm:grid-cols-2">
        <div class="rounded-xl bg-black/[0.03] p-4">
          <p class="text-xs font-bold text-black/50">
            خریدار
          </p>
          <p class="mt-2 text-sm font-bold">
            {{ order.customerName || 'کاربر' }}
          </p>
          <p
            v-if="order.user?.phone"
            class="mt-1 text-xs"
            dir="ltr"
          >
            {{ order.user.phone }}
          </p>
        </div>
        <div class="rounded-xl bg-black/[0.03] p-4">
          <p class="text-xs font-bold text-black/50">
            آدرس ارسال
          </p>
          <p class="mt-2 text-sm font-bold">
            {{ order.address.name }}
          </p>
          <p class="mt-1 text-xs leading-6 text-black/70">
            {{ order.address.summary }}
          </p>
        </div>
      </div>

      <div class="mt-6 overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="border-b border-black/10 text-black/60">
              <th class="py-2 text-start font-medium">
                ردیف
              </th>
              <th class="py-2 text-start font-medium">
                محصول
              </th>
              <th class="py-2 text-start font-medium">
                تعداد
              </th>
              <th class="py-2 text-start font-medium">
                قیمت واحد
              </th>
              <th class="py-2 text-start font-medium">
                جمع
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in order.items"
              :key="item.id"
              class="border-b border-black/5"
            >
              <td class="py-3">
                {{ (index + 1).toLocaleString('fa-IR') }}
              </td>
              <td class="py-3">
                <p class="font-bold">
                  {{ item.productName }}
                </p>
                <p
                  v-if="item.optionsLabel"
                  class="mt-1 text-xs text-black/55"
                >
                  {{ item.optionsLabel }}
                </p>
              </td>
              <td class="py-3">
                {{ item.quantity.toLocaleString('fa-IR') }}
              </td>
              <td
                class="py-3"
                dir="ltr"
              >
                {{ formatPrice(item.unitPrice) }}
              </td>
              <td
                class="py-3 font-bold"
                dir="ltr"
              >
                {{ formatPrice(item.lineTotal) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-6 ml-auto w-full max-w-sm space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-black/60">جمع اقلام</span>
          <span dir="ltr">{{ formatPrice(order.subtotalAmount) }}</span>
        </div>
        <div
          v-if="order.discountAmount > 0"
          class="flex justify-between text-emerald-700"
        >
          <span>
            تخفیف
            <span v-if="order.discountCode">({{ order.discountCode }})</span>
          </span>
          <span dir="ltr">− {{ formatPrice(order.discountAmount) }}</span>
        </div>
        <div class="flex justify-between border-t border-black/10 pt-3 text-base font-black">
          <span>مبلغ قابل پرداخت</span>
          <span dir="ltr">{{ formatPrice(order.paidAmount) }}</span>
        </div>
        <p
          v-if="order.payment?.trackingCode"
          class="pt-2 text-xs text-black/50"
          dir="ltr"
        >
          کد تراکنش: {{ order.payment.trackingCode }}
        </p>
      </div>
    </div>
  </div>
</template>

<style>
@media print {
  body {
    background: white !important;
  }

  .print\:hidden,
  header,
  nav,
  aside,
  .profile-shell-actions {
    display: none !important;
  }

  .invoice-sheet {
    border: none !important;
    box-shadow: none !important;
  }
}
</style>
