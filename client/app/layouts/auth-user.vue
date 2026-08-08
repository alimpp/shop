<template>
  <UApp>
    <div class="relative min-h-dvh overflow-hidden bg-default text-default">
      <img
        src="/images/auth/bg.gif"
        alt=""
        class="absolute inset-0 h-full w-full object-cover"
      />

      <div class="absolute inset-0 bg-black/45" />

      <div class="relative z-10 grid min-h-dvh lg:grid-cols-2">
        <div class="flex items-center justify-center px-4 py-10 sm:px-8 lg:px-16">
          <div class="w-full max-w-md rounded-[5px] bg-white/90 p-6 shadow-xl backdrop-blur-md sm:p-8">
            <div class="mb-8 flex flex-col items-center justify-center text-center">
              <img
                src="/image/logo/logo.png"
                alt="Vista Logo"
                class="object-contain"
                width="200"
              />
            </div>

            <slot />
          </div>
        </div>

        <div class="hidden lg:block" />
      </div>
    </div>
  </UApp>
</template>
