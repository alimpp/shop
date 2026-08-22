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

const canSend = computed(
  () => Boolean(inputText.value.trim()) && !props.sending
);

function handleSend(): void {
  const text = inputText.value.trim();
  if (!text || props.sending) return;

  emit("send", text);
  inputText.value = "";
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = "auto";
    }
  });
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
  textareaRef.value.style.height =
    Math.min(textareaRef.value.scrollHeight, 120) + "px";
}

watch(inputText, () => {
  nextTick(autoResize);
});

watch(
  () => props.replyTo,
  (value) => {
    if (value) {
      nextTick(() => textareaRef.value?.focus());
    }
  }
);
</script>

<template>
  <div
    class="shrink-0 border-t border-default bg-default/80 px-3 py-3 backdrop-blur-md"
  >
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-1 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-1 opacity-0"
    >
      <div
        v-if="replyTo"
        class="mb-2.5 flex items-stretch gap-0 overflow-hidden rounded-2xl bg-elevated ring-1 ring-default"
      >
        <div class="w-1 shrink-0 bg-primary" />
        <div class="flex min-w-0 flex-1 items-center gap-2 px-3 py-2.5">
          <div
            class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            <UIcon name="i-lucide-reply" class="size-3.5" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-[11px] font-semibold text-primary">
              پاسخ به {{ replyTo.sender?.displayName || "پیام" }}
            </p>
            <p class="truncate text-xs text-toned">
              {{ replyTo.content || "پیام حذف شده" }}
            </p>
          </div>
          <button
            type="button"
            class="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-default hover:text-highlighted"
            title="لغو پاسخ"
            @click="emit('cancelReply')"
          >
            <UIcon name="i-lucide-x" class="size-4" />
          </button>
        </div>
      </div>
    </Transition>

    <div class="flex items-end gap-2">
      <div
        class="flex min-h-11 flex-1 items-end rounded-2xl bg-elevated ring-1 ring-default transition-shadow focus-within:ring-2 focus-within:ring-primary/40"
      >
        <textarea
          ref="textareaRef"
          v-model="inputText"
          placeholder="پیام خود را بنویسید..."
          rows="1"
          class="max-h-[120px] min-h-11 flex-1 resize-none bg-transparent px-3.5 py-3 text-sm leading-5 text-highlighted placeholder:text-muted focus:outline-none disabled:opacity-60"
          :disabled="sending"
          @keydown="handleKeydown"
        />
      </div>

      <UButton
        color="primary"
        icon="i-lucide-send"
        square
        size="lg"
        :loading="sending"
        :disabled="!canSend"
        class="size-10 shrink-0 rounded-2xlflex justify-center items-center "
        @click="handleSend"
      />
    </div>
  </div>
</template>
