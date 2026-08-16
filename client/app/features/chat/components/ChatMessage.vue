<script setup lang="ts">
import type { ChatMessageModel } from "../models/index.model";

const props = defineProps<{
  message: ChatMessageModel;
  isOwnMessage: boolean;
  showSender?: boolean;
  canDelete?: boolean;
}>();

const emit = defineEmits<{
  reply: [message: ChatMessageModel];
  delete: [message: ChatMessageModel];
}>();

const allowDelete = computed(() => props.canDelete ?? true);

const senderName = computed(() => {
  if (!props.message.sender) return "ناشناس";
  return props.message.sender.displayName;
});

const senderInitial = computed(() => {
  return senderName.value.charAt(0);
});
</script>

<template>
  <div
    class="flex gap-2 px-4 py-1.5"
    :class="isOwnMessage ? 'flex-row-reverse' : 'flex-row'"
  >
    <div
      class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium mt-1"
      :class="
        isOwnMessage
          ? 'bg-primary-500 text-white'
          : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
      "
    >
      {{ senderInitial }}
    </div>

    <div class="flex flex-col max-w-[70%]" :class="isOwnMessage ? 'items-end' : 'items-start'">
      <div v-if="showSender" class="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5 px-1">
        {{ senderName }}
      </div>

      <div v-if="message.replyTo && !message.isDeleted" class="mb-1">
        <div
          class="rounded-lg px-3 py-1.5 text-xs border-r-2"
          :class="
            isOwnMessage
              ? 'bg-primary-100 dark:bg-primary-900/30 border-primary-400 text-primary-700 dark:text-primary-300'
              : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-400 dark:border-neutral-500 text-neutral-600 dark:text-neutral-400'
          "
        >
          <span v-if="message.replyTo.isDeleted" class="italic">پیام حذف شده</span>
          <span v-else class="line-clamp-2">{{ message.replyTo.content }}</span>
        </div>
      </div>

      <div
        class="rounded-2xl px-3.5 py-2 text-sm leading-relaxed break-words"
        :class="
          message.isDeleted
            ? 'italic text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800'
            : isOwnMessage
              ? 'bg-primary-500 text-white'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
        "
      >
        <span v-if="message.isDeleted">پیام حذف شده</span>
        <span v-else>{{ message.content }}</span>
      </div>

      <div class="flex items-center gap-1.5 mt-0.5 px-1">
        <span class="text-[10px] text-neutral-400 dark:text-neutral-500">
          {{ message.formattedTime }}
        </span>

        <button
          v-if="!message.isDeleted"
          class="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          @click="emit('reply', message)"
        >
          <UIcon name="i-lucide-reply" class="w-3 h-3" />
        </button>

        <button
          v-if="!message.isDeleted && allowDelete"
          class="text-neutral-400 hover:text-red-500 transition-colors"
          @click="emit('delete', message)"
        >
          <UIcon name="i-lucide-trash-2" class="w-3 h-3" />
        </button>
      </div>
    </div>
  </div>
</template>
