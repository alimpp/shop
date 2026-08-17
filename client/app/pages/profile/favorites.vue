<script setup lang="ts">
import ProfileShell from '~/components/profile/ProfileShell.vue'
import { favoritesController } from '~/features/favorites/controllers/index.controller'
import { useFavoritesDS } from '~/features/favorites/data/index.store'

definePageMeta({ title: 'علاقه‌مندی‌ها', robots: 'noindex, nofollow' })

const toast = useToast()
const favoritesDS = useFavoritesDS()

const favorites = computed(() => favoritesDS.getItems)
const favoritesLoading = computed(() => favoritesDS.getLoading)
const submitting = computed(() => favoritesDS.getSubmitting)

function formatPrice(value: number | string | undefined | null): string {
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return '--'
  return `${new Intl.NumberFormat('fa-IR').format(numeric)} تومان`
}

async function loadFavorites(): Promise<void> {
  const response = await favoritesController.getFavorites(1, 100)

  if (!response.success) {
    toast.add({
      title: response.message,
      color: 'error'
    })
  }
}

async function removeFavorite(productId: string): Promise<void> {
  const response = await favoritesController.toggleFavorite(productId)

  toast.add({
    title: response.message || 'از علاقه مندی ها حذف شد',
    color: response.success ? 'success' : 'error'
  })
}

onMounted(() => {
  loadFavorites()
})
</script>

<template>
  <ProfileShell title="علاقه مندی ها">
    <UCard :ui="{ body: 'p-6 sm:p-8' }">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h2 class="text-xl font-black text-highlighted">
            علاقه مندی ها
          </h2>
          <p class="mt-1 text-sm text-toned">
            محصولاتی که دوست دارید.
          </p>
        </div>
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-refresh-cw"
          :loading="favoritesLoading"
          @click="loadFavorites"
        >
          تازه‌سازی
        </UButton>
      </div>

      <div
        v-if="favoritesLoading"
        class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <USkeleton
          v-for="index in 6"
          :key="index"
          class="h-64"
        />
      </div>

      <div
        v-else-if="favorites.length === 0"
        class="flex flex-col items-center gap-3 py-10 text-center"
      >
        <UIcon
          name="i-lucide-heart-off"
          class="size-10 text-toned"
        />
        <p class="text-sm text-toned">
          هنوز محصولی به علاقه مندی ها اضافه نکرده‌اید.
        </p>
      </div>

      <div
        v-else
        class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <UCard
          v-for="item in favorites"
          :key="item.id"
          class="overflow-hidden"
          :ui="{ body: 'p-0' }"
        >
          <NuxtImg
            v-if="item.mainImage"
            :src="item.mainImage"
            :alt="item.name"
            class="aspect-square w-full object-cover"
            loading="lazy"
          />
          <div
            v-else
            class="flex aspect-square items-center justify-center bg-gray-100 dark:bg-gray-800"
          >
            <UIcon
              name="i-lucide-image"
              class="size-8 text-gray-400"
            />
          </div>

          <div class="p-4">
            <h3 class="line-clamp-2 text-sm font-bold text-highlighted">
              {{ item.name }}
            </h3>
            <div class="mt-3 flex items-center justify-between">
              <span
                class="text-sm font-bold text-primary"
                dir="ltr"
              >
                {{ formatPrice(item.price) }}
              </span>
              <UButton
                color="error"
                variant="ghost"
                size="sm"
                icon="i-lucide-trash-2"
                :loading="submitting"
                @click="removeFavorite(item.id)"
              >
                حذف
              </UButton>
            </div>
          </div>
        </UCard>
      </div>
    </UCard>
  </ProfileShell>
</template>
