<script setup lang="ts">
defineProps<{
  label: string
  value: string
  hint?: string
  icon: string
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
  trend?: string | null
  trendUp?: boolean | null
}>()
</script>

<template>
  <article class="rounded-2xl border border-default bg-elevated/40 p-4 sm:p-5">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 space-y-2">
        <p class="text-xs font-medium text-toned sm:text-sm">
          {{ label }}
        </p>
        <p class="text-xl font-black text-highlighted sm:text-2xl">
          {{ value }}
        </p>
        <p
          v-if="hint"
          class="text-xs text-muted"
        >
          {{ hint }}
        </p>
        <p
          v-if="trend"
          class="text-xs font-semibold"
          :class="trendUp === true ? 'text-success' : trendUp === false ? 'text-error' : 'text-toned'"
        >
          {{ trend }}
        </p>
      </div>

      <div
        class="flex size-11 shrink-0 items-center justify-center rounded-xl"
        :class="{
          'bg-primary/10 text-primary': color === 'primary' || !color,
          'bg-success/10 text-success': color === 'success',
          'bg-warning/10 text-warning': color === 'warning',
          'bg-error/10 text-error': color === 'error',
          'bg-info/10 text-info': color === 'info',
          'bg-neutral/10 text-toned': color === 'neutral'
        }"
      >
        <UIcon :name="icon" class="size-5" />
      </div>
    </div>
  </article>
</template>
