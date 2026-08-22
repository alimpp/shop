<script setup lang="ts">
import { computed } from "vue";

import { navigation } from "../config/navigation";

const route = useRoute();
const links = computed(() => navigation);
const footerLinks = computed(() => links.value[1] ?? []);

useDashboard();

onMounted(() => {
  const token = useCookie<string>("token");
  if (!token.value) return;

  const schedule =
    typeof window.requestIdleCallback === "function"
      ? window.requestIdleCallback
      : (cb: () => void) => window.setTimeout(cb, 1);

  schedule(() => {
    void import(
      "~/features/profile/admin/controllers/index.controller"
    ).then(({ profileAdminController }) =>
      profileAdminController.getAdminProfile({ silent: true }),
    );
  });
});
</script>

<template>
  <UDashboardGroup unit="rem" class="rtl-dashboard h-dvh" :persistent="false">
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
        <div class="flex justify-center w-full mb-3">
          <img src="/image/logo/logo.png" width="120" class="mt-7" />
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
    </UDashboardSidebar>

    <div
      :key="route.fullPath"
      class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
    >
      <slot />
    </div>

    <NotificationsSlideover />
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
