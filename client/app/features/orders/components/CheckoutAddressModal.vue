<script setup lang="ts">
import AddressFormModal from '~/features/addresses/components/AddressFormModal.vue'
import { addressesController } from '~/features/addresses/controllers/index.controller'
import { useAddressesDS } from '~/features/addresses/data/index.store'
import type { AddressModel } from '~/features/addresses/models/index.model'
import type { TAddressPayload } from '~/features/addresses/types/index.type'

const props = defineProps<{
  open: boolean
  submitting: boolean
  paidAmount: number
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: [addressId: string]
}>()

const toast = useToast()
const addressesDS = useAddressesDS()

const addresses = computed(() => addressesDS.getAddresses)
const loading = computed(() => addressesDS.getLoading)
const addressSubmitting = computed(() => addressesDS.getSubmitting)

const selectedAddressId = ref('')
const isFormModalOpen = ref(false)

const modalOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value)
})

const selectedAddress = computed(
  () => addresses.value.find(item => item.id === selectedAddressId.value) ?? null
)

function formatPrice(value: number): string {
  return new Intl.NumberFormat('fa-IR').format(value)
}

async function loadAddresses(): Promise<void> {
  const response = await addressesController.getAddresses()
  if (!response.success) {
    toast.add({
      title: response.message || 'دریافت آدرس‌ها ناموفق بود',
      color: 'error'
    })
    return
  }

  if (!selectedAddressId.value && addresses.value.length) {
    selectedAddressId.value = addresses.value[0]!.id
  }
}

function selectAddress(address: AddressModel): void {
  selectedAddressId.value = address.id
}

async function handleCreateAddress(payload: TAddressPayload): Promise<void> {
  const response = await addressesController.createAddress(payload)
  if (!response.success || !response.data) {
    toast.add({
      title: response.message || 'ثبت آدرس ناموفق بود',
      color: 'error'
    })
    return
  }

  selectedAddressId.value = response.data.id
  isFormModalOpen.value = false
  toast.add({
    title: 'آدرس ثبت شد',
    color: 'success'
  })
}

function confirmCheckout(): void {
  if (!selectedAddressId.value) {
    toast.add({
      title: 'ابتدا یک آدرس انتخاب کنید',
      color: 'warning'
    })
    return
  }
  emit('confirm', selectedAddressId.value)
}

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) return
    selectedAddressId.value = ''
    await loadAddresses()
  }
)
</script>

<template>
  <UModal
    v-model:open="modalOpen"
    title="انتخاب آدرس ارسال"
  >
    <template #body>
      <div class="space-y-4">
        <p class="text-sm leading-7 text-toned">
          آدرس ارسال را انتخاب کنید. اگر آدرسی ندارید، همین‌جا بسازید و سپس پرداخت را نهایی کنید.
        </p>

        <div
          v-if="loading"
          class="flex justify-center py-8"
        >
          <UIcon
            name="i-lucide-loader-2"
            class="size-6 animate-spin text-primary"
          />
        </div>

        <div
          v-else-if="!addresses.length"
          class="rounded-2xl border border-dashed border-default px-4 py-8 text-center"
        >
          <UIcon
            name="i-lucide-map-pin"
            class="mx-auto mb-2 size-8 text-toned"
          />
          <p class="text-sm text-toned">
            هنوز آدرسی ثبت نکرده‌اید.
          </p>
          <UButton
            class="mt-4"
            color="primary"
            icon="i-lucide-plus"
            @click="isFormModalOpen = true"
          >
            افزودن آدرس
          </UButton>
        </div>

        <div
          v-else
          class="space-y-3"
        >
          <button
            v-for="item in addresses"
            :key="item.id"
            type="button"
            class="w-full rounded-2xl border p-4 text-right transition-colors"
            :class="
              selectedAddressId === item.id
                ? 'border-primary bg-primary/5'
                : 'border-default hover:border-primary/40'
            "
            @click="selectAddress(item)"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm font-bold text-highlighted">
                  {{ item.name }}
                </p>
                <p class="mt-1 text-xs leading-6 text-toned">
                  {{ item.province }}، {{ item.city }}
                </p>
                <p class="mt-1 text-xs leading-6 text-toned">
                  {{ item.address }}
                </p>
              </div>
              <UIcon
                v-if="selectedAddressId === item.id"
                name="i-lucide-check-circle-2"
                class="size-5 text-primary"
              />
            </div>
          </button>

          <UButton
            color="neutral"
            variant="soft"
            icon="i-lucide-plus"
            class="w-full justify-center"
            @click="isFormModalOpen = true"
          >
            آدرس جدید
          </UButton>
        </div>

        <div
          v-if="selectedAddress"
          class="rounded-xl bg-elevated px-4 py-3 text-xs leading-6 text-toned"
        >
          ارسال به:
          <span class="font-bold text-highlighted">{{ selectedAddress.name }}</span>
          — {{ selectedAddress.summary }}
        </div>

        <div class="flex items-center justify-between border-t border-default pt-3 text-sm">
          <span class="text-toned">مبلغ پرداخت</span>
          <span
            class="font-black text-primary"
            dir="ltr"
          >
            {{ formatPrice(paidAmount) }}
            <span class="text-xs font-medium text-toned">تومان</span>
          </span>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <UButton
            color="neutral"
            variant="outline"
            class="w-full justify-center"
            :disabled="submitting"
            @click="modalOpen = false"
          >
            انصراف
          </UButton>
          <UButton
            color="primary"
            icon="i-lucide-credit-card"
            class="w-full justify-center"
            :loading="submitting"
            :disabled="!selectedAddressId"
            @click="confirmCheckout"
          >
            پرداخت و ثبت سفارش
          </UButton>
        </div>
      </div>

      <AddressFormModal
        v-model:open="isFormModalOpen"
        :address="null"
        :submitting="addressSubmitting"
        @submit="handleCreateAddress"
      />
    </template>
  </UModal>
</template>
