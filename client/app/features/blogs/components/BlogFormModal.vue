<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import { productsController } from "~/features/products/controllers/index.controller";
import type { TProduct } from "~/features/products/types/index.type";
import type { TBlog, TBlogPayload, TBlogSectionPayload, TBlogStatus } from "../types/index.type";

interface TBlogFormState {
  title: string;
  slug: string;
  summary: string;
  coverImage: string;
  status: TBlogStatus;
  isActive: boolean;
  isFeatured: boolean;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  canonical: string;
  ogImage: string;
  sections: TBlogSectionPayload[];
  productIds: string[];
}

const props = defineProps<{
  open: boolean;
  blog: TBlog | null;
  submitting: boolean;
}>();

const emit = defineEmits<{
  (event: "update:open", value: boolean): void;
  (event: "submit", payload: TBlogPayload, id: string | null): void;
}>();

const sectionSchema = z.object({
  title: z.string().trim().min(1, "عنوان بخش الزامی است").max(255, "عنوان بخش باید حداکثر ۲۵۵ کاراکتر باشد"),
  description: z.string().trim().min(1, "توضیحات بخش الزامی است"),
  imageUrl: z.string().trim().max(500, "آدرس تصویر بخش باید حداکثر ۵۰۰ کاراکتر باشد").optional(),
});

const blogSchema = z.object({
  title: z.string().trim().min(3, "عنوان باید حداقل ۳ کاراکتر باشد").max(200, "عنوان باید حداکثر ۲۰۰ کاراکتر باشد"),
  slug: z.string().trim().max(220, "اسلاگ باید حداکثر ۲۲۰ کاراکتر باشد").optional(),
  summary: z.string().trim().min(1, "توضیحات الزامی است"),
  coverImage: z.string().trim().min(1, "آدرس تصویر الزامی است").max(500, "آدرس تصویر باید حداکثر ۵۰۰ کاراکتر باشد"),
  status: z.enum(["draft", "published", "archived"]),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  metaTitle: z.string().max(255, "عنوان سئو باید حداکثر ۲۵۵ کاراکتر باشد").optional(),
  metaDescription: z.string().max(4000, "توضیحات سئو باید حداکثر ۴۰۰۰ کاراکتر باشد").optional(),
  keywords: z.string().max(4000, "کلمات کلیدی باید حداکثر ۴۰۰۰ کاراکتر باشد").optional(),
  canonical: z.string().max(500, "Canonical باید حداکثر ۵۰۰ کاراکتر باشد").optional(),
  ogImage: z.string().max(2048, "آدرس تصویر OG باید حداکثر ۲۰۴۸ کاراکتر باشد").optional(),
  sections: z.array(sectionSchema).max(50, "حداکثر ۵۰ بخش مجاز است"),
  productIds: z.array(z.string()).max(10, "حداکثر ۱۰ محصول مجاز است"),
});

type BlogSchema = z.output<typeof blogSchema>;

const state = reactive<TBlogFormState>({
  title: "",
  slug: "",
  summary: "",
  coverImage: "",
  status: "draft",
  isActive: true,
  isFeatured: false,
  metaTitle: "",
  metaDescription: "",
  keywords: "",
  canonical: "",
  ogImage: "",
  sections: [],
  productIds: [],
});

const products = ref<TProduct[]>([]);
const productsLoading = ref(false);

const modalOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit("update:open", value),
});

const isEditing = computed(() => Boolean(props.blog?.id));

async function fetchProducts(): Promise<void> {
  if (products.value.length > 0) {
    return;
  }

  productsLoading.value = true;
  const response = await productsController.getProducts({ limit: 100 });

  if (response.success) {
    products.value = response.data;
  }

  productsLoading.value = false;
}

function resetState(): void {
  state.title = "";
  state.slug = "";
  state.summary = "";
  state.coverImage = "";
  state.status = "draft";
  state.isActive = true;
  state.isFeatured = false;
  state.metaTitle = "";
  state.metaDescription = "";
  state.keywords = "";
  state.canonical = "";
  state.ogImage = "";
  state.sections = [];
  state.productIds = [];
}

function syncState(blog: TBlog | null): void {
  if (!blog) {
    resetState();
    return;
  }

  state.title = blog.title;
  state.slug = blog.slug;
  state.summary = blog.summary;
  state.coverImage = blog.coverImage;
  state.status = blog.status;
  state.isActive = blog.isActive;
  state.isFeatured = blog.isFeatured;
  state.metaTitle = blog.metaTitle ?? "";
  state.metaDescription = blog.metaDescription ?? "";
  state.keywords = blog.keywords ?? "";
  state.canonical = blog.canonical ?? "";
  state.ogImage = blog.ogImage ?? "";
  state.sections = blog.sections.map((section) => ({
    title: section.title,
    description: section.description,
    imageUrl: section.imageUrl ?? "",
  }));
  state.productIds = blog.products.map((product) => product.id);
}

function addSection(): void {
  state.sections.push({
    title: "",
    description: "",
    imageUrl: "",
  });
}

function removeSection(index: number): void {
  state.sections.splice(index, 1);
}

