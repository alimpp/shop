<script setup lang="ts">
import ProfileShell from '~/components/profile/ProfileShell.vue'
import { paymentsController } from '~/features/payments/controllers/index.controller'
import type { TPaymentTransaction } from '~/features/payments/types/index.type'
import {
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_TYPE_LABELS
} from '~/features/payments/types/index.type'
import { ORDER_STATUS_LABELS } from '~/features/orders/types/index.type'
import type { TOrderStatus } from '~/features/orders/types/index.type'

definePageMeta({ title: 'جزئیات پرداخت', robots: 'noindex, nofollow' })

const route = useRoute()
const toast = useToast()
const paymentId = String(route.params.id ?? '')

const loading = ref(true)
const payment = ref<TPaymentTransaction | null>(null)

function formatPrice(value: number): string {
  return `${new Intl.NumberFormat('fa-IR').format(value)} تومان`
}

function formatDate(value?: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleString('fa-IR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function orderStatusLabel(status?: string): string {
  if (!status) return '—'
  return ORDER_STATUS_LABELS[status as TOrderStatus] ?? status
}

async function loadPayment(): Promise<void> {
  loading.value = true
  const response = await paymentsController.getMyPayment(paymentId)
  loading.value = false

  if (!response.success || !response.data) {
    payment.value = null
    toast.add({
      title: response.message || 'دریافت تراکنش ناموفق بود',
      color: 'error'
    })
    return
  }

  payment.value = response.data
}

onMounted(() => {
  void loadPayment()
})
</script>

<template>
  <ProfileShell
    title="جزئیات پرداخت"
    back-to="/profile/payments"
  >
    <div
      v-if="loading"
      class="flex items-center justify-center py-20"
    >
      <UIcon
        name="i-lucide-loader-2"
        class="size-7 animate-spin text-primary"
      />
    </div>

    <div
      v-else-if="!payment"
      class="rounded-2xl border border-dashed border-default px-6 py-16 text-center"
    >
      <UIcon
        name="i-lucide-credit-card"
        class="mx-auto mb-3 size-10 text-toned"
      />
      <p class="text-sm text-toned">
        تراکنش یافت نشد
      </p>
      <UButton
        class="mt-4"
        to="/profile/payments"
        color="neutral"
        variant="soft"
      >
        بازگشت به پرداخت‌ها
      </UButton>
    </div>

    <div
      v-else
      class="space-y-4"
    >
      <article class="overflow-hidden rounded-2xl border border-default bg-elevated/40">
        <div class="border-b border-default bg-primary/5 px-5 py-5 sm:px-6">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="space-y-2">
              <div class="flex flex-wrap items-center gap-2">
                <h1 class="text-lg font-black text-highlighted">
                  {{ payment.description || PAYMENT_TYPE_LABELS[payment.type] }}
                </h1>
                <UBadge
                  :color="PAYMENT_STATUS_COLORS[payment.status]"
                  variant="subtle"
                >
                  {{ PAYMENT_STATUS_LABELS[payment.status] }}
                </UBadge>
              </div>
              <p
                class="text-xs text-muted"
                dir="ltr"
              >
                {{ payment.trackingCode }}
              </p>
            </div>
            <p class="text-xl font-black text-primary">
              {{ formatPrice(payment.amount) }}
            </p>
          </div>
        </div>

        <dl class="grid gap-4 px-5 py-5 sm:grid-cols-2 sm:px-6">
          <div>
            <dt class="text-xs text-muted">
              نوع تراکنش
            </dt>
            <dd class="mt-1 text-sm font-medium text-highlighted">
              {{ PAYMENT_TYPE_LABELS[payment.type] }}
            </dd>
          </div>
          <div>
            <dt class="text-xs text-muted">
              تاریخ
            </dt>
            <dd class="mt-1 text-sm font-medium text-highlighted">
              {{ formatDate(payment.createdAt) }}
            </dd>
          </div>
          <div v-if="payment.gateway">
            <dt class="text-xs text-muted">
              درگاه
            </dt>
            <dd class="mt-1 text-sm font-medium text-highlighted">
              {{ payment.gateway }}
            </dd>
          </div>
          <div v-if="payment.gatewayRef">
            <dt class="text-xs text-muted">
              کد پیگیری درگاه
            </dt>
            <dd class="mt-1 text-sm font-medium text-highlighted">
              {{ payment.gatewayRef }}
            </dd>
          </div>
        </dl>
      </article>

      <article
        v-if="payment.orderId"
        class="rounded-2xl border border-default bg-elevated/40 p-5 sm:p-6"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-base font-bold text-highlighted">
              سفارش مرتبط
            </h2>
            <p class="mt-1 text-sm text-toned">
              شماره سفارش:
              <span class="font-semibold text-highlighted">
                {{ payment.order?.orderNumber || '—' }}
              </span>
            </p>
            <p class="mt-1 text-xs text-muted">
              وضعیت سفارش: {{ orderStatusLabel(payment.order?.status) }}
            </p>
          </div>
          <UButton
            :to="`/profile/orders/${payment.orderId}`"
            color="primary"
            icon="i-lucide-package"
          >
            مشاهده سفارش
          </UButton>
        </div>
      </article>

      <div class="flex flex-wrap gap-2">
        <UButton
          to="/profile/payments"
          color="neutral"
          variant="soft"
          icon="i-lucide-arrow-right"
        >
          همه پرداخت‌ها
        </UButton>
        <UButton
          v-if="payment.orderId"
          :to="`/profile/orders/${payment.orderId}/invoice`"
          color="neutral"
          variant="ghost"
          icon="i-lucide-file-text"
        >
          فاکتور سفارش
        </UButton>
      </div>
    </div>
  </ProfileShell>
</template>
