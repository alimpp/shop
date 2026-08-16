<script setup lang="ts">
import { chatController } from "../controllers/index.controller";
import { ChatDS } from "../data/index.store";
import type { ChatMessageModel } from "../models/index.model";
import ChatMessage from "./ChatMessage.vue";
import ChatMessageInput from "./ChatMessageInput.vue";

const props = defineProps<{
  chatId: string;
  currentUserId: string;
  isAdmin?: boolean;
}>();

const chatDS = ChatDS.getInstance();
const toast = useToast();

const messages = computed(() => chatDS.getMessages);
const loading = computed(() => chatDS.getMessagesLoading);
const sending = computed(() => chatDS.getSending);
const replyToMessage = ref<ChatMessageModel | null>(null);

let pollTimer: ReturnType<typeof setInterval> | null = null;

function isOwnMessage(message: ChatMessageModel): boolean {
  if (!message.sender) return false;
  return message.sender.id === props.currentUserId;
}

function shouldShowSender(index: number): boolean {
  if (index === 0) return true;
  const current = messages.value[index];
  const prev = messages.value[index - 1];
  if (!current?.sender || !prev?.sender) return true;
  return current.sender.id !== prev.sender.id;
}

function handleReply(message: ChatMessageModel): void {
  replyToMessage.value = message;
}

function handleCancelReply(): void {
  replyToMessage.value = null;
}

async function handleSend(content: string): Promise<void> {
  const payload: { content: string; replyToId?: string } = { content };
  if (replyToMessage.value) {
    payload.replyToId = replyToMessage.value.id;
  }

  const response = await chatController.sendMessage(props.chatId, payload);

  if (!response.success) {
    toast.add({
      title: response.message || "ارسال پیام ناموفق بود",
      color: "error",
    });
    return;
  }

  replyToMessage.value = null;
  scrollToBottom();
}

async function handleDeleteMessage(message: ChatMessageModel): Promise<void> {
  const response = await chatController.deleteMessage(props.chatId, message.id);

  if (!response.success) {
    toast.add({
      title: response.message || "حذف پیام ناموفق بود",
      color: "error",
    });
  }
}

async function fetchMessages(silent = false): Promise<void> {
  const response = await chatController.getMessages(
    props.chatId,
    { limit: 100 },
    { silent }
  );

  if (!silent && !response.success) {
    toast.add({
      title: response.message || "دریافت پیام‌ها ناموفق بود",
      color: "error",
    });
  }
}

async function markAsRead(): Promise<void> {
  await chatController.markAsRead(props.chatId);
}

function scrollToBottom(): void {
  nextTick(() => {
    const container = document.getElementById("chat-messages-container");
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  });
}

function stopPolling(): void {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

function startPolling(): void {
  stopPolling();
  pollTimer = setInterval(async () => {
    await fetchMessages(true);
  }, 10000);
}

async function bootstrapRoom(): Promise<void> {
  chatDS.setMessages([]);
  replyToMessage.value = null;
  await fetchMessages(false);
  await markAsRead();
  scrollToBottom();
  startPolling();
}

watch(
  () => messages.value.length,
  () => {
    scrollToBottom();
  }
);

watch(
  () => props.chatId,
  async () => {
    await bootstrapRoom();
  }
);

onMounted(async () => {
  await bootstrapRoom();
});

onUnmounted(() => {
  stopPolling();
  chatDS.setMessages([]);
});
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <div
      id="chat-messages-container"
      class="min-h-0 flex-1 overflow-y-auto py-3"
    >
      <div v-if="loading" class="flex h-full items-center justify-center">
        <UIcon
          name="i-lucide-loader-2"
          class="h-6 w-6 animate-spin text-primary-500"
        />
      </div>

      <div
        v-else-if="messages.length === 0"
        class="flex h-full items-center justify-center"
      >
        <div class="text-center text-neutral-400 dark:text-neutral-500">
          <UIcon
            name="i-lucide-message-circle"
            class="mx-auto mb-2 h-12 w-12 opacity-50"
          />
          <p class="text-sm">هنوز پیامی وجود ندارد</p>
        </div>
      </div>

      <div v-else class="space-y-1">
        <ChatMessage
          v-for="(message, index) in messages"
          :key="message.id"
          :message="message"
          :is-own-message="isOwnMessage(message)"
          :show-sender="shouldShowSender(index)"
          :can-delete="isAdmin || isOwnMessage(message)"
          @reply="handleReply"
          @delete="handleDeleteMessage"
        />
      </div>
    </div>

    <ChatMessageInput
      :sending="sending"
      :reply-to="replyToMessage"
      @send="handleSend"
      @cancel-reply="handleCancelReply"
    />
  </div>
</template>
