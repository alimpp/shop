<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="داشبورد" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UTooltip text="Notifications" :shortcuts="['N']">
            <UButton
              color="neutral"
              variant="ghost"
              square
              @click="isNotificationsSlideoverOpen = true"
            >
              <UChip color="error" inset>
                <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
              </UChip>
            </UButton>
          </UTooltip>

          <UDropdownMenu :items="items">
            <!-- <Profile /> -->
          </UDropdownMenu>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <BaseDashboardPanelBody>
        داشبورد در ادمین
      </BaseDashboardPanelBody>
    </template>
  </UDashboardPanel>
</template>

<script setup>
definePageMeta({
  layout: "admin",
  middleware: "auth"
});
</script>
