<script setup lang="ts">
import { contactController } from '~/features/contact/controllers/index.controller'
import type {
  TContactListMeta,
  TContactMessage
} from '~/features/contact/types/index.type'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const toast = useToast()

const loading = ref(false)
const detailLoading = ref(false)
const deleting = ref(false)
const messages = ref<TContactMessage[]>([])
const meta = ref<TContactListMeta>({
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 1,
  unreadCount: 0
})

const selectedFilter = ref<'all' | 'read' | 'unread'>('all')
const search = ref('')
const currentPage = ref(1)

const detailOpen = ref(false)
const selected = ref<TContactMessage | null>(null)
const typedMessage = ref('')
const isTyping = ref(false)
let typingTimer: ReturnType<typeof setInterval> | null = null
let searchTimer: ReturnType<typeof setTimeout> | null = null

const filterItems = [
  { label: 'همه', value: 'all' },
  { label: 'خوانده‌نشده', value: 'unread' },
  { label: 'خوانده‌شده', value: 'read' }
]

function clearTyping(): void {
  if (typingTimer) {
    clearInterval(typingTimer)
    typingTimer = null
  }
  isTyping.value = false
}

function startTypingEffect(text: string): void {
  clearTyping()
  typedMessage.value = ''
  if (!text) return

  isTyping.value = true
  let index = 0
  const step = Math.max(1, Math.ceil(text.length / 180))

  typingTimer = setInterval(() => {
    index = Math.min(text.length, index + step)
    typedMessage.value = text.slice(0, index)
    if (index >= text.length) {
      clearTyping()
      typedMessage.value = text
    }
  }, 18)
}

function formatDate(value?: string | null): string {
  if (!value) return '—'
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(value))
  } catch {
    return value
  }
}

async function fetchMessages(): Promise<void> {
  loading.value = true
  const response = await contactController.getMessages({
    filter: selectedFilter.value,
    search: search.value.trim() || undefined,
    page: currentPage.value,
    limit: 20
  })
  loading.value = false

  if (!response.success) {
    toast.add({
      title: response.message || 'دریافت پیام‌ها ناموفق بود',
      color: 'error'
    })
    return
  }

  messages.value = response.data?.items ?? []
  meta.value = response.data?.meta ?? meta.value
}

async function openMessage(item: TContactMessage): Promise<void> {
  detailOpen.value = true
  detailLoading.value = true
  typedMessage.value = ''
  clearTyping()

  const response = await contactController.getMessage(item.id)
  detailLoading.value = false

  if (!response.success || !response.data) {
    toast.add({
      title: response.message || 'دریافت پیام ناموفق بود',
      color: 'error'
    })
    detailOpen.value = false
    return
  }

  selected.value = response.data
  messages.value = messages.value.map(message =>
    message.id === response.data!.id
      ? { ...message, isRead: true, readAt: response.data!.readAt }
      : message
  )
  if (!item.isRead && meta.value.unreadCount > 0) {
    meta.value = {
      ...meta.value,
      unreadCount: Math.max(0, meta.value.unreadCount - 1)
    }
  }

  startTypingEffect(response.data.message)
}

async function handleDelete(): Promise<void> {
  if (!selected.value || deleting.value) return

  deleting.value = true
  const id = selected.value.id
  const response = await contactController.deleteMessage(id)
  deleting.value = false

  if (!response.success) {
    toast.add({
      title: response.message || 'حذف پیام ناموفق بود',
      color: 'error'
    })
    return
  }

  detailOpen.value = false
  selected.value = null
  clearTyping()
  toast.add({ title: 'پیام حذف شد', color: 'success' })
  await fetchMessages()
}

watch(selectedFilter, () => {
  currentPage.value = 1
  void fetchMessages()
})

watch(currentPage, () => {
  void fetchMessages()
})

watch(search, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    void fetchMessages()
  }, 400)
})

watch(detailOpen, open => {
  if (!open) {
    clearTyping()
    selected.value = null
    typedMessage.value = ''
  }
})

onMounted(() => {
  void fetchMessages()
})

onBeforeUnmount(() => {
  clearTyping()
  if (searchTimer) clearTimeout(searchTimer)
})
</script>

