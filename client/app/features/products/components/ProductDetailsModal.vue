<script setup lang="ts">
import type { TProduct, TProductVariant } from "../types/index.type";

const props = defineProps<{
  open: boolean;
  product: TProduct | null;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
}>();

const modalOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit("update:open", value)
});

function isMissing(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim().length === 0;
  }

  return false;
}

const missingLabel = "ثبت نشده";

const mediaItems = computed(() => {
  const product = props.product;
  if (!product) {
    return [];
  }

  return [...product.medias].sort((a, b) => {
    const thumbnailDiff = Number(b.isThumbnail) - Number(a.isThumbnail);
    if (thumbnailDiff !== 0) {
      return thumbnailDiff;
    }

    return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
  });
});

const activeMediaIndex = ref(0);
const activeMedia = computed(() => mediaItems.value[activeMediaIndex.value]);

watch(mediaItems, () => {
  activeMediaIndex.value = 0;
});

function setActiveMedia(index: number): void {
  if (index < 0 || index >= mediaItems.value.length) {
    return;
  }
  activeMediaIndex.value = index;
}

function nextMedia(): void {
  const total = mediaItems.value.length;
  if (!total) {
    return;
  }
  activeMediaIndex.value = (activeMediaIndex.value + 1) % total;
}

function prevMedia(): void {
  const total = mediaItems.value.length;
  if (!total) {
    return;
  }
  activeMediaIndex.value = (activeMediaIndex.value - 1 + total) % total;
}

const imagePreviewOpen = ref(false);
const imagePreviewUrl = ref("");
const imagePreviewLabel = ref("");

function openImagePreview(url: string, label: string): void {
  imagePreviewUrl.value = url;
  imagePreviewLabel.value = label;
  imagePreviewOpen.value = true;
}

function formatCurrency(value?: number | null): string {
  if (typeof value !== "number") {
    return "-";
  }
  return new Intl.NumberFormat("fa-IR").format(value);
}

function formatBoolean(value?: boolean | null, positive: string = "بله", negative: string = "خیر"): string {
  if (value === true) return positive;
  if (value === false) return negative;
  return "-";
}

