<script setup lang="ts">
const props = defineProps<{
  modelValue: number | ''
  label: string
  disabled?: boolean
  compact?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number | '']
  commit: []
}>()

function onInput(value: string | number): void {
  if (value === '' || value === null || typeof value === 'undefined') {
    emit('update:modelValue', '')
    return
  }

  const parsed = Number(value)
  emit('update:modelValue', Number.isFinite(parsed) ? parsed : '')
}

function onCommit(): void {
  emit('commit')
}
</script>

<template>
  <label class="block min-w-0">
    <span
      class="mb-1 block text-toned"
      :class="compact ? 'text-[10px]' : 'text-[11px]'"
    >
      {{ label }}
    </span>
    <UInput
      :model-value="modelValue === '' ? '' : modelValue"
      type="number"
      min="0"
      inputmode="numeric"
      class="w-full"
      :disabled="disabled"
      :ui="{ base: compact ? 'h-8 text-xs' : 'h-9 text-sm' }"
      @update:model-value="onInput"
      @blur="onCommit"
      @keydown.enter.prevent="onCommit"
    />
  </label>
</template>
