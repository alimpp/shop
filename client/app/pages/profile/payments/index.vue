<script setup lang="ts">
import ProfileShell from '~/components/profile/ProfileShell.vue'
import { paymentsController } from '~/features/payments/controllers/index.controller'
import type {
  TPaymentStatus,
  TPaymentTransaction
} from '~/features/payments/types/index.type'
import {
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_TYPE_LABELS
} from '~/features/payments/types/index.type'

definePageMeta({ title: 'پرداخت‌ها', robots: 'noindex, nofollow' })

const toast = useToast()
const loading = ref(false)
const payments = ref<TPaymentTransaction[]>([])
const selectedFilter = ref<'all' | TPaymentStatus>('all')

const filterItems = [
  { label: 'همه', value: 'all' },
  { label: PAYMENT_STATUS_LABELS.success, value: 'success' },
  { label: PAYMENT_STATUS_LABELS.failed, value: 'failed' },
  { label: PAYMENT_STATUS_LABELS.unknown, value: 'unknown' }
]

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

async function loadPayments(): Promise<void> {
  loading.value = true
  const response = await paymentsController.getMyPayments({
    page: 1,
    limit: 50,
    status: selectedFilter.value === 'all' ? undefined : selectedFilter.value
  })
  loading.value = false

  if (!response.success) {
    toast.add({
      title: response.message || 'دریافت تراکنش‌ها ناموفق بود',
      color: 'error'
    })
    return
  }

  payments.value = response.data?.items ?? []
}

watch(selectedFilter, () => {
  void loadPayments()
})

onMounted(() => {
  void loadPayments()
})
</script>

<template>
  <ProfileShell title="پرداخت ها">
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-black text-highlighted">
          تراکنش‌های پرداخت
        </h2>
        <p class="mt-1 text-sm text-toned">
          وضعیت پرداخت سفارش‌ها (موفق، ناموفق، نامشخص)
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <USelect
          v-model="selectedFilter"
          :items="filterItems"
          class="w-40"
        />
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-refresh-cw"
          :loading="loading"
          @click="loadPayments"
        >
          تازه‌سازی
        </UButton>
      </div>
    </div>

    <div
      v-if="loading && !payments.length"
      class="space-y-3"
    >
      <USkeleton
        v-for="index in 3"
        :key="index"
        class="h-28 w-full rounded-2xl"
      />
    </div>

    <div
      v-else-if="!payments.length"
      class="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-default px-6 py-16 text-center"
    >
      <UIcon
        name="i-lucide-credit-card"
        class="size-10 text-toned"
      />
      <p class="text-sm text-toned">
        هنوز تراکنشی ثبت نشده است.
      </p>
      <UButton
        to="/products"
        color="primary"
      >
        مشاهده محصولات
      </UButton>
    </div>

    <div
      v-else
      class="space-y-3"
    >
      <NuxtLink
        v-for="payment in payments"
        :key="payment.id"
        :to="`/profile/payments/${payment.id}`"
        class="block rounded-2xl border border-default bg-elevated/40 p-4 transition-colors hover:border-primary/40 hover:bg-primary/5 sm:p-5"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="space-y-1.5">
            <div class="flex flex-wrap items-center gap-2">
              <p class="font-bold text-highlighted">
                {{ payment.description || PAYMENT_TYPE_LABELS[payment.type] }}
              </p>
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

          <p class="text-base font-black text-primary">
            {{ formatPrice(payment.amount) }}
          </p>
        </div>

        <div class="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-toned sm:text-sm">
          <span>{{ formatDate(payment.createdAt) }}</span>
          <span
            v-if="payment.orderId"
            class="text-primary"
          >
            سفارش {{ payment.order?.orderNumber || '' }}
          </span>
          <span v-if="payment.gatewayRef">
            کد پیگیری درگاه: {{ payment.gatewayRef }}
          </span>
        </div>
      </NuxtLink>
    </div>
  </ProfileShell>
</template>
