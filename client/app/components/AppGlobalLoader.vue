<script setup lang="ts">
const { isLoading } = useAppLoader()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isLoading"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm"
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label="در حال بارگذاری"
      >
        <div
          class="flex flex-col items-center gap-4 rounded-2xl border border-default/60 bg-elevated/90 px-10 py-8 shadow-xl"
        >
          <span
            class="size-10 animate-spin rounded-full border-[3px] border-primary/20 border-t-primary"
          />

          <p class="text-sm font-medium text-muted">
            در حال بارگذاری...
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
