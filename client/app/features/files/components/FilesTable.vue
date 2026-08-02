<script setup lang="ts">
import type { TFileItem } from "../types/index.type";

const props = defineProps<{
  files: TFileItem[];
  loading: boolean;
  submitting: boolean;
}>();

const emit = defineEmits<{
  delete: [file: TFileItem];
}>();

const config = useRuntimeConfig();
const currentPage = ref(1);
const itemsPerPage = 5;

const totalItems = computed(() => props.files.length);

const paginatedFiles = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return props.files.slice(start, start + itemsPerPage);
});

function formatSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** exponent;
  const formatted = value >= 10 ? value.toFixed(0) : value.toFixed(1);
  return `${formatted} ${units[exponent]}`;
}

function buildDownloadUrl(file: TFileItem): string {
  const apiBase = String(config.public.apiBase ?? "").replace(/\/+$/, "");
  return `${apiBase}/files/${file.id}`;
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
      <BasePageHeader title="لیست فایل‌ها" />
    </div>

    <BaseResponsiveDataView
      :loading="loading"
      :has-items="files.length > 0"
      empty-message="هنوز هیچ فایلی آپلود نشده است."
      desktop-table-min-width="min-w-[860px]"
    >
      <template #mobile-skeleton>
        <BaseCardSkeletonList>
          <template #item>
            <div class="space-y-2">
              <div class="h-4 w-2/3 rounded bg-default/40" />
              <div class="h-3 w-4/5 rounded bg-default/40" />
            </div>
            <div class="mt-4 grid grid-cols-2 gap-3">
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
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">نام فایل</th>
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">نوع</th>
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">حجم</th>
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">تاریخ</th>
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
              <div class="h-3 w-20 rounded bg-default/40" />
            </td>
            <td class="border-b border-default px-4 py-4">
              <div class="h-3 w-28 rounded bg-default/40" />
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
            v-for="file in paginatedFiles"
            :key="file.id"
            class="rounded-xl border border-default bg-default/20 p-4"
          >
            <p class="break-words font-semibold text-highlighted">
              {{ file.originalname }}
            </p>
            <p class="mt-2 text-xs text-muted">
              {{ file.mimetype }}
            </p>

            <div class="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div class="space-y-1">
                <p class="text-xs text-muted">حجم</p>
                <p class="text-toned">{{ formatSize(file.size) }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-xs text-muted">تاریخ</p>
                <p class="text-toned">{{ file.createdAt || "-" }}</p>
              </div>
            </div>

            <div class="mt-4 flex items-center justify-start gap-2">
              <UButton
                as="a"
                :href="buildDownloadUrl(file)"
                target="_blank"
                rel="noreferrer"
                color="neutral"
                variant="soft"
                size="sm"
                icon="i-lucide-download"
              >
                دانلود
              </UButton>
              <UButton
                color="error"
                variant="soft"
                size="sm"
                icon="i-lucide-trash-2"
                :loading="submitting"
                @click="emit('delete', file)"
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
                نام فایل
              </th>
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">
                نوع
              </th>
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">
                حجم
              </th>
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">
                تاریخ
              </th>
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="file in paginatedFiles"
              :key="file.id"
              class="transition-colors hover:bg-elevated/40"
            >
              <td class="border-b border-default px-4 py-4 font-medium text-highlighted">
                {{ file.originalname }}
              </td>
              <td class="border-b border-default px-4 py-4 text-toned">
                {{ file.mimetype }}
              </td>
              <td class="border-b border-default px-4 py-4 text-toned">
                {{ formatSize(file.size) }}
              </td>
              <td class="border-b border-default px-4 py-4 text-toned">
                {{ file.createdAt || "-" }}
              </td>
              <td class="border-b border-default px-4 py-4">
                <div class="flex items-center justify-start gap-2">
                  <UButton
                    as="a"
                    :href="buildDownloadUrl(file)"
                    target="_blank"
                    rel="noreferrer"
                    color="neutral"
                    variant="soft"
                    size="sm"
                    icon="i-lucide-download"
                  >
                    دانلود
                  </UButton>
                  <UButton
                    color="error"
                    variant="soft"
                    size="sm"
                    icon="i-lucide-trash-2"
                    :loading="submitting"
                    @click="emit('delete', file)"
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
      label="فایل"
    />
  </UCard>
</template>
