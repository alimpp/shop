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
const showActions = ref(false);

const senderName = computed(() => {
  if (!props.message.sender) return "ناشناس";
  return props.message.sender.displayName;
});

const replySenderName = computed(() => {
  const sender = props.message.replyTo?.sender;
  if (!sender) return "پیام";
  if (sender.username) return sender.username;
  return [sender.fristname, sender.lastname].filter(Boolean).join(" ") || "پیام";
});

const avatarSrc = computed(() => props.message.sender?.avatarUrl || undefined);
</script>

<template>
  <div
    class="group flex gap-2.5 px-4 py-1"
    :class="isOwnMessage ? 'flex-row-reverse' : 'flex-row'"
    @mouseenter="showActions = true"
    @mouseleave="showActions = false"
  >
    <div
      class="mt-auto mb-5 shrink-0"
      :class="showSender ? 'visible' : 'invisible'"
    >
      <UAvatar
        :src="avatarSrc"
        :alt="senderName"
        :icon="avatarSrc ? undefined : 'i-lucide-user-round'"
        size="sm"
        :class="
          isOwnMessage
            ? 'ring-2 ring-primary/30'
            : 'ring-1 ring-default'
        "
      />
    </div>

    <div
      class="flex max-w-[min(78%,28rem)] flex-col gap-1"
      :class="isOwnMessage ? 'items-end' : 'items-start'"
    >
      <p
        v-if="showSender"
        class="px-1 text-[11px] font-medium tracking-wide"
        :class="
          isOwnMessage
            ? 'text-primary'
            : 'text-toned'
        "
      >
        {{ senderName }}
      </p>

      <div
        class="relative overflow-hidden text-sm leading-6 break-words shadow-sm transition-shadow duration-200 group-hover:shadow-md"
        :class="[
          message.isDeleted
            ? 'rounded-2xl bg-elevated/60 px-3.5 py-2.5 italic text-muted'
            : isOwnMessage
              ? 'rounded-2xl rounded-bl-md bg-primary text-white'
              : 'rounded-2xl rounded-br-md border border-default bg-elevated text-highlighted',
        ]"
      >
        <div
          v-if="message.replyTo && !message.isDeleted"
          class="mx-2.5 mt-2.5 mb-1 overflow-hidden rounded-xl"
          :class="
            isOwnMessage
              ? 'bg-black/15 ring-1 ring-white/10'
              : 'bg-default/70 ring-1 ring-default'
          "
        >
          <div class="flex gap-0">
            <div
              class="w-1 shrink-0 self-stretch"
              :class="isOwnMessage ? 'bg-white/70' : 'bg-primary'"
            />
            <div class="min-w-0 flex-1 px-2.5 py-2">
              <div class="mb-0.5 flex items-center gap-1.5">
                <UIcon
                  name="i-lucide-corner-up-left"
                  class="size-3 shrink-0 opacity-70"
                  :class="isOwnMessage ? 'text-white' : 'text-primary'"
                />
                <span
                  class="truncate text-[11px] font-semibold"
                  :class="isOwnMessage ? 'text-white/90' : 'text-primary'"
                >
                  {{ replySenderName }}
                </span>
              </div>
              <p
                v-if="message.replyTo.isDeleted"
                class="truncate text-[11px] italic opacity-70"
              >
                پیام حذف شده
              </p>
              <p
                v-else
                class="line-clamp-2 text-[11px] leading-4 opacity-80"
              >
                {{ message.replyTo.content }}
              </p>
            </div>
          </div>
        </div>

        <div
          class="px-3.5 py-2.5"
          :class="message.replyTo && !message.isDeleted ? 'pt-1.5' : ''"
        >
          <span v-if="message.isDeleted">پیام حذف شده</span>
          <span v-else class="whitespace-pre-wrap">
            <template
              v-for="(part, index) in message.contentParts"
              :key="index"
            >
              <a
                v-if="part.href"
                :href="part.href"
                target="_blank"
                rel="noopener noreferrer"
                class="underline underline-offset-4"
                :class="isOwnMessage ? 'text-white' : 'text-primary'"
                @click.stop
              >{{ part.text }}</a>
              <span v-else>{{ part.text }}</span>
            </template>
          </span>
        </div>
      </div>

      <div
        class="flex items-center gap-1 px-1"
        :class="isOwnMessage ? 'flex-row-reverse' : 'flex-row'"
      >
        <span class="text-[10px] tabular-nums text-muted">
          {{ message.formattedTime }}
        </span>

        <div
          class="flex items-center gap-0.5 transition-all duration-150"
          :class="
            showActions
              ? 'translate-y-0 opacity-100'
              : 'pointer-events-none translate-y-0.5 opacity-0 max-sm:pointer-events-auto max-sm:opacity-100'
          "
        >
          <button
            v-if="!message.isDeleted"
            type="button"
            class="inline-flex size-6 items-center justify-center rounded-full text-muted transition-colors hover:bg-elevated hover:text-primary"
            title="پاسخ"
            @click="emit('reply', message)"
          >
            <UIcon name="i-lucide-reply" class="size-3.5" />
          </button>

          <button
            v-if="!message.isDeleted && allowDelete"
            type="button"
            class="inline-flex size-6 items-center justify-center rounded-full text-muted transition-colors hover:bg-red-500/10 hover:text-red-500"
            title="حذف"
            @click="emit('delete', message)"
          >
            <UIcon name="i-lucide-trash-2" class="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
