<script setup lang="ts">
import { publicNavigation } from "~/config/public-navigation";

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
}>();

const openModel = computed({
  get: () => props.open,
  set: (value: boolean) => emit("update:open", value)
});

function closeMenu(): void {
  openModel.value = false;
}
</script>

<template>
  <USlideover
    v-model:open="openModel"
    side="right"
    :close="false"
    :ui="{
      content: 'w-full max-w-full',
      body: 'p-0 sm:p-0'
    }"
  >
    <template #body>
      <div class="flex min-h-dvh flex-col bg-default" dir="rtl">
        <div class="flex items-center justify-between border-b border-default px-4 py-5">
          <UButton
            color="neutral"
            variant="ghost"
            square
            aria-label="بستن منو"
            @click="closeMenu"
          >
            <UIcon name="i-lucide-x" class="size-5" />
          </UButton>

          <NuxtLink to="/" class="flex items-center justify-center" @click="closeMenu">
            <img
              src="/image/logo/logo.png"
              alt="Vista Shop"
              class="h-11 w-auto object-contain"
            >
          </NuxtLink>
        </div>

        <div class="no-scrollbar flex-1 overflow-y-auto px-4 py-6">
          <PublicNavLinks
            :items="publicNavigation"
            mobile
            @navigate="closeMenu"
          />
        </div>

        <div class="border-t border-default px-4 py-5">
          <div class="flex items-center justify-between gap-3 rounded-2xl bg-elevated/60 px-4 py-4">
            <div class="space-y-1 text-sm">
              <p class="font-medium text-highlighted">
                دسترسی سریع
              </p>
              <p class="text-xs text-muted">
                پروفایل و سبد خرید از اینجا در دسترس هستند.
              </p>
            </div>

            <PublicHeaderActions />
          </div>
        </div>
      </div>
    </template>
  </USlideover>
</template>
