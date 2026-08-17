<script setup lang="ts">
import ProfileShell from '~/components/profile/ProfileShell.vue'
import { notificationController } from '~/features/notifications/controllers/index.controller'
import { useNotificationsDS } from '~/features/notifications/data/index.store'
import type { TNotificationType } from '~/features/notifications/types/index.type'
import { NOTIFICATION_TYPE_LABELS } from '~/features/notifications/types/index.type'
import type { NotificationModel } from '~/features/notifications/models/index.model'

definePageMeta({ title: 'اعلانات', robots: 'noindex, nofollow' })

const toast = useToast()
const notificationsDS = useNotificationsDS()

const notifications = computed(() => notificationsDS.getItems)
const unreadCount = computed(() => notificationsDS.getUnreadCount)
const loading = computed(() => notificationsDS.getLoading)
const submitting = computed(() => notificationsDS.getSubmitting)

const typeMeta: Record<TNotificationType, { icon: string; color: string }> = {
  message: { icon: 'i-lucide-message-circle', color: 'primary' },
  transaction: { icon: 'i-lucide-wallet', color: 'success' },
  order_registered: { icon: 'i-lucide-package-plus', color: 'info' },
  order_preparing: { icon: 'i-lucide-package', color: 'warning' },
  order_shipping: { icon: 'i-lucide-truck', color: 'primary' },
  order_cancelled: { icon: 'i-lucide-package-x', color: 'error' }
}

async function fetchNotifications(): Promise<void> {
  const response = await notificationController.getNotifications({ limit: 50 })

  if (!response.success) {
    toast.add({
      title: response.message || 'دریافت اعلان‌ها ناموفق بود',
      color: 'error'
    })
  }
}

async function handleMarkAsSeen(item: NotificationModel): Promise<void> {
  if (item.seen) return

  const response = await notificationController.markAsSeen(item.id)
  if (!response.success) {
    toast.add({
      title: response.message || 'بروزرسانی اعلان ناموفق بود',
      color: 'error'
    })
  }
}

async function handleMarkAllAsSeen(): Promise<void> {
  if (unreadCount.value === 0) return

  const response = await notificationController.markAllAsSeen()

  if (!response.success) {
    toast.add({
      title: response.message || 'بروزرسانی اعلان‌ها ناموفق بود',
      color: 'error'
    })
  }
}

onMounted(() => {
  fetchNotifications()
})
</script>

<template>
  <ProfileShell title="اعلانات">
    <div class="mb-4 flex items-center justify-between gap-3">
      <p class="text-sm text-toned">
        <span v-if="unreadCount > 0">
          {{ unreadCount.toLocaleString('fa-IR') }} اعلان خوانده‌نشده
        </span>
        <span v-else>همه اعلان‌ها خوانده شده‌اند</span>
      </p>

      <UButton
        color="neutral"
        variant="soft"
        size="sm"
        :loading="submitting"
        :disabled="unreadCount === 0 || loading"
        @click="handleMarkAllAsSeen"
      >
        خواندن همه
      </UButton>
    </div>

    <div
      v-if="loading"
      class="flex items-center justify-center py-20"
    >
      <UIcon
        name="i-lucide-loader-2"
        class="size-7 animate-spin text-primary"
      />
    </div>

    <div
      v-else-if="notifications.length === 0"
      class="rounded-2xl border border-default bg-elevated px-6 py-16 text-center"
    >
      <UIcon
        name="i-lucide-bell-off"
        class="mx-auto mb-3 size-10 text-toned opacity-60"
      />
      <h2 class="text-base font-bold text-highlighted">
        اعلانی وجود ندارد
      </h2>
      <p class="mt-1 text-sm text-toned">
        وقتی اعلان جدیدی برایتان ارسال شود اینجا نمایش داده می‌شود
      </p>
    </div>

    <div
      v-else
      class="space-y-3"
    >
      <button
        v-for="item in notifications"
        :key="item.id"
        type="button"
        class="w-full rounded-2xl border p-4 text-right transition-colors"
        :class="
          item.seen
            ? 'border-default bg-elevated/50 hover:bg-elevated'
            : 'border-primary/30 bg-primary/5 hover:bg-primary/10'
        "
        @click="handleMarkAsSeen(item)"
      >
        <div class="flex items-start gap-3">
          <div
            class="flex size-10 shrink-0 items-center justify-center rounded-xl"
            :class="
              item.seen
                ? 'bg-elevated text-toned ring-1 ring-default'
                : 'bg-primary/15 text-primary'
            "
          >
            <UIcon
              :name="typeMeta[item.type]?.icon || 'i-lucide-bell'"
              class="size-5"
            />
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-2">
              <h3
                class="text-sm text-highlighted"
                :class="item.seen ? 'font-medium' : 'font-bold'"
              >
                {{ item.title }}
              </h3>
              <span
                v-if="!item.seen"
                class="mt-1 size-2 shrink-0 rounded-full bg-primary"
              />
            </div>

            <p class="mt-1 text-xs leading-6 text-toned">
              {{ item.description }}
            </p>

            <div class="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted">
              <UBadge
                color="neutral"
                variant="subtle"
                size="sm"
              >
                {{ item.typeLabel || NOTIFICATION_TYPE_LABELS[item.type] }}
              </UBadge>
              <span>{{ item.formattedDate }}</span>
            </div>
          </div>
        </div>
      </button>
    </div>
  </ProfileShell>
</template>
