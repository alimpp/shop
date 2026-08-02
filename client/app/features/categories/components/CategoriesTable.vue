<script setup lang="ts">
import type { TCategory } from "../types/index.type";
import CategoryImagePreview from "./CategoryImagePreview.vue";

const props = defineProps<{
  categories: TCategory[];
  loading: boolean;
  submitting: boolean;
}>();

const emit = defineEmits<{
  edit: [category: TCategory];
  delete: [category: TCategory];
}>();

const currentPage = ref(1);
const itemsPerPage = 5;

const totalItems = computed(() => props.categories.length);

const paginatedCategories = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return props.categories.slice(start, start + itemsPerPage);
});

function getParentName(parentId?: string): string {
  if (!parentId) {
    return "بدون والد";
  }

  const parent = props.categories.find((category) => category.id === parentId);
  return parent?.name ?? "نامشخص";
}

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
      <BasePageHeader title="لیست دسته‌بندی‌ها" />
    </div>

    <BaseResponsiveDataView
      :loading="loading"
      :has-items="categories.length > 0"
      empty-message="هنوز هیچ دسته‌بندی ثبت نشده است."
      desktop-table-min-width="min-w-[980px]"
    >
      <template #mobile-skeleton>
        <BaseCardSkeletonList>
          <template #item>
            <div class="flex items-center justify-between gap-3">
              <div class="h-4 w-2/3 rounded bg-default/40" />
              <div class="h-6 w-20 rounded bg-default/40" />
            </div>
            <div class="mt-3 space-y-2">
              <div class="h-3 w-4/5 rounded bg-default/40" />
              <div class="h-3 w-2/3 rounded bg-default/40" />
            </div>
            <div class="mt-4 h-9 w-full rounded-lg bg-default/40" />
          </template>
        </BaseCardSkeletonList>
      </template>

      <template #desktop-skeleton>
        <BaseTableSkeleton table-class="min-w-full border-separate border-spacing-0 text-right text-sm">
          <template #header>
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">نام</th>
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">توضیحات</th>
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">والد</th>
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">وضعیت</th>
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">ترتیب</th>
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">تصویر</th>
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">عملیات</th>
          </template>

          <template #row>
            <td class="border-b border-default px-4 py-4">
              <div class="h-4 w-2/3 rounded bg-default/40" />
            </td>
            <td class="border-b border-default px-4 py-4">
              <div class="h-3 w-4/5 rounded bg-default/40" />
            </td>
            <td class="border-b border-default px-4 py-4">
              <div class="h-3 w-1/2 rounded bg-default/40" />
            </td>
            <td class="border-b border-default px-4 py-4">
              <div class="h-6 w-20 rounded bg-default/40" />
            </td>
            <td class="border-b border-default px-4 py-4">
              <div class="h-3 w-12 rounded bg-default/40" />
            </td>
            <td class="border-b border-default px-4 py-4">
              <div class="h-8 w-20 rounded bg-default/40" />
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
            v-for="category in paginatedCategories"
            :key="category.id"
            class="rounded-xl border border-default bg-default/20 p-4"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="truncate font-semibold text-highlighted">
                  {{ category.name }}
                </p>
                <p class="mt-1 text-xs text-muted">
                  والد: {{ getParentName(category.parentId) }}
                </p>
              </div>
              <UBadge :color="category.isActive ? 'success' : 'neutral'" variant="soft">
                {{ category.isActive ? "فعال" : "غیرفعال" }}
              </UBadge>
            </div>

            <p class="mt-3 text-sm text-toned">
              {{ category.description || "بدون توضیحات" }}
            </p>

            <div class="mt-3 flex items-center justify-between gap-3 text-sm">
              <p class="text-xs text-muted">
                ترتیب: <span class="text-toned">{{ category.sortOrder }}</span>
              </p>
              <div class="flex items-center gap-2">
                <CategoryImagePreview
                  v-if="category.image"
                  :url="category.image"
                />
                <span v-else class="text-xs text-muted">بدون تصویر</span>
              </div>
            </div>

            <div class="mt-4 flex items-center justify-start gap-2">
              <UButton
                color="primary"
                variant="soft"
                size="sm"
                icon="i-lucide-pencil"
                @click="emit('edit', category)"
              >
                ویرایش
              </UButton>
              <UButton
                color="error"
                variant="soft"
                size="sm"
                icon="i-lucide-trash-2"
                :loading="submitting"
                @click="emit('delete', category)"
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
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">
                نام
              </th>
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">
                توضیحات
              </th>
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">
                والد
              </th>
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">
                وضعیت
              </th>
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">
                ترتیب
              </th>
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">
                تصویر
              </th>
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="category in paginatedCategories"
              :key="category.id"
              class="transition-colors hover:bg-elevated/40"
            >
              <td class="border-b border-default px-4 py-4 font-medium text-highlighted">
                {{ category.name }}
              </td>
              <td class="border-b border-default px-4 py-4 text-toned">
                {{ category.description || "بدون توضیحات" }}
              </td>
              <td class="border-b border-default px-4 py-4 text-toned">
                {{ getParentName(category.parentId) }}
              </td>
              <td class="border-b border-default px-4 py-4">
                <UBadge :color="category.isActive ? 'success' : 'neutral'">
                  {{ category.isActive ? "فعال" : "غیرفعال" }}
                </UBadge>
              </td>
              <td class="border-b border-default px-4 py-4 text-toned">
                {{ category.sortOrder }}
              </td>
              <td class="border-b border-default px-4 py-4 text-toned">
                <CategoryImagePreview
                  v-if="category.image"
                  :url="category.image"
                />
                <span v-else>ندارد</span>
              </td>
              <td class="border-b border-default px-4 py-4">
                <div class="flex items-center justify-start gap-2">
                  <UButton
                    color="primary"
                    variant="soft"
                    size="sm"
                    icon="i-lucide-pencil"
                    @click="emit('edit', category)"
                  >
                    ویرایش
                  </UButton>
                  <UButton
                    color="error"
                    variant="soft"
                    size="sm"
                    icon="i-lucide-trash-2"
                    :loading="submitting"
                    @click="emit('delete', category)"
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
      label="دسته‌بندی"
    />
  </UCard>
</template>
