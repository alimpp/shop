<script setup lang="ts">
import type { TBlog } from "../types/index.type";

const props = defineProps<{
  blogs: TBlog[];
  loading: boolean;
  submitting: boolean;
}>();

const emit = defineEmits<{
  (event: "edit", blog: TBlog): void;
  (event: "remove", blog: TBlog): void;
}>();

const currentPage = ref(1);
const itemsPerPage = 5;

const totalItems = computed(() => props.blogs.length);

const paginatedBlogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return props.blogs.slice(start, start + itemsPerPage);
});

watch(totalItems, (value) => {
  const pageCount = Math.max(1, Math.ceil(value / itemsPerPage));
  if (currentPage.value > pageCount) {
    currentPage.value = pageCount;
  }
});

function getStatusColor(status: TBlog["status"]): "warning" | "success" | "neutral" {
  if (status === "published") {
    return "success";
  }

  if (status === "archived") {
    return "neutral";
  }

  return "warning";
}

function getStatusLabel(status: TBlog["status"]): string {
  if (status === "published") {
    return "منتشر شده";
  }

  if (status === "archived") {
    return "آرشیو";
  }

  return "پیش‌نویس";
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("fa-IR").format(value);
}
</script>

<template>
  <UCard>
    <div class="mb-4 border-b border-default pb-4">
      <BasePageHeader title="لیست بلاگ‌ها" />
    </div>

    <BaseResponsiveDataView
      :loading="loading"
      :has-items="blogs.length > 0"
      empty-message="هنوز هیچ بلاگی ثبت نشده است."
      desktop-table-min-width="min-w-[1080px]"
    >
      <template #mobile-skeleton>
        <BaseCardSkeletonList>
          <template #item>
            <div class="h-44 rounded-xl bg-default/40" />
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
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">وضعیت</th>
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">بخش‌ها</th>
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">محصولات مرتبط</th>
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">بازدید</th>
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">عملیات</th>
          </template>

          <template #row>
            <td class="border-b border-default px-4 py-4">
              <div class="h-14 w-20 rounded-xl bg-default/40" />
            </td>
            <td class="border-b border-default px-4 py-4">
              <div class="h-6 w-40 rounded bg-default/40" />
            </td>
            <td class="border-b border-default px-4 py-4">
              <div class="h-6 w-24 rounded bg-default/40" />
            </td>
            <td class="border-b border-default px-4 py-4">
              <div class="h-6 w-16 rounded bg-default/40" />
            </td>
            <td class="border-b border-default px-4 py-4">
              <div class="h-6 w-24 rounded bg-default/40" />
            </td>
            <td class="border-b border-default px-4 py-4">
              <div class="h-6 w-16 rounded bg-default/40" />
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
            v-for="blog in paginatedBlogs"
            :key="blog.id"
            class="rounded-xl border border-default bg-default/20 p-4"
          >
            <div class="overflow-hidden rounded-xl border border-default bg-default/30">
              <img
                :src="blog.coverImage"
                :alt="blog.title"
                class="h-44 w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div class="mt-4 flex flex-col gap-2">
              <p class="font-semibold text-highlighted">{{ blog.title }}</p>
              <div class="flex flex-wrap items-center gap-2">
                <UBadge :color="blog.isActive ? 'success' : 'neutral'" variant="soft">
                  {{ blog.isActive ? 'فعال' : 'غیرفعال' }}
                </UBadge>
                <UBadge :color="getStatusColor(blog.status)" variant="soft">
                  {{ getStatusLabel(blog.status) }}
                </UBadge>
                <UBadge v-if="blog.isFeatured" color="warning" variant="soft">
                  ویژه
                </UBadge>
              </div>
              <p class="text-xs text-muted">
                {{ blog.sections.length }} بخش · {{ blog.products.length }} محصول مرتبط ·
                {{ formatNumber(blog.viewCount) }} بازدید
              </p>
            </div>

            <div class="mt-4 flex flex-wrap items-center gap-2">
              <UButton
                color="primary"
                variant="soft"
                size="sm"
                icon="i-lucide-pencil"
                @click="emit('edit', blog)"
              >
                ویرایش
              </UButton>
              <UButton
                color="error"
                variant="soft"
                size="sm"
                icon="i-lucide-trash-2"
                :loading="submitting"
                @click="emit('remove', blog)"
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
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">وضعیت</th>
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">بخش‌ها</th>
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">محصولات مرتبط</th>
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">بازدید</th>
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">عملیات</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="blog in paginatedBlogs"
              :key="blog.id"
              class="transition-colors hover:bg-elevated/40"
            >
              <td class="border-b border-default px-4 py-4">
                <div class="h-14 w-20 overflow-hidden rounded-xl border border-default bg-default/30">
                  <img
                    :src="blog.coverImage"
                    :alt="blog.title"
                    class="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </td>
              <td class="border-b border-default px-4 py-4">
                <p class="max-w-[240px] truncate font-medium text-highlighted">{{ blog.title }}</p>
                <p class="text-xs text-muted" dir="ltr">{{ blog.slug }}</p>
              </td>
              <td class="border-b border-default px-4 py-4">
                <div class="flex flex-wrap items-center gap-1.5">
                  <UBadge :color="blog.isActive ? 'success' : 'neutral'" variant="soft">
                    {{ blog.isActive ? 'فعال' : 'غیرفعال' }}
                  </UBadge>
                  <UBadge :color="getStatusColor(blog.status)" variant="soft">
                    {{ getStatusLabel(blog.status) }}
                  </UBadge>
                  <UBadge v-if="blog.isFeatured" color="warning" variant="soft">
                    ویژه
                  </UBadge>
                </div>
              </td>
              <td class="border-b border-default px-4 py-4 text-toned">
                {{ blog.sections.length }}
              </td>
              <td class="border-b border-default px-4 py-4 text-toned">
                <p class="max-w-[220px] truncate">
                  {{ blog.products.map((product) => product.name).join('، ') || '—' }}
                </p>
              </td>
              <td class="border-b border-default px-4 py-4">
                <UBadge color="primary" variant="soft">{{ formatNumber(blog.viewCount) }} بازدید</UBadge>
              </td>
              <td class="border-b border-default px-4 py-4">
                <div class="flex items-center justify-start gap-2">
                  <UButton
                    color="primary"
                    variant="soft"
                    size="sm"
                    icon="i-lucide-pencil"
                    @click="emit('edit', blog)"
                  >
                    ویرایش
                  </UButton>
                  <UButton
                    color="error"
                    variant="soft"
                    size="sm"
                    icon="i-lucide-trash-2"
                    :loading="submitting"
                    @click="emit('remove', blog)"
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
      label="بلاگ"
    />
  </UCard>
</template>
