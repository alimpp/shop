<script setup lang="ts">
import DashboardLowStockList from '~/features/dashboard/components/DashboardLowStockList.vue'
import DashboardOrderStatusPanel from '~/features/dashboard/components/DashboardOrderStatusPanel.vue'
import DashboardQuickActions from '~/features/dashboard/components/DashboardQuickActions.vue'
import DashboardRecentOrders from '~/features/dashboard/components/DashboardRecentOrders.vue'
import DashboardRecentUsers from '~/features/dashboard/components/DashboardRecentUsers.vue'
import DashboardRevenueChart from '~/features/dashboard/components/DashboardRevenueChart.vue'
import DashboardStatCard from '~/features/dashboard/components/DashboardStatCard.vue'
import DashboardTopProducts from '~/features/dashboard/components/DashboardTopProducts.vue'
import { dashboardController } from '~/features/dashboard/controllers/index.controller'
import { useDashboardDS } from '~/features/dashboard/data/index.store'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const toast = useToast()
const { isNotificationsSlideoverOpen } = useDashboard()
const dashboardDS = useDashboardDS()

const data = computed(() => dashboardDS.getData)
const loading = computed(() => dashboardDS.getLoading)

const numberFormatter = new Intl.NumberFormat('fa-IR')

function formatPrice(value: number): string {
  return `${numberFormatter.format(value)} تومان`
}

function formatGrowth(value: number | null | undefined): string | null {
  if (value === null || typeof value === 'undefined') {
    return null
  }

  const sign = value > 0 ? '+' : ''
  return `${sign}${numberFormatter.format(value)}٪ نسبت به ماه قبل`
}

function formatGeneratedAt(value?: string): string {
  if (!value) return ''
  return new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}

async function fetchDashboard(): Promise<void> {
  const response = await dashboardController.getDashboard()

  if (!response.success) {
    toast.add({
      title: response.message || 'دریافت اطلاعات داشبورد ناموفق بود',
      color: 'error'
    })
  }
}

onMounted(() => {
  fetchDashboard()
})
</script>

