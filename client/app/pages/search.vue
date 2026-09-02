<script setup lang="ts">
import PublicProductCard from '~/components/public/PublicProductCard.vue'
import PublicProductCardSkeleton from '~/components/public/PublicProductCardSkeleton.vue'
import { productsController } from '~/features/products/controllers/index.controller'
import type {
  TProduct,
  TProductSuggestItem
} from '~/features/products/types/index.type'
import {
  clearSearchHistory,
  pushSearchHistory,
  readSearchHistory,
  removeSearchHistoryItem
} from '~/utils/searchHistory'
import { DEFAULT_ROBOTS, SITE_NAME, resolveSiteOgImage } from '~/utils/seo'

definePageMeta({
  layout: 'default'
})

const route = useRoute()
const requestURL = useRequestURL()
const toast = useToast()

const SEARCH_DEBOUNCE_MS = 450
const SUGGEST_DEBOUNCE_MS = 220
const MIN_QUERY_LENGTH = 2

const inputRef = ref<{ $el?: HTMLElement } | null>(null)
const searchInput = ref(String(route.query.q ?? ''))
const debouncedQuery = ref(searchInput.value.trim())
const products = ref<TProduct[]>([])
const suggestions = ref<TProductSuggestItem[]>([])
const loading = ref(false)
const suggesting = ref(false)
const showSuggestions = ref(false)
const hasSearched = ref(false)
const history = ref<string[]>([])
let debounceTimer: ReturnType<typeof setTimeout> | null = null
let suggestTimer: ReturnType<typeof setTimeout> | null = null
let requestSeq = 0
let suggestSeq = 0

const seoTitle = computed(() =>
  debouncedQuery.value
    ? `جستجوی «${debouncedQuery.value}» | ${SITE_NAME}`
    : `جستجوی محصولات | ${SITE_NAME}`
)

const seoDescription = computed(() =>
  debouncedQuery.value
    ? `نتایج جستجوی «${debouncedQuery.value}» در ${SITE_NAME}.`
    : `جستجوی سریع لپ‌تاپ، مانیتور، موبایل و لوازم دیجیتال در ${SITE_NAME}.`
)

const cornerBusy = computed(() => loading.value || suggesting.value)

useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  ogImage: () => resolveSiteOgImage(requestURL.origin, 'search'),
  ogImageAlt: 'جستجوی محصولات فروشگاه دیجیتال',
  ogImageType: 'image/png',
  ogSiteName: SITE_NAME,
  ogType: 'website',
  ogUrl: () => requestURL.href,
  twitterCard: 'summary_large_image',
  twitterImage: () => resolveSiteOgImage(requestURL.origin, 'search'),
  robots: DEFAULT_ROBOTS
})

useHead({
  link: [{ key: 'canonical', rel: 'canonical', href: () => `${requestURL.origin}/search` }]
})

function formatPrice(value: number): string {
  return `${new Intl.NumberFormat('fa-IR').format(value)} تومان`
}

function syncQueryToUrl(query: string): void {
  const nextQuery = query ? { q: query } : {}
  navigateTo({ path: '/search', query: nextQuery }, { replace: true })
}

async function runSuggest(query: string): Promise<void> {
  const normalized = query.trim()
  const seq = ++suggestSeq

  if (normalized.length < MIN_QUERY_LENGTH) {
    suggestions.value = []
    suggesting.value = false
    return
  }

  suggesting.value = true
  const response = await productsController.suggest(normalized, 6)
  if (seq !== suggestSeq) return
  suggesting.value = false

  if (!response.success) {
    suggestions.value = []
    return
  }

  suggestions.value = response.data?.items ?? []
  showSuggestions.value = true
}

async function runSearch(query: string): Promise<void> {
  const normalized = query.trim()
  const seq = ++requestSeq

  if (normalized.length < MIN_QUERY_LENGTH) {
    products.value = []
    hasSearched.value = false
    loading.value = false
    syncQueryToUrl('')
    return
  }

  loading.value = true
  hasSearched.value = true
  showSuggestions.value = false
  syncQueryToUrl(normalized)

  const response = await productsController.getProducts({
    search: normalized,
    status: 'published',
    isActive: true,
    page: 1,
    limit: 24
  })

  if (seq !== requestSeq) return
  loading.value = false

  if (!response.success) {
    products.value = []
    toast.add({
      title: response.message || 'جستجو ناموفق بود',
      color: 'error'
    })
    return
  }

  products.value = response.data?.items ?? []
  history.value = pushSearchHistory(normalized)
}

