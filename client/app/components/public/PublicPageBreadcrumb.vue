<script setup lang="ts">
defineProps<{
  items: Array<{ label: string; to?: string }>
}>()
</script>

<template>
  <nav
    aria-label="مسیر صفحه"
    class="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8"
  >
    <ol class="flex flex-wrap items-center gap-1.5 text-xs text-muted sm:text-sm">
      <li
        v-for="(item, index) in items"
        :key="`${item.label}-${index}`"
        class="inline-flex items-center gap-1.5"
      >
        <UIcon
          v-if="index > 0"
          name="i-lucide-chevron-left"
          class="size-3.5 text-muted/70"
        />
        <NuxtLink
          v-if="item.to && index < items.length - 1"
          :to="item.to"
          class="transition hover:text-primary"
        >
          {{ item.label }}
        </NuxtLink>
        <span
          v-else
          class="font-medium text-toned"
          aria-current="page"
        >
          {{ item.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>
