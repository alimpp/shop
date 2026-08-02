<script setup lang="ts">
import type { TBrand } from "../types/index.type";

const props = defineProps<{
  brands: TBrand[];
  loading: boolean;
  submitting: boolean;
}>();

const emit = defineEmits<{
  edit: [brand: TBrand];
  delete: [brand: TBrand];
}>();

const currentPage = ref(1);
const itemsPerPage = 5;

const totalItems = computed(() => props.brands.length);

const paginatedBrands = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return props.brands.slice(start, start + itemsPerPage);
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
      <BasePageHeader title="لیست برندها" />
    </div>

    <BaseResponsiveDataView
      :loading="loading"
      :has-items="brands.length > 0"
      empty-message="هنوز هیچ برندی ثبت نشده است."
      desktop-table-min-width="min-w-[860px]"
    >
      <template #mobile-skeleton>
        <BaseCardSkeletonList>
          <template #item>
            <div class="flex items-center gap-3">
              <div class="size-12 rounded-lg bg-default/40" />
              <div class="min-w-0 flex-1 space-y-2">
                <div class="h-4 w-2/3 rounded bg-default/40" />
                <div class="h-3 w-1/2 rounded bg-default/40" />
              </div>
            </div>
            <div class="mt-4 h-9 w-full rounded-lg bg-default/40" />
          </template>
        </BaseCardSkeletonList>
      </template>

      <template #desktop-skeleton>
        <BaseTableSkeleton table-class="min-w-full border-separate border-spacing-0 text-right text-sm">
          <template #header>
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">برند</th>
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">اسلاگ</th>
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">وضعیت</th>
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">توضیحات</th>
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">عملیات</th>
          </template>

          <template #row>
            <td class="border-b border-default px-4 py-4">
              <div class="flex items-center gap-3">
                <div class="size-12 rounded-lg bg-default/40" />
                <div class="h-4 w-2/3 rounded bg-default/40" />
              </div>
            </td>
            <td class="border-b border-default px-4 py-4">
              <div class="h-3 w-1/2 rounded bg-default/40" />
            </td>
            <td class="border-b border-default px-4 py-4">
              <div class="h-6 w-20 rounded bg-default/40" />
            </td>
            <td class="border-b border-default px-4 py-4">
              <div class="h-3 w-4/5 rounded bg-default/40" />
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
            v-for="brand in paginatedBrands"
            :key="brand.id"
            class="rounded-xl border border-default bg-default/20 p-4"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="flex min-w-0 items-center gap-3">
                <div class="flex size-12 items-center justify-center overflow-hidden rounded-lg border border-default bg-default/30">
                  <img
                    v-if="brand.logo"
                    :src="brand.logo"
                    :alt="brand.name"
                    class="h-full w-full object-contain p-1"
                  >
                  <UIcon v-else name="i-lucide-badge-percent" class="size-5 text-muted" />
                </div>
                <div class="min-w-0">
                  <p class="truncate font-semibold text-highlighted">
                    {{ brand.name }}
                  </p>
                  <p class="mt-1 truncate text-xs text-muted" dir="ltr">
                    {{ brand.slug }}
                  </p>
                </div>
              </div>
              <UBadge :color="brand.isActive ? 'success' : 'neutral'" variant="soft">
                {{ brand.isActive ? "فعال" : "غیرفعال" }}
              </UBadge>
            </div>

            <p class="mt-3 text-sm text-toned">
              {{ brand.description || "ثبت نشده" }}
            </p>

            <div class="mt-4 flex items-center justify-start gap-2">
              <UButton
                color="primary"
                variant="soft"
                size="sm"
                icon="i-lucide-pencil"
                @click="emit('edit', brand)"
              >
                ویرایش
              </UButton>
              <UButton
                color="error"
                variant="soft"
                size="sm"
                icon="i-lucide-trash-2"
                :loading="submitting"
                @click="emit('delete', brand)"
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
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">برند</th>
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">اسلاگ</th>
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">وضعیت</th>
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">توضیحات</th>
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">عملیات</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="brand in paginatedBrands"
              :key="brand.id"
              class="transition-colors hover:bg-elevated/40"
            >
              <td class="border-b border-default px-4 py-4">
                <div class="flex items-center gap-3">
                  <div class="flex size-12 items-center justify-center overflow-hidden rounded-lg border border-default bg-default/30">
                    <img
                      v-if="brand.logo"
                      :src="brand.logo"
                      :alt="brand.name"
                      class="h-full w-full object-contain p-1"
                    >
                    <UIcon v-else name="i-lucide-badge-percent" class="size-5 text-muted" />
                  </div>
                  <div class="min-w-0">
                    <p class="truncate font-medium text-highlighted">
                      {{ brand.name }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="border-b border-default px-4 py-4 text-toned" dir="ltr">
                {{ brand.slug }}
              </td>
              <td class="border-b border-default px-4 py-4">
                <UBadge :color="brand.isActive ? 'success' : 'neutral'" variant="soft">
                  {{ brand.isActive ? "فعال" : "غیرفعال" }}
                </UBadge>
              </td>
              <td class="border-b border-default px-4 py-4 text-toned">
                <p class="max-w-[360px] truncate">
                  {{ brand.description || "ثبت نشده" }}
                </p>
              </td>
              <td class="border-b border-default px-4 py-4">
                <div class="flex items-center justify-start gap-2">
                  <UButton
                    color="primary"
                    variant="soft"
                    size="sm"
                    icon="i-lucide-pencil"
                    @click="emit('edit', brand)"
                  >
                    ویرایش
                  </UButton>
                  <UButton
                    color="error"
                    variant="soft"
                    size="sm"
                    icon="i-lucide-trash-2"
                    :loading="submitting"
                    @click="emit('delete', brand)"
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
      label="برند"
    />
  </UCard>
</template>