function scheduleSearch(value: string): void {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (suggestTimer) clearTimeout(suggestTimer)

  suggestTimer = setTimeout(() => {
    void runSuggest(value)
  }, SUGGEST_DEBOUNCE_MS)

  debounceTimer = setTimeout(() => {
    debouncedQuery.value = value.trim()
    void runSearch(debouncedQuery.value)
  }, SEARCH_DEBOUNCE_MS)
}

function applyHistoryTerm(term: string): void {
  searchInput.value = term
  if (debounceTimer) clearTimeout(debounceTimer)
  if (suggestTimer) clearTimeout(suggestTimer)
  debouncedQuery.value = term.trim()
  void runSearch(term)
}

function applySuggestion(item: TProductSuggestItem): void {
  showSuggestions.value = false
  history.value = pushSearchHistory(item.name)
  navigateTo(`/products/${item.slug}`)
}

function removeHistoryTerm(term: string): void {
  history.value = removeSearchHistoryItem(term)
}

function clearHistory(): void {
  history.value = clearSearchHistory()
}

function onProductNavigate(term: string): void {
  if (term.trim()) {
    history.value = pushSearchHistory(term)
  }
}

function onInputBlur(): void {
  window.setTimeout(() => {
    showSuggestions.value = false
  }, 180)
}

watch(searchInput, (value) => {
  scheduleSearch(value)
})

onMounted(() => {
  history.value = readSearchHistory()

  nextTick(() => {
    const el = inputRef.value?.$el?.querySelector?.('input') as HTMLInputElement | null
    el?.focus()
  })

  if (searchInput.value.trim().length >= MIN_QUERY_LENGTH) {
    void runSearch(searchInput.value)
  }
})

onBeforeUnmount(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (suggestTimer) clearTimeout(suggestTimer)
})
</script>

