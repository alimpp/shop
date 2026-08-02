<script setup lang="ts">
import type { TBanner } from "~/features/banners/types/index.type";

const props = withDefaults(
  defineProps<{
    banners: TBanner[];
    autoplayMs?: number;
  }>(),
  {
    autoplayMs: 5000
  }
);

const currentIndex = ref(0);
const slideDirection = ref<"next" | "prev">("next");
let autoplayTimer: ReturnType<typeof setInterval> | null = null;

const activeBanners = computed(() =>
  props.banners.filter((banner) => banner.isActive && banner.imageUrl)
);

const currentBanner = computed(() => activeBanners.value[currentIndex.value] ?? null);
const hasMultipleSlides = computed(() => activeBanners.value.length > 1);

function clampCurrentIndex(): void {
  if (!activeBanners.value.length) {
    currentIndex.value = 0;
    return;
  }

  if (currentIndex.value > activeBanners.value.length - 1) {
    currentIndex.value = 0;
  }
}

function stopAutoplay(): void {
  if (!autoplayTimer) {
    return;
  }

  clearInterval(autoplayTimer);
  autoplayTimer = null;
}

function startAutoplay(): void {
  stopAutoplay();

  if (!hasMultipleSlides.value) {
    return;
  }

  autoplayTimer = setInterval(() => {
    goToNext();
  }, props.autoplayMs);
}

function goToSlide(index: number): void {
  if (!activeBanners.value.length || index === currentIndex.value) {
    return;
  }

  slideDirection.value = index > currentIndex.value ? "next" : "prev";
  currentIndex.value = index;
  startAutoplay();
}

function goToNext(): void {
  if (!activeBanners.value.length) {
    return;
  }

  slideDirection.value = "next";
  currentIndex.value = (currentIndex.value + 1) % activeBanners.value.length;
}

function goToPrevious(): void {
  if (!activeBanners.value.length) {
    return;
  }

  slideDirection.value = "prev";
  currentIndex.value =
    (currentIndex.value - 1 + activeBanners.value.length) % activeBanners.value.length;
  startAutoplay();
}

function handleObserve(): void {
  if (!currentBanner.value?.link) {
    return;
  }

  navigateTo(currentBanner.value.link, {
    external: /^https?:\/\//.test(currentBanner.value.link)
  });
}

watch(
  activeBanners,
  () => {
    clampCurrentIndex();
    startAutoplay();
  },
  { immediate: true }
);

onMounted(() => {
  startAutoplay();
});

onBeforeUnmount(() => {
  stopAutoplay();
});
</script>

<template>
  <section
    v-if="currentBanner"
    id="home"
    class="w-full"
    dir="rtl"
  >
    <div class="overflow-hidden bg-black text-white">
      <div class="relative isolate min-h-[340px] overflow-hidden sm:min-h-[420px] lg:min-h-[560px]">
        <Transition :name="`slide-${slideDirection}`">
          <img
            :key="currentBanner.id"
            :src="currentBanner.imageUrl"
            :alt="currentBanner.title"
            class="absolute inset-0 h-full w-full object-cover"
          >
        </Transition>

        <div class="pointer-events-none absolute inset-0 bg-black/35" />
        <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/15" />

        <div class="pointer-events-none absolute inset-0 bg-white/5 backdrop-blur-[2px]" />

        <div class="absolute inset-0 flex items-center">
          <div class="w-full px-5 sm:px-8 lg:px-16 xl:px-24">
            <Transition :name="`content-${slideDirection}`" mode="out-in">
              <div :key="currentBanner.id" class="ml-auto max-w-xl text-right">
                <div class="rounded-[2rem] border border-white/10 bg-black/28 p-5 shadow-2xl ring-1 ring-white/10 backdrop-blur-md sm:p-7 lg:p-8">
                  <p
                    v-if="currentBanner.subtitle"
                    class="mb-3 text-[14px] font-normal text-white/75 sm:text-[16px]"
                  >
                    {{ currentBanner.subtitle }}
                  </p>

                  <h1 class="text-[20px] font-bold leading-tight text-white sm:text-[24px] lg:text-[24px]">
                    {{ currentBanner.title }}
                  </h1>

                  <p
                    v-if="currentBanner.description"
                    class="mt-4 text-[12px] leading-7 text-white/85"
                  >
                    {{ currentBanner.description }}
                  </p>

                  <div class="mt-6">
                    <UButton
                      color="neutral"
                      class="bg-white text-black hover:bg-white/90"
                      @click="handleObserve"
                    >
                      مشاهده
                    </UButton>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>

        <div
          v-if="hasMultipleSlides"
          class="absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-between px-3 sm:px-5"
        >
          <UButton
            color="neutral"
            variant="soft"
            square
            class="pointer-events-auto rounded-full bg-black/35 text-white ring-1 ring-white/15 backdrop-blur"
            aria-label="اسلاید قبلی"
            @click="goToPrevious"
          >
            <UIcon name="i-lucide-chevron-right" class="size-5" />
          </UButton>

          <UButton
            color="neutral"
            variant="soft"
            square
            class="pointer-events-auto rounded-full bg-black/35 text-white ring-1 ring-white/15 backdrop-blur"
            aria-label="اسلاید بعدی"
            @click="goToNext"
          >
            <UIcon name="i-lucide-chevron-left" class="size-5" />
          </UButton>
        </div>

        <div
          v-if="hasMultipleSlides"
          class="absolute inset-x-0 bottom-5 flex items-center justify-center gap-2 px-4 sm:bottom-7"
        >
          <button
            v-for="(banner, index) in activeBanners"
            :key="banner.id"
            type="button"
            class="h-2.5 rounded-full transition-all"
            :class="
              index === currentIndex
                ? 'w-8 bg-white'
                : 'w-2.5 bg-white/35 hover:bg-white/60'
            "
            :aria-label="`رفتن به اسلاید ${index + 1}`"
            @click="goToSlide(index)"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* --- تصویر پس‌زمینه: اسلاید کامل با هم‌پوشانی --- */
.slide-next-enter-active,
.slide-next-leave-active,
.slide-prev-enter-active,
.slide-prev-leave-active {
  transition:
    transform 0.7s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

/* بعدی: اسلاید جدید از راست وارد می‌شود، قدیمی به چپ خارج می‌شود */
.slide-next-enter-from {
  transform: translateX(100%) scale(1.02);
  opacity: 0.7;
}
.slide-next-leave-to {
  transform: translateX(-100%) scale(1.02);
  opacity: 0.7;
}

/* قبلی: اسلاید جدید از چپ وارد می‌شود، قدیمی به راست خارج می‌شود */
.slide-prev-enter-from {
  transform: translateX(-100%) scale(1.02);
  opacity: 0.7;
}
.slide-prev-leave-to {
  transform: translateX(100%) scale(1.02);
  opacity: 0.7;
}

/* --- محتوای متنی: فید + جابه‌جایی ملایم --- */
.content-next-enter-active,
.content-next-leave-active,
.content-prev-enter-active,
.content-prev-leave-active {
  transition:
    transform 0.4s ease,
    opacity 0.4s ease;
}

.content-next-enter-from {
  transform: translateX(16px);
  opacity: 0;
}
.content-next-leave-to {
  transform: translateX(-16px);
  opacity: 0;
}

.content-prev-enter-from {
  transform: translateX(-16px);
  opacity: 0;
}
.content-prev-leave-to {
  transform: translateX(16px);
  opacity: 0;
}
</style>