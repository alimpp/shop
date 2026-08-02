<template>
  <UPopover>
    <UButton color="neutral" variant="ghost" class="cursor-pointer">
      <UAvatar :alt="userStore.getUser.avatar" size="lg" color="primary" />
      <span class="text-sm">{{ userStore.getUser.fullName }}</span>
    </UButton>

    <template #content>
      <div class="w-72 p-4" dir="rtl">

        <div class="flex items-center gap-3 pb-4 border-b border-(--ui-border)">
          <UAvatar :alt="userStore.getUser.avatar" size="lg" color="primary" />
          <div>
            <p class="text-sm font-medium text-(--ui-text-highlighted)">
              {{ userStore.getUser.fullName }}
            </p>
            <p class="text-xs text-(--ui-text-muted)">
              {{ userStore.getUser.email }}
            </p>
          </div>
        </div>

        <div class="py-4 border-b border-(--ui-border)">
          <p class="text-xs font-medium text-(--ui-text-muted) mb-3">پوسته</p>
          <div class="grid grid-cols-3 gap-2">
            <UButton
              v-for="mode in themeModes"
              :key="mode.value"
              :variant="colorMode.preference === mode.value ? 'soft' : 'ghost'"
              :color="colorMode.preference === mode.value ? 'primary' : 'neutral'"
              size="sm"
              class="flex flex-col items-center gap-1 h-auto py-2 cursor-pointer"
              @click="colorMode.preference = mode.value"
            >
              <UIcon :name="mode.icon" class="text-base" />
              <span class="text-xs">{{ mode.label }}</span>
            </UButton>
          </div>
        </div>

        <div class="py-4 border-b border-(--ui-border)">
          <p class="text-xs font-medium text-(--ui-text-muted) mb-3">رنگ اصلی</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="color in primaryColors"
              :key="color.value"
              :title="color.label"
              class="w-7 h-7 rounded-full transition-all duration-150 focus:outline-none cursor-pointer"
              :style="{ backgroundColor: color.hex }"
              :class="[
                appConfig.ui.colors.primary === color.value
                  ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900'
                  : 'opacity-70 hover:opacity-100'
              ]"
              :aria-label="color.label"
              @click="changePrimaryColor(color.value)"
            />
          </div>
        </div>

        <div class="pt-4">
          <UButton
            color="error"
            variant="ghost"
            block
            leading-icon="i-lucide-log-out"
            class="justify-start cursor-pointer"
            @click="handleLogout"
          >
            خروج از حساب
          </UButton>
        </div>

      </div>
    </template>
  </UPopover>
</template>

<script setup>
import { useUserDS } from "../../dataStore/index";

const userStore = useUserDS();
const colorMode = useColorMode();
const appConfig = useAppConfig();

const themeModes = [
  { value: "light", label: "روشن",  icon: "i-lucide-sun" },
  { value: "dark",  label: "تاریک", icon: "i-lucide-moon" },
  { value: "system",label: "سیستم", icon: "i-lucide-monitor" },
];

const primaryColors = [
  { value: "violet",  label: "بنفش",    hex: "#7c3aed" },
  { value: "sky",     label: "آبی",     hex: "#0ea5e9" },
  { value: "emerald", label: "سبز",     hex: "#10b981" },
  { value: "orange",  label: "نارنجی",  hex: "#f97316" },
  { value: "pink",    label: "صورتی",   hex: "#ec4899" },
  { value: "amber",   label: "کهربایی", hex: "#f59e0b" },
  { value: "red",     label: "قرمز",    hex: "#ef4444" },
];

function changePrimaryColor(color) {
  appConfig.ui.colors.primary = color;
}

async function handleLogout() {
  const token = useCookie('token')
  token.value = ''
  localStorage.clear()
  navigateTo('/auth/login')
}
</script>