<template>
  <div
    class="relative mx-auto min-h-[calc(100dvh-5rem)] w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
    dir="rtl"
  >
    <Transition name="search-corner">
      <div
        v-if="cornerBusy"
        class="pointer-events-none fixed bottom-5 left-5 z-50 sm:bottom-8 sm:left-8"
        aria-live="polite"
      >
        <div class="search-corner-chip flex items-center gap-2.5 rounded-full px-3.5 py-2.5 text-xs font-medium text-white shadow-lg shadow-primary/25">
          <span class="relative flex size-5 items-center justify-center">
            <span class="absolute inset-0 animate-ping rounded-full bg-white/30" />
            <span class="search-orbit size-4 rounded-full border-2 border-white/30 border-t-white" />
          </span>
          <span>{{ loading ? 'در حال جستجو...' : 'پیشنهادها...' }}</span>
        </div>
      </div>
    </Transition>

    <div class="space-y-6">
      <div class="space-y-3">
        <h1 class="text-2xl font-black text-highlighted sm:text-3xl">
          جستجو
        </h1>
        <p class="text-sm text-toned">
          نام محصول، برند یا مدل را بنویسید؛ پیشنهادها هم‌زمان ظاهر می‌شوند.
        </p>
      </div>

      <div class="relative">
        <UInput
          ref="inputRef"
          v-model="searchInput"
          size="xl"
          icon="i-lucide-search"
          :loading="loading"
          placeholder="مثلاً لپ‌تاپ لنوو، مانیتور سامسونگ..."
          class="w-full"
          autofocus
          @focus="showSuggestions = suggestions.length > 0"
          @blur="onInputBlur"
        />

        <div
          v-if="showSuggestions && suggestions.length"
          class="absolute inset-x-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-2xl border border-default bg-elevated shadow-xl"
        >
          <button
            v-for="item in suggestions"
            :key="item.id"
            type="button"
            class="flex w-full items-center gap-3 px-3 py-2.5 text-start transition-colors hover:bg-primary/8"
            @mousedown.prevent="applySuggestion(item)"
          >
            <div class="size-11 shrink-0 overflow-hidden rounded-xl bg-default">
              <img
                v-if="item.image"
                :src="item.image"
                :alt="item.name"
                class="size-full object-cover"
              >
              <div
                v-else
                class="flex size-full items-center justify-center text-muted"
              >
                <UIcon
                  name="i-lucide-image"
                  class="size-4"
                />
              </div>
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-highlighted">
                {{ item.name }}
              </p>
              <p class="mt-0.5 truncate text-xs text-toned">
                <span v-if="item.brandName">{{ item.brandName }} · </span>
                {{ formatPrice(item.salePrice ?? item.price) }}
              </p>
            </div>
            <UIcon
              name="i-lucide-corner-down-left"
              class="size-3.5 shrink-0 text-muted"
            />
          </button>
        </div>
      </div>

      <div
        v-if="history.length"
        class="space-y-3"
      >
        <div class="flex items-center justify-between gap-3">
          <p class="text-xs font-medium text-muted">
            جستجوهای اخیر
          </p>
          <button
            type="button"
            class="text-xs text-primary transition-colors hover:text-primary/70"
            @click="clearHistory"
          >
            پاک کردن تاریخچه
          </button>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            v-for="term in history"
            :key="term"
            type="button"
            class="group inline-flex max-w-full items-center gap-2 rounded-xl bg-elevated px-3 py-2 text-xs font-medium text-highlighted transition-colors hover:bg-primary/10 hover:text-primary"
            @click="applyHistoryTerm(term)"
          >
            <UIcon
              name="i-lucide-history"
              class="size-3.5 shrink-0 opacity-60"
            />
            <span class="min-w-0 truncate">{{ term }}</span>
            <span
              class="inline-flex size-5 items-center justify-center rounded-lg text-muted transition-colors hover:bg-default hover:text-error"
              role="button"
              tabindex="0"
              aria-label="حذف از تاریخچه"
              @click.stop="removeHistoryTerm(term)"
              @keydown.enter.stop="removeHistoryTerm(term)"
            >
              <UIcon
                name="i-lucide-x"
                class="size-3.5"
              />
            </span>
          </button>
        </div>
      </div>

      <div
        v-if="searchInput.trim().length > 0 && searchInput.trim().length < MIN_QUERY_LENGTH"
        class="rounded-2xl bg-elevated/50 px-4 py-3 text-sm text-toned"
      >
        حداقل {{ MIN_QUERY_LENGTH.toLocaleString('fa-IR') }} حرف وارد کنید.
      </div>

      <div
        v-else-if="loading && !products.length"
        class="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4"
      >
        <PublicProductCardSkeleton
          v-for="index in 8"
          :key="index"
        />
      </div>

      <div
        v-else-if="hasSearched && products.length === 0"
        class="flex flex-col items-center gap-3 py-16 text-center"
      >
        <UIcon
          name="i-lucide-search-x"
          class="size-12 text-dimmed"
        />
        <p class="text-sm font-medium text-highlighted">
          نتیجه‌ای برای «{{ debouncedQuery }}» پیدا نشد
        </p>
        <p class="text-xs text-toned">
          عبارت دیگری را امتحان کنید یا از دسته‌بندی‌ها وارد شوید.
        </p>
        <UButton
          to="/products"
          color="neutral"
          variant="soft"
        >
          مشاهده همه محصولات
        </UButton>
      </div>

      <div
        v-else-if="products.length"
        class="space-y-4"
      >
        <p class="text-sm text-toned">
          {{ products.length.toLocaleString('fa-IR') }} نتیجه نزدیک برای
          «{{ debouncedQuery }}»
        </p>
        <div class="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          <div
            v-for="product in products"
            :key="product.id"
            @click="onProductNavigate(debouncedQuery)"
          >
            <PublicProductCard :product="product" />
          </div>
        </div>
      </div>

      <div
        v-else
        class="flex flex-col items-center gap-3 py-16 text-center"
      >
        <UIcon
          name="i-lucide-search"
          class="size-12 text-dimmed"
        />
        <p class="text-sm text-toned">
          نام محصول، برند یا مدل را بنویسید تا نتایج نزدیک نمایش داده شود.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-corner-chip {
  background: linear-gradient(135deg, #00c16a 0%, #0a8f52 55%, #0e0e0e 140%);
  backdrop-filter: blur(8px);
}

.search-orbit {
  animation: search-spin 0.75s linear infinite;
}

@keyframes search-spin {
  to {
    transform: rotate(360deg);
  }
}

.search-corner-enter-active,
.search-corner-leave-active {
  transition: all 0.28s ease;
}

.search-corner-enter-from,
.search-corner-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.92);
}
</style>