function normalizePayload(data: BlogSchema): TBlogPayload {
  return {
    title: data.title.trim(),
    slug: data.slug ? data.slug.trim() : undefined,
    summary: data.summary.trim(),
    coverImage: data.coverImage.trim(),
    status: data.status,
    isActive: data.isActive,
    isFeatured: data.isFeatured,
    metaTitle: data.metaTitle?.trim() || undefined,
    metaDescription: data.metaDescription?.trim() || undefined,
    keywords: data.keywords?.trim() || undefined,
    canonical: data.canonical?.trim() || undefined,
    ogImage: data.ogImage?.trim() || undefined,
    sections: data.sections.map((section) => ({
      title: section.title.trim(),
      description: section.description.trim(),
      imageUrl: section.imageUrl?.trim() || undefined,
    })),
    productIds: data.productIds,
  };
}

function closeModal(): void {
  modalOpen.value = false;
}

function handleSubmit(event: FormSubmitEvent<BlogSchema>): void {
  emit("submit", normalizePayload(event.data), props.blog?.id ?? null);
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      syncState(props.blog);
      fetchProducts();
    }
  },
  { immediate: true },
);
</script>

<template>
  <UModal v-model:open="modalOpen" :title="isEditing ? 'ویرایش بلاگ' : 'ایجاد بلاگ'">
    <template #body>
      <UForm
        :schema="blogSchema"
        :state="state"
        class="space-y-4"
        @submit="handleSubmit"
      >
        <section class="space-y-4 rounded-xl border border-default p-4">
          <div class="border-b border-default pb-3">
            <h3 class="font-semibold text-highlighted">مشخصات اصلی</h3>
          </div>

          <UFormField label="عنوان" name="title">
            <UInput v-model="state.title" class="w-full" placeholder="عنوان بلاگ" />
          </UFormField>

          <UFormField label="اسلاگ" name="slug" hint="در صورت خالی بودن، به‌صورت خودکار از عنوان ساخته می‌شود">
            <UInput v-model="state.slug" class="w-full" dir="ltr" placeholder="my-blog-slug" />
          </UFormField>

          <UFormField label="توضیحات" name="summary">
            <UTextarea v-model="state.summary" class="w-full" :rows="3" placeholder="خلاصه‌ای از بلاگ" />
          </UFormField>

          <UFormField label="تصویر کاور" name="coverImage">
            <BaseFilePicker v-model="state.coverImage" />
          </UFormField>

          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="وضعیت" name="status">
              <USelect
                v-model="state.status"
                :items="[
                  { label: 'پیش‌نویس', value: 'draft' },
                  { label: 'منتشر شده', value: 'published' },
                  { label: 'آرشیو', value: 'archived' },
                ]"
                value-attribute="value"
                option-attribute="label"
                class="w-full"
              />
            </UFormField>

            <div class="flex flex-col gap-3 pt-1">
              <UCheckbox v-model="state.isActive" label="بلاگ فعال باشد" />
              <UCheckbox v-model="state.isFeatured" label="بلاگ ویژه باشد" />
            </div>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-default p-4">
          <div class="flex items-center justify-between border-b border-default pb-3">
            <h3 class="font-semibold text-highlighted">بخش‌ها</h3>
            <UButton
              type="button"
              color="primary"
              variant="soft"
              size="sm"
              icon="i-lucide-plus"
              @click="addSection"
            >
              افزودن بخش
            </UButton>
          </div>

          <div v-if="state.sections.length === 0" class="rounded-lg border border-dashed border-default p-4 text-center text-sm text-muted">
            هنوز هیچ بخشی اضافه نشده است.
          </div>

          <div
            v-for="(section, index) in state.sections"
            :key="index"
            class="space-y-3 rounded-lg border border-default p-3"
          >
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium text-highlighted">بخش {{ index + 1 }}</p>
              <UButton
                type="button"
                color="error"
                variant="ghost"
                size="xs"
                icon="i-lucide-trash-2"
                @click="removeSection(index)"
              >
                حذف
              </UButton>
            </div>

            <UFormField label="عنوان بخش" :name="`sections.${index}.title`">
              <UInput v-model="section.title" class="w-full" />
            </UFormField>

            <UFormField label="توضیحات بخش" :name="`sections.${index}.description`">
              <UTextarea v-model="section.description" class="w-full" :rows="2" />
            </UFormField>

            <UFormField label="تصویر بخش" :name="`sections.${index}.imageUrl`">
              <BaseFilePicker v-model="section.imageUrl" />
            </UFormField>
          </div>
        </section>

        <section class="space-y-4 rounded-xl border border-default p-4">
          <div class="border-b border-default pb-3">
            <h3 class="font-semibold text-highlighted">محصولات مرتبط</h3>
          </div>

          <UFormField label="انتخاب محصولات" name="productIds" hint="بلاگ‌هایی که درباره یک محصول فروشگاه نوشته می‌شوند">
            <USelectMenu
              v-model="state.productIds"
              :items="products"
              value-attribute="id"
              option-attribute="name"
              multiple
              searchable
              :loading="productsLoading"
              placeholder="محصولات مرتبط را انتخاب کنید"
              class="w-full"
            />
          </UFormField>
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

          <UFormField label="تصویر OG" name="ogImage">
            <BaseFilePicker v-model="state.ogImage" />
          </UFormField>
        </section>

        <div class="grid grid-cols-2 gap-3 pt-2">
          <UButton
            type="button"
            color="neutral"
            variant="outline"
            icon="i-lucide-x"
            class="w-full justify-center"
            :disabled="submitting"
            @click="closeModal"
          >
            انصراف
          </UButton>
          <UButton
            type="submit"
            :icon="isEditing ? 'i-lucide-save' : 'i-lucide-file-plus-2'"
            class="w-full justify-center"
            :loading="submitting"
          >
            {{ isEditing ? 'ذخیره تغییرات' : 'ایجاد بلاگ' }}
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
