<script setup lang="ts">
import type { TComment } from "~/features/interactions/types/index.type";

defineProps<{
  comments: TComment[];
  commentCount: number;
  isLoggedIn: boolean;
  commentText: string;
  commentSubmitting: boolean;
  commentsLoading: boolean;
  commentsLoaded: boolean;
  hasMoreComments: boolean;
}>();

const emit = defineEmits<{
  "update:commentText": [value: string];
  submit: [];
  loadMore: [];
}>();

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("fa-IR");
}

function displayName(comment: TComment): string {
  const name = [comment.user?.fristname, comment.user?.lastname]
    .filter(Boolean)
    .join(" ")
    .trim();
  return name || "کاربر پرایم شاپ";
}
</script>

<template>
  <div class="rounded-2xl border border-default p-4 sm:p-6 lg:p-8">
    <h2 class="mb-6 flex items-center gap-2 text-lg font-black text-highlighted">
      <UIcon
        name="i-lucide-message-square"
        class="size-5 text-primary"
      />
      دیدگاه کاربران
      <span
        class="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary"
      >
        {{ commentCount }}
      </span>
    </h2>

    <div
      v-if="isLoggedIn"
      class="mb-8"
    >
      <PublicCommentTextarea
        :model-value="commentText"
        :loading="commentSubmitting"
        :disabled="commentSubmitting"
        @update:model-value="emit('update:commentText', $event)"
        @submit="emit('submit')"
      />
    </div>

    <div
      v-else
      class="mb-8 flex flex-col gap-3 rounded-xl border border-dashed border-default p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p class="text-sm text-toned">
        برای ثبت دیدگاه ابتدا وارد حساب شوید.
      </p>
      <UButton
        color="primary"
        variant="soft"
        size="sm"
        icon="i-lucide-log-in"
        class="w-full shrink-0 justify-center sm:w-auto"
        to="/auth/login-by-phone"
      >
        ورود
      </UButton>
    </div>

    <div
      v-if="commentsLoaded && comments.length === 0"
      class="flex flex-col items-center gap-3 py-10 text-center"
    >
      <UIcon
        name="i-lucide-message-square-off"
        class="size-10 text-toned"
      />
      <p class="text-sm text-toned">
        کامنتی وجود ندارد. اولین نفری باشید که دیدگاهی ثبت می‌کند.
      </p>
    </div>

    <div
      v-else
      class="space-y-4"
    >
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="rounded-xl border border-default p-4"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="flex size-9 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
              <img
                v-if="comment.user?.avatarUrl"
                :src="comment.user.avatarUrl"
                :alt="displayName(comment)"
                class="size-full object-cover"
              />
              <UIcon
                v-else
                name="i-lucide-user-round"
                class="size-4"
              />
            </span>
            <span class="text-sm font-semibold text-highlighted">
              {{ displayName(comment) }}
            </span>
          </div>
          <span class="text-xs text-toned">
            {{ formatDate(comment.createdAt) }}
          </span>
        </div>
        <p class="mt-3 text-sm leading-7 text-highlighted">
          {{ comment.content }}
        </p>
      </div>

      <div
        v-if="hasMoreComments"
        class="flex justify-center pt-2"
      >
        <UButton
          color="neutral"
          variant="outline"
          :loading="commentsLoading"
          icon="i-lucide-chevrons-down"
          @click="emit('loadMore')"
        >
          نمایش دیدگاه های بیشتر
        </UButton>
      </div>
    </div>
  </div>
</template>
