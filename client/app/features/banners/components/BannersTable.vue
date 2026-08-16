<script setup lang="ts">
import type { TBanner } from "../types/index.type";

const props = defineProps<{
  banners: TBanner[];
  loading: boolean;
  submitting: boolean;
}>();

const emit = defineEmits<{
  edit: [banner: TBanner];
  delete: [banner: TBanner];
}>();

const currentPage = ref(1);
const itemsPerPage = 5;

const totalItems = computed(() => props.banners.length);

const paginatedBanners = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return props.banners.slice(start, start + itemsPerPage);
});

watch(totalItems, (value) => {
  const pageCount = Math.max(1, Math.ceil(value / itemsPerPage));
  if (currentPage.value > pageCount) {
    currentPage.value = pageCount;
  }
});
</script>

<template>
  <UCard>
    <div class="mb-4 border-b border-default pb-4">
      <BasePageHeader title="لیست بنرها" />
    </div>

    <BaseResponsiveDataView
      :loading="loading"
      :has-items="banners.length > 0"
      empty-message="هنوز هیچ بنری ثبت نشده است."
      desktop-table-min-width="min-w-[1120px]"
    >
      <template #mobile-skeleton>
        <BaseCardSkeletonList>
          <template #item>
            <div class="h-40 rounded-xl bg-default/40" />
            <div class="mt-4 space-y-2">
              <div class="h-4 w-2/3 rounded bg-default/40" />
              <div class="h-3 w-1/2 rounded bg-default/40" />
              <div class="h-3 w-full rounded bg-default/40" />
            </div>
            <div class="mt-4 h-9 w-full rounded-lg bg-default/40" />
          </template>
        </BaseCardSkeletonList>
      </template>

      <template #desktop-skeleton>
        <BaseTableSkeleton table-class="min-w-full border-separate border-spacing-0 text-right text-sm">
          <template #header>
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">تصویر</th>
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">عنوان</th>
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">لینک</th>
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">وضعیت</th>
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">توضیحات</th>
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">عملیات</th>
          </template>

          <template #row>
            <td class="border-b border-default px-4 py-4">
              <div class="h-20 w-36 rounded-xl bg-default/40" />
            </td>
            <td class="border-b border-default px-4 py-4">
              <div class="space-y-2">
                <div class="h-4 w-32 rounded bg-default/40" />
                <div class="h-3 w-24 rounded bg-default/40" />
              </div>
            </td>
            <td class="border-b border-default px-4 py-4">
              <div class="h-3 w-40 rounded bg-default/40" />
            </td>
            <td class="border-b border-default px-4 py-4">
              <div class="h-6 w-20 rounded bg-default/40" />
            </td>
            <td class="border-b border-default px-4 py-4">
              <div class="h-3 w-56 rounded bg-default/40" />
            </td>
            <td class="border-b border-default px-4 py-4">
              <div class="flex items-center gap-2">
                <div class="h-9 w-24 rounded-lg bg-default/40" />
                <div class="h-9 w-24 rounded-lg bg-default/40" />
              </div>
            </td>
          </template>
        </BaseTableSkeleton>
      </template>

      <template #mobile>
        <div class="space-y-3">
          <div
            v-for="banner in paginatedBanners"
            :key="banner.id"
            class="rounded-xl border border-default bg-default/20 p-4"
          >
            <div class="overflow-hidden rounded-xl border border-default bg-default/30">
              <img
                :src="banner.imageUrl"
                :alt="banner.title"
                class="h-44 w-full object-cover"
                loading="lazy"
                decoding="async"
              >
            </div>

            <div class="mt-4 flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="truncate font-semibold text-highlighted">
                  {{ banner.title }}
                </p>
                <p v-if="banner.subtitle" class="mt-1 truncate text-xs text-muted">
                  {{ banner.subtitle }}
                </p>
              </div>
              <UBadge :color="banner.isActive ? 'success' : 'neutral'" variant="soft">
                {{ banner.isActive ? "فعال" : "غیرفعال" }}
              </UBadge>
            </div>

            <p class="mt-3 line-clamp-2 text-sm text-toned">
              {{ banner.description || "ثبت نشده" }}
            </p>

            <p class="mt-2 truncate text-xs text-primary" dir="ltr">
              {{ banner.link || "ثبت نشده" }}
            </p>

            <div class="mt-4 flex items-center justify-start gap-2">
              <UButton
                color="primary"
                variant="soft"
                size="sm"
                icon="i-lucide-pencil"
                @click="emit('edit', banner)"
              >
                ویرایش
              </UButton>
              <UButton
                color="error"
                variant="soft"
                size="sm"
                icon="i-lucide-trash-2"
                :loading="submitting"
                @click="emit('delete', banner)"
              >
                حذف
              </UButton>
            </div>
          </div>
        </div>
      </template>

      <template #desktop>
        <table class="min-w-full border-separate border-spacing-0 text-right text-sm">
          <thead>
            <tr>
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">تصویر</th>
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">عنوان</th>
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">لینک</th>
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">وضعیت</th>
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">توضیحات</th>
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">عملیات</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="banner in paginatedBanners"
              :key="banner.id"
              class="transition-colors hover:bg-elevated/40"
            >
              <td class="border-b border-default px-4 py-4">
                <div class="h-20 w-36 overflow-hidden rounded-xl border border-default bg-default/30">
                  <img
                    :src="banner.imageUrl"
                    :alt="banner.title"
                    class="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  >
                </div>
              </td>
              <td class="border-b border-default px-4 py-4">
                <div class="max-w-[220px]">
                  <p class="truncate font-medium text-highlighted">
                    {{ banner.title }}
                  </p>
                  <p v-if="banner.subtitle" class="mt-1 truncate text-xs text-muted">
                    {{ banner.subtitle }}
                  </p>
                  <p v-else class="mt-1 text-xs text-muted">
                    ثبت نشده
                  </p>
                </div>
              </td>
              <td class="border-b border-default px-4 py-4 text-primary" dir="ltr">
                <a
                  v-if="banner.link"
                  :href="banner.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="block max-w-[260px] truncate hover:underline"
                >
                  {{ banner.link }}
                </a>
                <span v-else class="text-muted">
                  ثبت نشده
                </span>
              </td>
              <td class="border-b border-default px-4 py-4">
                <UBadge :color="banner.isActive ? 'success' : 'neutral'" variant="soft">
                  {{ banner.isActive ? "فعال" : "غیرفعال" }}
                </UBadge>
              </td>
              <td class="border-b border-default px-4 py-4 text-toned">
                <p class="max-w-[320px] truncate">
                  {{ banner.description || "ثبت نشده" }}
                </p>
              </td>
              <td class="border-b border-default px-4 py-4">
                <div class="flex items-center justify-start gap-2">
                  <UButton
                    color="primary"
                    variant="soft"
                    size="sm"
                    icon="i-lucide-pencil"
                    @click="emit('edit', banner)"
                  >
                    ویرایش
                  </UButton>
                  <UButton
                    color="error"
                    variant="soft"
                    size="sm"
                    icon="i-lucide-trash-2"
                    :loading="submitting"
                    @click="emit('delete', banner)"
                  >
                    حذف
                  </UButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </template>
    </BaseResponsiveDataView>

    <BasePaginationFooter
      v-model:page="currentPage"
      :items-per-page="itemsPerPage"
      :total="totalItems"
      label="بنر"
    />
  </UCard>
</template>
