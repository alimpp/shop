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

const messagesContainer = ref<HTMLElement | null>(null);
const bottomAnchor = ref<HTMLElement | null>(null);
const showScrollToBottom = ref(false);
const stickToBottom = ref(true);

const BOTTOM_THRESHOLD = 96;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let forceScrollOnNextUpdate = false;
let scrollSettleTimers: ReturnType<typeof setTimeout>[] = [];

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

function isNearBottom(): boolean {
  const el = messagesContainer.value;
  if (!el) return true;
  return el.scrollHeight - el.scrollTop - el.clientHeight <= BOTTOM_THRESHOLD;
}

function clearScrollSettleTimers(): void {
  scrollSettleTimers.forEach((timer) => clearTimeout(timer));
  scrollSettleTimers = [];
}

function scrollToBottom(smooth = true): void {
  const el = messagesContainer.value;
  const anchor = bottomAnchor.value;

  if (anchor) {
    anchor.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
      block: "end",
    });
  } else if (el) {
    el.scrollTo({
      top: el.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
  }

  stickToBottom.value = true;
  showScrollToBottom.value = false;
}

async function scrollToBottomReliable(smooth = true): Promise<void> {
  clearScrollSettleTimers();
  forceScrollOnNextUpdate = false;
  stickToBottom.value = true;
  showScrollToBottom.value = false;

  await nextTick();

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });

  // First jump so long threads don't flash the top
  scrollToBottom(false);

  if (smooth) {
    scrollSettleTimers.push(
      setTimeout(() => scrollToBottom(true), 40),
      setTimeout(() => scrollToBottom(true), 160),
      setTimeout(() => {
        if (!isNearBottom()) {
          scrollToBottom(false);
        }
        showScrollToBottom.value = !isNearBottom();
      }, 420)
    );
  } else {
    scrollSettleTimers.push(
      setTimeout(() => scrollToBottom(false), 50),
      setTimeout(() => scrollToBottom(false), 150)
    );
  }
}

function handleMessagesScroll(): void {
  const near = isNearBottom();
  stickToBottom.value = near;
  showScrollToBottom.value = !near && messages.value.length > 0 && !loading.value;
}

function handleScrollToBottomClick(): void {
  scrollToBottomReliable(true);
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

  forceScrollOnNextUpdate = true;
  stickToBottom.value = true;

  const response = await chatController.sendMessage(props.chatId, payload);

  if (!response.success) {
    forceScrollOnNextUpdate = false;
    toast.add({
      title: response.message || "ارسال پیام ناموفق بود",
      color: "error",
    });
    return;
  }

  replyToMessage.value = null;
  await scrollToBottomReliable(true);
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
    { limit: 200 },
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

function stopPolling(): void {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

function startPolling(): void {
  stopPolling();
  pollTimer = setInterval(async () => {
    const wasNearBottom = isNearBottom();
    await fetchMessages(true);
    if (wasNearBottom || stickToBottom.value) {
      await scrollToBottomReliable(true);
    } else {
      showScrollToBottom.value = true;
    }
  }, 10000);
}

async function bootstrapRoom(): Promise<void> {
  clearScrollSettleTimers();
  chatDS.setMessages([]);
  replyToMessage.value = null;
  showScrollToBottom.value = false;
  stickToBottom.value = true;
  forceScrollOnNextUpdate = true;

  await fetchMessages(false);
  await markAsRead();
  await scrollToBottomReliable(true);
  startPolling();
}

watch(
  () => messages.value.length,
  async (length, previousLength) => {
    if (!length || loading.value) return;

    const grew = length > (previousLength ?? 0);
    if (forceScrollOnNextUpdate || stickToBottom.value || (grew && isNearBottom())) {
      await scrollToBottomReliable(true);
      return;
    }

    if (grew) {
      showScrollToBottom.value = true;
    }
  }
);

watch(loading, async (isLoading, wasLoading) => {
  if (wasLoading && !isLoading && messages.value.length > 0) {
    await scrollToBottomReliable(true);
  }
});

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
  clearScrollSettleTimers();
  chatDS.setMessages([]);
});
</script>

<template>
  <div class="relative flex h-full min-h-0 flex-col bg-default/40">
    <div
      ref="messagesContainer"
      class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 py-4"
      style="scroll-behavior: smooth"
      @scroll.passive="handleMessagesScroll"
    >
      <div v-if="loading" class="flex h-full items-center justify-center">
        <UIcon
          name="i-lucide-loader-2"
          class="size-6 animate-spin text-primary"
        />
      </div>

      <div
        v-else-if="messages.length === 0"
        class="flex h-full items-center justify-center px-6"
      >
        <div class="text-center">
          <div
            class="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-elevated ring-1 ring-default"
          >
            <UIcon
              name="i-lucide-messages-square"
              class="size-7 text-toned"
            />
          </div>
          <p class="text-sm font-medium text-highlighted">هنوز پیامی نیست</p>
          <p class="mt-1 text-xs text-toned">اولین پیام را ارسال کنید</p>
        </div>
      </div>

      <div v-else class="space-y-0.5">
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
        <div ref="bottomAnchor" class="h-px w-full shrink-0" aria-hidden="true" />
      </div>
    </div>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-2 opacity-0 scale-90"
      enter-to-class="translate-y-0 opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100 scale-100"
      leave-to-class="translate-y-2 opacity-0 scale-90"
    >
      <button
        v-if="showScrollToBottom"
        type="button"
        class="absolute bottom-24 left-1/2 z-20 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-elevated px-3.5 py-2 text-xs font-medium text-highlighted shadow-lg ring-1 ring-default transition hover:bg-primary hover:text-white"
        @click="handleScrollToBottomClick"
      >
        <UIcon name="i-lucide-arrow-down" class="size-3.5" />
        <span>رفتن به پایین</span>
      </button>
    </Transition>

    <ChatMessageInput
      :sending="sending"
      :reply-to="replyToMessage"
      @send="handleSend"
      @cancel-reply="handleCancelReply"
    />
  </div>
</template>
