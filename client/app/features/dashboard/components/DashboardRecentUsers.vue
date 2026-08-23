<script setup lang="ts">
import type { TDashboardRecentUser } from '../types/index.type'

defineProps<{
  items: TDashboardRecentUser[]
}>()

function formatDate(value: string | Date): string {
  const date = new Date(value)
  return new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'medium'
  }).format(date)
}
</script>

<template>
  <section class="rounded-2xl border border-default bg-elevated/40 p-4 sm:p-5">
    <div class="mb-5 flex items-center justify-between gap-3">
      <div>
        <h3 class="text-sm font-black text-highlighted sm:text-base">
          کاربران جدید
        </h3>
        <p class="mt-1 text-xs text-toned sm:text-sm">
          آخرین ثبت‌نام‌ها
        </p>
      </div>

      <UButton
        to="/admin/users"
        color="neutral"
        variant="ghost"
        size="sm"
        trailing-icon="i-lucide-arrow-left"
      >
        همه
      </UButton>
    </div>

    <div
      v-if="!items.length"
      class="rounded-xl border border-dashed border-default px-4 py-10 text-center text-sm text-toned"
    >
      کاربری ثبت نشده است.
    </div>

    <div
      v-else
      class="space-y-3"
    >
      <article
        v-for="user in items"
        :key="user.id"
        class="flex items-center justify-between gap-3 rounded-xl border border-default/80 bg-default/20 p-3"
      >
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-highlighted">
            {{ user.fristname }} {{ user.lastname }}
          </p>
          <p class="text-xs text-toned">
            {{ user.phone }}
          </p>
        </div>

        <p class="shrink-0 text-xs text-muted">
          {{ formatDate(user.created_at) }}
        </p>
      </article>
    </div>
  </section>
</template>
