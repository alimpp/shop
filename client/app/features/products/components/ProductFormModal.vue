<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

import type { TCategory } from "~/features/categories/types/index.type";
import type {
  TProduct,
  TProductAttributeWithValues,
  TProductBrandRef,
  TProductOptionPayload,
  TProductPayload,
  TProductStatus,
  TProductVariantPayload,
  TProductVisibility
} from "../types/index.type";

type TNumberInput = number | "";

interface TProductVariantFormState {
  name: string;
  sku: string;
  barcode: string;
  price: TNumberInput;
  salePrice: TNumberInput;
  stock: TNumberInput;
  image: string;
  isActive: boolean;
}

interface TProductOptionFormState {
  attributeId: string;
  valueIds: string[];
}

interface TProductSpecificationFormState {
  title: string;
  value: string;
}

interface TProductFormState {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  sku: string;
  barcode: string;
  price: TNumberInput;
  salePrice: TNumberInput;
  costPrice: TNumberInput;
  stock: TNumberInput;
  manageStock: boolean;
  allowBackorder: boolean;
  weight: TNumberInput;
  length: TNumberInput;
  width: TNumberInput;
  height: TNumberInput;
  categoryId: string;
  brandId: string;
  status: TProductStatus;
  visibility: TProductVisibility;
  isFeatured: boolean;
  isActive: boolean;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  canonical: string;
  ogImage: string;
  mediaUrls: string[];
  thumbnailUrl: string;
  options: TProductOptionFormState[];
  variants: TProductVariantFormState[];
  specifications: TProductSpecificationFormState[];
}

const props = defineProps<{
  open: boolean;
  product: TProduct | null;
  categories: TCategory[];
  brands: TProductBrandRef[];
  attributes: TProductAttributeWithValues[];
  submitting: boolean;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  submit: [payload: TProductPayload, id: string | null];
}>();

const statusOptions = [
  { label: "پیش‌نویس", value: "draft" },
  { label: "منتشر شده", value: "published" },
  { label: "آرشیو", value: "archived" }
];

const visibilityOptions = [
  { label: "عمومی", value: "public" },
  { label: "مخفی", value: "hidden" }
];

const uuidField = z.union([
  z.literal(""),
  z.string().uuid("شناسه وارد شده معتبر نیست")
]);

const numberField = (label: string, required: boolean = false) => z.preprocess(
  (value) => {
    if (value === "" || value === null || typeof value === "undefined") {
      return undefined;
    }

    return Number(value);
  },
  required
    ? z.number().min(0, `${label} باید حداقل ۰ باشد`)
    : z.number().min(0, `${label} باید حداقل ۰ باشد`).optional()
);

const variantSchema = z.object({
  name: z.string().trim().min(1, "نام واریانت الزامی است").max(160, "نام واریانت باید حداکثر ۱۶۰ کاراکتر باشد"),
  sku: z.string().trim().min(1, "SKU واریانت الزامی است").max(120, "SKU واریانت باید حداکثر ۱۲۰ کاراکتر باشد"),
  barcode: z.string().max(120, "بارکد واریانت باید حداکثر ۱۲۰ کاراکتر باشد"),
  price: numberField("قیمت واریانت", true),
  salePrice: numberField("قیمت تخفیف واریانت"),
  stock: numberField("موجودی واریانت"),
  image: z.string().max(2048, "آدرس تصویر واریانت باید حداکثر ۲۰۴۸ کاراکتر باشد"),
  isActive: z.boolean()
}).superRefine((variant, ctx) => {
  if (
    typeof variant.salePrice === "number" &&
    typeof variant.price === "number" &&
    variant.salePrice > variant.price
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "قیمت تخفیف واریانت نمی‌تواند بیشتر از قیمت اصلی باشد",
      path: ["salePrice"]
    });
  }
});

const optionSchema = z.object({
  attributeId: z.string().uuid("انتخاب ویژگی الزامی است"),
  valueIds: z.array(z.string().uuid("مقدار ویژگی معتبر نیست"))
    .min(1, "انتخاب حداقل یک مقدار الزامی است")
    .max(50, "حداکثر ۵۰ مقدار مجاز است")
});

const specificationSchema = z.object({
  title: z.string().trim().min(1, "عنوان مشخصات الزامی است").max(200, "عنوان مشخصات باید حداکثر ۲۰۰ کاراکتر باشد"),
  value: z.string().trim().min(1, "مقدار مشخصات الزامی است").max(500, "مقدار مشخصات باید حداکثر ۵۰۰ کاراکتر باشد")
});

