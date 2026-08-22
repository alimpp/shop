<script setup lang="ts">
import { bannersController } from "~/features/banners/controllers/index.controller";
import { storiesController } from "~/features/stories/controllers/index.controller";
import { categoriesController } from "~/features/categories/controllers/index.controller";
import { productsController } from "~/features/products/controllers/index.controller";
import { BannersDS } from "~/features/banners/data/index.store";
import { StoriesDS } from "~/features/stories/data/index.store";
import { CategoriesDS } from "~/features/categories/data/index.store";
import { ProductsDS } from "~/features/products/data/index.store";
import type { TStory } from "~/features/stories/types/index.type";
import type { TBanner } from "~/features/banners/types/index.type";
import type { TCategory } from "~/features/categories/types/index.type";
import type { TProduct } from "~/features/products/types/index.type";
import { SITE_NAME, toAbsoluteUrl } from "~/utils/seo";

const PublicStoryViewer = defineAsyncComponent(
  () => import("~/components/public/PublicStoryViewer.vue")
);

const bannersDS = BannersDS.getInstance();
const storiesDS = StoriesDS.getInstance();
const categoriesDS = CategoriesDS.getInstance();
const productsDS = ProductsDS.getInstance();
const toast = useToast();
const requestURL = useRequestURL();

type HomePagePayload = {
  ok: boolean;
  message?: string;
  banners: TBanner[];
  stories: TStory[];
  categories: TCategory[];
  products: TProduct[];
};

function hydrateHomeStores(payload: HomePagePayload): void {
  if (!payload.ok) return;

  bannersDS.setBanners(payload.banners);
  storiesDS.setStories(payload.stories);
  categoriesDS.setCategories(payload.categories);
  productsDS.setProducts(payload.products);
}

const banners = computed(() => bannersDS.getBanners);
const stories = computed(() => storiesDS.getStories);
const categories = computed(() => categoriesDS.getCategories);

const { pending: homePending, data: homeData } = await useAsyncData<HomePagePayload>(
  "home-page-data",
  async () => {
    const [bannersRes, storiesRes, categoriesRes, productsRes] = await Promise.all([
      bannersController.getBanners(),
      storiesController.getStories(),
      categoriesController.getCategories(),
      productsController.getProducts({
        status: "published",
        isActive: true,
        limit: 100,
      }),
    ]);

    const failed = [bannersRes, storiesRes, categoriesRes, productsRes].find(
      (response) => !response.success,
    );

    if (failed) {
      if (import.meta.client) {
        toast.add({
          title: failed.message || "دریافت اطلاعات صفحه اصلی ناموفق بود",
          color: "error",
        });
      }

      return {
        ok: false,
        message: failed.message,
        banners: [],
        stories: [],
        categories: [],
        products: [],
      };
    }

    const payload: HomePagePayload = {
      ok: true,
      banners: bannersRes.data ?? [],
      stories: storiesRes.data ?? [],
      categories: categoriesRes.data?.items ?? [],
      products: productsRes.data?.items ?? [],
    };

    hydrateHomeStores(payload);

    return payload;
  },
  { server: true },
);

hydrateStoreFromPayload(homeData, hydrateHomeStores);

useSeoMeta({
  title: "خرید لپ‌تاپ، موبایل و لوازم دیجیتال",
  description:
    `${SITE_NAME}؛ مرجع خرید آنلاین لپ‌تاپ، گوشی موبایل، مانیتور و لوازم جانبی دیجیتال با ضمانت اصالت کالا، قیمت رقابتی و ارسال سریع به سراسر ایران.`,
  ogTitle: `${SITE_NAME} - خرید لپ‌تاپ، موبایل و لوازم دیجیتال`,
  ogDescription:
    "خرید آنلاین لپ‌تاپ، موبایل، مانیتور و لوازم دیجیتال با ضمانت اصالت کالا و ارسال سریع به سراسر ایران.",
  ogSiteName: SITE_NAME,
  ogType: "website",
  ogUrl: () => requestURL.href,
  twitterTitle: `${SITE_NAME} - خرید لپ‌تاپ، موبایل و لوازم دیجیتال`,
  twitterDescription:
    "خرید آنلاین لپ‌تاپ، موبایل، مانیتور و لوازم دیجیتال با ضمانت اصالت کالا و ارسال سریع به سراسر ایران.",
});

useHead({
  link: [
    {
      key: "canonical",
      rel: "canonical",
      href: () => requestURL.href,
    },
  ],
});

useSchemaOrg([
  defineOrganization({
    name: SITE_NAME,
    description:
      "فروشگاه آنلاین لپ‌تاپ، موبایل، مانیتور و لوازم جانبی دیجیتال",
    url: requestURL.origin,
    logo: toAbsoluteUrl("/favicon.ico", requestURL.origin),
  }),
  defineWebSite({
    name: SITE_NAME,
    url: requestURL.origin,
    description: "خرید آنلاین لپ‌تاپ، موبایل، مانیتور و لوازم دیجیتال",
  }),
]);

const isStoryViewerOpen = ref(false);
const selectedStoryIndex = ref(0);

function handleStoryView(_story: TStory, index: number): void {
  selectedStoryIndex.value = index;
  isStoryViewerOpen.value = true;
}
</script>

<template>
  <div class="space-y-10 pb-10">
    <div v-if="homePending && !stories.length && !banners.length" class="px-4 py-16">
      <div class="mx-auto flex max-w-7xl items-center justify-center gap-3 text-sm text-toned">
        <UIcon name="i-lucide-loader-2" class="size-5 animate-spin text-primary" />
        <span>در حال بارگذاری...</span>
      </div>
    </div>

    <template v-else>
      <div v-if="stories.length > 0">
        <PublicStoryCarousel :stories="stories" @view="handleStoryView" />
      </div>

      <PublicBannerCarousel :banners="banners" />

      <BaseDivider
        class="mt-20"
        title="دسته بندی ها"
        subtitle="تمام دسته بندی ها در فروشگاه پرایم"
      />

      <UContainer>
        <PublicCategoryGrid
          v-if="categories.length > 0"
          :categories="categories"
        />
      </UContainer>

      <div class="flex flex-col bg-[#151515] py-10">
        <UContainer>
          <BaseDivider
            title="محصولات پرفروش"
            subtitle="پرفروش ترین محصولات در فروشگاه پرایم"
          />
          <PublicBestSellers class="mt-10" />
        </UContainer>
      </div>

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
