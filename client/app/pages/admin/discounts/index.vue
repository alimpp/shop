<script setup lang="ts">
import { discountsController } from '~/features/discounts/controllers/index.controller'
import type {
  TDiscountCode,
  TDiscountPayload
} from '~/features/discounts/types/index.type'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const toast = useToast()
const loading = ref(false)
const submitting = ref(false)
const items = ref<TDiscountCode[]>([])
const search = ref('')
const formOpen = ref(false)
const editing = ref<TDiscountCode | null>(null)
let searchTimer: ReturnType<typeof setTimeout> | null = null

const form = reactive({
  code: '',
  amount: 0,
  description: '',
  isActive: true,
  maxUses: undefined as number | undefined,
  minOrderAmount: undefined as number | undefined,
  expiresAt: ''
})

function formatPrice(value: number): string {
  return `${new Intl.NumberFormat('fa-IR').format(value)} تومان`
}

function formatDate(value?: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleString('fa-IR')
}

async function fetchItems(): Promise<void> {
  loading.value = true
  const response = await discountsController.getDiscounts({
    page: 1,
    limit: 50,
    search: search.value.trim() || undefined
  })
  loading.value = false

  if (!response.success) {
    toast.add({
      title: response.message || 'دریافت کدهای تخفیف ناموفق بود',
      color: 'error'
    })
    return
  }

  items.value = response.data?.items ?? []
}

function openCreate(): void {
  editing.value = null
  form.code = ''
  form.amount = 0
  form.description = ''
  form.isActive = true
  form.maxUses = undefined
  form.minOrderAmount = undefined
  form.expiresAt = ''
  formOpen.value = true
}

function openEdit(item: TDiscountCode): void {
  editing.value = item
  form.code = item.code
  form.amount = item.amount
  form.description = item.description ?? ''
  form.isActive = item.isActive
  form.maxUses = item.maxUses ?? undefined
  form.minOrderAmount = item.minOrderAmount ?? undefined
  form.expiresAt = item.expiresAt
    ? new Date(item.expiresAt).toISOString().slice(0, 16)
    : ''
  formOpen.value = true
}

async function save(): Promise<void> {
  if (!form.amount || form.amount < 1) {
    toast.add({ title: 'مبلغ تخفیف را وارد کنید', color: 'warning' })
    return
  }

  const payload: TDiscountPayload = {
    code: form.code.trim() || undefined,
    amount: Number(form.amount),
    description: form.description.trim() || undefined,
    isActive: form.isActive,
    maxUses: form.maxUses ? Number(form.maxUses) : undefined,
    minOrderAmount: form.minOrderAmount
      ? Number(form.minOrderAmount)
      : undefined,
    expiresAt: form.expiresAt
      ? new Date(form.expiresAt).toISOString()
      : undefined
  }

  submitting.value = true
  const response = editing.value
    ? await discountsController.updateDiscount(editing.value.id, payload)
    : await discountsController.createDiscount(payload)
  submitting.value = false

  toast.add({
    title:
      response.message
      || (response.success
        ? editing.value
          ? 'کد تخفیف بروزرسانی شد'
          : 'کد تخفیف ساخته شد'
        : 'ذخیره ناموفق بود'),
    color: response.success ? 'success' : 'error'
  })

  if (response.success) {
    formOpen.value = false
    await fetchItems()
  }
}

async function remove(item: TDiscountCode): Promise<void> {
  const ok = window.confirm(`کد «${item.code}» حذف شود؟`)
  if (!ok) return

  const response = await discountsController.deleteDiscount(item.id)
  toast.add({
    title: response.message || (response.success ? 'حذف شد' : 'حذف ناموفق بود'),
    color: response.success ? 'success' : 'error'
  })
  if (response.success) await fetchItems()
}

watch(search, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    void fetchItems()
  }, 350)
})

onMounted(() => {
  void fetchItems()
})

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
})
</script>