const productSchema = z.object({
  name: z.string().trim().min(3, "نام محصول باید حداقل ۳ کاراکتر باشد").max(200, "نام محصول باید حداکثر ۲۰۰ کاراکتر باشد"),
  slug: z.string().trim().min(3, "اسلاگ محصول باید حداقل ۳ کاراکتر باشد").max(220, "اسلاگ محصول باید حداکثر ۲۲۰ کاراکتر باشد"),
  description: z.string().trim().min(3, "توضیحات محصول الزامی است"),
  shortDescription: z.string().max(2000, "توضیح کوتاه باید حداکثر ۲۰۰۰ کاراکتر باشد"),
  sku: z.string().trim().min(1, "SKU محصول الزامی است").max(120, "SKU محصول باید حداکثر ۱۲۰ کاراکتر باشد"),
  barcode: z.string().max(120, "بارکد باید حداکثر ۱۲۰ کاراکتر باشد"),
  price: numberField("قیمت اصلی", true),
  salePrice: numberField("قیمت تخفیف"),
  costPrice: numberField("قیمت تمام‌شده"),
  stock: numberField("موجودی"),
  manageStock: z.boolean(),
  allowBackorder: z.boolean(),
  weight: numberField("وزن"),
  length: numberField("طول"),
  width: numberField("عرض"),
  height: numberField("ارتفاع"),
  categoryId: z.string().uuid("انتخاب دسته‌بندی الزامی است"),
  brandId: uuidField,
  status: z.enum(["draft", "published", "archived"]),
  visibility: z.enum(["public", "hidden"]),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  metaTitle: z.string().max(255, "عنوان سئو باید حداکثر ۲۵۵ کاراکتر باشد"),
  metaDescription: z.string().max(4000, "توضیحات سئو باید حداکثر ۴۰۰۰ کاراکتر باشد"),
  keywords: z.string().max(4000, "کلمات کلیدی باید حداکثر ۴۰۰۰ کاراکتر باشد"),
  canonical: z.string().max(500, "Canonical باید حداکثر ۵۰۰ کاراکتر باشد"),
  ogImage: z.string().max(2048, "آدرس تصویر OG باید حداکثر ۲۰۴۸ کاراکتر باشد"),
  mediaUrls: z.array(z.string().url("آدرس رسانه معتبر نیست")).max(20, "حداکثر ۲۰ رسانه مجاز است"),
  thumbnailUrl: z.string(),
  options: z.array(optionSchema).max(50, "حداکثر ۵۰ ویژگی مجاز است"),
  variants: z.array(variantSchema).max(100, "حداکثر ۱۰۰ واریانت مجاز است"),
  specifications: z.array(specificationSchema).max(50, "حداکثر ۵۰ مشخصات مجاز است")
}).superRefine((data, ctx) => {
  if (
    typeof data.salePrice === "number" &&
    typeof data.price === "number" &&
    data.salePrice > data.price
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "قیمت تخفیف نمی‌تواند بیشتر از قیمت اصلی باشد",
      path: ["salePrice"]
    });
  }

  if (data.mediaUrls.length > 0 && data.thumbnailUrl && !data.mediaUrls.includes(data.thumbnailUrl)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "تصویر شاخص باید از بین تصاویر انتخاب‌شده باشد",
      path: ["thumbnailUrl"]
    });
  }
  if (data.variants.length > 0) {
    const variantStockSum = data.variants.reduce(
      (sum, variant) => sum + (Number(variant.stock) || 0),
      0
    );
    const productStock = Number(data.stock) || 0;

    if (variantStockSum !== productStock) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `مجموع موجودی واریانت‌ها (${variantStockSum.toLocaleString("fa-IR")}) باید برابر موجودی محصول (${productStock.toLocaleString("fa-IR")}) باشد.`,
        path: ["variants"]
      });
    }
  }

  const variantSkus = new Set<string>();
  data.variants.forEach((variant, index) => {
    if (variantSkus.has(variant.sku.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "SKU واریانت‌ها باید یکتا باشد",
        path: ["variants", index, "sku"]
      });
    }

    variantSkus.add(variant.sku.trim());
  });

  const seenAttributes = new Set<string>();
  data.options.forEach((option, index) => {
    if (seenAttributes.has(option.attributeId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "ویژگی تکراری است",
        path: ["options", index, "attributeId"]
      });
    }
    seenAttributes.add(option.attributeId);
  });
});

type ProductSchema = z.output<typeof productSchema>;

const state = reactive<TProductFormState>({
  name: "",
  slug: "",
  description: "",
  shortDescription: "",
  sku: "",
  barcode: "",
  price: 0,
  salePrice: "",
  costPrice: "",
  stock: 0,
  manageStock: true,
  allowBackorder: false,
  weight: "",
  length: "",
  width: "",
  height: "",
  categoryId: "",
  brandId: "",
  status: "draft",
  visibility: "public",
  isFeatured: false,
  isActive: true,
  metaTitle: "",
  metaDescription: "",
  keywords: "",
  canonical: "",
  ogImage: "",
  mediaUrls: [],
  thumbnailUrl: "",
  options: [],
  variants: [],
  specifications: []
});

const modalOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit("update:open", value)
});

const isEditing = computed(() => Boolean(props.product?.id));
const modalTitle = computed(() =>
  isEditing.value ? "ویرایش محصول" : "ایجاد محصول"
);
const modalDescription = computed(() =>
  isEditing.value
    ? `در حال ویرایش: ${props.product?.name ?? ""}`
    : "اطلاعات کامل محصول را وارد کنید."
);

const sortedCategories = computed(() =>
  [...props.categories].sort((a, b) => a.name.localeCompare(b.name, "fa"))
);

const sortedBrands = computed(() =>
  [...props.brands].sort((a, b) => a.name.localeCompare(b.name, "fa"))
);

const sortedAttributes = computed(() =>
  [...props.attributes].sort((a, b) => {
    const sortDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    if (sortDiff !== 0) {
      return sortDiff;
    }
    return a.name.localeCompare(b.name, "fa");
  })
);

function createEmptyOption(): TProductOptionFormState {
  return {
    attributeId: "",
    valueIds: []
  };
}

function addOption(): void {
  state.options.push(createEmptyOption());
}

function removeOption(index: number): void {
  state.options.splice(index, 1);
}

function handleOptionAttributeChange(index: number, attributeId: string): void {
  const option = state.options[index];
  if (!option) {
    return;
  }
  if (option.attributeId === attributeId) {
    return;
  }
  option.attributeId = attributeId;
  option.valueIds = [];
}

function getAttributeValues(attributeId: string): { id: string; label: string }[] {
  const attribute = props.attributes.find((item) => item.id === attributeId);
  if (!attribute) {
    return [];
  }

  return (attribute.values ?? [])
    .map((value) => ({
      id: value.id,
      label: value.value
    }))
    .filter((item) => Boolean(item.id) && Boolean(item.label));
}

const relatedTags = computed(() =>
  props.product?.productTags
    .map((productTag) => productTag.tag?.name?.trim())
    .filter((tagName): tagName is string => Boolean(tagName)) ?? []
);

const relatedOptions = computed(() =>
  props.product?.options
    .map((option) => ({
      id: option.id,
      name: option.attribute?.name?.trim() || "ویژگی نامشخص",
      values: option.values
        .map((value) => value.attributeValue?.value?.trim())
        .filter((optionValue): optionValue is string => Boolean(optionValue))
    })) ?? []
);

const relatedVariantValues = computed(() =>
  props.product?.variants
    .map((variant) => ({
      id: variant.id || variant.sku,
      sku: variant.sku,
      values: variant.values
        .map((value) => {
          const attributeName = value.attributeValue?.attribute?.name?.trim();
          const attributeValue = value.attributeValue?.value?.trim();

          if (attributeName && attributeValue) {
            return `${attributeName}: ${attributeValue}`;
          }

          return attributeValue || "";
        })
        .filter((variantValue): variantValue is string => Boolean(variantValue))
    }))
    .filter((variant) => variant.values.length) ?? []
);

const hasRelatedEntities = computed(() =>
  relatedTags.value.length > 0 ||
  relatedOptions.value.length > 0 ||
  relatedVariantValues.value.length > 0
);

const toast = useToast();

const variantStockSum = computed(() =>
  state.variants.reduce((sum, variant) => sum + (Number(variant.stock) || 0), 0)
);

const productStockValue = computed(() => Number(state.stock) || 0);

const variantStockMismatch = computed(() =>
  state.variants.length > 0 && variantStockSum.value !== productStockValue.value
);

function getVariantStockRemaining(): number {
  const usedStock = state.variants.reduce(
    (sum, variant) => sum + (Number(variant.stock) || 0),
    0
  );

  return Math.max(0, productStockValue.value - usedStock);
}

function syncProductStockFromVariants(): void {
  if (!state.variants.length) {
    return;
  }

  state.stock = variantStockSum.value;
}

function resetState(): void {
  state.name = "";
  state.slug = "";
  state.description = "";
  state.shortDescription = "";
  state.sku = "";
  state.barcode = "";
  state.price = 0;
  state.salePrice = "";
  state.costPrice = "";
  state.stock = 0;
  state.manageStock = true;
  state.allowBackorder = false;
  state.weight = "";
  state.length = "";
  state.width = "";
  state.height = "";
  state.categoryId = "";
  state.brandId = "";
  state.status = "draft";
  state.visibility = "public";
  state.isFeatured = false;
  state.isActive = true;
  state.metaTitle = "";
  state.metaDescription = "";
  state.keywords = "";
  state.canonical = "";
  state.ogImage = "";
  state.mediaUrls = [];
  state.thumbnailUrl = "";
  state.options = [];
  state.variants = [];
  state.specifications = [];
}

