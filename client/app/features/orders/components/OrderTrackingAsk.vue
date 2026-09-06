<script setup lang="ts">
import { ordersController } from '~/features/orders/controllers/index.controller'
import type { OrderModel } from '~/features/orders/models/index.model'
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS
} from '~/features/orders/types/index.type'

const props = defineProps<{
  order: OrderModel
}>()

const toast = useToast()
const open = ref(false)
const loadingPreview = ref(false)
const sending = ref(false)
const previewContent = ref('')

const previewLines = computed(() =>
  previewContent.value ? previewContent.value.split('\n') : []
)

async function openModal(): Promise<void> {
  open.value = true
  loadingPreview.value = true
  previewContent.value = ''

  const response = await ordersController.getAdminOrderTrackingPreview(
    props.order.id
  )

  loadingPreview.value = false

  if (!response.success || !response.data?.content) {
    toast.add({
      title: response.message || 'دریافت پیش‌نمایش پیام ناموفق بود',
      color: 'error'
    })
    open.value = false
    return
  }

  previewContent.value = response.data.content
}

async function confirmSend(): Promise<void> {
  if (sending.value) return
  sending.value = true

  const response = await ordersController.sendAdminOrderTracking(
    props.order.id
  )

  sending.value = false

  if (!response.success || !response.data?.chatId) {
    toast.add({
      title: response.message || 'ارسال پیگیری سفارش ناموفق بود',
      color: 'error'
    })
    return
  }

  open.value = false
  toast.add({
    title: 'پیام پیگیری برای مشتری ارسال شد',
    description: 'در چت پشتیبانی قابل مشاهده است',
    color: 'success'
  })
  await navigateTo(`/admin/chat/${response.data.chatId}`)
}
</script>

<template>
  <div class="mt-2">
    <button
      type="button"
      class="group flex w-full items-center justify-between gap-4 rounded-2xl bg-gradient-to-l from-primary/10 via-elevated to-transparent px-4 py-3.5 text-right ring-1 ring-primary/15 transition-all hover:ring-primary/40"
      @click="openModal"
    >
      <span class="flex min-w-0 items-center gap-3">
        <span class="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <UIcon
            name="i-lucide-radar"
            class="size-5"
          />
        </span>
        <span class="min-w-0">
          <span class="block text-sm font-black text-highlighted">
            پیگیری سفارش
          </span>
          <span class="mt-0.5 block text-xs leading-5 text-toned">
            ارسال گزارش وضعیت سفارش به چت پشتیبانی مشتری
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
    :description="order.orderNumber"
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
              {{ ORDER_STATUS_LABELS[order.status] }}
            </UBadge>
            <p class="text-xs leading-6 text-toned">
              پیش‌نمایش پیام زیر برای مشتری در چت پشتیبانی ارسال می‌شود.
            </p>
          </div>
        </div>

        <div class="rounded-2xl border border-dashed border-default bg-default/40 p-4">
          <p class="mb-3 text-[11px] font-bold tracking-wide text-toned">
            پیش‌نمایش پیام ارسالی
          </p>

          <div
            v-if="loadingPreview"
            class="flex justify-center py-8"
          >
            <UIcon
              name="i-lucide-loader-2"
              class="size-6 animate-spin text-primary"
            />
          </div>

          <div
            v-else
            class="max-h-72 space-y-1 overflow-y-auto rounded-2xl rounded-bl-md bg-primary px-4 py-3 text-sm leading-7 text-white"
          >
            <p
              v-for="(line, index) in previewLines"
              :key="index"
              :class="line.trim() ? '' : 'h-3'"
            >
              {{ line }}
            </p>
          </div>
        </div>

        <p class="text-xs leading-6 text-muted">
          بعد از تایید، پیام بالا برای مشتری ارسال می‌شود و اعلان پیگیری هم ثبت می‌گردد.
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
          :disabled="loadingPreview || !previewContent"
          @click="confirmSend"
        >
          تایید و ارسال
        </UButton>
      </div>
    </template>
  </UModal>
</template>
