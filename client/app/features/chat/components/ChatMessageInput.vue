<script setup lang="ts">
import type { ChatMessageModel } from "../models/index.model";

const props = defineProps<{
  sending: boolean;
  replyTo?: ChatMessageModel | null;
}>();

const emit = defineEmits<{
  send: [content: string];
  cancelReply: [];
}>();

const inputText = ref("");
const textareaRef = ref<HTMLTextAreaElement | null>(null);

function handleSend(): void {
  const text = inputText.value.trim();
  if (!text || props.sending) return;

  emit("send", text);
  inputText.value = "";
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    handleSend();
  }
}

function autoResize(): void {
  if (!textareaRef.value) return;
  textareaRef.value.style.height = "auto";
  textareaRef.value.style.height = Math.min(textareaRef.value.scrollHeight, 120) + "px";
}

watch(inputText, () => {
  nextTick(autoResize);
});
</script>

<template>
  <div class="border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-3">
    <div
      v-if="replyTo"
      class="flex items-center gap-2 mb-2 px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border-r-2 border-primary-400"
    >
      <div class="flex-1 min-w-0">
        <div class="text-xs font-medium text-primary-600 dark:text-primary-400">
          پاسخ به {{ replyTo.sender?.displayName || "پیام" }}
        </div>
        <div class="text-xs text-neutral-500 dark:text-neutral-400 truncate">
          {{ replyTo.content || "پیام حذف شده" }}
        </div>
      </div>
      <button
        class="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
        @click="emit('cancelReply')"
      >
        <UIcon name="i-lucide-x" class="w-4 h-4" />
      </button>
    </div>

    <div class="flex items-end gap-2">
      <textarea
        ref="textareaRef"
        v-model="inputText"
        placeholder="پیام خود را بنویسید..."
        rows="1"
        class="flex-1 resize-none rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3.5 py-2.5 text-sm text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
        :disabled="sending"
        @keydown="handleKeydown"
      />

      <UButton
        color="primary"
        icon="i-lucide-send"
        :loading="sending"
        :disabled="!inputText.trim() || sending"
        class="shrink-0 rounded-xl px-3 py-2.5"
        @click="handleSend"
      />
    </div>
  </div>
</template>
