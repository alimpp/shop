<script setup lang="ts">
withDefaults(
  defineProps<{
    brand: string
    headline: string
    support: string
    primaryCta: { label: string; to: string }
    secondaryCta?: { label: string; to: string }
    visualLabel?: string
  }>(),
  {
    visualLabel: 'فضای فروشگاه'
  }
)

const revealed = ref(false)

onMounted(() => {
  requestAnimationFrame(() => {
    revealed.value = true
  })
})
</script>

<template>
  <section
    class="public-page-hero relative isolate min-h-[min(92dvh,820px)] overflow-hidden"
    dir="rtl"
  >
    <div
      class="pointer-events-none absolute inset-0"
      aria-hidden="true"
    >
      <div class="absolute inset-0 bg-[radial-gradient(120%_80%_at_80%_0%,rgba(0,193,106,0.18),transparent_55%),radial-gradient(90%_70%_at_10%_100%,rgba(16,185,129,0.08),transparent_50%),linear-gradient(165deg,#0c0c0c_0%,#121212_45%,#0a1210_100%)]" />
      <div class="public-page-hero__grid absolute inset-0 opacity-[0.35]" />
      <div class="public-page-hero__orb absolute -left-24 top-16 size-[280px] rounded-full bg-primary/20 blur-3xl sm:size-[360px]" />
      <div class="public-page-hero__orb public-page-hero__orb--delay absolute -right-16 bottom-10 size-[220px] rounded-full bg-emerald-500/10 blur-3xl" />
    </div>

    <div class="relative mx-auto flex min-h-[min(92dvh,820px)] max-w-7xl flex-col justify-end px-4 pb-14 pt-10 sm:px-6 sm:pb-16 lg:justify-center lg:px-8 lg:pb-20 lg:pt-16">
      <div class="grid items-end gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
        <div
          class="public-page-hero__copy max-w-xl space-y-6 transition-all duration-700 ease-out"
          :class="revealed ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'"
        >
          <p class="text-2xl font-black tracking-tight text-primary sm:text-3xl lg:text-4xl">
            {{ brand }}
          </p>

          <h1 class="text-3xl font-black leading-[1.35] text-highlighted sm:text-4xl lg:text-[2.75rem] lg:leading-[1.3]">
            {{ headline }}
          </h1>

          <p class="max-w-md text-sm leading-8 text-toned sm:text-base sm:leading-8">
            {{ support }}
          </p>

          <div class="flex flex-wrap items-center gap-3 pt-1">
            <UButton
              :to="primaryCta.to"
              color="primary"
              size="lg"
              trailing-icon="i-lucide-arrow-left"
              class="min-w-[9.5rem] justify-center"
            >
              {{ primaryCta.label }}
            </UButton>
            <UButton
              v-if="secondaryCta"
              :to="secondaryCta.to"
              color="neutral"
              variant="outline"
              size="lg"
              class="min-w-[9.5rem] justify-center"
            >
              {{ secondaryCta.label }}
            </UButton>
          </div>
        </div>

        <div
          class="public-page-hero__visual relative mx-auto w-full max-w-md transition-all duration-1000 ease-out lg:max-w-none"
          :class="revealed ? 'translate-y-0 opacity-100 delay-150' : 'translate-y-8 opacity-0'"
          :aria-label="visualLabel"
        >
          <div class="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-white/10 bg-[#0e0e0e] shadow-[0_30px_80px_-40px_rgba(0,193,106,0.45)]">
            <div class="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,193,106,0.12),transparent_40%),linear-gradient(to_top,rgba(0,0,0,0.55),transparent_55%)]" />
            <div class="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:28px_28px]" />

            <div class="absolute inset-0 flex flex-col items-center justify-center gap-5 p-8">
              <img
                src="/image/logo/logo.png"
                :alt="brand"
                class="h-20 w-auto object-contain drop-shadow-[0_12px_40px_rgba(0,193,106,0.35)] sm:h-24"
              >
              <div class="h-px w-24 bg-gradient-to-l from-transparent via-primary/70 to-transparent" />
              <p class="text-center text-xs font-medium tracking-wide text-toned sm:text-sm">
                {{ visualLabel }}
              </p>
            </div>

            <div class="absolute inset-x-6 bottom-5 h-1.5 overflow-hidden rounded-full bg-white/5">
              <div class="public-page-hero__bar h-full w-2/3 rounded-full bg-primary/80" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.public-page-hero__grid {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse at center, black 20%, transparent 75%);
}

.public-page-hero__orb {
  animation: hero-orb 10s ease-in-out infinite alternate;
}

.public-page-hero__orb--delay {
  animation-delay: -4s;
  animation-duration: 14s;
}

.public-page-hero__bar {
  animation: hero-bar 3.2s ease-in-out infinite alternate;
}

@keyframes hero-orb {
  from {
    transform: translate3d(0, 0, 0) scale(1);
  }
  to {
    transform: translate3d(24px, -18px, 0) scale(1.08);
  }
}

@keyframes hero-bar {
  from {
    width: 42%;
    opacity: 0.65;
  }
  to {
    width: 78%;
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .public-page-hero__orb,
  .public-page-hero__bar {
    animation: none;
  }

  .public-page-hero__copy,
  .public-page-hero__visual {
    transition: none !important;
    transform: none !important;
    opacity: 1 !important;
  }
}
</style>