<template>
  <UDashboardPanel id="admin-contact-messages">
    <template #header>
      <UDashboardNavbar title="پیام‌های تماس">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UBadge
            v-if="meta.unreadCount > 0"
            color="primary"
            variant="subtle"
          >
            {{ meta.unreadCount.toLocaleString('fa-IR') }} خوانده‌نشده
          </UBadge>
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
            @click="fetchMessages"
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
            placeholder="جستجو در نام، شماره، موضوع یا متن..."
            class="max-w-md"
          />
        </div>

        <div
          v-if="loading && !messages.length"
          class="flex items-center justify-center gap-2 py-16 text-sm text-toned"
        >
          <UIcon
            name="i-lucide-loader-2"
            class="size-5 animate-spin text-primary"
          />
          در حال بارگذاری...
        </div>

        <div
          v-else-if="!messages.length"
          class="rounded-2xl border border-dashed border-default px-4 py-16 text-center text-sm text-toned"
        >
          پیامی ثبت نشده است.
        </div>

        <div
          v-else
          class="space-y-3"
        >
          <button
            v-for="item in messages"
            :key="item.id"
            type="button"
            class="flex w-full items-start gap-4 rounded-2xl border border-default bg-elevated/50 p-4 text-start transition hover:border-primary/30 hover:bg-elevated"
            :class="!item.isRead ? 'border-primary/25 bg-primary/5' : ''"
            @click="openMessage(item)"
          >
            <span
              class="mt-1 flex size-10 shrink-0 items-center justify-center rounded-full"
              :class="item.isRead ? 'bg-elevated text-toned' : 'bg-primary/15 text-primary'"
            >
              <UIcon
                :name="item.isRead ? 'i-lucide-mail-open' : 'i-lucide-mail'"
                class="size-4"
              />
            </span>

            <span class="min-w-0 flex-1 space-y-1.5">
              <span class="flex flex-wrap items-center gap-2">
                <span class="font-bold text-highlighted">
                  {{ item.name }}
                </span>
                <UBadge
                  v-if="!item.isRead"
                  color="primary"
                  variant="subtle"
                  size="sm"
                >
                  جدید
                </UBadge>
              </span>
              <span class="block text-sm text-toned">
                {{ item.subject || 'بدون موضوع' }}
              </span>
              <span class="line-clamp-2 text-sm leading-6 text-muted">
                {{ item.message }}
              </span>
              <span class="flex flex-wrap gap-3 pt-1 text-xs text-muted">
                <span dir="ltr">{{ item.phone }}</span>
                <span>{{ formatDate(item.createdAt) }}</span>
              </span>
            </span>

            <UIcon
              name="i-lucide-chevron-left"
              class="mt-2 size-4 shrink-0 text-muted"
            />
          </button>
        </div>

        <div
          v-if="meta.totalPages > 1"
          class="mt-6 flex justify-center"
        >
          <UPagination
            v-model:page="currentPage"
            :total="meta.total"
            :items-per-page="meta.limit"
          />
        </div>
      </BaseDashboardPanelBody>
    </template>
  </UDashboardPanel>

  <UModal
    v-model:open="detailOpen"
    :title="selected?.subject || 'جزئیات پیام'"
    description="پیام دریافتی از فرم تماس با ما"
  >
    <template #body>
      <div
        v-if="detailLoading"
        class="flex items-center justify-center gap-2 py-10 text-sm text-toned"
      >
        <UIcon
          name="i-lucide-loader-2"
          class="size-5 animate-spin text-primary"
        />
        در حال باز کردن پیام...
      </div>

      <div
        v-else-if="selected"
        class="space-y-5"
      >
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="rounded-xl border border-default bg-elevated/40 p-3">
            <p class="text-xs text-muted">
              نام
            </p>
            <p class="mt-1 font-bold text-highlighted">
              {{ selected.name }}
            </p>
          </div>
          <div class="rounded-xl border border-default bg-elevated/40 p-3">
            <p class="text-xs text-muted">
              شماره تماس
            </p>
            <a
              :href="`tel:${selected.phone}`"
              class="mt-1 block font-bold text-primary"
              dir="ltr"
            >
              {{ selected.phone }}
            </a>
          </div>
        </div>

        <div class="flex flex-wrap gap-3 text-xs text-muted">
          <span>ثبت: {{ formatDate(selected.createdAt) }}</span>
          <span v-if="selected.readAt">خوانده‌شده: {{ formatDate(selected.readAt) }}</span>
        </div>

        <div class="rounded-2xl border border-primary/20 bg-[#101010] p-4 sm:p-5">
          <div class="mb-3 flex items-center gap-2 text-xs font-bold text-primary">
            <UIcon
              name="i-lucide-message-square-text"
              class="size-3.5"
            />
            متن پیام
            <span
              v-if="isTyping"
              class="ms-auto inline-flex items-center gap-1 text-toned"
            >
              در حال نمایش
              <span class="inline-block size-1.5 animate-pulse rounded-full bg-primary" />
            </span>
          </div>
          <p class="min-h-24 whitespace-pre-wrap text-sm leading-8 text-[#d8d8d8] sm:text-[15px]">
            {{ typedMessage }}<span
              v-if="isTyping"
              class="ms-0.5 inline-block h-4 w-0.5 animate-pulse bg-primary align-middle"
            />
          </p>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full flex-wrap justify-between gap-3">
        <UButton
          color="error"
          variant="soft"
          icon="i-lucide-trash-2"
          :loading="deleting"
          @click="handleDelete"
        >
          حذف
        </UButton>
        <UButton
          color="neutral"
          variant="outline"
          @click="detailOpen = false"
        >
          بستن
        </UButton>
      </div>
    </template>
  </UModal>
</template>
