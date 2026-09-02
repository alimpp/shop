<script setup lang="ts">
import { bannersController } from '~/features/banners/controllers/index.controller'
import { storiesController } from '~/features/stories/controllers/index.controller'
import { categoriesController } from '~/features/categories/controllers/index.controller'
import { productsController } from '~/features/products/controllers/index.controller'
import { BannersDS } from '~/features/banners/data/index.store'
import { StoriesDS } from '~/features/stories/data/index.store'
import { CategoriesDS } from '~/features/categories/data/index.store'
import type { TStory } from '~/features/stories/types/index.type'
import type { TBanner } from '~/features/banners/types/index.type'
import type { TCategory } from '~/features/categories/types/index.type'
import type { TProduct, TProductBrandRef } from '~/features/products/types/index.type'
import { SITE_NAME, toAbsoluteUrl } from '~/utils/seo'

const PublicStoryViewer = defineAsyncComponent(
  () => import('~/components/public/PublicStoryViewer.vue')
)

const bannersDS = BannersDS.getInstance()
const storiesDS = StoriesDS.getInstance()
const categoriesDS = CategoriesDS.getInstance()
const toast = useToast()
const requestURL = useRequestURL()
const { getRecentProducts, getRecommendedProducts, syncLocalToServer } =
  useBehaviorTracker()
const token = useCookie<string | null>('token')

type HomePagePayload = {
  ok: boolean
  message?: string
  banners: TBanner[]
  stories: TStory[]
  categories: TCategory[]
  brands: TProductBrandRef[]
  bestsellers: TProduct[]
  discounted: TProduct[]
  recent: TProduct[]
  recommendations: TProduct[]
}

const brands = ref<TProductBrandRef[]>([])
const bestsellers = ref<TProduct[]>([])
const discounted = ref<TProduct[]>([])
const recentProducts = ref<TProduct[]>([])
const recommendations = ref<TProduct[]>([])

function hydrateHomePayload(payload: HomePagePayload): void {
  if (!payload.ok) return

  bannersDS.setBanners(payload.banners)
  storiesDS.setStories(payload.stories)
  categoriesDS.setCategories(payload.categories)
  brands.value = payload.brands
  bestsellers.value = payload.bestsellers
  discounted.value = payload.discounted
  recentProducts.value = payload.recent
  recommendations.value = payload.recommendations
}

const banners = computed(() => bannersDS.getBanners)
const stories = computed(() => storiesDS.getStories)
const categories = computed(() => categoriesDS.getCategories)

const { pending: homePending, data: homeData } = await useAsyncData<HomePagePayload>(
  'home-page-data-v2',
  async () => {
    const [
      bannersRes,
      storiesRes,
      categoriesRes,
      brandsRes,
      bestsellersRes,
      discountedRes
    ] = await Promise.all([
      bannersController.getBanners(),
      storiesController.getStories(),
      categoriesController.getCategories(),
      productsController.getBrands(),
      productsController.getBestsellers(12),
      productsController.getDiscounted(12)
    ])

    const required = [bannersRes, storiesRes, categoriesRes, brandsRes, bestsellersRes, discountedRes]
    const failed = required.find(response => !response.success)

    if (failed) {
      if (import.meta.client) {
        toast.add({
          title: failed.message || 'دریافت اطلاعات صفحه اصلی ناموفق بود',
          color: 'error'
        })
      }

      return {
        ok: false,
        message: failed.message,
        banners: [],
        stories: [],
        categories: [],
        brands: [],
        bestsellers: [],
        discounted: [],
        recent: [],
        recommendations: []
      }
    }

    const payload: HomePagePayload = {
      ok: true,
      banners: bannersRes.data ?? [],
      stories: storiesRes.data ?? [],
      categories: categoriesRes.data?.items ?? [],
      brands: (brandsRes.data ?? []).filter(brand => brand.isActive !== false),
      bestsellers: bestsellersRes.data ?? [],
      discounted: discountedRes.data ?? [],
      recent: [],
      recommendations: []
    }

    hydrateHomePayload(payload)
    return payload
  },
  { server: true }
)

hydrateStoreFromPayload(homeData, hydrateHomePayload)

useSeoMeta({
  title: 'خرید لپ‌تاپ، موبایل و لوازم دیجیتال',
  description:
    `${SITE_NAME}؛ مرجع خرید آنلاین لپ‌تاپ، گوشی موبایل، مانیتور و لوازم جانبی دیجیتال با ضمانت اصالت کالا، قیمت رقابتی و ارسال سریع به سراسر ایران.`,
  ogTitle: `${SITE_NAME} - خرید لپ‌تاپ، موبایل و لوازم دیجیتال`,
  ogDescription:
    'خرید آنلاین لپ‌تاپ، موبایل، مانیتور و لوازم دیجیتال با ضمانت اصالت کالا و ارسال سریع به سراسر ایران.',
  ogSiteName: SITE_NAME,
  ogType: 'website',
  ogUrl: () => requestURL.href,
  twitterTitle: `${SITE_NAME} - خرید لپ‌تاپ، موبایل و لوازم دیجیتال`,
  twitterDescription:
    'خرید آنلاین لپ‌تاپ، موبایل، مانیتور و لوازم دیجیتال با ضمانت اصالت کالا و ارسال سریع به سراسر ایران.'
})

