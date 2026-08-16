<script setup lang="ts">
import type { PublicNavigationItem } from "~/config/public-navigation";

const props = withDefaults(
  defineProps<{
    items: PublicNavigationItem[];
    mobile?: boolean;
  }>(),
  {
    mobile: false
  }
);

const emit = defineEmits<{
  navigate: [];
}>();

const route = useRoute();

function getItemPath(item: PublicNavigationItem): string {
  const [path] = item.to.split("#");
  return path || "/";
}

function getItemHash(item: PublicNavigationItem): string {
  const [, hash] = item.to.split("#");
  return hash ? `#${hash}` : "";
}

function isItemActive(item: PublicNavigationItem): boolean {
  if (route.path !== getItemPath(item)) {
    return false;
  }

  const itemHash = getItemHash(item);

  if (!itemHash || itemHash === "#home") {
    return route.hash === "" || route.hash === "#home";
  }

  return route.hash === itemHash;
}

function handleNavigate(): void {
  emit("navigate");
}
</script>

<template>
  <nav
    :class="
      mobile
        ? 'flex flex-col gap-2'
        : 'flex flex-wrap items-center justify-end gap-1'
    "
  >
    <NuxtLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      :class="
        mobile
          ? [
              'flex items-center justify-between gap-3 rounded-2xl border px-4 py-4 text-sm font-medium transition-all',
              isItemActive(item)
                ? 'border-primary/30 bg-primary/10 text-primary'
                : 'border-default bg-default text-muted hover:bg-elevated hover:text-highlighted'
            ]
          : [
              'rounded-full px-4 py-2 text-sm font-medium transition-all',
              isItemActive(item)
                ? 'bg-primary/10 text-primary'
                : 'text-toned hover:bg-elevated hover:text-highlighted'
            ]
      "
      @click="handleNavigate"
    >
      <span class="flex items-center gap-3">
        <UIcon
          v-if="mobile"
          :name="item.icon"
          class="size-5 shrink-0"
        />
        <span>{{ item.label }}</span>
      </span>

      <UIcon
        v-if="mobile"
        name="i-lucide-chevron-left"
        class="size-4 shrink-0 text-muted"
      />
    </NuxtLink>
  </nav>
</template>
