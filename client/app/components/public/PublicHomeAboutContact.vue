<script setup lang="ts">
import { contactContent } from '~/content/contact.content'
import { SITE_NAME } from '~/utils/seo'

const root = ref<HTMLElement | null>(null)
const visible = ref(false)
let observer: IntersectionObserver | null = null

const contactPreview = contactContent.channels.items.filter(item =>
  ['phone', 'email'].includes(item.key)
)

const aboutHighlights = [
  { icon: 'i-lucide-badge-check', label: 'اصالت کالا' },
  { icon: 'i-lucide-wallet', label: 'قیمت شفاف' },
  { icon: 'i-lucide-headset', label: 'پشتیبانی واقعی' }
]

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
    { threshold: 0.16, rootMargin: '0px 0px -6% 0px' }
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
    class="relative overflow-hidden py-12 sm:py-16"
    dir="rtl"
  >
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(0,193,106,0.1),transparent_40%),radial-gradient(ellipse_at_90%_80%,rgba(255,255,255,0.03),transparent_35%)]"
      aria-hidden="true"
    />

    <div class="relative mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
      <BaseDivider
        title="با ما بیشتر آشنا شوید"
        subtitle="داستان فروشگاه و راه ارتباط مستقیم"
      />

      <div class="grid gap-5 lg:grid-cols-2 lg:gap-6">
        <!-- About -->
        <article
          class="group relative min-h-[320px] overflow-hidden rounded-[1.75rem] border border-primary/15 bg-[#101010] transition duration-700 ease-out sm:min-h-[360px]"
          :class="
            visible
              ? 'translate-y-0 opacity-100'
              : 'translate-y-8 opacity-0'
          "
        >
          <div
            class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(0,193,106,0.28),transparent_42%),linear-gradient(155deg,#141414_0%,#0c0c0c_55%,#0a1410_100%)]"
          />
          <div
            class="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:18px_18px]"
          />
          <div
            class="pointer-events-none absolute -left-16 top-8 size-48 rounded-full bg-primary/20 blur-3xl transition duration-700 group-hover:bg-primary/30"
          />
          <div
            class="pointer-events-none absolute -right-10 bottom-0 size-40 rounded-full bg-emerald-500/10 blur-3xl"
          />

          <div class="relative flex h-full min-h-[320px] flex-col justify-between gap-8 p-6 sm:min-h-[360px] sm:p-8">
            <div class="space-y-4">
              <p class="text-sm font-bold text-primary">
                درباره {{ SITE_NAME }}
              </p>
              <h3 class="max-w-sm text-2xl font-black leading-9 text-highlighted sm:text-[1.75rem] sm:leading-10">
                خرید دیجیتال، بدون سردرگمی
              </h3>
              <p class="max-w-md text-sm leading-8 text-[#b0b0b0] sm:text-[15px]">
                از انتخاب لپ‌تاپ و مانیتور تا لوازم جانبی؛ مشخصات واقعی، قیمت شفاف و پشتیبانی قبل و بعد از خرید را کنار هم گذاشته‌ایم.
              </p>
            </div>

            <div class="space-y-5">
              <ul class="flex flex-wrap gap-2">
                <li
                  v-for="item in aboutHighlights"
                  :key="item.label"
                  class="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-xs font-medium text-[#d4d4d4] backdrop-blur-sm"
                >
                  <UIcon
                    :name="item.icon"
                    class="size-3.5 text-primary"
                  />
                  {{ item.label }}
                </li>
              </ul>

              <UButton
                to="/about"
                color="primary"
                size="lg"
                trailing-icon="i-lucide-arrow-left"
                class="w-full justify-center sm:w-auto"
              >
                داستان ما را بخوانید
              </UButton>
            </div>
          </div>
        </article>

        <!-- Contact -->
        <article
          class="group relative min-h-[320px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#121212] transition duration-700 ease-out delay-100 sm:min-h-[360px]"
          :class="
            visible
              ? 'translate-y-0 opacity-100'
              : 'translate-y-8 opacity-0'
          "
        >
          <div
            class="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgba(0,193,106,0.08),transparent_40%),linear-gradient(200deg,#151515,#0f0f0f)]"
          />
          <div
            class="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-primary/35 to-transparent opacity-0 transition duration-500 group-hover:opacity-100 lg:opacity-100"
          />

          <div class="relative flex h-full min-h-[320px] flex-col justify-between gap-8 p-6 sm:min-h-[360px] sm:p-8">
            <div class="space-y-4">
              <p class="text-sm font-bold text-primary">
                ارتباط با ما
              </p>
              <h3 class="max-w-sm text-2xl font-black leading-9 text-highlighted sm:text-[1.75rem] sm:leading-10">
                همین حالا با پشتیبانی حرف بزنید
              </h3>
              <p class="max-w-md text-sm leading-8 text-[#b0b0b0] sm:text-[15px]">
                سوال دربارهٔ محصول، وضعیت سفارش یا مشاورهٔ خرید؛ تیم ما در ساعات اداری پاسخگوست.
              </p>
            </div>

            <div class="space-y-5">
              <ul class="space-y-3">
                <li
                  v-for="item in contactPreview"
                  :key="item.key"
                >
                  <a
                    :href="item.href"
                    class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3.5 py-3 transition hover:border-primary/30 hover:bg-primary/5"
                  >
                    <span class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <UIcon
                        :name="item.icon"
                        class="size-4"
                      />
                    </span>
                    <span class="min-w-0 text-start">
                      <span class="block text-xs text-[#7a7a7a]">
                        {{ item.label }}
                      </span>
                      <span class="mt-0.5 block truncate text-sm font-bold text-highlighted">
                        {{ item.value }}
                      </span>
                    </span>
                  </a>
                </li>
              </ul>

              <div class="flex flex-wrap gap-3">
                <UButton
                  to="/contact"
                  color="primary"
                  size="lg"
                  trailing-icon="i-lucide-arrow-left"
                  class="min-w-[9rem] justify-center"
                >
                  صفحه تماس
                </UButton>
                <UButton
                  to="/profile/support"
                  color="neutral"
                  variant="outline"
                  size="lg"
                  class="min-w-[9rem] justify-center"
                >
                  چت پشتیبانی
                </UButton>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
