<script setup lang="ts">
const props = defineProps<{
  title?: string;
}>();

const route = useRoute();

const segmentLabels: Record<string, string> = {
  admin: "پنل مدیریت",
  dashboard: "داشبورد",
  categories: "دسته‌بندی‌ها",
  products: "محصولات",
  brands: "برندها",
  attributes: "ویژگی‌ها",
  auth: "احراز هویت",
  login: "ورود",
  files: "فایل‌ها",
  stories: "استوری‌ها",
};

const breadcrumbItems = computed(() => {
  const segments = route.path.split("/").filter(Boolean);
  let currentPath = "";

  return segments.map((segment) => {
    currentPath += `/${segment}`;

    return {
      label: segmentLabels[segment] ?? segment.replace(/-/g, " "),
      to: currentPath
    };
  });
});

const pageTitle = computed(() => {
  if (props.title) {
    return props.title;
  }

  return breadcrumbItems.value.at(-1)?.label ?? "";
});
</script>

<template>
  <div
    class="flex w-full items-center justify-between gap-4"
  >
    <div class="flex items-center gap-3">
      <slot name="actions" />

      <nav
        aria-label="breadcrumb"
        class="flex items-center gap-2 text-sm text-muted"
      >
        <template v-for="(item, index) in breadcrumbItems" :key="item.to">
          <NuxtLink
            :to="item.to"
            class="transition-colors hover:text-highlighted"
            :class="{ 'font-medium text-highlighted': index === breadcrumbItems.length - 1 }"
          >
            {{ item.label }}
          </NuxtLink>

          <UIcon
            v-if="index < breadcrumbItems.length - 1"
            name="i-lucide-chevron-left"
            class="size-4 shrink-0"
          />
        </template>
      </nav>
    </div>

    <div class="min-w-0">
      <h1 class="text-base font-bold text-highlighted">
        {{ pageTitle }}
      </h1>
    </div>
  </div>
</template>
