<script setup lang="ts">
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

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const toast = useToast()

const loading = ref(false)
const submitting = ref(false)
const payments = ref<TPaymentTransaction[]>([])
const selectedFilter = ref<'all' | TPaymentStatus>('all')
const search = ref('')
const detailOpen = ref(false)
const selected = ref<TPaymentTransaction | null>(null)
const statusDraft = ref<TPaymentStatus>('unknown')
let searchTimer: ReturnType<typeof setTimeout> | null = null

const filterItems = [
  { label: 'همه', value: 'all' },
  { label: PAYMENT_STATUS_LABELS.success, value: 'success' },
  { label: PAYMENT_STATUS_LABELS.failed, value: 'failed' },
  { label: PAYMENT_STATUS_LABELS.unknown, value: 'unknown' }
]

const statusItems = (
  Object.entries(PAYMENT_STATUS_LABELS) as Array<[TPaymentStatus, string]>
).map(([value, label]) => ({ value, label }))

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

async function fetchPayments(): Promise<void> {
  loading.value = true
  const response = await paymentsController.getAdminPayments({
    page: 1,
    limit: 50,
    status: selectedFilter.value === 'all' ? undefined : selectedFilter.value,
    search: search.value.trim() || undefined
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

async function openDetail(item: TPaymentTransaction): Promise<void> {
  detailOpen.value = true
  const response = await paymentsController.getAdminPayment(item.id)
  if (!response.success || !response.data) {
    toast.add({
      title: response.message || 'دریافت جزئیات ناموفق بود',
      color: 'error'
    })
    detailOpen.value = false
    return
  }
  selected.value = response.data
  statusDraft.value = response.data.status
}

async function saveStatus(): Promise<void> {
  if (!selected.value || submitting.value) return
  submitting.value = true
  const response = await paymentsController.updateAdminPaymentStatus(
    selected.value.id,
    { status: statusDraft.value }
  )
  submitting.value = false

  if (!response.success || !response.data) {
    toast.add({
      title: response.message || 'بروزرسانی وضعیت ناموفق بود',
      color: 'error'
    })
    return
  }

  selected.value = response.data
  payments.value = payments.value.map(item =>
    item.id === response.data!.id ? response.data! : item
  )
  toast.add({ title: 'وضعیت تراکنش بروزرسانی شد', color: 'success' })
}

watch(selectedFilter, () => {
  void fetchPayments()
})

watch(search, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    void fetchPayments()
  }, 400)
})

onMounted(() => {
  void fetchPayments()
})

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
})
</script>

<template>
  <UDashboardPanel id="admin-payments">
    <template #header>
      <UDashboardNavbar title="تراکنش‌های پرداخت">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <USelect
            v-model="selectedFilter"
            :items="filterItems"
            class="w-40"
          />
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-refresh-cw"
            :loading="loading"
            @click="fetchPayments"
          >
            بروزرسانی
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <BaseDashboardPanelBody>
        <div class="mb-4">
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="جستجو در کد پیگیری، سفارش یا توضیحات..."
            class="max-w-md"
          />
        </div>

        <div
          v-if="loading && !payments.length"
          class="flex items-center justify-center gap-2 py-16 text-sm text-toned"
        >
          <UIcon
            name="i-lucide-loader-2"
            class="size-5 animate-spin text-primary"
          />
          در حال بارگذاری...
        </div>

        <div
          v-else-if="!payments.length"
          class="rounded-2xl border border-dashed border-default px-4 py-16 text-center text-sm text-toned"
        >
          تراکنشی ثبت نشده است.
        </div>

        <div
          v-else
          class="space-y-3"
        >
          <button
            v-for="item in payments"
            :key="item.id"
            type="button"
            class="flex w-full items-start gap-4 rounded-2xl border border-default bg-elevated/50 p-4 text-start transition hover:border-primary/30 hover:bg-elevated"
            @click="openDetail(item)"
          >
            <span class="mt-1 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UIcon
                name="i-lucide-credit-card"
                class="size-4"
              />
            </span>
            <span class="min-w-0 flex-1 space-y-1.5">
              <span class="flex flex-wrap items-center gap-2">
                <span class="font-bold text-highlighted">
                  {{ item.description || PAYMENT_TYPE_LABELS[item.type] }}
                </span>
                <UBadge
                  :color="PAYMENT_STATUS_COLORS[item.status]"
                  variant="subtle"
                  size="sm"
                >
                  {{ PAYMENT_STATUS_LABELS[item.status] }}
                </UBadge>
              </span>
              <span class="block text-xs text-muted"
                    dir="ltr"
              >
                {{ item.trackingCode }}
              </span>
              <span class="flex flex-wrap gap-3 text-xs text-toned">
                <span>{{ formatPrice(item.amount) }}</span>
                <span>{{ formatDate(item.createdAt) }}</span>
                <span v-if="item.user">
                  {{ [item.user.fristname, item.user.lastname].filter(Boolean).join(' ') || item.user.phone }}
                </span>
                <span v-if="item.order">{{ item.order.orderNumber }}</span>
              </span>
            </span>
            <UIcon
              name="i-lucide-chevron-left"
              class="mt-2 size-4 shrink-0 text-muted"
            />
          </button>
        </div>
      </BaseDashboardPanelBody>
    </template>
  </UDashboardPanel>

  <UModal
    v-model:open="detailOpen"
    :title="selected?.trackingCode || 'جزئیات تراکنش'"
    description="مدیریت وضعیت پرداخت"
  >
    <template #body>
      <div
        v-if="selected"
        class="space-y-4"
      >
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="rounded-xl border border-default p-3">
            <p class="text-xs text-muted">
              مبلغ
            </p>
            <p class="mt-1 font-bold text-highlighted">
              {{ formatPrice(selected.amount) }}
            </p>
          </div>
          <div class="rounded-xl border border-default p-3">
            <p class="text-xs text-muted">
              زمان ثبت
            </p>
            <p class="mt-1 font-bold text-highlighted">
              {{ formatDate(selected.createdAt) }}
            </p>
          </div>
        </div>

        <p class="text-sm text-toned">
          {{ selected.description }}
        </p>

        <UFormField label="وضعیت تراکنش">
          <USelect
            v-model="statusDraft"
            :items="statusItems"
            class="w-full"
          />
        </UFormField>

        <p class="text-xs text-muted">
          تا اتصال درگاه، وضعیت را می‌توانید دستی روی موفق / ناموفق / نامشخص تنظیم کنید.
        </p>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton
          color="neutral"
          variant="outline"
          @click="detailOpen = false"
        >
          بستن
        </UButton>
        <UButton
          color="primary"
          :loading="submitting"
          @click="saveStatus"
        >
          ذخیره وضعیت
        </UButton>
      </div>
    </template>
  </UModal>
</template>
