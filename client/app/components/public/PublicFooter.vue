<script setup lang="ts">
import { publicNavigation } from '~/config/public-navigation'
import { contactContent } from '~/content/contact.content'
import { SITE_NAME } from '~/utils/seo'

const year = new Date().getFullYear()

const shopLinks = [
  { label: 'همه محصولات', to: '/products' },
  { label: 'جستجو', to: '/search' },
  { label: 'بلاگ', to: '/blog' },
  { label: 'پروفایل', to: '/profile' }
]

const helpLinks = publicNavigation.filter(item =>
  ['/about', '/contact'].includes(item.to)
)

const contactItems = contactContent.channels.items.filter(item =>
  ['phone', 'email', 'address'].includes(item.key)
)

const perks = [
  {
    icon: 'i-lucide-shield-check',
    title: 'ضمانت اصالت',
    text: 'کالای اصل با بررسی قبل از ارسال'
  },
  {
    icon: 'i-lucide-truck',
    title: 'ارسال سریع',
    text: 'تحویل مطمئن به سراسر ایران'
  },
  {
    icon: 'i-lucide-headset',
    title: 'پشتیبانی واقعی',
    text: 'مشاوره قبل و بعد از خرید'
  }
]

const socials = [
  { label: 'اینستاگرام', icon: 'i-simple-icons-instagram', href: '#' },
  { label: 'تلگرام', icon: 'i-simple-icons-telegram', href: '#' }
]
</script>

<template>
  <footer
    class="relative mt-10 overflow-hidden border-t border-white/5 bg-[#0e0e0e]"
    dir="rtl"
  >
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(0,193,106,0.12),transparent_42%),radial-gradient(ellipse_at_90%_10%,rgba(255,255,255,0.04),transparent_35%)]"
    />
    <div
      class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-primary/40 to-transparent"
    />

    <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="grid gap-6 border-b border-white/5 py-8 sm:grid-cols-3 sm:gap-4 sm:py-10">
        <div
          v-for="perk in perks"
          :key="perk.title"
          class="flex items-start gap-3"
        >
          <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UIcon
              :name="perk.icon"
              class="size-5"
            />
          </div>
          <div class="space-y-1">
            <p class="text-sm font-bold text-highlighted">
              {{ perk.title }}
            </p>
            <p class="text-xs leading-6 text-[#8a8a8a]">
              {{ perk.text }}
            </p>
          </div>
        </div>
      </div>

      <div class="grid gap-10 py-12 sm:gap-12 lg:grid-cols-[1.35fr_0.8fr_0.8fr_1.1fr] lg:gap-8 lg:py-14">
        <div class="space-y-5">
          <NuxtLink
            to="/"
            class="inline-flex items-center"
          >
            <img
              src="/image/logo/logo.png"
              :alt="SITE_NAME"
              class="h-14 w-auto object-contain sm:h-16"
            >
          </NuxtLink>
          <p class="max-w-sm text-sm leading-7 text-[#9a9a9a]">
            {{ SITE_NAME }}؛ مرجع خرید لپ‌تاپ، موبایل، مانیتور و لوازم دیجیتال با قیمت شفاف و پشتیبانی واقعی.
          </p>
          <div class="flex items-center gap-2">
            <a
              v-for="social in socials"
              :key="social.label"
              :href="social.href"
              :aria-label="social.label"
              class="flex size-10 items-center justify-center rounded-full border border-white/10 text-[#b0b0b0] transition hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
            >
              <UIcon
                :name="social.icon"
                class="size-4"
              />
            </a>
          </div>
        </div>

        <div class="space-y-4">
          <h3 class="text-sm font-black tracking-wide text-highlighted">
            فروشگاه
          </h3>
          <ul class="space-y-2.5">
            <li
              v-for="link in shopLinks"
              :key="link.to"
            >
              <NuxtLink
                :to="link.to"
                class="text-sm text-[#9a9a9a] transition hover:text-primary"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div class="space-y-4">
          <h3 class="text-sm font-black tracking-wide text-highlighted">
            راهنما
          </h3>
          <ul class="space-y-2.5">
            <li
              v-for="link in helpLinks"
              :key="link.to"
            >
              <NuxtLink
                :to="link.to"
                class="text-sm text-[#9a9a9a] transition hover:text-primary"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/profile/support"
                class="text-sm text-[#9a9a9a] transition hover:text-primary"
              >
                پشتیبانی آنلاین
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div class="space-y-4">
          <h3 class="text-sm font-black tracking-wide text-highlighted">
            ارتباط با ما
          </h3>
          <ul class="space-y-3.5">
            <li
              v-for="item in contactItems"
              :key="item.key"
            >
              <a
                :href="item.href"
                class="group flex items-start gap-3"
                :target="item.key === 'address' ? '_blank' : undefined"
                :rel="item.key === 'address' ? 'noopener noreferrer' : undefined"
              >
                <span class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-primary transition group-hover:bg-primary/15">
                  <UIcon
                    :name="item.icon"
                    class="size-3.5"
                  />
                </span>
                <span class="min-w-0">
                  <span class="block text-xs text-[#6f6f6f]">
                    {{ item.label }}
                  </span>
                  <span class="mt-0.5 block text-sm leading-6 text-[#cfcfcf] transition group-hover:text-primary">
                    {{ item.value }}
                  </span>
                </span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div class="flex flex-col items-center justify-between gap-3 border-t border-white/5 py-6 text-center sm:flex-row sm:text-start">
        <p class="text-xs text-[#6f6f6f] sm:text-sm">
          © {{ year }} {{ SITE_NAME }}. تمامی حقوق محفوظ است.
        </p>
        <p class="text-xs text-[#5a5a5a]">
          خرید مطمئن دیجیتال، از انتخاب تا تحویل
        </p>
      </div>
    </div>
  </footer>
</template>
