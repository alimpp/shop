<script setup lang="ts">
import ChatRoom from '~/features/chat/components/ChatRoom.vue'
import OrderDetailView from '~/features/orders/components/OrderDetailView.vue'
import { profileAdminController } from '~/features/profile/admin/controllers/index.controller'
import { usersController } from '~/features/users/controllers/index.controller'
import { useUsersDS } from '~/features/users/data/index.store'
import type { TAdminUserTab } from '~/features/users/types/index.type'
import type { OrderModel } from '~/features/orders/models/index.model'
import type { TAdminUserBehaviorData } from '~/features/behavior/types/index.type'
import { behaviorController } from '~/features/behavior/controllers/index.controller'
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS
} from '~/features/orders/types/index.type'
import { useAdminDS } from '~/dataStore'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const toast = useToast()
const usersDS = useUsersDS()
const adminDS = useAdminDS()

const userId = computed(() => String(route.params.id ?? ''))
const user = computed(() => usersDS.getSelectedUser)
const stats = computed(() => usersDS.getStats)
const overviewLoading = computed(() => usersDS.getOverviewLoading)
const tabLoading = computed(() => usersDS.getTabLoading)
const cartItems = computed(() => usersDS.getCartItems)
const cartTotalPrice = computed(() => usersDS.getCartTotalPrice)
const orders = computed(() => usersDS.getOrders)
const favorites = computed(() => usersDS.getFavorites)
const likes = computed(() => usersDS.getLikes)
const comments = computed(() => usersDS.getComments)
const addresses = computed(() => usersDS.getAddresses)
const chat = computed(() => usersDS.getChat)

const tab = ref<TAdminUserTab>('info')
const loadedTabs = ref<Set<TAdminUserTab>>(new Set(['info']))
const selectedOrder = ref<OrderModel | null>(null)
const adminReady = ref(false)
const behaviorData = ref<TAdminUserBehaviorData | null>(null)
const behaviorLoading = ref(false)

const adminId = computed(() => adminDS.getAdmin.id || adminIdFromToken())

const BEHAVIOR_LABELS: Record<string, string> = {
  product_view: 'بازدید محصول',
  gallery_view: 'مشاهده گالری',
  like: 'لایک',
  unlike: 'آنلایک',
  comment: 'کامنت',
  favorite: 'علاقه‌مندی',
  unfavorite: 'حذف علاقه‌مندی',
  add_to_cart: 'افزودن به سبد',
  filter: 'فیلتر'
}

const tabs: Array<{ value: TAdminUserTab; label: string; icon: string; count?: () => number }> = [
  { value: 'info', label: 'اطلاعات', icon: 'i-lucide-user' },
  { value: 'cart', label: 'سبد خرید', icon: 'i-lucide-shopping-cart', count: () => stats.value.cartItems },
  { value: 'orders', label: 'سفارش‌ها', icon: 'i-lucide-shopping-bag', count: () => stats.value.orders },
  { value: 'likes', label: 'لایک‌ها', icon: 'i-lucide-heart', count: () => stats.value.likes },
  { value: 'comments', label: 'کامنت‌ها', icon: 'i-lucide-message-square', count: () => stats.value.comments },
  { value: 'favorites', label: 'علاقه‌مندی', icon: 'i-lucide-bookmark', count: () => stats.value.favorites },
  { value: 'behavior', label: 'رفتار', icon: 'i-lucide-activity' },
  { value: 'chat', label: 'پشتیبانی', icon: 'i-lucide-headphones' }
]

function formatPrice(value: number): string {
  return `${new Intl.NumberFormat('fa-IR').format(value)} تومان`
}

