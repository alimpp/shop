<script setup lang="ts">
import { chatController } from '~/features/chat/controllers/index.controller'
import { useChatDS } from '~/features/chat/data/index.store'
import { buildOrderSupportMessage } from '~/features/chat/types/index.type'
import type { OrderModel } from '~/features/orders/models/index.model'
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS
} from '~/features/orders/types/index.type'

const props = defineProps<{
  order: OrderModel
}>()

const toast = useToast()
const chatDS = useChatDS()
const token = useCookie<string | null>('token')
const requestURL = useRequestURL()

const open = ref(false)
const sending = computed(() => chatDS.getSending)

const orderUrl = computed(() => {
  const path = `/profile/orders/${props.order.id}`
  if (import.meta.client) {
    return `${window.location.origin}${path}`
  }
  return `${requestURL.origin}${path}`
})

const statusLabel = computed(
  () => ORDER_STATUS_LABELS[props.order.status] ?? props.order.status
)

const preparedMessage = computed(() =>
  buildOrderSupportMessage({
    orderNumber: props.order.orderNumber,
    orderId: props.order.id,
    statusLabel: statusLabel.value,
    orderUrl: orderUrl.value,
    paidAmount: props.order.paidAmount,
    formattedDate: props.order.formattedDate,
    itemCount: props.order.itemCount
  })
)

const previewLines = computed(() => preparedMessage.value.split('\n'))

function requireLogin(): boolean {
  if (token.value) return true
  toast.add({
    title: 'برای پیگیری سفارش ابتدا وارد حساب شوید',
    color: 'warning'
  })
  navigateTo('/auth/login-by-phone')
  return false
}

function openModal(): void {
  if (!requireLogin()) return
  open.value = true
}

async function confirmAsk(): Promise<void> {
  if (sending.value) return

  const response = await chatController.sendProductInquiry(preparedMessage.value)

  if (!response.success) {
    toast.add({
      title: response.message || 'ارسال پیام به پشتیبانی ناموفق بود',
      color: 'error'
    })
    return
  }

  open.value = false
  toast.add({
    title: 'پیام برای پشتیبانی ارسال شد',
    description: 'منتظر پاسخ ادمین بمانید',
    color: 'success'
  })
  await navigateTo('/profile/support')
}
</script>

<template>
  <div class="mt-6 border-t border-default pt-5">
    <button
      type="button"
      class="group flex w-full items-center justify-between gap-4 rounded-2xl bg-gradient-to-l from-primary/10 via-elevated to-transparent px-4 py-3.5 text-right ring-1 ring-primary/15 transition-all hover:ring-primary/40"
      @click="openModal"
    >
      <span class="flex min-w-0 items-center gap-3">
        <span class="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <UIcon
            name="i-lucide-message-circle-question"
            class="size-5"
          />
        </span>
        <span class="min-w-0">
          <span class="block text-sm font-black text-highlighted">
            پیگیری سفارش
          </span>
          <span class="mt-0.5 block text-xs leading-5 text-toned">
            از پشتیبانی بخواه وضعیت این سفارش را پیگیری کند
          </span>
        </span>
      </span>
      <UIcon
        name="i-lucide-chevron-left"
        class="size-4 shrink-0 text-primary transition-transform group-hover:-translate-x-0.5"
      />
    </button>
  </div>

  <UModal
    v-model:open="open"
    title="پیگیری سفارش"
    :ui="{ content: 'sm:max-w-lg' }"
  >
    <template #body>
      <div class="space-y-5">
        <div class="flex items-start gap-3 rounded-2xl border border-default bg-elevated/50 p-3">
          <div class="inline-flex size-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <UIcon
              name="i-lucide-package-search"
              class="size-7"
            />
          </div>
          <div class="min-w-0 space-y-2">
            <p class="text-sm font-black text-highlighted">
              {{ order.orderNumber }}
            </p>
            <UBadge
              :color="ORDER_STATUS_COLORS[order.status]"
              variant="subtle"
              size="sm"
            >
              {{ statusLabel }}
            </UBadge>
            <p class="text-xs leading-6 text-toned">
              می‌خوای پشتیبانی وضعیت این سفارش رو برات پیگیری کنه؟
            </p>
          </div>
        </div>

        <div class="rounded-2xl border border-dashed border-default bg-default/40 p-4">
          <p class="mb-3 text-[11px] font-bold tracking-wide text-toned">
            پیش‌نمایش پیام ارسالی
          </p>
          <div class="space-y-1 rounded-2xl rounded-bl-md bg-primary px-4 py-3 text-sm leading-7 text-white">
            <p class="font-bold">
              {{ previewLines[0] }}
            </p>
            <a
              class="mt-1 block break-all text-xs text-white/85 underline underline-offset-4"
              :href="orderUrl"
              target="_blank"
              rel="noopener noreferrer"
              @click.stop
            >
              {{ previewLines[1] }}
            </a>
            <p
              v-for="(line, index) in previewLines.slice(2)"
              :key="index"
              :class="line.trim() ? '' : 'h-3'"
            >
              {{ line }}
            </p>
          </div>
        </div>

        <p class="text-xs leading-6 text-muted">
          بعد از تایید، پیام بالا برای پشتیبانی ارسال می‌شود و به صفحه چت می‌روید تا منتظر پاسخ ادمین بمانید.
        </p>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full items-center justify-end gap-2">
        <UButton
          color="neutral"
          variant="ghost"
          :disabled="sending"
          @click="open = false"
        >
          انصراف
        </UButton>
        <UButton
          color="primary"
          icon="i-lucide-send"
          :loading="sending"
          @click="confirmAsk"
        >
          تایید و ارسال
        </UButton>
      </div>
    </template>
  </UModal>
</template>