useHead({
  link: [
    {
      key: 'canonical',
      rel: 'canonical',
      href: () => requestURL.href
    }
  ]
})

useSchemaOrg([
  defineOrganization({
    name: SITE_NAME,
    description:
      'فروشگاه آنلاین لپ‌تاپ، موبایل، مانیتور و لوازم جانبی دیجیتال',
    url: requestURL.origin,
    logo: toAbsoluteUrl('/favicon.ico', requestURL.origin)
  }),
  defineWebSite({
    name: SITE_NAME,
    url: requestURL.origin,
    description: 'خرید آنلاین لپ‌تاپ، موبایل، مانیتور و لوازم دیجیتال'
  })
])

const isStoryViewerOpen = ref(false)
const selectedStoryIndex = ref(0)

function handleStoryView(_story: TStory, index: number): void {
  selectedStoryIndex.value = index
  isStoryViewerOpen.value = true
}

async function loadPersonalizedSections(): Promise<void> {
  if (!homeData.value?.ok) return

  if (token.value) {
    await syncLocalToServer()
  }

  const [recent, recommended] = await Promise.all([
    getRecentProducts(12),
    getRecommendedProducts(12)
  ])
  recentProducts.value = recent
  recommendations.value = recommended
}

onMounted(() => {
  void loadPersonalizedSections()
})

watch(token, (next, prev) => {
  if (next && next !== prev) {
    void loadPersonalizedSections()
  }
})
</script>

<template>
  <div class="space-y-10 pb-14">
    <div
      v-if="homePending && !stories.length && !banners.length"
      class="px-4 py-16"
    >
      <div class="mx-auto flex max-w-7xl items-center justify-center gap-3 text-sm text-toned">
        <UIcon
          name="i-lucide-loader-2"
          class="size-5 animate-spin text-primary"
        />
        <span>در حال بارگذاری...</span>
      </div>
    </div>

    <template v-else>
      <div v-if="stories.length > 0">
        <PublicStoryCarousel
          :stories="stories"
          @view="handleStoryView"
        />
      </div>

      <PublicBannerCarousel :banners="banners" />

      <section class="space-y-6 pt-10">
        <BaseDivider
          title="دسته‌بندی‌ها"
          subtitle="مسیر سریع برای شروع خرید"
        />
        <PublicCategoryGrid
          v-if="categories.length > 0"
          :categories="categories"
        />
      </section>

      <section
        v-if="discounted.length"
        class="space-y-6 bg-[#151515] py-10"
      >
        <BaseDivider
          title="بیشترین تخفیف‌ها"
          subtitle="از بالاترین درصد تخفیف تا کمتر"
        />
        <div class="px-4 sm:px-6 lg:px-8">
          <PublicProductRail :products="discounted" />
        </div>
      </section>

      <section
        v-if="bestsellers.length"
        class="space-y-6 py-4"
      >
        <BaseDivider
          title="پرفروش‌ترین‌ها"
          subtitle="محصولاتی که بیشتر خریداری شده‌اند"
        />
        <div class="px-4 sm:px-6 lg:px-8">
          <PublicProductRail :products="bestsellers" />
        </div>
      </section>

      <section
        v-if="brands.length"
        class="space-y-6"
      >
        <BaseDivider
          title="برندها"
          subtitle="انتخاب از برندهای معتبر دیجیتال"
        />
        <PublicBrandRail :brands="brands" />
      </section>

      <section
        v-if="recentProducts.length"
        class="space-y-6 bg-[#151515] py-10"
      >
        <BaseDivider
          title="آخرین بازدیدهای شما"
          subtitle="محصولاتی که اخیراً دیده‌اید"
        />
        <div class="px-4 sm:px-6 lg:px-8">
          <PublicProductRail :products="recentProducts" />
        </div>
      </section>

      <section
        v-if="recommendations.length"
        class="space-y-6 py-4"
      >
        <BaseDivider
          title="پیشنهاد مخصوص شما"
          subtitle="بر اساس علاقه‌مندی و رفتار شما در فروشگاه"
        />
        <div class="px-4 sm:px-6 lg:px-8">
          <PublicProductRail :products="recommendations" />
        </div>
      </section>

      <PublicHomeAboutContact />

      <PublicStoryViewer
        v-if="isStoryViewerOpen"
        :is-open="isStoryViewerOpen"
        :stories="stories"
        :initial-index="selectedStoryIndex"
        @update:is-open="(value) => (isStoryViewerOpen = value)"
      />
    </template>
  </div>
</template>
