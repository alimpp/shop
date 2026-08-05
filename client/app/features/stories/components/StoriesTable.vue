<script setup lang="ts">
import type { TStory } from '../types/index.type';

const props = defineProps<{
  stories: TStory[];
  loading: boolean;
  submitting: boolean;
}>();

const emit = defineEmits(["edit", "remove"]);

const currentPage = ref(1);
const itemsPerPage = 5;

const totalItems = computed(() => props.stories.length);

const paginatedStories = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return props.stories.slice(start, start + itemsPerPage);
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
      <BasePageHeader title="لیست استوری‌ها" />
    </div>

    <BaseResponsiveDataView
      :loading="loading"
      :has-items="stories.length > 0"
      empty-message="هنوز هیچ استوری ثبت نشده است."
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
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">پیش‌نمایش</th>
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">مدت</th>
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">بازدید</th>
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">لیست بازدیدکنندگان</th>
            <th class="border-b border-default px-4 py-3 font-semibold text-toned">عملیات</th>
          </template>

          <template #row>
            <td class="border-b border-default px-4 py-4">
              <div class="h-20 w-36 rounded-xl bg-default/40" />
            </td>
            <td class="border-b border-default px-4 py-4">
              <div class="h-6 w-24 rounded bg-default/40" />
            </td>
            <td class="border-b border-default px-4 py-4">
              <div class="h-6 w-28 rounded bg-default/40" />
            </td>
            <td class="border-b border-default px-4 py-4">
              <div class="h-4 w-4/5 rounded bg-default/40" />
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
            v-for="story in paginatedStories"
            :key="story.id"
            class="rounded-xl border border-default bg-default/20 p-4"
          >
            <div class="overflow-hidden rounded-xl border border-default bg-default/30">
              <img
                :src="story.imageUrl"
                alt="Story image"
                class="h-44 w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div class="mt-4 flex flex-col gap-2">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="font-semibold text-highlighted">مدت نمایش</p>
                  <p class="text-sm text-toned">{{ story.duration }} ثانیه</p>
                </div>
                <UBadge color="primary" variant="soft">{{ story.visitorCount !== undefined ? story.visitorCount : story.visitors.length }} بازدید</UBadge>
              </div>
              <div>
                <p class="text-sm font-medium text-highlighted">بازدیدکنندگان</p>
                <p class="mt-1 text-xs text-muted">
                  {{ story.visitors.map((visitor) => visitor.fristname + ' ' + visitor.lastname).join('، ') || 'بدون بازدیدکننده' }}
                </p>
              </div>
            </div>

            <div class="mt-4 flex flex-wrap items-center gap-2">
              <UButton
                color="primary"
                variant="soft"
                size="sm"
                icon="i-lucide-pencil"
                @click="emit('edit', story)"
              >
                ویرایش
              </UButton>
              <UButton
                color="error"
                variant="soft"
                size="sm"
                icon="i-lucide-trash-2"
                :loading="submitting"
                @click="emit('remove', story)"
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
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">پیش‌نمایش</th>
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">مدت</th>
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">بازدید</th>
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">لیست بازدیدکنندگان</th>
              <th class="border-b border-default px-4 py-3 font-semibold text-toned">عملیات</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="story in paginatedStories"
              :key="story.id"
              class="transition-colors hover:bg-elevated/40"
            >
              <td class="border-b border-default px-4 py-4">
                <div class="h-20 w-36 overflow-hidden rounded-xl border border-default bg-default/30">
                  <img
                    :src="story.imageUrl"
                    alt="Story image"
                    class="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </td>
              <td class="border-b border-default px-4 py-4 text-toned">{{ story.duration }} ثانیه</td>
              <td class="border-b border-default px-4 py-4">
                <UBadge color="primary" variant="soft">{{ story.visitorCount !== undefined ? story.visitorCount : story.visitors.length }} بازدید</UBadge>
              </td>
              <td class="border-b border-default px-4 py-4 text-toned">
                <p class="max-w-[280px] truncate">
                  {{ story.visitors.map((visitor) => visitor.fristname + ' ' + visitor.lastname).join('، ') || 'بدون بازدیدکننده' }}
                </p>
              </td>
              <td class="border-b border-default px-4 py-4">
                <div class="flex items-center justify-start gap-2">
                  <UButton
                    color="primary"
                    variant="soft"
                    size="sm"
                    icon="i-lucide-pencil"
                    @click="emit('edit', story)"
                  >
                    ویرایش
                  </UButton>
                  <UButton
                    color="error"
                    variant="soft"
                    size="sm"
                    icon="i-lucide-trash-2"
                    :loading="submitting"
                    @click="emit('remove', story)"
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
      label="استوری"
    />
  </UCard>
</template>
