<script setup lang="ts">
import { faqsController } from '~/features/faqs/controllers/index.controller'
import type { TFaq, TFaqPayload } from '~/features/faqs/types/index.type'
import { useAdminPermissions } from '~/composables/useAdminPermissions'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const toast = useToast()
const { can } = useAdminPermissions()
const loading = ref(false)
const submitting = ref(false)
const items = ref<TFaq[]>([])
const search = ref('')
const formOpen = ref(false)
const editing = ref<TFaq | null>(null)
let searchTimer: ReturnType<typeof setTimeout> | null = null

const form = reactive({
  question: '',
  answer: '',
  category: '',
  sortOrder: 0,
  isActive: true,
  isFeatured: false
})

async function fetchItems(): Promise<void> {
  loading.value = true
  const response = await faqsController.getFaqs({
    page: 1,
    limit: 100,
    search: search.value.trim() || undefined
  })
  loading.value = false

  if (!response.success) {
    toast.add({
      title: response.message || 'دریافت FAQ ناموفق بود',
      color: 'error'
    })
    return
  }

  items.value = response.data?.items ?? []
}

function openCreate(): void {
  editing.value = null
  form.question = ''
  form.answer = ''
  form.category = ''
  form.sortOrder = 0
  form.isActive = true
  form.isFeatured = false
  formOpen.value = true
}

function openEdit(item: TFaq): void {
  editing.value = item
  form.question = item.question
  form.answer = item.answer
  form.category = item.category ?? ''
  form.sortOrder = item.sortOrder
  form.isActive = item.isActive
  form.isFeatured = item.isFeatured
  formOpen.value = true
}

async function save(): Promise<void> {
  if (!form.question.trim() || !form.answer.trim()) {
    toast.add({ title: 'سوال و پاسخ الزامی هستند', color: 'warning' })
    return
  }

  const payload: TFaqPayload = {
    question: form.question.trim(),
    answer: form.answer.trim(),
    category: form.category.trim() || undefined,
    sortOrder: Number(form.sortOrder) || 0,
    isActive: form.isActive,
    isFeatured: form.isFeatured
  }

  submitting.value = true
  const response = editing.value
    ? await faqsController.updateFaq(editing.value.id, payload)
    : await faqsController.createFaq(payload)
  submitting.value = false

  toast.add({
    title:
      response.message
      || (response.success
        ? editing.value
          ? 'FAQ بروزرسانی شد'
          : 'FAQ ساخته شد'
        : 'ذخیره ناموفق بود'),
    color: response.success ? 'success' : 'error'
  })

  if (response.success) {
    formOpen.value = false
    await fetchItems()
  }
}

async function remove(item: TFaq): Promise<void> {
  const ok = window.confirm('این سوال حذف شود؟')
  if (!ok) return
  const response = await faqsController.deleteFaq(item.id)
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
  <UDashboardPanel id="admin-faqs">
    <template #header>
      <UDashboardNavbar title="سوالات متداول">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            v-if="can('faqs', 'create')"
            color="primary"
            icon="i-lucide-plus"
            @click="openCreate"
          >
            سوال جدید
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
            placeholder="جستجو در سوالات..."
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
          هنوز سوالی ثبت نشده است.
        </div>

        <div
          v-else
          class="space-y-3"
        >
          <article
            v-for="item in items"
            :key="item.id"
            class="rounded-2xl border border-default bg-elevated/40 p-4"
          >
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="min-w-0 flex-1 space-y-2">
                <div class="flex flex-wrap gap-2">
                  <UBadge
                    v-if="item.category"
                    color="neutral"
                    variant="subtle"
                  >
                    {{ item.category }}
                  </UBadge>
                  <UBadge
                    :color="item.isActive ? 'success' : 'neutral'"
                    variant="subtle"
                  >
                    {{ item.isActive ? 'فعال' : 'غیرفعال' }}
                  </UBadge>
                  <UBadge
                    v-if="item.isFeatured"
                    color="primary"
                    variant="subtle"
                  >
                    ویژه
                  </UBadge>
                </div>
                <h3 class="text-sm font-black text-highlighted">
                  {{ item.question }}
                </h3>
                <p class="line-clamp-2 text-sm text-toned">
                  {{ item.answer }}
                </p>
              </div>
              <div class="flex gap-2">
                <UButton
                  v-if="can('faqs', 'edit')"
                  size="sm"
                  color="neutral"
                  variant="soft"
                  icon="i-lucide-pencil"
                  @click="openEdit(item)"
                />
                <UButton
                  v-if="can('faqs', 'delete')"
                  size="sm"
                  color="error"
                  variant="soft"
                  icon="i-lucide-trash-2"
                  @click="remove(item)"
                />
              </div>
            </div>
          </article>
        </div>
      </BaseDashboardPanelBody>
    </template>
  </UDashboardPanel>

  <UModal
    v-model:open="formOpen"
    :title="editing ? 'ویرایش سوال' : 'سوال جدید'"
  >
    <template #body>
      <div class="space-y-4">
        <UFormField
          label="سوال"
          required
        >
          <UInput
            v-model="form.question"
            class="w-full"
          />
        </UFormField>
        <UFormField
          label="پاسخ"
          required
        >
          <UTextarea
            v-model="form.answer"
            :rows="6"
            class="w-full"
          />
        </UFormField>
        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField label="دسته‌بندی">
            <UInput
              v-model="form.category"
              class="w-full"
              placeholder="مثلاً ارسال، پرداخت"
            />
          </UFormField>
          <UFormField label="ترتیب">
            <UInput
              v-model.number="form.sortOrder"
              type="number"
              class="w-full"
              dir="ltr"
            />
          </UFormField>
        </div>
        <div class="flex flex-wrap gap-4">
          <UCheckbox
            v-model="form.isActive"
            label="فعال"
          />
          <UCheckbox
            v-model="form.isFeatured"
            label="ویژه"
          />
        </div>
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
