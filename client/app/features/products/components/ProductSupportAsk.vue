<script setup lang="ts">
import { chatController } from '~/features/chat/controllers/index.controller'
import { useChatDS } from '~/features/chat/data/index.store'
import { buildProductSupportMessage } from '~/features/chat/types/index.type'
import type { TProduct } from '~/features/products/types/index.type'

const props = defineProps<{
  product: TProduct
}>()

const toast = useToast()
const chatDS = useChatDS()
const token = useCookie<string | null>('token')

const open = ref(false)
const sending = computed(() => chatDS.getSending)

const productImage = computed(
  () => props.product.medias?.[0]?.url ?? props.product.ogImage ?? ''
)

const productUrl = computed(() => {
  if (import.meta.client) {
    return window.location.href
  }
  return `${useRequestURL().origin}/products/${props.product.slug}`
})

const preparedMessage = computed(() =>
  buildProductSupportMessage(props.product.name, productUrl.value)
)

const previewLines = computed(() => preparedMessage.value.split('\n'))

function requireLogin(): boolean {
  if (token.value) return true
  toast.add({
    title: 'برای پرسش از پشتیبانی ابتدا وارد حساب شوید',
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
            سوال درباره محصول
          </span>
          <span class="mt-0.5 block text-xs leading-5 text-toned">
            از پشتیبانی بخواه راجع به این محصول راهنماییت کند
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
    title="پشتیبانی محصول"
    :ui="{ content: 'sm:max-w-lg' }"
  >
    <template #body>
      <div class="space-y-5">
        <div class="flex items-start gap-3 rounded-2xl border border-default bg-elevated/50 p-3">
          <div class="size-16 shrink-0 overflow-hidden rounded-xl bg-elevated">
            <NuxtImg
              v-if="productImage"
              :src="productImage"
              :alt="product.name"
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
          <div class="min-w-0">
            <p class="text-sm font-black text-highlighted">
              {{ product.name }}
            </p>
            <p class="mt-1 text-xs leading-6 text-toned">
              می‌خوای راجع به این محصول پشتیبانی بیشتر راهنماییت کنه؟
            </p>
          </div>
        </div>

        <div class="rounded-2xl border border-dashed border-default bg-default/40 p-4">
          <p class="mb-3 text-[11px] font-bold tracking-wide text-toned">
            پیش‌نمایش پیام ارسالی
          </p>
          <div class="rounded-2xl rounded-bl-md bg-primary px-4 py-3 text-sm leading-7 text-white">
            <p class="font-bold">
              {{ previewLines[0] }}
            </p>
            <a
              class="mt-1 block break-all text-xs text-white/85 underline underline-offset-4"
              :href="productUrl"
              target="_blank"
              rel="noopener noreferrer"
              @click.stop
            >
              {{ previewLines[1] }}
            </a>
            <p class="mt-2">
              {{ previewLines[2] }}
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