<template>
  <UDashboardPanel id="admin-dashboard">
    <template #header>
      <UDashboardNavbar title="داشبورد" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UTooltip text="اعلان‌ها" :shortcuts="['N']">
            <UButton
              color="neutral"
              variant="ghost"
              square
              @click="isNotificationsSlideoverOpen = true"
            >
              <UChip
                v-if="data?.engagement.unreadChats"
                color="error"
                inset
              >
                <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
              </UChip>
              <UIcon
                v-else
                name="i-lucide-bell"
                class="size-5 shrink-0"
              />
            </UButton>
          </UTooltip>

          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-refresh-cw"
            :loading="loading"
            @click="fetchDashboard"
          >
            بروزرسانی
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <BaseDashboardPanelBody>
        <div
          v-if="loading && !data"
          class="flex justify-center py-20"
        >
          <UIcon
            name="i-lucide-loader-2"
            class="size-8 animate-spin text-primary"
          />
        </div>

        <div
          v-else-if="data"
          class="space-y-6"
        >
          <section class="space-y-2">
            <h2 class="text-lg font-black text-highlighted sm:text-xl">
              نمای کلی فروشگاه
            </h2>
            <p class="text-xs text-toned sm:text-sm">
              آخرین بروزرسانی: {{ formatGeneratedAt(data.generatedAt) }}
            </p>
          </section>

          <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardStatCard
              label="درآمد این ماه"
              :value="formatPrice(data.revenue.month)"
              :hint="`امروز: ${formatPrice(data.revenue.today)}`"
              icon="i-lucide-wallet"
              color="primary"
              :trend="formatGrowth(data.revenue.monthGrowthPercent)"
              :trend-up="data.revenue.monthGrowthPercent === null ? null : data.revenue.monthGrowthPercent >= 0"
            />
            <DashboardStatCard
              label="سفارش‌های در انتظار"
              :value="numberFormatter.format(data.orders.pending)"
              :hint="`${numberFormatter.format(data.orders.today)} سفارش امروز`"
              icon="i-lucide-clock-3"
              color="warning"
            />
            <DashboardStatCard
              label="کاربران"
              :value="numberFormatter.format(data.users.total)"
              :hint="`${numberFormatter.format(data.users.month)} کاربر جدید این ماه`"
              icon="i-lucide-users"
              color="success"
            />
            <DashboardStatCard
              label="محصولات منتشرشده"
              :value="numberFormatter.format(data.products.published)"
              :hint="`${numberFormatter.format(data.products.total)} محصول کل`"
              icon="i-lucide-package-2"
              color="info"
            />
          </section>

          <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardStatCard
              label="درآمد کل"
              :value="formatPrice(data.revenue.total)"
              :hint="`۷ روز اخیر: ${formatPrice(data.revenue.week)}`"
              icon="i-lucide-trending-up"
              color="neutral"
            />
            <DashboardStatCard
              label="میانگین ارزش سفارش"
              :value="formatPrice(data.orders.averageValue)"
              :hint="`${numberFormatter.format(data.orders.total)} سفارش کل`"
              icon="i-lucide-receipt"
              color="neutral"
            />
            <DashboardStatCard
              label="چت‌های باز"
              :value="numberFormatter.format(data.engagement.openChats)"
              :hint="`${numberFormatter.format(data.engagement.unreadChats)} پیام خوانده‌نشده`"
              icon="i-lucide-message-circle"
              color="primary"
            />
            <DashboardStatCard
              label="موجودی کم / تمام‌شده"
              :value="numberFormatter.format(data.products.lowStock + data.products.outOfStock)"
              :hint="`${numberFormatter.format(data.products.outOfStock)} تمام‌شده`"
              icon="i-lucide-triangle-alert"
              color="error"
            />
          </section>

          <section class="grid gap-4 xl:grid-cols-3">
            <div class="xl:col-span-2">
              <DashboardRevenueChart :points="data.revenueChart" />
            </div>
            <DashboardOrderStatusPanel
              :items="data.orders.byStatus"
              :total="data.orders.total"
            />
          </section>

          <section class="grid gap-4 xl:grid-cols-3">
            <div class="xl:col-span-2">
              <DashboardRecentOrders :items="data.recentOrders" />
            </div>
            <DashboardQuickActions />
          </section>

          <section class="grid gap-4 xl:grid-cols-2">
            <DashboardTopProducts :items="data.topProducts" />
            <DashboardLowStockList :items="data.lowStockProducts" />
          </section>

          <section class="grid gap-4 xl:grid-cols-3">
            <div class="xl:col-span-2">
              <section class="rounded-2xl border border-default bg-elevated/40 p-4 sm:p-5">
                <h3 class="mb-4 text-sm font-black text-highlighted sm:text-base">
                  شاخص‌های عملیاتی
                </h3>

                <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div class="rounded-xl border border-default/80 bg-default/20 p-4">
                    <p class="text-xs text-toned">
                      سبد خرید فعال
                    </p>
                    <p class="mt-1 text-lg font-black text-highlighted">
                      {{ numberFormatter.format(data.engagement.activeCarts) }}
                    </p>
                    <p class="mt-1 text-xs text-muted">
                      {{ numberFormatter.format(data.engagement.cartItems) }} آیتم
                    </p>
                  </div>

                  <div class="rounded-xl border border-default/80 bg-default/20 p-4">
                    <p class="text-xs text-toned">
                      نظرات ثبت‌شده
                    </p>
                    <p class="mt-1 text-lg font-black text-highlighted">
                      {{ numberFormatter.format(data.engagement.comments) }}
                    </p>
                  </div>

                  <div class="rounded-xl border border-default/80 bg-default/20 p-4">
                    <p class="text-xs text-toned">
                      محصولات ویژه
                    </p>
                    <p class="mt-1 text-lg font-black text-highlighted">
                      {{ numberFormatter.format(data.products.featured) }}
                    </p>
                  </div>

                  <div class="rounded-xl border border-default/80 bg-default/20 p-4">
                    <p class="text-xs text-toned">
                      پیش‌نویس‌ها
                    </p>
                    <p class="mt-1 text-lg font-black text-highlighted">
                      {{ numberFormatter.format(data.products.draft) }}
                    </p>
                  </div>

                  <div class="rounded-xl border border-default/80 bg-default/20 p-4">
                    <p class="text-xs text-toned">
                      غیرفعال / آرشیو
                    </p>
                    <p class="mt-1 text-lg font-black text-highlighted">
                      {{ numberFormatter.format(data.products.inactive + data.products.archived) }}
                    </p>
                  </div>

                  <div class="rounded-xl border border-default/80 bg-default/20 p-4">
                    <p class="text-xs text-toned">
                      سفارش این ماه
                    </p>
                    <p class="mt-1 text-lg font-black text-highlighted">
                      {{ numberFormatter.format(data.orders.month) }}
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <DashboardRecentUsers :items="data.recentUsers" />
          </section>
        </div>

        <div
          v-else
          class="rounded-2xl border border-dashed border-default px-6 py-16 text-center"
        >
          <p class="text-sm text-toned">
            اطلاعات داشبورد در دسترس نیست.
          </p>
          <UButton
            class="mt-4"
            color="primary"
            @click="fetchDashboard"
          >
            تلاش مجدد
          </UButton>
        </div>
      </BaseDashboardPanelBody>
    </template>
  </UDashboardPanel>
</template>
