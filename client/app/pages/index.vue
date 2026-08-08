<script setup lang="ts">
import { bannersController } from "~/features/banners/controllers/index.controller";
import { storiesController } from "~/features/stories/controllers/index.controller";
import { categoriesController } from "~/features/categories/controllers/index.controller";
import { BannersDS } from "~/features/banners/data/index.store";
import { StoriesDS } from "~/features/stories/data/index.store";
import { CategoriesDS } from "~/features/categories/data/index.store";
import type { TBanner } from "~/features/banners/types/index.type";
import type { TStory } from "~/features/stories/types/index.type";

const bannersDS = BannersDS.getInstance();
const storiesDS = StoriesDS.getInstance();
const categoriesDS = CategoriesDS.getInstance();
const toast = useToast();

const banners = computed(() => bannersDS.getBanners);
const stories = computed(() => storiesDS.getStories);
const categories = computed(() => categoriesDS.getCategories);

const isStoryViewerOpen = ref(false);
const selectedStoryIndex = ref(0);

async function fetchBanners(): Promise<void> {
  const response = await bannersController.getBanners();

  if (!response.success) {
    toast.add({
      title: response.message || "دریافت بنرهای صفحه اصلی ناموفق بود",
      color: "error",
    });
  }
}

async function fetchStories(): Promise<void> {
  const response = await storiesController.getStories();

  if (!response.success) {
    toast.add({
      title: response.message || "دریافت استوری‌ها ناموفق بود",
      color: "error",
    });
  }
}

async function fetchCategories(): Promise<void> {
  const response = await categoriesController.getCategories();

  if (!response.success) {
    toast.add({
      title: response.message || "دریافت دسته‌بندی‌ها ناموفق بود",
      color: "error",
    });
  }
}

function handleStoryView(story: TStory, index: number): void {
  console.log("handleStoryView called:", { index, storyId: story.id });
  selectedStoryIndex.value = index;
  isStoryViewerOpen.value = true;
  console.log("State updated:", {
    selectedStoryIndex: selectedStoryIndex.value,
    isStoryViewerOpen: isStoryViewerOpen.value,
  });
}

onMounted(async () => {
  await Promise.all([fetchBanners(), fetchStories(), fetchCategories()]);
});
</script>

<template>
  <div class="space-y-10 pb-10">
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

    <div class="flex flex-col py-10 bg-[#151515]">
      <UContainer>
        <BaseDivider
          title="محصولات پرفروش"
          subtitle="پرفروش ترین محصولات در فروشگاه پرایم"
        />
        <PublicBestSellers class="mt-10" />
      </UContainer>
    </div>

    <PublicStoryViewer
      :is-open="isStoryViewerOpen"
      :stories="stories"
      :initial-index="selectedStoryIndex"
      @update:is-open="(value) => (isStoryViewerOpen = value)"
    />
  </div>
</template>
