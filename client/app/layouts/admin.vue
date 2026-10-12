<script setup lang="ts">
import { computed } from 'vue'
import AdminProfileModal from '~/components/admin/AdminProfileModal.vue'
import { navigation, type AppNavigationItem } from '~/config/navigation'
import { useAdminPermissions } from '~/composables/useAdminPermissions'
import { profileAdminController } from '~/features/profile/admin/controllers/index.controller'

const { admin, can } = useAdminPermissions()
const profileOpen = ref(false)

const links = computed(() => {
  const filterItems = (items: AppNavigationItem[] = []) =>
    items.filter(item =>
      !item.permissionResource || can(item.permissionResource, 'view')
    )

  return navigation.map(group => filterItems(group))
})

const footerLinks = computed(() => links.value[1] ?? [])

useDashboard()

onMounted(() => {
  const token = useCookie<string>('token')
  if (!token.value) return

  const schedule =
    typeof window.requestIdleCallback === 'function'
      ? window.requestIdleCallback
      : (cb: () => void) => window.setTimeout(cb, 1)

  schedule(() => {
    void profileAdminController.getAdminProfile({ silent: true })
  })
})
</script>

<template>
  <UDashboardGroup
    unit="rem"
    class="rtl-dashboard h-dvh"
    :persistent="false"
  >
    <UDashboardSidebar
      id="default"
      collapsible
      class="bg-elevated/25"
      side="left"
      :ui="{
        footer: 'lg:border-t lg:border-default',
      }"
    >
      <template #header="{ collapsed }">
        <div class="mb-3 flex w-full justify-center">
          <img
            src="/image/logo/logo.png"
            width="120"
            class="mt-7"
          >
        </div>
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
          dir="rtl"
        />

        <UNavigationMenu
          v-if="footerLinks.length"
          :collapsed="collapsed"
          :items="footerLinks"
          orientation="vertical"
          tooltip
          class="mt-auto"
        />
      </template>

      <template #footer="{ collapsed }">
        <UButton
          :block="!collapsed"
          color="neutral"
          variant="ghost"
          class="justify-start"
          :icon="collapsed ? 'i-lucide-user-round' : undefined"
          @click="profileOpen = true"
        >
          <span
            v-if="!collapsed"
            class="truncate"
          >
            {{ admin.displayName || admin.username || 'پروفایل ادمین' }}
          </span>
        </UButton>
      </template>
    </UDashboardSidebar>

    <div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <slot />
    </div>

    <NotificationsSlideover />
    <AdminProfileModal v-model:open="profileOpen" />
  </UDashboardGroup>
</template>

<style scoped>
:global([dir="rtl"] .rtl-dashboard) {
  direction: rtl;
}

:global([dir="rtl"] .rtl-dashboard > *) {
  direction: rtl;
}

:global([dir="rtl"] .rtl-dashboard .lg\:order-1) {
  order: 2;
}

:global([dir="rtl"] [data-navigation-menu]) {
  text-align: right;
}
</style>
