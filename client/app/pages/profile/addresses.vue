<script setup lang="ts">
import ProfileShell from '~/components/profile/ProfileShell.vue'
import AddressDeleteConfirmModal from '~/features/addresses/components/AddressDeleteConfirmModal.vue'
import AddressFormModal from '~/features/addresses/components/AddressFormModal.vue'
import { addressesController } from '~/features/addresses/controllers/index.controller'
import { useAddressesDS } from '~/features/addresses/data/index.store'
import type { AddressModel } from '~/features/addresses/models/index.model'
import type { TAddressPayload } from '~/features/addresses/types/index.type'

definePageMeta({ title: 'آدرس‌ها', robots: 'noindex, nofollow' })

const toast = useToast()
const addressesDS = useAddressesDS()

const addresses = computed(() => addressesDS.getAddresses)
const loading = computed(() => addressesDS.getLoading)
const submitting = computed(() => addressesDS.getSubmitting)

const isFormModalOpen = ref(false)
const isDeleteConfirmOpen = ref(false)
const editingAddress = ref<AddressModel | null>(null)
const addressPendingDelete = ref<AddressModel | null>(null)

function openCreateModal(): void {
  editingAddress.value = null
  addressesDS.setSelectedAddress(null)
  isFormModalOpen.value = true
}

function openEditModal(address: AddressModel): void {
  editingAddress.value = address
  addressesDS.setSelectedAddress(address)
  isFormModalOpen.value = true
}

function openDeleteConfirm(address: AddressModel): void {
  addressPendingDelete.value = address
  isDeleteConfirmOpen.value = true
}

async function fetchAddresses(): Promise<void> {
  const response = await addressesController.getAddresses()

  if (!response.success) {
    toast.add({
      title: response.message || 'دریافت آدرس‌ها ناموفق بود',
      color: 'error'
    })
  }
}

async function handleFormSubmit(
  payload: TAddressPayload,
  id: string | null
): Promise<void> {
  const response = id
    ? await addressesController.updateAddress(id, payload)
    : await addressesController.createAddress(payload)

  toast.add({
    title:
      response.message
      || (response.success
        ? id
          ? 'آدرس با موفقیت ویرایش شد'
          : 'آدرس با موفقیت ثبت شد'
        : 'عملیات با خطا مواجه شد'),
    color: response.success ? 'success' : 'error'
  })

  if (!response.success) return

  isFormModalOpen.value = false
}

async function handleDeleteConfirm(): Promise<void> {
  if (!addressPendingDelete.value) return

  const response = await addressesController.deleteAddress(
    addressPendingDelete.value.id
  )

  toast.add({
    title:
      response.message
      || (response.success ? 'آدرس حذف شد' : 'حذف آدرس ناموفق بود'),
    color: response.success ? 'success' : 'error'
  })

  if (!response.success) return

  isDeleteConfirmOpen.value = false
  addressPendingDelete.value = null
}

onMounted(() => {
  fetchAddresses()
})
</script>

<template>
  <ProfileShell title="آدرس ها">
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 class="text-xl font-black text-highlighted">
          آدرس‌های ارسال
        </h2>
        <p class="mt-1 text-sm text-toned">
          آدرس‌های ثبت‌شده برای ارسال سفارش‌ها
        </p>
      </div>

      <UButton
        color="primary"
        icon="i-lucide-plus"
        @click="openCreateModal"
      >
        افزودن آدرس
      </UButton>
    </div>

    <div
      v-if="loading && !addresses.length"
      class="space-y-3"
    >
      <USkeleton
        v-for="index in 3"
        :key="index"
        class="h-32 w-full rounded-2xl"
      />
    </div>

    <div
      v-else-if="!addresses.length"
      class="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-default bg-elevated/40 px-6 py-16 text-center"
    >
      <div class="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <UIcon
          name="i-lucide-map-pin"
          class="size-8"
        />
      </div>
      <div class="space-y-2">
        <h3 class="text-lg font-black text-highlighted">
          هنوز آدرسی ثبت نشده
        </h3>
        <p class="max-w-sm text-sm leading-7 text-toned">
          اولین آدرس ارسال را اضافه کنید تا در سفارش بعدی آماده باشد.
        </p>
      </div>
      <UButton
        color="primary"
        icon="i-lucide-plus"
        @click="openCreateModal"
      >
        افزودن آدرس
      </UButton>
    </div>

    <div
      v-else
      class="grid gap-4 sm:grid-cols-2"
    >
      <UCard
        v-for="item in addresses"
        :key="item.id"
        :ui="{ body: 'p-5' }"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h3 class="text-sm font-bold text-highlighted">
              {{ item.name }}
            </h3>
            <p class="mt-1 text-xs text-toned">
              {{ item.summary }}
            </p>
          </div>
          <div class="flex shrink-0 gap-1">
            <UButton
              color="neutral"
              variant="ghost"
              size="sm"
              icon="i-lucide-pencil"
              @click="openEditModal(item)"
            />
            <UButton
              color="error"
              variant="ghost"
              size="sm"
              icon="i-lucide-trash-2"
              @click="openDeleteConfirm(item)"
            />
          </div>
        </div>

        <p class="mt-3 text-sm leading-7 text-toned">
          {{ item.address }}
        </p>
        <p
          class="mt-2 text-xs text-muted"
          dir="ltr"
        >
          کد پستی: {{ item.formattedPostalCode }}
        </p>
      </UCard>
    </div>

    <AddressFormModal
      v-model:open="isFormModalOpen"
      :address="editingAddress"
      :submitting="submitting"
      @submit="handleFormSubmit"
    />

    <AddressDeleteConfirmModal
      v-model:open="isDeleteConfirmOpen"
      :address="addressPendingDelete"
      :submitting="submitting"
      @confirm="handleDeleteConfirm"
    />
  </ProfileShell>
</template>
