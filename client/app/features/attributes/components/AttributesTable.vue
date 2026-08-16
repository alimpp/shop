<script setup lang="ts">
import type { TAttribute, TAttributeValue } from "../types/index.type";

const props = defineProps<{
  attributes: TAttribute[];
  loading: boolean;
  submitting: boolean;
}>();

const emit = defineEmits<{
  edit: [attribute: TAttribute];
  delete: [attribute: TAttribute];
  "add-value": [attribute: TAttribute];
  "edit-value": [attribute: TAttribute, value: TAttributeValue];
  "delete-value": [attribute: TAttribute, value: TAttributeValue];
}>();

const currentPage = ref(1);
const itemsPerPage = 5;

const totalItems = computed(() => props.attributes.length);

const paginatedAttributes = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return props.attributes.slice(start, start + itemsPerPage);
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
      <BasePageHeader title="لیست ویژگی‌ها" />
    </div>

    <BaseResponsiveDataView
      :loading="loading"
      :has-items="attributes.length > 0"
      empty-message="هنوز هیچ ویژگی‌ای ثبت نشده است."
      desktop-table-min-width="min-w-[1080px]"
    >
      <template #mobile-skeleton>
        <BaseCardSkeletonList>
          <template #item>
            <div class="flex items-center justify-between gap-3">
              <div class="h-4 w-2/3 rounded bg-default/40" />
              <div class="h-6 w-20 rounded bg-default/40" />
            </div>
            <div class="mt-3 grid grid-cols-2 gap-3">
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
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">ویژگی</th>
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">اسلاگ</th>
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">فیلتر</th>
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">ترتیب</th>
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">مقادیر</th>
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">عملیات</th>
          </template>

          <template #row>
            <td class="border-b border-default px-4 py-4">
              <div class="space-y-2">
                <div class="h-4 w-2/3 rounded bg-default/40" />
                <div class="h-3 w-1/3 rounded bg-default/40" />
              </div>
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
              <div class="h-3 w-2/3 rounded bg-default/40" />
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
            v-for="attribute in paginatedAttributes"
            :key="attribute.id"
            class="rounded-xl border border-default bg-default/20 p-4"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="truncate font-semibold text-highlighted">
                  {{ attribute.name }}
                </p>
                <p class="mt-1 truncate text-xs text-muted" dir="ltr">
                  {{ attribute.slug }}
                </p>
              </div>
              <UBadge :color="attribute.isFilterable ? 'success' : 'neutral'" variant="soft">
                {{ attribute.isFilterable ? "قابل فیلتر" : "غیرفعال" }}
              </UBadge>
            </div>

            <div class="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div class="space-y-1">
                <p class="text-xs text-muted">ترتیب</p>
                <p class="text-toned">{{ attribute.sortOrder }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-xs text-muted">تعداد مقدار</p>
                <p class="text-toned">{{ attribute.values.length }}</p>
              </div>
            </div>

            <div class="mt-3">
              <div v-if="attribute.values.length" class="flex flex-wrap gap-2">
                <div
                  v-for="value in attribute.values"
                  :key="value.id"
                  class="flex items-center gap-1 rounded-full border border-default bg-default/40 px-2 py-1"
                >
                  <span class="text-xs text-toned">
                    {{ value.value }}
                  </span>
                  <UButton
                    color="neutral"
                    variant="ghost"
                    size="sm"
                    icon="i-lucide-pencil"
                    :disabled="submitting"
                    @click="emit('edit-value', attribute, value)"
                  />
                  <UButton
                    color="error"
                    variant="ghost"
                    size="sm"
                    icon="i-lucide-trash-2"
                    :disabled="submitting"
                    @click="emit('delete-value', attribute, value)"
                  />
                </div>
              </div>
              <div v-else class="text-sm text-muted">
                هنوز مقداری برای این ویژگی ثبت نشده است.
              </div>
            </div>

            <div class="mt-4 flex flex-wrap items-center justify-start gap-2">
              <UButton
                color="primary"
                variant="outline"
                size="sm"
                icon="i-lucide-plus"
                :disabled="submitting"
                @click="emit('add-value', attribute)"
              >
                افزودن مقدار
              </UButton>
              <UButton
                color="primary"
                variant="soft"
                size="sm"
                icon="i-lucide-pencil"
                @click="emit('edit', attribute)"
              >
                ویرایش
              </UButton>
              <UButton
                color="error"
                variant="soft"
                size="sm"
                icon="i-lucide-trash-2"
                :loading="submitting"
                @click="emit('delete', attribute)"
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
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">ویژگی</th>
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">اسلاگ</th>
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">فیلتر</th>
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">ترتیب</th>
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">مقادیر</th>
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">عملیات</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="attribute in paginatedAttributes"
              :key="attribute.id"
              class="align-top transition-colors hover:bg-elevated/40"
            >
              <td class="border-b border-default px-4 py-4">
                <div class="space-y-1">
                  <p class="font-medium text-highlighted">
                    {{ attribute.name }}
                  </p>
                  <p class="text-xs text-muted">
                    {{ attribute.values.length }} مقدار ثبت شده
                  </p>
                </div>
              </td>
              <td class="border-b border-default px-4 py-4 text-toned" dir="ltr">
                {{ attribute.slug }}
              </td>
              <td class="border-b border-default px-4 py-4">
                <UBadge :color="attribute.isFilterable ? 'success' : 'neutral'" variant="soft">
                  {{ attribute.isFilterable ? "قابل فیلتر" : "غیرفعال" }}
                </UBadge>
              </td>
              <td class="border-b border-default px-4 py-4 text-toned">
                {{ attribute.sortOrder }}
              </td>
              <td class="border-b border-default px-4 py-4">
                <div v-if="attribute.values.length" class="flex max-w-[520px] flex-wrap gap-2">
                  <div
                    v-for="value in attribute.values"
                    :key="value.id"
                    class="flex items-center gap-1 rounded-full border border-default bg-default/40 px-2 py-1"
                  >
                    <span class="text-xs text-toned">
                      {{ value.value }}
                    </span>
                    <UButton
                      color="neutral"
                      variant="ghost"
                      size="sm"
                      icon="i-lucide-pencil"
                      :disabled="submitting"
                      @click="emit('edit-value', attribute, value)"
                    />
                    <UButton
                      color="error"
                      variant="ghost"
                      size="sm"
                      icon="i-lucide-trash-2"
                      :disabled="submitting"
                      @click="emit('delete-value', attribute, value)"
                    />
                  </div>
                </div>
                <div v-else class="text-sm text-muted">
                  هنوز مقداری برای این ویژگی ثبت نشده است.
                </div>
              </td>
              <td class="border-b border-default px-4 py-4">
                <div class="flex flex-wrap items-center justify-start gap-2">
                  <UButton
                    color="primary"
                    variant="outline"
                    size="sm"
                    icon="i-lucide-plus"
                    :disabled="submitting"
                    @click="emit('add-value', attribute)"
                  >
                    افزودن مقدار
                  </UButton>
                  <UButton
                    color="primary"
                    variant="soft"
                    size="sm"
                    icon="i-lucide-pencil"
                    @click="emit('edit', attribute)"
                  >
                    ویرایش
                  </UButton>
                  <UButton
                    color="error"
                    variant="soft"
                    size="sm"
                    icon="i-lucide-trash-2"
                    :loading="submitting"
                    @click="emit('delete', attribute)"
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
      label="ویژگی"
    />
  </UCard>
</template>