function syncState(product: TProduct | null): void {
  if (!product) {
    resetState();
    return;
  }

  state.name = product.name;
  state.slug = product.slug;
  state.description = product.description;
  state.shortDescription = product.shortDescription ?? "";
  state.sku = product.sku;
  state.barcode = product.barcode ?? "";
  state.price = product.price;
  state.salePrice = product.salePrice ?? "";
  state.costPrice = product.costPrice ?? "";
  state.stock = product.stock;
  state.manageStock = product.manageStock;
  state.allowBackorder = product.allowBackorder;
  state.weight = product.weight ?? "";
  state.length = product.length ?? "";
  state.width = product.width ?? "";
  state.height = product.height ?? "";
  state.categoryId = product.categoryId;
  state.brandId = product.brandId ?? "";
  state.status = product.status;
  state.visibility = product.visibility;
  state.isFeatured = product.isFeatured;
  state.isActive = product.isActive;
  state.metaTitle = product.metaTitle ?? "";
  state.metaDescription = product.metaDescription ?? "";
  state.keywords = product.keywords ?? "";
  state.canonical = product.canonical ?? "";
  state.ogImage = product.ogImage ?? "";
  state.mediaUrls = product.medias.map((media) => media.url);
  state.thumbnailUrl = product.medias.find((media) => media.isThumbnail)?.url ?? product.medias[0]?.url ?? "";
  state.options = product.options.map((option) => ({
    attributeId: option.attributeId,
    valueIds: option.values
      .map((value) => value.attributeValueId || value.attributeValue?.id || '')
      .filter(Boolean)
  }));
  state.variants = product.variants.map((variant) => ({
    name: variant.name,
    sku: variant.sku,
    barcode: variant.barcode ?? "",
    price: variant.price,
    salePrice: variant.salePrice ?? "",
    stock: variant.stock,
    image: variant.image ?? "",
    isActive: variant.isActive
  }));
  state.specifications = (product.specifications ?? []).map(spec => ({
    title: spec.title ?? "",
    value: spec.value ?? ""
  }));
}

function normalizePayload(data: ProductSchema): TProductPayload {
  const mediaUrls = Array.from(new Set(data.mediaUrls.filter(Boolean)));
  const thumbnailUrl = mediaUrls.includes(data.thumbnailUrl)
    ? data.thumbnailUrl
    : mediaUrls[0] ?? "";

  const orderedMediaUrls = thumbnailUrl
    ? [thumbnailUrl, ...mediaUrls.filter((url) => url !== thumbnailUrl)]
    : mediaUrls;

  const medias = orderedMediaUrls.length ? orderedMediaUrls : undefined;

  const variants = data.variants.length
    ? data.variants.map<TProductVariantPayload>((variant) => ({
        name: variant.name.trim(),
        sku: variant.sku.trim(),
        barcode: variant.barcode.trim() || undefined,
        price: Number(variant.price),
        salePrice: variant.salePrice,
        stock: variant.stock,
        image: variant.image.trim() || undefined,
        isActive: variant.isActive
      }))
    : undefined;

  const options = data.options.length
    ? data.options.map<TProductOptionPayload>((option) => ({
        attributeId: option.attributeId,
        valueIds: option.valueIds
      }))
    : undefined;

  const specifications = data.specifications.length
    ? data.specifications
        .map((spec) => ({
          title: spec.title.trim(),
          value: spec.value.trim()
        }))
        .filter(spec => Boolean(spec.title) && Boolean(spec.value))
    : undefined;

  return {
    name: data.name.trim(),
    slug: data.slug.trim(),
    description: data.description.trim(),
    shortDescription: data.shortDescription.trim() || undefined,
    sku: data.sku.trim(),
    barcode: data.barcode.trim() || undefined,
    price: Number(data.price),
    salePrice: data.salePrice,
    costPrice: data.costPrice,
    stock: data.stock,
    manageStock: data.manageStock,
    allowBackorder: data.allowBackorder,
    // وزن و ابعاد فعلا از فرم حذف شده‌اند؛ خالی به بک‌اند می‌روند
    weight: undefined,
    length: undefined,
    width: undefined,
    height: undefined,
    categoryId: data.categoryId,
    brandId: data.brandId || undefined,
    status: data.status,
    visibility: data.visibility,
    isFeatured: data.isFeatured,
    isActive: data.isActive,
    metaTitle: data.metaTitle.trim() || undefined,
    metaDescription: data.metaDescription.trim() || undefined,
    keywords: data.keywords.trim() || undefined,
    canonical: data.canonical.trim() || undefined,
    ogImage: data.ogImage.trim() || undefined,
    medias,
    options,
    variants,
    specifications
  };
}

