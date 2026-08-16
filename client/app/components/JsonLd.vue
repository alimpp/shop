<script setup lang="ts">
interface Props {
  data: Record<string, unknown>
}

const props = defineProps<Props>()

const json = computed(() => JSON.stringify(props.data))

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: json.value
    }
  ]
}))
</script>

<template>
  <div
    class="hidden"
    aria-hidden="true"
  />
</template>
