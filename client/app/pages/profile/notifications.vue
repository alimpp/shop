<script setup lang="ts">
import ProfileShell from "~/components/profile/ProfileShell.vue";
import { notificationController } from "~/features/notifications/controllers/index.controller";
import type {
  TNotification,
  TNotificationType,
} from "~/features/notifications/types/index.type";
import { NOTIFICATION_TYPE_LABELS } from "~/features/notifications/types/index.type";

definePageMeta({ title: "اعلانات", robots: "noindex, nofollow" });

const toast = useToast();

const loading = ref(true);
const markingAll = ref(false);
const notifications = ref<TNotification[]>([]);
const unreadCount = ref(0);

const typeMeta: Record<
  TNotificationType,
  { icon: string; color: string }
> = {
  message: { icon: "i-lucide-message-circle", color: "primary" },
  transaction: { icon: "i-lucide-wallet", color: "success" },
  order_registered: { icon: "i-lucide-package-plus", color: "info" },
  order_preparing: { icon: "i-lucide-package", color: "warning" },
  order_shipping: { icon: "i-lucide-truck", color: "primary" },
  order_cancelled: { icon: "i-lucide-package-x", color: "error" },
};

function formatDate(value: string): string {
  if (!value) return "";
  return new Date(value).toLocaleString("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function fetchNotifications(): Promise<void> {
  loading.value = true;
  const response = await notificationController.getNotifications({ limit: 50 });

  if (!response.success) {
    toast.add({
      title: response.message || "دریافت اعلان‌ها ناموفق بود",
      color: "error",
    });
    loading.value = false;
    return;
  }

  notifications.value = response.data.items;
  unreadCount.value = response.data.meta.unreadCount;
  loading.value = false;
}

async function handleMarkAsSeen(item: TNotification): Promise<void> {
  if (item.seen) return;

  const response = await notificationController.markAsSeen(item.id);
  if (!response.success) {
    toast.add({
      title: response.message || "بروزرسانی اعلان ناموفق بود",
      color: "error",
    });
    return;
  }

  item.seen = true;
  unreadCount.value = Math.max(0, unreadCount.value - 1);
}

async function handleMarkAllAsSeen(): Promise<void> {
  if (unreadCount.value === 0) return;

  markingAll.value = true;
  const response = await notificationController.markAllAsSeen();
  markingAll.value = false;

  if (!response.success) {
    toast.add({
      title: response.message || "بروزرسانی اعلان‌ها ناموفق بود",
      color: "error",
    });
    return;
  }

  notifications.value = notifications.value.map((item) => ({
    ...item,
    seen: true,
  }));
  unreadCount.value = 0;
}

onMounted(() => {
  fetchNotifications();
});
</script>

<template>
  <ProfileShell title="اعلانات">
    <div class="mb-4 flex items-center justify-between gap-3">
      <p class="text-sm text-toned">
        <span v-if="unreadCount > 0">
          {{ unreadCount.toLocaleString("fa-IR") }} اعلان خوانده‌نشده
        </span>
        <span v-else>همه اعلان‌ها خوانده شده‌اند</span>
      </p>

      <UButton
        color="neutral"
        variant="soft"
        size="sm"
        :loading="markingAll"
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
      <h2 class="text-base font-bold text-highlighted">اعلانی وجود ندارد</h2>
      <p class="mt-1 text-sm text-toned">
        وقتی اعلان جدیدی برایتان ارسال شود اینجا نمایش داده می‌شود
      </p>
    </div>

    <div v-else class="space-y-3">
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
                {{ NOTIFICATION_TYPE_LABELS[item.type] || item.type }}
              </UBadge>
              <span>{{ formatDate(item.created_at) }}</span>
            </div>
          </div>
        </div>
      </button>
    </div>
  </ProfileShell>
</template>
