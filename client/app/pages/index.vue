<script setup lang="ts">
import { bannersController } from "~/features/banners/controllers/index.controller";
import { storiesController } from "~/features/stories/controllers/index.controller";
import { BannersDS } from "~/features/banners/data/index.store";
import { StoriesDS } from "~/features/stories/data/index.store";
import type { TBanner } from "~/features/banners/types/index.type";
import type { TStory } from "~/features/stories/types/index.type";

const bannersDS = BannersDS.getInstance();
const storiesDS = StoriesDS.getInstance();
const toast = useToast();

const banners = computed(() => bannersDS.getBanners);
const stories = computed(() => storiesDS.getStories);

const isStoryViewerOpen = ref(false);
const selectedStoryIndex = ref(0);

async function fetchBanners(): Promise<void> {
  const response = await bannersController.getBanners();

  if (!response.success) {
    toast.add({
      title: response.message || "دریافت بنرهای صفحه اصلی ناموفق بود",
      color: "error"
    });
  }
}

async function fetchStories(): Promise<void> {
  const response = await storiesController.getStories();

  if (!response.success) {
    toast.add({
      title: response.message || "دریافت استوری‌ها ناموفق بود",
      color: "error"
    });
  }
}

function handleStoryView(story: TStory, index: number): void {
  console.log('handleStoryView called:', { index, storyId: story.id });
  selectedStoryIndex.value = index;
  isStoryViewerOpen.value = true;
  console.log('State updated:', { selectedStoryIndex: selectedStoryIndex.value, isStoryViewerOpen: isStoryViewerOpen.value });
}

onMounted(async () => {
  await Promise.all([fetchBanners(), fetchStories()]);
});
</script>

<template>
  <div class="space-y-10 pb-10">
    <!-- استوری‌ز کروز کل -->
    <div v-if="stories.length > 0">
      <PublicStoryCarousel :stories="stories" @view="handleStoryView" />
    </div>

    <!-- بنر کروز کل -->
    <PublicBannerCarousel :banners="banners" />

    <!-- استوری ویور مڈل -->
    <PublicStoryViewer
      :is-open="isStoryViewerOpen"
      :stories="stories"
      :initial-index="selectedStoryIndex"
      @update:is-open="(value) => isStoryViewerOpen = value"
    />

    <div class="px-4 sm:px-6 lg:px-8">
      Lorem ipsum dolor sit, amet consectetur adipisicing elit. Nihil cupiditate, totam,
      quasi dolorem ea perspiciatis suscipit labore temporibus molestiae, officia
      distinctio culpa voluptates voluptas. Possimus nam eos recusandae libero eum.
    </div>
  </div>
</template>
