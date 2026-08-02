<script setup lang="ts">
import { publicNavigation } from "~/config/public-navigation";

const isMobileMenuOpen = ref(false);

function openMobileMenu(): void {
  isMobileMenuOpen.value = true;
}
</script>

<template>
  <header
    class="sticky top-0 z-40 border-b border-default bg-default/95 backdrop-blur supports-[backdrop-filter]:bg-default/80"
    dir="rtl"
  >
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="hidden h-24 items-center gap-8 md:flex">
        <NuxtLink to="/" class="flex shrink-0 items-center justify-center pl-2">
          <img
            src="/image/logo/logo.png"
            alt="Vista Shop"
            class="h-16 w-auto object-contain"
          >
        </NuxtLink>

        <div class="flex min-w-0 flex-1 justify-start">
          <PublicNavLinks :items="publicNavigation" />
        </div>

        <div class="flex shrink-0 justify-end">
          <PublicHeaderActions />
        </div>
      </div>

      <div class="grid h-20 grid-cols-[1fr_auto_1fr] items-center gap-3 md:hidden">
        <div class="flex justify-start">
          <UButton
            color="neutral"
            variant="ghost"
            square
            aria-label="باز کردن منو"
            @click="openMobileMenu"
          >
            <UIcon name="i-lucide-menu" class="size-5" />
          </UButton>
        </div>

        <NuxtLink to="/" class="flex items-center justify-center px-2">
          <img
            src="/image/logo/logo.png"
            alt="Vista Shop"
            class="h-14 w-auto object-contain"
          >
        </NuxtLink>

        <div class="flex justify-end">
          <PublicHeaderActions />
        </div>
      </div>
    </div>

    <PublicMobileMenu
      :open="isMobileMenuOpen"
      @update:open="isMobileMenuOpen = $event"
    />
  </header>
</template>
