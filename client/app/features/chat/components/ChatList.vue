<script setup lang="ts">
import type { ChatModel } from "../models/index.model";

const props = defineProps<{
  chats: ChatModel[];
  loading: boolean;
  selectedChatId?: string;
}>();

const emit = defineEmits<{
  select: [chat: ChatModel];
}>();

function getSenderName(chat: ChatModel): string {
  if (chat.user) {
    return [chat.user.fristname, chat.user.lastname].filter(Boolean).join(" ") || "ناشناس";
  }
  return chat.subject || "ناشناس";
}

function getSenderInitial(chat: ChatModel): string {
  return getSenderName(chat).charAt(0);
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div v-if="loading" class="flex items-center justify-center py-12">
      <UIcon name="i-lucide-loader-2" class="w-5 h-5 animate-spin text-primary-500" />
    </div>

    <div v-else-if="chats.length === 0" class="flex flex-col items-center justify-center py-12 text-neutral-400 dark:text-neutral-500">
      <UIcon name="i-lucide-inbox" class="w-10 h-10 mb-2 opacity-50" />
      <p class="text-sm">چتی یافت نشد</p>
    </div>

    <div v-else class="flex-1 overflow-y-auto">
      <button
        v-for="chat in chats"
        :key="chat.id"
        class="w-full flex items-center gap-3 px-4 py-3 text-right transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800 border-b border-neutral-100 dark:border-neutral-800"
        :class="selectedChatId === chat.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''"
        @click="emit('select', chat)"
      >
        <div class="relative shrink-0">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
          >
            {{ getSenderInitial(chat) }}
          </div>
          <div
            v-if="chat.unseenCount > 0"
            class="absolute -top-1 -left-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-500 px-1 text-[10px] font-bold text-white"
          >
            {{ chat.unseenCount > 99 ? "99+" : chat.unseenCount }}
          </div>
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2">
            <span
              class="text-sm truncate"
              :class="
                chat.unseenCount > 0 || chat.hasUnseen
                  ? 'font-semibold text-neutral-900 dark:text-neutral-100'
                  : 'font-medium text-neutral-800 dark:text-neutral-200'
              "
            >
              {{ getSenderName(chat) }}
            </span>
            <span class="text-[10px] text-neutral-400 dark:text-neutral-500 shrink-0">
              {{ chat.formattedDate }}
            </span>
          </div>

          <div class="flex items-center justify-between gap-2 mt-0.5">
            <span class="text-xs text-neutral-500 dark:text-neutral-400 truncate">
              {{ chat.lastMessage?.content || chat.subject || "بدون پیام" }}
            </span>
            <UBadge
              v-if="chat.status === 'closed'"
              color="neutral"
              variant="outline"
              size="xs"
            >
              بسته شده
            </UBadge>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>
