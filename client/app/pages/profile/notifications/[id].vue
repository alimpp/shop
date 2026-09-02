<script setup lang="ts">
import ProfileShell from '~/components/profile/ProfileShell.vue'
import { notificationController } from '~/features/notifications/controllers/index.controller'
import { useNotificationsDS } from '~/features/notifications/data/index.store'
import { NOTIFICATION_TYPE_META } from '~/features/notifications/constants/index'
import { NOTIFICATION_TYPE_LABELS } from '~/features/notifications/types/index.type'

definePageMeta({ title: 'جزئیات اعلان', robots: 'noindex, nofollow' })

const route = useRoute()
const toast = useToast()
const notificationsDS = useNotificationsDS()

const notificationId = String(route.params.id ?? '')
const loading = ref(true)
const markingSeen = ref(false)

const notification = computed(() => notificationsDS.getSelected)
const descriptionText = computed(() => notification.value?.description ?? '')

const { displayed: typedDescription, isTyping } = useTypewriter(descriptionText, {
  speed: 24,
  delay: 350,
  enabled: () => Boolean(notification.value) && !loading.value
})

const typeMeta = computed(() => {
  const type = notification.value?.type
  if (!type) return { icon: 'i-lucide-bell', color: 'primary' }
  return NOTIFICATION_TYPE_META[type] ?? { icon: 'i-lucide-bell', color: 'primary' }
})

async function markSeenIfNeeded(): Promise<void> {
  if (!notification.value || notification.value.seen || markingSeen.value) return

  markingSeen.value = true
  const response = await notificationController.markAsSeen(notification.value.id)

  if (!response.success) {
    toast.add({
      title: response.message || 'بروزرسانی وضعیت اعلان ناموفق بود',
      color: 'error'
    })
  }

  markingSeen.value = false
}

async function loadNotification(): Promise<void> {
  loading.value = true

  const cached = notificationsDS.getById(notificationId)
  if (cached) {
    notificationsDS.setSelected(cached)
  }

  const response = await notificationController.getNotification(notificationId)

  if (!response.success) {
    toast.add({
      title: response.message || 'دریافت اعلان ناموفق بود',
      color: 'error'
    })
    loading.value = false
    return
  }

  await markSeenIfNeeded()
  loading.value = false
}

onMounted(() => {
  loadNotification()
})

onUnmounted(() => {
  notificationsDS.setSelected(null)
})
</script>

<template>
  <ProfileShell
    title="جزئیات اعلان"
    back-to="/profile/notifications"
  >
    <div class="mb-4">
      <UButton
        to="/profile/notifications"
        color="neutral"
        variant="ghost"
        icon="i-lucide-arrow-right"
      >
        بازگشت به اعلانات
      </UButton>
    </div>

    <div
      v-if="loading && !notification"
      class="flex items-center justify-center py-20"
    >
      <UIcon
        name="i-lucide-loader-2"
        class="size-7 animate-spin text-primary"
      />
    </div>

    <div
      v-else-if="!notification"
      class="rounded-2xl border border-default bg-elevated px-6 py-16 text-center"
    >
      <UIcon
        name="i-lucide-bell-off"
        class="mx-auto mb-3 size-10 text-toned opacity-60"
      />
      <h2 class="text-base font-bold text-highlighted">
        اعلان یافت نشد
      </h2>
      <p class="mt-1 text-sm text-toned">
        این اعلان وجود ندارد یا دسترسی به آن ندارید
      </p>
    </div>

    <article
      v-else
      class="overflow-hidden rounded-2xl border border-default bg-elevated"
    >
      <div class="border-b border-default bg-primary/5 px-5 py-5 sm:px-6">
        <div class="flex items-start gap-4">
          <div
            class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary"
          >
            <UIcon
              :name="typeMeta.icon"
              class="size-6"
            />
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <UBadge
                :color="typeMeta.color as any"
                variant="subtle"
                size="sm"
              >
                {{ notification.typeLabel || NOTIFICATION_TYPE_LABELS[notification.type] }}
              </UBadge>
              <span class="text-xs text-muted">
                {{ notification.formattedDate }}
              </span>
            </div>

            <h1 class="mt-2 text-lg font-black leading-8 text-highlighted sm:text-xl">
              {{ notification.title }}
            </h1>
          </div>
        </div>
      </div>

      <div class="px-5 py-6 sm:px-6">
        <p class="mb-2 text-xs font-semibold text-muted">
          متن اعلان
        </p>

        <p class="min-h-[4.5rem] whitespace-pre-wrap text-sm leading-8 text-toned">
          {{ typedDescription }}<span
            v-if="isTyping"
            class="mr-0.5 inline-block h-4 w-0.5 animate-pulse bg-primary align-middle"
            aria-hidden="true"
          />
        </p>

        <div
          v-if="notification.link"
          class="mt-6"
        >
          <UButton
            :to="notification.link"
            color="primary"
            icon="i-lucide-external-link"
          >
            مشاهده جزئیات
          </UButton>
        </div>
      </div>
    </article>
  </ProfileShell>
</template>
