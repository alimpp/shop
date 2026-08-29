<script setup lang="ts">
const props = defineProps<{
  title: string
  support?: string
}>()

const root = ref<HTMLElement | null>(null)
const visible = ref(false)
let observer: IntersectionObserver | null = null

onMounted(() => {
  if (!root.value || import.meta.server) {
    visible.value = true
    return
  }

  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) {
        visible.value = true
        observer?.disconnect()
        observer = null
      }
    },
    { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
  )

  observer.observe(root.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <section
    ref="root"
    class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
    :class="
      visible
        ? 'translate-y-0 opacity-100 transition duration-700 ease-out'
        : 'translate-y-5 opacity-0 transition duration-700 ease-out'
    "
  >
    <header class="mb-8 max-w-2xl space-y-3 sm:mb-10">
      <h2 class="text-2xl font-black text-highlighted sm:text-3xl">
        {{ props.title }}
      </h2>
      <p
        v-if="props.support"
        class="text-sm leading-8 text-toned sm:text-base"
      >
        {{ props.support }}
      </p>
    </header>

    <slot />
  </section>
</template>
