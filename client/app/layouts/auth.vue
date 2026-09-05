<script setup lang="ts">
const route = useRoute()
const title = route.meta.title as string | undefined
</script>

<template>
  <UApp>
    <div class="relative min-h-dvh overflow-hidden bg-default">
      <img
        src="/images/auth/bg.gif"
        alt=""
        class="absolute inset-0 h-full w-full object-cover"
      >

      <div class="absolute inset-0 bg-black/35" />

      <div class="relative z-10 grid min-h-dvh lg:grid-cols-2">
        <div
          class="flex w-full items-center justify-center sm:px-6 lg:justify-start lg:px-0 lg:py-0"
        >
          <div
            class="flex w-full flex-col items-center justify-center bg-zinc-950/60 p-5 shadow-2xl backdrop-blur-1 sm:p-8 h-full lg:w-[450px] lg:max-w-[450px] lg:justify-center lg:px-16 lg:py-16 lg:shadow-none"
          >
            <div class="w-full">
              <div class="mb-8 flex flex-col items-center text-center">
                <img
                  src="/image/logo/logo.png"
                  alt="Vista Logo"
                  class="object-contain drop-shadow-lg"
                  width="180"
                >
                <span
                  v-if="title"
                  class="text-lg font-semibold text-white"
                >
                  {{ title }}
                </span>
              </div>

              <slot />
            </div>
          </div>
        </div>

        <div class="hidden lg:block" />
      </div>
    </div>
  </UApp>
</template>
