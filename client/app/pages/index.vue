<script setup lang="ts">
import { bannersController } from "~/features/banners/controllers/index.controller";
import { BannersDS } from "~/features/banners/data/index.store";
import type { TBanner } from "~/features/banners/types/index.type";

const bannersDS = BannersDS.getInstance();
const toast = useToast();

const banners = computed<TBanner[]>(() => bannersDS.getBanners);

async function fetchBanners(): Promise<void> {
  const response = await bannersController.getBanners();

  if (!response.success) {
    toast.add({
      title: response.message || "دریافت بنرهای صفحه اصلی ناموفق بود",
      color: "error"
    });
  }
}

onMounted(async () => {
  await fetchBanners();
});
</script>

<template>
  <div class="space-y-10 pb-10">
    <PublicBannerCarousel :banners="banners" />

    <div class="px-4 sm:px-6 lg:px-8">
      Lorem ipsum dolor sit, amet consectetur adipisicing elit. Nihil cupiditate, totam,
      quasi dolorem ea perspiciatis suscipit labore temporibus molestiae, officia
      distinctio culpa voluptates voluptas. Possimus nam eos recusandae libero eum.
    </div>
  </div>
</template>
