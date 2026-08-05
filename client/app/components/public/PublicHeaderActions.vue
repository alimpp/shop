<script setup lang="ts">
const token = useCookie<string | null>("token");

const actions = computed(() => [
  {
    key: "profile",
    icon: "i-lucide-user-round",
    label: token.value ? "پروفایل" : "ورود",
    to: token.value ? "/profile" : "/auth/login"
  },
  {
    key: "cart",
    icon: "i-lucide-shopping-cart",
    label: "سبد خرید",
    to: "/cart"
  },
  {
    key: "search",
    icon: "iconamoon:search",
    label: "جستجو",
    to: "/search"
  }
]);

function goTo(path: string): void {
  navigateTo(path);
}
</script>

<template>
  <div class="flex items-center gap-2">
    <UButton
      v-for="action in actions"
      :key="action.key"
      color="neutral"
      variant="ghost"
      square
      :aria-label="action.label"
      class="shrink-0"
      @click="goTo(action.to)"
    >
      <UIcon :name="action.icon" class="size-5" />
    </UButton>
  </div>
</template>
