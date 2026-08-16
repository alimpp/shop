<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    loading: boolean;
    hasItems: boolean;
    emptyMessage: string;
    refreshingMessage?: string;
    desktopTableMinWidth?: string;
    desktopWrapperClass?: string;
    desktopInnerClass?: string;
  }>(),
  {
    refreshingMessage: "در حال بروزرسانی اطلاعات...",
    desktopTableMinWidth: "",
    desktopWrapperClass: "app-scrollbar -mx-1 overflow-x-auto pb-2",
    desktopInnerClass: "min-w-full px-1"
  }
);

const isInitialLoading = computed(() => props.loading && !props.hasItems);
</script>

<template>
  <div>
    <div v-if="isInitialLoading">
      <div class="md:hidden">
        <slot name="mobile-skeleton" />
      </div>

      <div class="hidden md:block">
        <div :class="props.desktopWrapperClass">
          <div :class="[props.desktopInnerClass, props.desktopTableMinWidth]">
            <slot name="desktop-skeleton" />
          </div>
        </div>
      </div>
    </div>

    <div
      v-else-if="!props.hasItems"
      class="rounded-lg border border-dashed border-default p-8 text-center text-sm text-muted"
    >
      {{ props.emptyMessage }}
    </div>

    <div v-else>
      <div
        v-if="props.loading"
        class="mb-3 rounded-lg border border-default bg-default/40 px-3 py-2 text-sm text-muted"
      >
        {{ props.refreshingMessage }}
      </div>

      <div class="md:hidden">
        <slot name="mobile" />
      </div>

      <div class="hidden md:block">
        <div :class="props.desktopWrapperClass">
          <div :class="[props.desktopInnerClass, props.desktopTableMinWidth]">
            <slot name="desktop" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