function formatDate(value?: string): string {
  if (!value) return ''
  return new Date(value).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function adminIdFromToken(): string {
  const token = useCookie<string | null>('token').value
  if (!token) return ''
  try {
    const payload = JSON.parse(
      atob(token.split('.')[1]?.replace(/-/g, '+').replace(/_/g, '/') || '')
    )
    return payload.sub || ''
  } catch {
    return ''
  }
}

async function ensureAdmin(): Promise<void> {
  if (adminDS.getAdmin.id) {
    adminReady.value = true
    return
  }

  const fromToken = adminIdFromToken()
  if (fromToken) {
    adminDS.setAdmin({
      id: fromToken,
      username: adminDS.getAdmin.username || '',
      role: 'admin'
    })
  }

  const response = await profileAdminController.getAdminProfile()
  if (response.success && response.data) {
    adminDS.setAdmin({
      id: (response.data as { id?: string }).id || fromToken,
      username: (response.data as { username?: string }).username || '',
      role: (response.data as { role?: string }).role || 'admin'
    })
  }

  adminReady.value = true
}

async function loadOverview(): Promise<void> {
  const response = await usersController.getOverview(userId.value)
  if (!response.success) {
    toast.add({
      title: response.message || 'دریافت کاربر ناموفق بود',
      color: 'error'
    })
    return
  }
  await usersController.getAddresses(userId.value)
}

async function loadTab(next: TAdminUserTab): Promise<void> {
  if (loadedTabs.value.has(next) && next !== 'chat' && next !== 'behavior') return
  loadedTabs.value.add(next)

  if (next === 'behavior') {
    behaviorLoading.value = true
    const response = await behaviorController.getAdminUserBehavior(userId.value, {
      page: 1,
      limit: 40
    })
    behaviorLoading.value = false
    if (!response.success) {
      loadedTabs.value.delete(next)
      toast.add({
        title: response.message || 'دریافت رفتار کاربر ناموفق بود',
        color: 'error'
      })
      return
    }
    behaviorData.value = response.data ?? null
    return
  }

  const loaders: Record<Exclude<TAdminUserTab, 'behavior'>, () => Promise<{ success: boolean; message?: string }>> = {
    info: () => usersController.getAddresses(userId.value),
    cart: () => usersController.getCart(userId.value),
    orders: () => usersController.getOrders(userId.value),
    likes: () => usersController.getLikes(userId.value),
    comments: () => usersController.getComments(userId.value),
    favorites: () => usersController.getFavorites(userId.value),
    chat: () => usersController.getOrCreateChat(userId.value)
  }

  const response = await loaders[next]()
  if (!response.success) {
    loadedTabs.value.delete(next)
    toast.add({
      title: response.message || 'دریافت اطلاعات ناموفق بود',
      color: 'error'
    })
  }
}

watch(tab, (value) => {
  loadTab(value)
  router.replace({
    query: { ...route.query, tab: value === 'info' ? undefined : value }
  })
})

onMounted(async () => {
  const queryTab = String(route.query.tab || '') as TAdminUserTab
  await Promise.all([ensureAdmin(), loadOverview()])
  if (tabs.some(item => item.value === queryTab)) {
    tab.value = queryTab
  }
})

onBeforeUnmount(() => {
  usersDS.resetDetail()
})
</script>

<template>
  <UDashboardPanel id="admin-user-detail">
    <template #header>
      <UDashboardNavbar :title="user?.displayName || 'پروفایل کاربر'">
        <template #leading>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-arrow-right"
            @click="navigateTo('/admin/users')"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <BaseDashboardPanelBody>
        <div
          v-if="overviewLoading && !user"
          class="space-y-4"
        >
          <USkeleton class="h-36 w-full rounded-3xl" />
          <USkeleton class="h-12 w-full rounded-2xl" />
        </div>

        <div
          v-else-if="!user"
          class="rounded-3xl border border-dashed border-default px-6 py-16 text-center text-sm text-toned"
        >
          کاربر یافت نشد.
        </div>

        <div
          v-else
          class="space-y-5"
        >
          <section class="overflow-hidden rounded-3xl border border-default bg-gradient-to-bl from-primary/10 via-elevated/70 to-transparent">
            <div class="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-6">
              <UAvatar
                :src="user.avatarUrl || undefined"
                :alt="user.displayName"
                :text="user.initials"
                size="3xl"
              />
              <div class="min-w-0 flex-1">
                <h2 class="text-lg font-black text-highlighted sm:text-xl">
                  {{ user.displayName }}
                </h2>
                <p
                  class="mt-1 text-sm text-toned"
                  dir="ltr"
                >
                  {{ user.phone }}
                </p>
                <p
                  v-if="user.email"
                  class="mt-0.5 truncate text-xs text-muted"
                >
                  {{ user.email }}
                </p>
                <p class="mt-2 text-xs text-toned">
                  عضویت از {{ user.formattedDate }}
                </p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-px border-t border-default bg-default/40 sm:grid-cols-3 lg:grid-cols-6">
              <div
                v-for="item in [
                  { label: 'سفارش', value: stats.orders },
                  { label: 'سبد', value: stats.cartItems },
                  { label: 'علاقه', value: stats.favorites },
                  { label: 'لایک', value: stats.likes },
                  { label: 'کامنت', value: stats.comments },
                  { label: 'آدرس', value: stats.addresses }
                ]"
                :key="item.label"
                class="bg-default/80 px-3 py-3 text-center"
              >
                <p class="text-sm font-black text-highlighted">
                  {{ item.value.toLocaleString('fa-IR') }}
                </p>
                <p class="mt-0.5 text-[11px] text-toned">
                  {{ item.label }}
                </p>
              </div>
            </div>
          </section>

          <div class="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            <button
              v-for="item in tabs"
              :key="item.value"
              type="button"
              class="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-colors sm:text-sm"
              :class="
                tab === item.value
                  ? 'bg-primary text-white'
                  : 'bg-elevated text-toned ring-1 ring-default'
              "
              @click="tab = item.value"
            >
              <UIcon
                :name="item.icon"
                class="size-3.5"
              />
              {{ item.label }}
              <span
                v-if="item.count"
                class="rounded-full px-1.5 text-[10px]"
                :class="tab === item.value ? 'bg-white/15' : 'bg-default'"
              >
                {{ item.count().toLocaleString('fa-IR') }}
              </span>
            </button>
          </div>

          <div
            v-if="tabLoading && tab !== 'info'"
            class="flex justify-center py-16"
          >
            <UIcon
              name="i-lucide-loader-2"
              class="size-7 animate-spin text-primary"
            />
          </div>

          <section
            v-else-if="tab === 'info'"
            class="grid gap-4 lg:grid-cols-2"
          >
            <div class="rounded-2xl border border-default bg-elevated/40 p-4 sm:p-5">
              <h3 class="text-sm font-bold text-highlighted">
                مشخصات حساب
              </h3>
              <dl class="mt-4 space-y-3 text-sm">
                <div class="flex justify-between gap-3">
                  <dt class="text-toned">نام</dt>
                  <dd class="font-medium text-highlighted">
                    {{ user.fristname || '—' }}
                  </dd>
                </div>
                <div class="flex justify-between gap-3">
                  <dt class="text-toned">نام خانوادگی</dt>
                  <dd class="font-medium text-highlighted">
                    {{ user.lastname || '—' }}
                  </dd>
                </div>
                <div class="flex justify-between gap-3">
                  <dt class="text-toned">موبایل</dt>
                  <dd
                    class="font-medium text-highlighted"
                    dir="ltr"
                  >
                    {{ user.phone || '—' }}
                  </dd>
                </div>
                <div class="flex justify-between gap-3">
                  <dt class="text-toned">ایمیل</dt>
                  <dd class="truncate font-medium text-highlighted">
                    {{ user.email || '—' }}
                  </dd>
                </div>
              </dl>
            </div>

            <div class="rounded-2xl border border-default bg-elevated/40 p-4 sm:p-5">
              <h3 class="text-sm font-bold text-highlighted">
                آدرس‌ها
              </h3>
              <div
                v-if="!addresses.length"
                class="mt-6 text-center text-xs text-toned"
              >
                آدرسی ثبت نشده است.
              </div>
              <div
                v-else
                class="mt-4 space-y-3"
              >
                <article
                  v-for="address in addresses"
                  :key="address.id"
                  class="rounded-xl border border-default p-3"
                >
                  <p class="text-sm font-bold text-highlighted">
                    {{ address.name }}
                  </p>
                  <p class="mt-1 text-xs leading-6 text-toned">
                    {{ address.province }}، {{ address.city }}، {{ address.address }}
                  </p>
                  <p
                    class="mt-1 text-[11px] text-muted"
                    dir="ltr"
                  >
                    {{ address.postalCode }}
                  </p>
                </article>
              </div>
            </div>
          </section>

          <section
            v-else-if="tab === 'cart'"
            class="space-y-3"
          >
            <div
              v-if="!cartItems.length"
              class="rounded-2xl border border-dashed border-default px-4 py-12 text-center text-sm text-toned"
            >
              سبد خرید این کاربر خالی است.
            </div>
            <article
              v-for="item in cartItems"
              :key="item.id"
              class="flex gap-3 rounded-2xl border border-default bg-elevated/40 p-3 sm:p-4"
            >
              <div class="size-16 shrink-0 overflow-hidden rounded-xl bg-elevated sm:size-20">
                <NuxtImg
                  v-if="item.thumbnail"
                  :src="item.thumbnail"
                  :alt="item.product.name"
                  class="size-full object-cover"
                />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-bold text-highlighted">
                  {{ item.product.name }}
                </p>
                <PublicProductSelectionChips
                  class="mt-1"
                  :variant="item.variant"
                  :selected-options="item.selectedOptions"
                  :include-sku="false"
                />
                <p
                  v-if="item.variant?.sku"
                  class="mt-1 text-[11px] text-muted"
                  dir="ltr"
                >
                  SKU: {{ item.variant.sku }}
                </p>
                <div class="mt-2 flex justify-between text-xs text-toned">
                  <span>تعداد {{ item.quantity.toLocaleString('fa-IR') }}</span>
                  <span class="font-bold text-highlighted">
                    {{ formatPrice(item.lineTotal) }}
                  </span>
                </div>
              </div>
            </article>
            <div
              v-if="cartItems.length"
              class="rounded-2xl bg-primary/10 px-4 py-3 text-sm font-black text-primary"
            >
              جمع سبد: {{ formatPrice(cartTotalPrice) }}
            </div>
          </section>

          <section
            v-else-if="tab === 'orders'"
            class="space-y-3"
          >
            <div
              v-if="!orders.length"
              class="rounded-2xl border border-dashed border-default px-4 py-12 text-center text-sm text-toned"
            >
              سفارشی برای این کاربر ثبت نشده است.
            </div>
            <button
              v-for="order in orders"
              :key="order.id"
              type="button"
              class="flex w-full items-start justify-between gap-3 rounded-2xl border border-default bg-elevated/40 p-4 text-right"
              @click="selectedOrder = order"
            >
              <div>
                <p class="text-sm font-black text-highlighted">
                  {{ order.orderNumber }}
                </p>
                <p class="mt-1 text-xs text-toned">
                  {{ order.formattedDate }}
                </p>
                <p class="mt-2 text-sm font-bold text-primary">
                  {{ formatPrice(order.paidAmount) }}
                </p>
              </div>
              <UBadge
                :color="ORDER_STATUS_COLORS[order.status]"
                variant="subtle"
              >
                {{ ORDER_STATUS_LABELS[order.status] }}
              </UBadge>
            </button>
          </section>

          <section
            v-else-if="tab === 'likes'"
            class="grid gap-3 sm:grid-cols-2"
          >
            <div
              v-if="!likes.length"
              class="col-span-full rounded-2xl border border-dashed border-default px-4 py-12 text-center text-sm text-toned"
            >
              این کاربر هنوز چیزی لایک نکرده است.
            </div>
            <article
              v-for="item in likes"
              :key="item.id"
              class="flex gap-3 rounded-2xl border border-default bg-elevated/40 p-3"
            >
              <div class="size-14 shrink-0 overflow-hidden rounded-xl bg-elevated">
                <NuxtImg
                  v-if="item.image"
                  :src="item.image"
                  :alt="item.title"
                  class="size-full object-cover"
                />
              </div>
              <div class="min-w-0">
                <p class="text-sm font-bold text-highlighted">
                  {{ item.title }}
                </p>
                <p class="mt-1 text-[11px] text-toned">
                  {{ item.entityType === 'blog' ? 'بلاگ' : 'محصول' }} ·
                  {{ formatDate(item.createdAt) }}
                </p>
              </div>
            </article>
          </section>

          <section
            v-else-if="tab === 'comments'"
            class="space-y-3"
          >
            <div
              v-if="!comments.length"
              class="rounded-2xl border border-dashed border-default px-4 py-12 text-center text-sm text-toned"
            >
              کامنتی از این کاربر ثبت نشده است.
            </div>
            <article
              v-for="item in comments"
              :key="item.id"
              class="rounded-2xl border border-default bg-elevated/40 p-4"
            >
              <p class="text-xs font-bold text-primary">
                {{ item.title }}
              </p>
              <p class="mt-2 text-sm leading-7 text-highlighted">
                {{ item.content }}
              </p>
              <p class="mt-2 text-[11px] text-muted">
                {{ formatDate(item.createdAt) }}
              </p>
            </article>
          </section>

          <section
            v-else-if="tab === 'favorites'"
            class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
          >
            <div
              v-if="!favorites.length"
              class="col-span-full rounded-2xl border border-dashed border-default px-4 py-12 text-center text-sm text-toned"
            >
              علاقه‌مندی‌ای ثبت نشده است.
            </div>
            <article
              v-for="item in favorites"
              :key="item.id"
              class="overflow-hidden rounded-2xl border border-default bg-elevated/40"
            >
              <div class="aspect-[4/3] bg-elevated">
                <NuxtImg
                  v-if="item.mainImage"
                  :src="item.mainImage"
                  :alt="item.name"
                  class="size-full object-cover"
                />
              </div>
              <div class="p-3">
                <p class="line-clamp-2 text-sm font-bold text-highlighted">
                  {{ item.name }}
                </p>
                <p class="mt-2 text-xs font-black text-primary">
                  {{ formatPrice(Number(item.salePrice || item.price || 0)) }}
                </p>
              </div>
            </article>
          </section>

          <section
            v-else-if="tab === 'behavior'"
            class="space-y-4"
          >
            <div
              v-if="behaviorLoading && !behaviorData"
              class="flex justify-center py-16"
            >
              <UIcon
                name="i-lucide-loader-2"
                class="size-7 animate-spin text-primary"
              />
            </div>

            <template v-else-if="behaviorData">
              <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div class="rounded-2xl bg-elevated/50 px-4 py-3">
                  <p class="text-xs text-muted">
                    کل رویدادها
                  </p>
                  <p class="mt-1 text-lg font-black text-highlighted">
                    {{ behaviorData.summary.totalEvents.toLocaleString('fa-IR') }}
                  </p>
                </div>
                <div
                  v-for="item in behaviorData.summary.eventTypeCounts.slice(0, 3)"
                  :key="item.eventType"
                  class="rounded-2xl bg-elevated/50 px-4 py-3"
                >
                  <p class="text-xs text-muted">
                    {{ BEHAVIOR_LABELS[item.eventType] || item.eventType }}
                  </p>
                  <p class="mt-1 text-lg font-black text-highlighted">
                    {{ item.count.toLocaleString('fa-IR') }}
                  </p>
                </div>
              </div>

              <div class="space-y-3">
                <h3 class="text-sm font-bold text-highlighted">
                  بیشترین علاقه به محصولات
                </h3>
                <div
                  v-if="!behaviorData.summary.topInterests.length"
                  class="rounded-2xl border border-dashed border-default px-4 py-8 text-center text-sm text-toned"
                >
                  هنوز علاقه محصولی ثبت نشده است.
                </div>
                <article
                  v-for="item in behaviorData.summary.topInterests"
                  :key="item.productId"
                  class="flex gap-3 rounded-2xl bg-elevated/40 p-3"
                >
                  <div class="size-14 shrink-0 overflow-hidden rounded-xl bg-default">
                    <NuxtImg
                      v-if="item.product?.image"
                      :src="item.product.image"
                      :alt="item.product?.name || ''"
                      class="size-full object-cover"
                    />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-bold text-highlighted">
                      {{ item.product?.name || item.productId }}
                    </p>
                    <p class="mt-1 text-xs text-toned">
                      امتیاز {{ item.score.toLocaleString('fa-IR') }} ·
                      بازدید {{ item.viewCount.toLocaleString('fa-IR') }} ·
                      گالری {{ item.galleryViewCount.toLocaleString('fa-IR') }} ·
                      لایک {{ item.likeCount.toLocaleString('fa-IR') }}
                    </p>
                  </div>
                </article>
              </div>

              <div class="space-y-3">
                <h3 class="text-sm font-bold text-highlighted">
                  فیلترهای اخیر
                </h3>
                <div
                  v-if="!behaviorData.filters.length"
                  class="rounded-2xl border border-dashed border-default px-4 py-8 text-center text-sm text-toned"
                >
                  فیلتری ثبت نشده است.
                </div>
                <div
                  v-for="item in behaviorData.filters"
                  :key="item.id"
                  class="rounded-2xl bg-elevated/40 px-4 py-3 text-xs text-toned"
                >
                  <p class="font-medium text-highlighted">
                    {{ new Date(item.createdAt).toLocaleString('fa-IR') }}
                  </p>
                  <p class="mt-1 break-all" dir="ltr">
                    {{ JSON.stringify(item.metadata) }}
                  </p>
                </div>
              </div>

              <div class="space-y-3">
                <h3 class="text-sm font-bold text-highlighted">
                  رویدادهای اخیر
                </h3>
                <article
                  v-for="item in behaviorData.events"
                  :key="item.id"
                  class="flex items-start justify-between gap-3 rounded-2xl bg-elevated/40 px-4 py-3"
                >
                  <div class="min-w-0">
                    <p class="text-sm font-bold text-highlighted">
                      {{ BEHAVIOR_LABELS[item.eventType] || item.eventType }}
                    </p>
                    <p class="mt-1 truncate text-xs text-toned">
                      {{ item.product?.name || '—' }}
                    </p>
                  </div>
                  <p class="shrink-0 text-[11px] text-muted">
                    {{ new Date(item.createdAt).toLocaleString('fa-IR') }}
                  </p>
                </article>
              </div>
            </template>

            <div
              v-else
              class="rounded-2xl border border-dashed border-default px-4 py-12 text-center text-sm text-toned"
            >
              داده‌ای برای رفتار کاربر یافت نشد.
            </div>
          </section>

          <section
            v-else-if="tab === 'chat'"
            class="overflow-hidden rounded-2xl border border-default"
            style="height: min(70dvh, 640px)"
          >
            <ChatRoom
              v-if="adminReady && chat?.id && adminId"
              :chat-id="chat.id"
              :current-user-id="adminId"
              :is-admin="true"
            />
            <div
              v-else
              class="flex h-full items-center justify-center text-sm text-toned"
            >
              در حال آماده‌سازی چت...
            </div>
          </section>
        </div>

        <UModal
          :open="Boolean(selectedOrder)"
          title="جزئیات سفارش"
          :ui="{ content: 'sm:max-w-4xl' }"
          @update:open="(value: boolean) => { if (!value) selectedOrder = null }"
        >
          <template #body>
            <OrderDetailView
              v-if="selectedOrder"
              :order="selectedOrder"
              show-customer
            />
          </template>
        </UModal>
      </BaseDashboardPanelBody>
    </template>
  </UDashboardPanel>
</template>