function addVariant(): void {
  const index = state.variants.length + 1;
  const baseSku = state.sku.trim() || "VAR";
  const productPrice = typeof state.price === "number"
    ? state.price
    : Number(state.price) || 0;

  state.variants.push({
    name: "",
    sku: `${baseSku}-V${index}`,
    barcode: "",
    price: productPrice,
    salePrice: state.salePrice,
    stock: getVariantStockRemaining(),
    image: "",
    isActive: true
  });

  syncProductStockFromVariants();
}

function removeVariant(index: number): void {
  state.variants.splice(index, 1);
  syncProductStockFromVariants();
}

function addSpecification(): void {
  state.specifications.push({ title: "", value: "" });
}

function removeSpecification(index: number): void {
  state.specifications.splice(index, 1);
}

function closeModal(): void {
  modalOpen.value = false;
}

function handleSubmit(event: FormSubmitEvent<ProductSchema>): void {
  emit("submit", normalizePayload(event.data), props.product?.id ?? null);
}

interface FormValidationErrorEvent {
  errors: Array<{ message?: string; name?: string }>;
}

function handleSubmitError(event: FormValidationErrorEvent): void {
  const firstError = event.errors?.[0];

  toast.add({
    title: firstError?.message || "لطفاً خطاهای فرم را برطرف کنید",
    color: "error"
  });

  if (!import.meta.client) {
    return;
  }

  nextTick(() => {
    const errorName = firstError?.name ?? "";

    if (errorName.includes("variants") || errorName === "stock") {
      document.getElementById("product-variants-section")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
      return;
    }

    const field = document.querySelector(`[name="${errorName}"]`);
    field?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

watch(
  () => state.variants.map((variant) => Number(variant.stock) || 0),
  () => {
    syncProductStockFromVariants();
  },
  { deep: true }
);

watch(
  () => state.mediaUrls.slice(),
  (mediaUrls) => {
    const uniqueUrls = Array.from(new Set(mediaUrls.filter(Boolean)));

    if (uniqueUrls.length !== state.mediaUrls.length) {
      state.mediaUrls = uniqueUrls;
    }

    if (!uniqueUrls.length) {
      state.thumbnailUrl = "";
      return;
    }

    if (!uniqueUrls.includes(state.thumbnailUrl)) {
      state.thumbnailUrl = uniqueUrls[0] ?? "";
    }
  },
  { deep: true }
);

watch(
  () => [props.open, props.product] as const,
  ([isOpen, product]) => {
    if (!isOpen) {
      resetState();
      return;
    }

    syncState(product);
  },
  { immediate: true }
);
</script>

<template>
  <UModal v-model:open="modalOpen" :title="modalTitle" fullscreen>
    <template #body>
      <div class="space-y-6">
        <p class="text-sm text-muted">
          {{ modalDescription }}
        </p>

        <UForm
          :schema="productSchema"
          :state="state"
          class="space-y-6"
          @submit="handleSubmit"
          @error="handleSubmitError"
        >
          <section class="space-y-4 rounded-xl border border-default p-4">
            <div class="border-b border-default pb-3">
              <h3 class="font-semibold text-highlighted">اطلاعات اصلی</h3>
            </div>

            <div class="grid gap-4 lg:grid-cols-2">
              <UFormField label="نام محصول" name="name">
                <UInput v-model="state.name" class="w-full" placeholder="مثلا گوشی موبایل" />
              </UFormField>

              <UFormField label="اسلاگ" name="slug">
                <UInput v-model="state.slug" class="w-full" dir="ltr" placeholder="mobile-phone" />
              </UFormField>
            </div>

            <div class="grid gap-4 lg:grid-cols-2">
              <UFormField label="SKU" name="sku">
                <UInput v-model="state.sku" class="w-full" dir="ltr" placeholder="PRD-1001" />
              </UFormField>

              <UFormField label="بارکد" name="barcode">
                <UInput v-model="state.barcode" class="w-full" dir="ltr" placeholder="اختیاری" />
              </UFormField>
            </div>

            <UFormField label="توضیحات کامل" name="description">
              <UTextarea
                v-model="state.description"
                class="w-full"
                :rows="5"
                placeholder="توضیحات کامل محصول"
              />
            </UFormField>

            <UFormField label="توضیح کوتاه" name="shortDescription">
              <UTextarea
                v-model="state.shortDescription"
                class="w-full"
                :rows="3"
                placeholder="توضیح کوتاه برای کارت یا لیست"
              />
            </UFormField>
          </section>

          <section class="space-y-4 rounded-xl border border-default p-4">
            <div class="border-b border-default pb-3">
              <h3 class="font-semibold text-highlighted">قیمت و موجودی</h3>
            </div>

            <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <UFormField label="قیمت اصلی" name="price">
                <UInput v-model.number="state.price" type="number" min="0" class="w-full" />
              </UFormField>

              <UFormField label="قیمت تخفیف" name="salePrice">
                <UInput v-model.number="state.salePrice" type="number" min="0" class="w-full" />
              </UFormField>

              <UFormField label="قیمت تمام‌شده" name="costPrice">
                <UInput v-model.number="state.costPrice" type="number" min="0" class="w-full" />
              </UFormField>

              <UFormField label="موجودی" name="stock">
                <UInput
                  v-model.number="state.stock"
                  type="number"
                  min="0"
                  class="w-full"
                  :disabled="state.variants.length > 0"
                />
                <p v-if="state.variants.length > 0" class="mt-1 text-xs text-muted">
                  با وجود واریانت، موجودی از مجموع موجودی واریانت‌ها محاسبه می‌شود.
                </p>
              </UFormField>
            </div>

            <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <UCheckbox v-model="state.manageStock" label="مدیریت موجودی فعال باشد" />
              <UCheckbox v-model="state.allowBackorder" label="ثبت سفارش بدون موجودی مجاز باشد" />
              <UCheckbox v-model="state.isActive" label="محصول فعال باشد" />
              <UCheckbox v-model="state.isFeatured" label="محصول ویژه باشد" />
            </div>
          </section>

          <section class="space-y-4 rounded-xl border border-default p-4">
            <div class="border-b border-default pb-3">
              <h3 class="font-semibold text-highlighted">دسته‌بندی و تنظیمات انتشار</h3>
            </div>

            <div class="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
              <UFormField label="دسته‌بندی" name="categoryId">
                <USelect
                  v-model="state.categoryId"
                  :items="sortedCategories"
                  value-key="id"
                  label-key="name"
                  placeholder="انتخاب دسته‌بندی"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="برند" name="brandId">
                <USelect
                  v-model="state.brandId"
                  :items="sortedBrands"
                  value-key="id"
                  label-key="name"
                  placeholder="بدون برند"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="وضعیت" name="status">
                <USelect
                  v-model="state.status"
                  :items="statusOptions"
                  value-key="value"
                  label-key="label"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="نمایش" name="visibility">
                <USelect
                  v-model="state.visibility"
                  :items="visibilityOptions"
                  value-key="value"
                  label-key="label"
                  class="w-full"
                />
              </UFormField>
            </div>
          </section>

          <section class="space-y-4 rounded-xl border border-default p-4">
            <div class="flex items-center justify-between gap-3 border-b border-default pb-3">
              <h3 class="font-semibold text-highlighted">ویژگی‌ها (آپشن‌ها)</h3>
              <UButton
                type="button"
                color="primary"
                variant="outline"
                icon="i-lucide-plus"
                @click="addOption"
              >
                افزودن ویژگی
              </UButton>
            </div>

            <div
              v-if="!state.options.length"
              class="rounded-lg border border-dashed border-default p-4 text-sm text-muted"
            >
              هنوز ویژگی‌ای برای این محصول انتخاب نشده است.
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="(option, index) in state.options"
                :key="`${index}-${option.attributeId}`"
                class="space-y-4 rounded-xl border border-default p-4"
              >
                <div class="flex items-center justify-between gap-3">
                  <p class="text-sm font-semibold text-toned">
                    ویژگی {{ index + 1 }}
                  </p>
                  <UButton
                    type="button"
                    color="error"
                    variant="soft"
                    size="sm"
                    icon="i-lucide-trash-2"
                    @click="removeOption(index)"
                  >
                    حذف
                  </UButton>
                </div>

                <UFormField :name="`options.${index}.attributeId`" label="ویژگی">
                  <USelect
                    :model-value="option.attributeId"
                    :items="sortedAttributes"
                    value-key="id"
                    label-key="name"
                    placeholder="انتخاب ویژگی"
                    class="w-full"
                    @update:model-value="(value) => handleOptionAttributeChange(index, String(value ?? ''))"
                  />
                </UFormField>

                <UFormField :name="`options.${index}.valueIds`" label="مقادیر">
                  <div v-if="!option.attributeId" class="text-sm text-muted">
                    ابتدا یک ویژگی انتخاب کنید.
                  </div>
                  <div
                    v-else-if="!getAttributeValues(option.attributeId).length"
                    class="text-sm text-muted"
                  >
                    برای این ویژگی مقداری ثبت نشده است.
                  </div>
                  <div v-else class="flex flex-wrap items-center gap-3">
                    <label
                      v-for="value in getAttributeValues(option.attributeId)"
                      :key="value.id"
                      class="flex items-center gap-2 rounded-lg border border-default bg-default/20 px-3 py-2 text-sm text-toned"
                    >
                      <input
                        v-model="option.valueIds"
                        type="checkbox"
                        class="size-4"
                        :value="value.id"
                      >
                      <span>{{ value.label }}</span>
                    </label>
                  </div>
                </UFormField>
              </div>
            </div>
          </section>

          <section class="space-y-4 rounded-xl border border-default p-4">
            <div class="border-b border-default pb-3">
              <h3 class="font-semibold text-highlighted">رسانه‌ها</h3>
            </div>

            <UFormField label="تصاویر محصول" name="mediaUrls">
              <BaseFilePicker v-model="state.mediaUrls" multiple />
            </UFormField>

            <UFormField
              v-if="state.mediaUrls.length > 1"
              label="تصویر شاخص"
              name="thumbnailUrl"
            >
              <USelect
                v-model="state.thumbnailUrl"
                :items="state.mediaUrls.map((url) => ({ label: url, value: url }))"
                value-key="value"
                label-key="label"
                placeholder="انتخاب تصویر شاخص"
                class="w-full"
              />
            </UFormField>

            <UFormField label="تصویر OG" name="ogImage">
              <BaseFilePicker v-model="state.ogImage" />
            </UFormField>
          </section>

          <section id="product-variants-section" class="space-y-4 rounded-xl border border-default p-4">
            <div class="flex items-center justify-between gap-3 border-b border-default pb-3">
              <h3 class="font-semibold text-highlighted">واریانت‌ها</h3>
              <UButton
                type="button"
                color="primary"
                variant="outline"
                icon="i-lucide-plus"
                @click="addVariant"
              >
                افزودن واریانت
              </UButton>
            </div>

            <p
              v-if="state.variants.length"
              class="text-xs"
              :class="variantStockMismatch ? 'text-error' : 'text-muted'"
            >
              مجموع موجودی واریانت‌ها:
              {{ variantStockSum.toLocaleString("fa-IR") }}
              —
              موجودی محصول:
              {{ productStockValue.toLocaleString("fa-IR") }}
            </p>

            <div
              v-if="!state.variants.length"
              class="rounded-lg border border-dashed border-default p-4 text-sm text-muted"
            >
              هنوز واریانتی برای این محصول ثبت نشده است.
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="(variant, index) in state.variants"
                :key="`${index}-${variant.sku}`"
                class="space-y-4 rounded-xl border border-default p-4"
              >
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <p class="font-medium text-highlighted">
                      واریانت {{ index + 1 }}
                    </p>
                    <p class="text-xs text-muted">
                      SKU و قیمت هر واریانت را کامل وارد کن.
                    </p>
                  </div>
                  <UButton
                    type="button"
                    color="error"
                    variant="ghost"
                    icon="i-lucide-trash-2"
                    @click="removeVariant(index)"
                  >
                    حذف
                  </UButton>
                </div>

                <div class="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
                  <UFormField :name="`variants.${index}.name`" label="نام واریانت">
                    <UInput v-model="variant.name" class="w-full" placeholder="مثلا مشکی" />
                  </UFormField>

                  <UFormField :name="`variants.${index}.sku`" label="SKU واریانت">
                    <UInput v-model="variant.sku" class="w-full" dir="ltr" />
                  </UFormField>

                  <UFormField :name="`variants.${index}.barcode`" label="بارکد واریانت">
                    <UInput v-model="variant.barcode" class="w-full" dir="ltr" />
                  </UFormField>

                  <UFormField :name="`variants.${index}.price`" label="قیمت واریانت">
                    <UInput v-model.number="variant.price" type="number" min="0" class="w-full" />
                  </UFormField>

                  <UFormField :name="`variants.${index}.salePrice`" label="قیمت تخفیف واریانت">
                    <UInput v-model.number="variant.salePrice" type="number" min="0" class="w-full" />
                  </UFormField>
                </div>

                <div class="grid gap-4 lg:grid-cols-2">
                  <UFormField :name="`variants.${index}.stock`" label="موجودی واریانت">
                    <UInput v-model.number="variant.stock" type="number" min="0" class="w-full" />
                  </UFormField>

                  <UCheckbox v-model="variant.isActive" label="واریانت فعال باشد" />
                </div>

                <UFormField :name="`variants.${index}.image`" label="تصویر واریانت">
                  <BaseFilePicker v-model="variant.image" />
                </UFormField>
              </div>
            </div>
          </section>

          <section class="space-y-4 rounded-xl border border-default p-4">
            <div class="flex items-center justify-between gap-3 border-b border-default pb-3">
              <h3 class="font-semibold text-highlighted">مشخصات محصول</h3>
              <UButton
                type="button"
                color="primary"
                variant="outline"
                icon="i-lucide-plus"
                @click="addSpecification"
              >
                افزودن مشخصات
              </UButton>
            </div>
            <p class="text-xs text-muted">
              مشخصات به صورت جفت عنوان و مقدار ثبت می‌شوند؛ مثلا شارژر = دارد.
            </p>

            <div
              v-if="!state.specifications.length"
              class="rounded-lg border border-dashed border-default p-4 text-sm text-muted"
            >
              هنوز مشخصاتی برای این محصول ثبت نشده است.
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="(spec, index) in state.specifications"
                :key="`${index}-${spec.title}`"
                class="grid gap-4 rounded-xl border border-default p-4 lg:grid-cols-[1fr_1fr_auto]"
              >
                <UFormField :name="`specifications.${index}.title`" label="عنوان">
                  <UInput v-model="spec.title" class="w-full" placeholder="مثلا شارژر" />
                </UFormField>

                <UFormField :name="`specifications.${index}.value`" label="مقدار">
                  <UInput v-model="spec.value" class="w-full" placeholder="مثلا دارد" />
                </UFormField>

                <div class="flex items-end justify-end pb-1">
                  <UButton
                    type="button"
                    color="error"
                    variant="ghost"
                    icon="i-lucide-trash-2"
                    aria-label="حذف مشخصات"
                    @click="removeSpecification(index)"
                  />
                </div>
              </div>
            </div>
          </section>

          <section
            v-if="isEditing && hasRelatedEntities"
            class="space-y-4 rounded-xl border border-default p-4"
          >
            <div class="border-b border-default pb-3">
              <h3 class="font-semibold text-highlighted">روابط موجود محصول</h3>
              <p class="mt-1 text-xs text-muted">
                این اطلاعات از سرور دریافت می‌شود و برای بررسی relationهای فعلی محصول نمایش داده شده است.
              </p>
            </div>

            <div v-if="relatedTags.length" class="space-y-2">
              <p class="text-sm font-medium text-highlighted">تگ‌ها</p>
              <div class="flex flex-wrap gap-2">
                <UBadge
                  v-for="tagName in relatedTags"
                  :key="tagName"
                  color="neutral"
                  variant="subtle"
                >
                  {{ tagName }}
                </UBadge>
              </div>
            </div>

            <div v-if="relatedOptions.length" class="space-y-3">
              <p class="text-sm font-medium text-highlighted">آپشن‌ها</p>
              <div
                v-for="option in relatedOptions"
                :key="option.id"
                class="rounded-lg border border-default p-3"
              >
                <p class="mb-2 text-sm font-medium text-highlighted">
                  {{ option.name }}
                </p>
                <div class="flex flex-wrap gap-2">
                  <UBadge
                    v-for="optionValue in option.values"
                    :key="`${option.id}-${optionValue}`"
                    color="info"
                    variant="soft"
                  >
                    {{ optionValue }}
                  </UBadge>
                </div>
              </div>
            </div>

            <div v-if="relatedVariantValues.length" class="space-y-3">
              <p class="text-sm font-medium text-highlighted">مقدارهای واریانت</p>
              <div
                v-for="variant in relatedVariantValues"
                :key="variant.id"
                class="rounded-lg border border-default p-3"
              >
                <p class="mb-2 text-sm font-medium text-highlighted" dir="ltr">
                  {{ variant.sku }}
                </p>
                <div class="flex flex-wrap gap-2">
                  <UBadge
                    v-for="variantValue in variant.values"
                    :key="`${variant.id}-${variantValue}`"
                    color="warning"
                    variant="soft"
                  >
                    {{ variantValue }}
                  </UBadge>
                </div>
              </div>
            </div>
          </section>

          <section class="space-y-4 rounded-xl border border-default p-4">
            <div class="border-b border-default pb-3">
              <h3 class="font-semibold text-highlighted">سئو</h3>
            </div>

            <div class="grid gap-4 lg:grid-cols-2">
              <UFormField label="عنوان سئو" name="metaTitle">
                <UInput v-model="state.metaTitle" class="w-full" />
              </UFormField>

              <UFormField label="Canonical" name="canonical">
                <UInput v-model="state.canonical" class="w-full" dir="ltr" />
              </UFormField>
            </div>

            <UFormField label="توضیحات سئو" name="metaDescription">
              <UTextarea v-model="state.metaDescription" class="w-full" :rows="3" />
            </UFormField>

            <UFormField label="کلمات کلیدی" name="keywords">
              <UTextarea v-model="state.keywords" class="w-full" :rows="2" />
            </UFormField>
          </section>

          <div class="flex items-center justify-end gap-2 pt-2">
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              icon="i-lucide-x"
              :disabled="submitting"
              @click="closeModal"
            >
              انصراف
            </UButton>
            <UButton
              type="submit"
              :icon="isEditing ? 'i-lucide-save' : 'i-lucide-package-plus'"
              :loading="submitting"
            >
              {{ isEditing ? "ذخیره تغییرات" : "ایجاد محصول" }}
            </UButton>
          </div>
        </UForm>
      </div>
    </template>
  </UModal>
</template>