<template>
  <UDashboardPanel id="admin-discounts">
    <template #header>
      <UDashboardNavbar title="کدهای تخفیف">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            color="primary"
            icon="i-lucide-plus"
            @click="openCreate"
          >
            ساخت کد تخفیف
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
            placeholder="جستجو در کد یا توضیحات..."
            class="max-w-md"
          />
        </div>

        <div
          v-if="loading && !items.length"
          class="flex justify-center py-16"
        >
          <UIcon
            name="i-lucide-loader-2"
            class="size-6 animate-spin text-primary"
          />
        </div>

        <div
          v-else-if="!items.length"
          class="rounded-2xl border border-dashed border-default px-4 py-16 text-center text-sm text-toned"
        >
          هنوز کد تخفیفی ساخته نشده است.
        </div>

        <div
          v-else
          class="overflow-x-auto rounded-2xl border border-default"
        >
          <table class="min-w-full text-sm">
            <thead class="bg-elevated/60 text-toned">
              <tr>
                <th class="px-4 py-3 text-start font-medium">کد</th>
                <th class="px-4 py-3 text-start font-medium">مبلغ تخفیف</th>
                <th class="px-4 py-3 text-start font-medium">استفاده</th>
                <th class="px-4 py-3 text-start font-medium">وضعیت</th>
                <th class="px-4 py-3 text-start font-medium">انقضا</th>
                <th class="px-4 py-3 text-start font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in items"
                :key="item.id"
                class="border-t border-default"
              >
                <td class="px-4 py-3 font-bold text-highlighted"
                    dir="ltr"
                >
                  {{ item.code }}
                </td>
                <td class="px-4 py-3 text-primary font-bold">
                  {{ formatPrice(item.amount) }}
                </td>
                <td class="px-4 py-3 text-toned">
                  {{ item.usedCount.toLocaleString('fa-IR') }}
                  /
                  {{ item.maxUses == null ? '∞' : item.maxUses.toLocaleString('fa-IR') }}
                </td>
                <td class="px-4 py-3">
                  <UBadge
                    :color="item.isActive ? 'success' : 'neutral'"
                    variant="subtle"
                  >
                    {{ item.isActive ? 'فعال' : 'غیرفعال' }}
                  </UBadge>
                </td>
                <td class="px-4 py-3 text-toned">
                  {{ formatDate(item.expiresAt) }}
                </td>
                <td class="px-4 py-3">
                  <div class="flex gap-2">
                    <UButton
                      size="sm"
                      color="neutral"
                      variant="soft"
                      icon="i-lucide-pencil"
                      @click="openEdit(item)"
                    />
                    <UButton
                      size="sm"
                      color="error"
                      variant="soft"
                      icon="i-lucide-trash-2"
                      @click="remove(item)"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </BaseDashboardPanelBody>
    </template>
  </UDashboardPanel>

  <UModal
    v-model:open="formOpen"
    :title="editing ? 'ویرایش کد تخفیف' : 'ساخت کد تخفیف'"
  >
    <template #body>
      <div class="space-y-4">
        <UFormField
          label="کد (اختیاری)"
          hint="اگر خالی باشد خودکار ساخته می‌شود"
        >
          <UInput
            v-model="form.code"
            placeholder="مثلاً OFF-SUMMER"
            class="w-full"
            dir="ltr"
          />
        </UFormField>

        <UFormField
          label="مبلغ تخفیف (تومان)"
          required
        >
          <UInput
            v-model.number="form.amount"
            type="number"
            min="1"
            class="w-full"
            dir="ltr"
          />
        </UFormField>

        <UFormField label="توضیحات">
          <UInput
            v-model="form.description"
            class="w-full"
            placeholder="مثلاً تخفیف مناسبتی"
          />
        </UFormField>

        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField label="حداکثر تعداد استفاده">
            <UInput
              v-model.number="form.maxUses"
              type="number"
              min="1"
              class="w-full"
              placeholder="نامحدود"
              dir="ltr"
            />
          </UFormField>
          <UFormField label="حداقل مبلغ سفارش">
            <UInput
              v-model.number="form.minOrderAmount"
              type="number"
              min="0"
              class="w-full"
              placeholder="۰"
              dir="ltr"
            />
          </UFormField>
        </div>

        <UFormField label="تاریخ انقضا">
          <UInput
            v-model="form.expiresAt"
            type="datetime-local"
            class="w-full"
            dir="ltr"
          />
        </UFormField>

        <UCheckbox
          v-model="form.isActive"
          label="فعال باشد"
        />
      </div>
    </template>

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton
          color="neutral"
          variant="outline"
          @click="formOpen = false"
        >
          انصراف
        </UButton>
        <UButton
          color="primary"
          :loading="submitting"
          @click="save"
        >
          ذخیره
        </UButton>
      </div>
    </template>
  </UModal>
</template>
