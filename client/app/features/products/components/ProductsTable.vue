<script setup lang="ts">
import type { TProduct } from "../types/index.type";

const props = defineProps<{
  products: TProduct[];
  loading: boolean;
  submitting: boolean;
}>();

const emit = defineEmits<{
  view: [product: TProduct];
  edit: [product: TProduct];
  delete: [product: TProduct];
}>();

function getPrimaryMediaUrl(product: TProduct): string {
  const thumbnail = product.medias.find((media) => media.isThumbnail);
  return thumbnail?.url || product.medias[0]?.url || "";
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("fa-IR").format(value);
}

function getStatusColor(status: TProduct["status"]): "warning" | "success" | "neutral" {
  if (status === "published") {
    return "success";
  }

  if (status === "archived") {
    return "neutral";
  }

  return "warning";
}

function getStatusLabel(status: TProduct["status"]): string {
  if (status === "published") {
    return "منتشر شده";
  }

  if (status === "archived") {
    return "آرشیو";
  }

  return "پیش‌نویس";
}

function getVisibilityLabel(visibility: TProduct["visibility"]): string {
  return visibility === "hidden" ? "مخفی" : "عمومی";
}

const currentPage = ref(1);
const itemsPerPage = 5;

const totalItems = computed(() => props.products.length);

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return props.products.slice(start, start + itemsPerPage);
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
      <BasePageHeader title="لیست محصولات" />
    </div>

    <BaseResponsiveDataView
      :loading="loading"
      :has-items="products.length > 0"
      empty-message="هنوز هیچ محصولی ثبت نشده است."
      desktop-table-min-width="min-w-[900px]"
    >
      <template #mobile-skeleton>
        <BaseCardSkeletonList>
          <template #item>
            <div class="flex items-center gap-3">
              <div class="size-14 rounded-lg bg-default/40" />
              <div class="min-w-0 flex-1 space-y-2">
                <div class="h-4 w-2/3 rounded bg-default/40" />
                <div class="h-3 w-1/2 rounded bg-default/40" />
              </div>
            </div>
            <div class="mt-4 grid grid-cols-2 gap-3">
              <div class="h-3 rounded bg-default/40" />
              <div class="h-3 rounded bg-default/40" />
              <div class="h-3 rounded bg-default/40" />
              <div class="h-3 rounded bg-default/40" />
            </div>
            <div class="mt-4 h-9 w-full rounded-lg bg-default/40" />
          </template>
        </BaseCardSkeletonList>
      </template>

      <template #desktop-skeleton>
        <BaseTableSkeleton table-class="min-w-full border-separate border-spacing-0 text-right text-sm">
          <template #header>
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">محصول</th>
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">قیمت</th>
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">موجودی</th>
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">وضعیت</th>
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">عملیات</th>
          </template>

          <template #row>
            <td class="border-b border-default px-4 py-4">
              <div class="flex items-center gap-3">
                <div class="size-14 rounded-lg bg-default/40" />
                <div class="min-w-0 flex-1 space-y-2">
                  <div class="h-4 w-2/3 rounded bg-default/40" />
                  <div class="h-3 w-1/2 rounded bg-default/40" />
                </div>
              </div>
            </td>
            <td class="border-b border-default px-4 py-4">
              <div class="h-3 w-1/2 rounded bg-default/40" />
            </td>
            <td class="border-b border-default px-4 py-4">
              <div class="h-3 w-1/3 rounded bg-default/40" />
            </td>
            <td class="border-b border-default px-4 py-4">
              <div class="h-6 w-20 rounded bg-default/40" />
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
            v-for="product in paginatedProducts"
            :key="product.id"
            class="rounded-xl border border-default bg-default/20 p-4"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-default bg-default/40"
              >
                <img
                  v-if="getPrimaryMediaUrl(product)"
                  :src="getPrimaryMediaUrl(product)"
                  :alt="product.name"
                  class="h-full w-full object-contain p-1"
                >
                <UIcon v-else name="i-lucide-image" class="size-6 text-muted" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate font-semibold text-highlighted">
                  {{ product.name }}
                </p>
                <p class="mt-1 truncate text-xs text-muted" dir="ltr">
                  {{ product.sku }}
                </p>
                <div class="mt-2 flex flex-wrap items-center gap-2">
                  <UBadge :color="product.isActive ? 'success' : 'neutral'" variant="soft">
                    {{ product.isActive ? "فعال" : "غیرفعال" }}
                  </UBadge>
                  <UBadge :color="getStatusColor(product.status)" variant="soft">
                    {{ getStatusLabel(product.status) }}
                  </UBadge>
                  <UBadge v-if="product.isFeatured" color="warning" variant="soft">
                    ویژه
                  </UBadge>
                </div>
              </div>
            </div>

            <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div class="space-y-1">
                <p class="text-xs text-muted">دسته‌بندی</p>
                <p class="text-toned">{{ product.category?.name || "نامشخص" }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-xs text-muted">قیمت</p>
                <p class="font-medium text-highlighted">{{ formatCurrency(product.price) }} تومان</p>
                <p v-if="product.salePrice" class="text-xs text-success">
                  تخفیف: {{ formatCurrency(product.salePrice) }} تومان
                </p>
              </div>
              <div class="space-y-1">
                <p class="text-xs text-muted">موجودی</p>
                <p class="text-toned">{{ product.stock }}</p>
              </div>
            </div>

            <div class="mt-4 flex items-center justify-start gap-2">
              <UButton
                color="neutral"
                variant="soft"
                size="sm"
                icon="i-lucide-eye"
                @click="emit('view', product)"
              >
                مشاهده
              </UButton>
              <UButton
                color="primary"
                variant="soft"
                size="sm"
                icon="i-lucide-pencil"
                @click="emit('edit', product)"
              >
                ویرایش
              </UButton>
              <UButton
                color="error"
                variant="soft"
                size="sm"
                icon="i-lucide-trash-2"
                :loading="submitting"
                @click="emit('delete', product)"
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
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">محصول</th>
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">قیمت</th>
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">موجودی</th>
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">وضعیت</th>
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">عملیات</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="product in paginatedProducts"
              :key="product.id"
              class="transition-colors hover:bg-elevated/40"
            >
              <td class="border-b border-default px-4 py-4">
                <div class="flex min-w-[240px] items-center gap-3">
                  <div
                    class="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-default bg-default/40"
                  >
                    <img
                      v-if="getPrimaryMediaUrl(product)"
                      :src="getPrimaryMediaUrl(product)"
                      :alt="product.name"
                      class="h-full w-full object-contain p-1"
                    >
                    <UIcon v-else name="i-lucide-image" class="size-6 text-muted" />
                  </div>
                  <div class="min-w-0 space-y-1">
                    <p class="truncate font-medium text-highlighted">
                      {{ product.name }}
                    </p>
                    <p class="truncate text-xs text-muted" dir="ltr">
                      {{ product.sku }}
                    </p>
                    <p class="truncate text-xs text-toned">
                      {{ product.category?.name || "بدون دسته" }}
                      <span v-if="product.brand?.name"> · {{ product.brand.name }}</span>
                    </p>
                    <div class="flex flex-wrap items-center gap-2">
                      <UBadge :color="product.isActive ? 'success' : 'neutral'" variant="soft">
                        {{ product.isActive ? "فعال" : "غیرفعال" }}
                      </UBadge>
                      <UBadge v-if="product.isFeatured" color="warning" variant="soft">
                        ویژه
                      </UBadge>
                    </div>
                  </div>
                </div>
              </td>
              <td class="border-b border-default px-4 py-4 text-toned">
                <div class="space-y-1">
                  <p class="font-medium text-highlighted">
                    {{ formatCurrency(product.price) }} تومان
                  </p>
                  <p v-if="product.salePrice" class="text-xs text-success">
                    تخفیف: {{ formatCurrency(product.salePrice) }} تومان
                  </p>
                </div>
              </td>
              <td class="border-b border-default px-4 py-4 text-toned">
                {{ product.stock }}
              </td>
              <td class="border-b border-default px-4 py-4">
                <div class="flex flex-col items-start gap-2">
                  <UBadge :color="getStatusColor(product.status)">
                    {{ getStatusLabel(product.status) }}
                  </UBadge>
                  <UBadge color="neutral" variant="soft">
                    {{ getVisibilityLabel(product.visibility) }}
                  </UBadge>
                </div>
              </td>
              <td class="border-b border-default px-4 py-4">
                <div class="flex items-center justify-start gap-2">
                  <UButton
                    color="neutral"
                    variant="soft"
                    size="sm"
                    icon="i-lucide-eye"
                    @click="emit('view', product)"
                  >
                    مشاهده
                  </UButton>
                  <UButton
                    color="primary"
                    variant="soft"
                    size="sm"
                    icon="i-lucide-pencil"
                    @click="emit('edit', product)"
                  >
                    ویرایش
                  </UButton>
                  <UButton
                    color="error"
                    variant="soft"
                    size="sm"
                    icon="i-lucide-trash-2"
                    :loading="submitting"
                    @click="emit('delete', product)"
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
      label="محصول"
    />
  </UCard>
</template>