function formatDateTime(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function getStatusLabel(status: TProduct["status"]): string {
  if (status === "published") return "منتشر شده";
  if (status === "archived") return "آرشیو";
  return "پیش‌نویس";
}

function getVisibilityLabel(visibility: TProduct["visibility"]): string {
  return visibility === "hidden" ? "مخفی" : "عمومی";
}

function getVariantSummary(variant: TProductVariant): string {
  const parts = [variant.name?.trim(), variant.sku?.trim()].filter(Boolean);
  return parts.length ? parts.join(" / ") : "واریانت";
}

const tagNames = computed(() => {
  const product = props.product;
  if (!product) return [];

  return product.productTags
    .map((productTag) => productTag.tag?.name?.trim())
    .filter((tagName): tagName is string => Boolean(tagName));
});

const optionSummaries = computed(() => {
  const product = props.product;
  if (!product) return [];

  return product.options
    .map((option) => {
      const optionName = option.attribute?.name?.trim() || "ویژگی نامشخص";
      const values = option.values
        .map((value) => value.attributeValue?.value?.trim())
        .filter((value): value is string => Boolean(value));

      return values.length
        ? `${optionName}: ${values.join("، ")}`
        : optionName;
    })
    .filter(Boolean);
});
</script>

<template>
  <UModal v-model:open="modalOpen" title="مشاهده محصول">
    <template #body>
      <div v-if="!product" class="py-8 text-center text-sm text-muted">
        محصولی برای نمایش انتخاب نشده است.
      </div>

      <div v-else class="space-y-6">
        <div class="rounded-lg border border-default p-4">
          <div class="overflow-hidden rounded-lg border border-default bg-default/30">
            <div class="relative flex h-[260px] items-center justify-center p-3 sm:h-[320px] lg:h-[380px]">
              <div v-if="!mediaItems.length" class="flex flex-col items-center gap-2 text-sm text-muted">
                <UIcon name="i-lucide-image" class="size-8" />
                <span>{{ missingLabel }}</span>
              </div>

              <button
                v-else
                type="button"
                class="h-full w-full"
                @click="openImagePreview(activeMedia?.url || '', activeMedia?.isThumbnail ? 'تصویر شاخص' : 'تصویر')"
              >
                <img
                  :src="activeMedia?.url"
                  alt="product"
                  class="h-full w-full object-contain"
                  loading="lazy"
                  decoding="async"
                >
              </button>

              <div v-if="mediaItems.length > 1" class="pointer-events-none absolute inset-x-2 top-1/2 flex -translate-y-1/2 justify-between">
                <UButton
                  class="pointer-events-auto"
                  type="button"
                  color="neutral"
                  variant="soft"
                  size="xs"
                  icon="i-lucide-chevron-right"
                  @click.stop="prevMedia"
                />
                <UButton
                  class="pointer-events-auto"
                  type="button"
                  color="neutral"
                  variant="soft"
                  size="xs"
                  icon="i-lucide-chevron-left"
                  @click.stop="nextMedia"
                />
              </div>
            </div>

            <div v-if="mediaItems.length > 1" class="flex items-center gap-2 overflow-x-auto border-t border-default p-2">
              <button
                v-for="(media, index) in mediaItems"
                :key="media.id"
                type="button"
                class="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-default/20 p-1"
                :class="index === activeMediaIndex ? 'border-primary' : 'border-default'"
                @click="setActiveMedia(index)"
              >
                <img
                  :src="media.url"
                  alt="thumb"
                  class="h-full w-full object-contain"
                  loading="lazy"
                  decoding="async"
                >
              </button>
            </div>
          </div>

          <div class="mt-4 space-y-4">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="truncate text-base font-semibold text-highlighted">
                  {{ product.name }}
                </p>
                <div class="mt-1 flex flex-wrap items-center gap-2">
                  <span class="text-xs text-muted">SKU:</span>
                  <UBadge v-if="isMissing(product.sku)" color="neutral" variant="soft">
                    {{ missingLabel }}
                  </UBadge>
                  <span v-else class="truncate text-xs text-toned" dir="ltr">
                    {{ product.sku }}
                  </span>
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <UBadge :color="product.isActive ? 'success' : 'neutral'" variant="soft">
                  {{ product.isActive ? "فعال" : "غیرفعال" }}
                </UBadge>
                <UBadge v-if="product.isFeatured" color="warning" variant="soft">
                  ویژه
                </UBadge>
                <UBadge color="neutral" variant="soft">
                  {{ getStatusLabel(product.status) }}
                </UBadge>
                <UBadge color="neutral" variant="soft">
                  {{ getVisibilityLabel(product.visibility) }}
                </UBadge>
              </div>
            </div>

            <div class="grid gap-3 sm:grid-cols-2">
              <div class="rounded-lg border border-default bg-default/20 p-3">
                <p class="text-xs font-semibold text-muted">قیمت</p>
                <p class="mt-1 text-sm font-semibold text-highlighted">
                  {{ formatCurrency(product.price) }} تومان
                </p>
                <p class="mt-1 text-xs text-muted">
                  <span>تخفیف:</span>
                  <span class="text-toned">
                    {{ product.salePrice ? `${formatCurrency(product.salePrice)} تومان` : missingLabel }}
                  </span>
                </p>
              </div>

              <div class="rounded-lg border border-default bg-default/20 p-3">
                <p class="text-xs font-semibold text-muted">موجودی</p>
                <p class="mt-1 text-sm font-semibold text-highlighted">
                  {{ typeof product.stock === "number" ? product.stock : "-" }}
                </p>
                <p class="mt-1 text-xs text-muted">
                  <span>مدیریت:</span>
                  <span class="text-toned">{{ formatBoolean(product.manageStock) }}</span>
                  <span class="mx-1">|</span>
                  <span>پیش‌خرید:</span>
                  <span class="text-toned">{{ formatBoolean(product.allowBackorder) }}</span>
                </p>
              </div>
            </div>

            <div class="grid gap-3 sm:grid-cols-2">
              <div class="rounded-lg border border-default bg-default/20 p-3">
                <p class="text-xs font-semibold text-muted">دسته‌بندی</p>
                <p class="mt-1 text-sm text-toned">
                  {{ product.category?.name || "نامشخص" }}
                </p>
              </div>

              <div class="rounded-lg border border-default bg-default/20 p-3">
                <p class="text-xs font-semibold text-muted">برند</p>
                <div class="mt-1">
                  <p v-if="product.brand?.name" class="text-sm text-toned">
                    {{ product.brand.name }}
                  </p>
                  <UBadge v-else color="neutral" variant="soft">
                    {{ missingLabel }}
                  </UBadge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-lg border border-default p-4">
            <p class="mb-3 text-sm font-semibold text-toned">اطلاعات اصلی</p>
            <dl class="grid gap-3 text-sm">
              <div class="grid grid-cols-[110px_1fr] items-start gap-3">
                <dt class="text-muted">شناسه</dt>
                <dd class="truncate text-toned" dir="ltr">{{ product.id }}</dd>
              </div>
              <div class="grid grid-cols-[110px_1fr] items-start gap-3">
                <dt class="text-muted">اسلاگ</dt>
                <dd class="truncate text-toned" dir="ltr">
                  <UBadge v-if="isMissing(product.slug)" color="neutral" variant="soft">
                    {{ missingLabel }}
                  </UBadge>
                  <span v-else>{{ product.slug }}</span>
                </dd>
              </div>
              <div class="grid grid-cols-[110px_1fr] items-start gap-3">
                <dt class="text-muted">بارکد</dt>
                <dd class="truncate text-toned" dir="ltr">
                  <UBadge v-if="isMissing(product.barcode)" color="neutral" variant="soft">
                    {{ missingLabel }}
                  </UBadge>
                  <span v-else>{{ product.barcode }}</span>
                </dd>
              </div>
            </dl>
          </div>

          <div class="rounded-lg border border-default p-4">
            <p class="mb-3 text-sm font-semibold text-toned">آمار</p>
            <dl class="grid gap-3 text-sm">
              <div class="grid grid-cols-[110px_1fr] items-start gap-3">
                <dt class="text-muted">بازدید</dt>
                <dd class="text-toned">{{ typeof product.viewCount === "number" ? product.viewCount : "-" }}</dd>
              </div>
              <div class="grid grid-cols-[110px_1fr] items-start gap-3">
                <dt class="text-muted">فروش</dt>
                <dd class="text-toned">{{ typeof product.soldCount === "number" ? product.soldCount : "-" }}</dd>
              </div>
              <div class="grid grid-cols-[110px_1fr] items-start gap-3">
                <dt class="text-muted">لایک</dt>
                <dd class="text-toned">{{ typeof product.likeCount === "number" ? product.likeCount : "-" }}</dd>
              </div>
              <div class="grid grid-cols-[110px_1fr] items-start gap-3">
                <dt class="text-muted">کامنت</dt>
                <dd class="text-toned">{{ typeof product.commentCount === "number" ? product.commentCount : "-" }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div class="rounded-lg border border-default p-4">
          <p class="mb-3 text-sm font-semibold text-toned">توضیحات</p>
          <div class="grid gap-4 md:grid-cols-2">
            <div class="rounded-lg border border-default bg-default/20 p-3">
              <p class="mb-2 text-xs font-semibold text-toned">توضیح کوتاه</p>
              <div v-if="isMissing(product.shortDescription)">
                <UBadge color="neutral" variant="soft">
                  {{ missingLabel }}
                </UBadge>
              </div>
              <p v-else class="whitespace-pre-wrap text-sm leading-6 text-toned">
                {{ product.shortDescription }}
              </p>
            </div>
            <div class="rounded-lg border border-default bg-default/20 p-3">
              <p class="mb-2 text-xs font-semibold text-toned">توضیح کامل</p>
              <div v-if="isMissing(product.description)">
                <UBadge color="neutral" variant="soft">
                  {{ missingLabel }}
                </UBadge>
              </div>
              <p v-else class="whitespace-pre-wrap text-sm leading-6 text-toned">
                {{ product.description }}
              </p>
            </div>
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-lg border border-default p-4">
            <p class="mb-3 text-sm font-semibold text-toned">قیمت‌ها</p>
            <dl class="grid gap-3 text-sm">
              <div class="grid grid-cols-[110px_1fr] items-start gap-3">
                <dt class="text-muted">قیمت</dt>
                <dd class="text-toned">
                  {{ formatCurrency(product.price) }} تومان
                </dd>
              </div>
              <div class="grid grid-cols-[110px_1fr] items-start gap-3">
                <dt class="text-muted">قیمت تخفیف</dt>
                <dd class="text-toned">
                  <UBadge v-if="typeof product.salePrice !== 'number'" color="neutral" variant="soft">
                    {{ missingLabel }}
                  </UBadge>
                  <span v-else>{{ formatCurrency(product.salePrice) }} تومان</span>
                </dd>
              </div>
              <div class="grid grid-cols-[110px_1fr] items-start gap-3">
                <dt class="text-muted">قیمت خرید</dt>
                <dd class="text-toned">
                  <UBadge v-if="typeof product.costPrice !== 'number'" color="neutral" variant="soft">
                    {{ missingLabel }}
                  </UBadge>
                  <span v-else>{{ formatCurrency(product.costPrice) }} تومان</span>
                </dd>
              </div>
            </dl>
          </div>

          <div class="rounded-lg border border-default p-4">
            <p class="mb-3 text-sm font-semibold text-toned">ابعاد و وزن</p>
            <dl class="grid gap-3 text-sm">
              <div class="grid grid-cols-[110px_1fr] items-start gap-3">
                <dt class="text-muted">وزن</dt>
                <dd class="text-toned">
                  <UBadge v-if="typeof product.weight !== 'number'" color="neutral" variant="soft">
                    {{ missingLabel }}
                  </UBadge>
                  <span v-else>{{ product.weight }}</span>
                </dd>
              </div>
              <div class="grid grid-cols-[110px_1fr] items-start gap-3">
                <dt class="text-muted">طول</dt>
                <dd class="text-toned">
                  <UBadge v-if="typeof product.length !== 'number'" color="neutral" variant="soft">
                    {{ missingLabel }}
                  </UBadge>
                  <span v-else>{{ product.length }}</span>
                </dd>
              </div>
              <div class="grid grid-cols-[110px_1fr] items-start gap-3">
                <dt class="text-muted">عرض</dt>
                <dd class="text-toned">
                  <UBadge v-if="typeof product.width !== 'number'" color="neutral" variant="soft">
                    {{ missingLabel }}
                  </UBadge>
                  <span v-else>{{ product.width }}</span>
                </dd>
              </div>
              <div class="grid grid-cols-[110px_1fr] items-start gap-3">
                <dt class="text-muted">ارتفاع</dt>
                <dd class="text-toned">
                  <UBadge v-if="typeof product.height !== 'number'" color="neutral" variant="soft">
                    {{ missingLabel }}
                  </UBadge>
                  <span v-else>{{ product.height }}</span>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div class="rounded-lg border border-default p-4">
          <p class="mb-3 text-sm font-semibold text-toned">ویژگی‌ها و تگ‌ها</p>
          <div class="grid gap-4 md:grid-cols-2">
            <div class="rounded-lg border border-default bg-default/20 p-3">
              <p class="mb-2 text-xs font-semibold text-toned">تگ‌ها</p>
              <div v-if="!tagNames.length">
                <UBadge color="neutral" variant="soft">
                  {{ missingLabel }}
                </UBadge>
              </div>
              <div v-else class="flex flex-wrap items-center gap-2">
                <UBadge v-for="tagName in tagNames" :key="tagName" color="neutral" variant="subtle">
                  {{ tagName }}
                </UBadge>
              </div>
            </div>

            <div class="rounded-lg border border-default bg-default/20 p-3">
              <p class="mb-2 text-xs font-semibold text-toned">ویژگی‌ها</p>
              <div v-if="!optionSummaries.length">
                <UBadge color="neutral" variant="soft">
                  {{ missingLabel }}
                </UBadge>
              </div>
              <div v-else class="space-y-1 text-sm text-toned">
                <p v-for="summary in optionSummaries" :key="summary">
                  {{ summary }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-lg border border-default p-4">
          <p class="mb-3 text-sm font-semibold text-toned">مشخصات محصول</p>
          <div v-if="!product.specifications?.length" class="text-sm text-muted">
            مشخصاتی ثبت نشده است.
          </div>
          <dl v-else class="grid gap-3 text-sm md:grid-cols-2">
            <div
              v-for="(spec, index) in product.specifications"
              :key="`${index}-${spec.title}`"
              class="rounded-lg border border-default bg-default/20 px-3 py-2"
            >
              <dt class="text-xs font-semibold text-muted">{{ spec.title }}</dt>
              <dd class="mt-1 text-toned">{{ spec.value }}</dd>
            </div>
          </dl>
        </div>

        <div class="rounded-lg border border-default p-4">
          <p class="mb-3 text-sm font-semibold text-toned">واریانت‌ها</p>
          <div v-if="!product.variants.length" class="text-sm text-muted">
            واریانتی ثبت نشده است.
          </div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full border-separate border-spacing-0 text-right text-sm">
              <thead>
                <tr>
                  <th class="border-b border-default px-3 py-2 font-semibold text-toned">نام</th>
                  <th class="border-b border-default px-3 py-2 font-semibold text-toned">SKU</th>
                  <th class="border-b border-default px-3 py-2 font-semibold text-toned">قیمت</th>
                  <th class="border-b border-default px-3 py-2 font-semibold text-toned">موجودی</th>
                  <th class="border-b border-default px-3 py-2 font-semibold text-toned">وضعیت</th>
                  <th class="border-b border-default px-3 py-2 font-semibold text-toned">تصویر</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="variant in product.variants" :key="variant.id" class="transition-colors hover:bg-elevated/40">
                  <td class="border-b border-default px-3 py-3 text-toned">
                    <UBadge v-if="isMissing(variant.name)" color="neutral" variant="soft">
                      {{ missingLabel }}
                    </UBadge>
                    <span v-else>{{ variant.name }}</span>
                  </td>
                  <td class="border-b border-default px-3 py-3 text-toned" dir="ltr">
                    <UBadge v-if="isMissing(variant.sku)" color="neutral" variant="soft">
                      {{ missingLabel }}
                    </UBadge>
                    <span v-else>{{ variant.sku }}</span>
                  </td>
                  <td class="border-b border-default px-3 py-3 text-toned">
                    {{ formatCurrency(variant.price) }}
                  </td>
                  <td class="border-b border-default px-3 py-3 text-toned">
                    {{ typeof variant.stock === "number" ? variant.stock : "-" }}
                  </td>
                  <td class="border-b border-default px-3 py-3">
                    <UBadge :color="variant.isActive ? 'success' : 'neutral'" variant="soft">
                      {{ variant.isActive ? "فعال" : "غیرفعال" }}
                    </UBadge>
                  </td>
                  <td class="border-b border-default px-3 py-3">
                    <UButton
                      v-if="variant.image"
                      type="button"
                      color="neutral"
                      variant="ghost"
                      size="sm"
                      icon="i-lucide-eye"
                      @click="openImagePreview(variant.image, getVariantSummary(variant))"
                    >
                      مشاهده
                    </UButton>
                    <UBadge v-else color="neutral" variant="soft">
                      {{ missingLabel }}
                    </UBadge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="rounded-lg border border-default p-4">
          <p class="mb-3 text-sm font-semibold text-toned">SEO</p>
          <dl class="grid gap-3 text-sm md:grid-cols-2">
            <div class="grid grid-cols-[110px_1fr] items-start gap-3">
              <dt class="text-muted">عنوان متا</dt>
              <dd class="truncate text-toned">
                <UBadge v-if="isMissing(product.metaTitle)" color="neutral" variant="soft">
                  {{ missingLabel }}
                </UBadge>
                <span v-else>{{ product.metaTitle }}</span>
              </dd>
            </div>
            <div class="grid grid-cols-[110px_1fr] items-start gap-3">
              <dt class="text-muted">توضیح متا</dt>
              <dd class="truncate text-toned">
                <UBadge v-if="isMissing(product.metaDescription)" color="neutral" variant="soft">
                  {{ missingLabel }}
                </UBadge>
                <span v-else>{{ product.metaDescription }}</span>
              </dd>
            </div>
            <div class="grid grid-cols-[110px_1fr] items-start gap-3">
              <dt class="text-muted">کلمات کلیدی</dt>
              <dd class="truncate text-toned">
                <UBadge v-if="isMissing(product.keywords)" color="neutral" variant="soft">
                  {{ missingLabel }}
                </UBadge>
                <span v-else>{{ product.keywords }}</span>
              </dd>
            </div>
            <div class="grid grid-cols-[110px_1fr] items-start gap-3">
              <dt class="text-muted">Canonical</dt>
              <dd class="truncate text-toned" dir="ltr">
                <UBadge v-if="isMissing(product.canonical)" color="neutral" variant="soft">
                  {{ missingLabel }}
                </UBadge>
                <span v-else>{{ product.canonical }}</span>
              </dd>
            </div>
            <div class="grid grid-cols-[110px_1fr] items-start gap-3">
              <dt class="text-muted">OG Image</dt>
              <dd class="truncate text-toned" dir="ltr">
                <UBadge v-if="isMissing(product.ogImage)" color="neutral" variant="soft">
                  {{ missingLabel }}
                </UBadge>
                <span v-else>{{ product.ogImage }}</span>
              </dd>
            </div>
          </dl>
        </div>

        <div class="rounded-lg border border-default p-4">
          <p class="mb-3 text-sm font-semibold text-toned">زمان‌ها</p>
          <dl class="grid gap-3 text-sm md:grid-cols-2">
            <div class="grid grid-cols-[110px_1fr] items-start gap-3">
              <dt class="text-muted">ایجاد</dt>
              <dd class="text-toned">
                <UBadge v-if="isMissing(product.createdAt)" color="neutral" variant="soft">
                  {{ missingLabel }}
                </UBadge>
                <span v-else>{{ formatDateTime(product.createdAt) }}</span>
              </dd>
            </div>
            <div class="grid grid-cols-[110px_1fr] items-start gap-3">
              <dt class="text-muted">بروزرسانی</dt>
              <dd class="text-toned">
                <UBadge v-if="isMissing(product.updatedAt)" color="neutral" variant="soft">
                  {{ missingLabel }}
                </UBadge>
                <span v-else>{{ formatDateTime(product.updatedAt) }}</span>
              </dd>
            </div>
            <div class="grid grid-cols-[110px_1fr] items-start gap-3">
              <dt class="text-muted">انتشار</dt>
              <dd class="text-toned">
                <UBadge v-if="isMissing(product.publishedAt)" color="neutral" variant="soft">
                  {{ missingLabel }}
                </UBadge>
                <span v-else>{{ formatDateTime(product.publishedAt) }}</span>
              </dd>
            </div>
          </dl>
        </div>

        <div class="flex items-center justify-end">
          <UButton
            type="button"
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            @click="() => { modalOpen = false }"
          >
            بستن
          </UButton>
        </div>
      </div>

      <UModal v-model:open="imagePreviewOpen" :title="imagePreviewLabel || 'پیش‌نمایش تصویر'">
        <template #body>
          <div class="space-y-4">
            <div class="flex items-center justify-center rounded-lg border border-default bg-default/40 p-3">
              <img
                v-if="imagePreviewUrl"
                :src="imagePreviewUrl"
                alt="preview"
                class="max-h-[70vh] w-full object-contain"
                loading="lazy"
                decoding="async"
              >
              <div v-else class="py-10 text-center text-sm text-muted">
                تصویری برای نمایش وجود ندارد.
              </div>
            </div>
            <div class="flex items-center justify-end">
              <UButton
                type="button"
                color="neutral"
                variant="ghost"
                icon="i-lucide-x"
                @click="() => { imagePreviewOpen = false }"
              >
                بستن
              </UButton>
            </div>
          </div>
        </template>
      </UModal>
    </template>
  </UModal>
</template>
