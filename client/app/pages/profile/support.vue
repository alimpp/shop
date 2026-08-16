<script setup lang="ts">
import ProfileShell from "~/components/profile/ProfileShell.vue";
import ChatRoom from "~/features/chat/components/ChatRoom.vue";
import { chatController } from "~/features/chat/controllers/index.controller";
import { ChatDS } from "~/features/chat/data/index.store";
import { useUserProfileDS } from "~/dataStore";
import { profileUserController } from "~/features/profile/user/controllers/index.controller";

definePageMeta({ title: "چت پشتیبانی", robots: "noindex, nofollow" });

const toast = useToast();
const profileDS = useUserProfileDS();
const chatDS = ChatDS.getInstance();

const loading = ref(true);
const chatId = ref("");
const userId = computed(
  () => profileDS.getUser?.id || userIdFromToken()
);

function userIdFromToken(): string {
  const token = useCookie<string | null>("token").value;
  if (!token) return "";

  try {
    const payload = JSON.parse(
      atob(token.split(".")[1]?.replace(/-/g, "+").replace(/_/g, "/") || "")
    );
    return payload.sub || "";
  } catch {
    return "";
  }
}

async function ensureUserProfile(): Promise<boolean> {
  if (profileDS.getUser?.id) return true;

  const response = await profileUserController.getProfile();
  if (response.success && response.data) {
    profileDS.setUser(response.data);
    return true;
  }

  return Boolean(userIdFromToken());
}

async function resolveSupportChat(): Promise<string | null> {
  const listResponse = await chatController.getChatsForUser({
    limit: 20,
  });

  if (!listResponse.success) {
    toast.add({
      title: listResponse.message || "دریافت چت ناموفق بود",
      color: "error",
    });
    return null;
  }

  const existing =
    chatDS.getChats.find((chat) => chat.status === "open") ||
    chatDS.getChats[0];

  if (existing) {
    chatDS.setSelectedChat(existing);
    return existing.id;
  }

  const createResponse = await chatController.createChat({
    subject: "چت پشتیبانی",
  });

  if (!createResponse.success || !createResponse.data?.id) {
    toast.add({
      title: createResponse.message || "ایجاد چت ناموفق بود",
      color: "error",
    });
    return null;
  }

  chatDS.setSelectedChat(createResponse.data);
  return createResponse.data.id;
}

onMounted(async () => {
  loading.value = true;

  const hasUser = await ensureUserProfile();
  if (!hasUser) {
    toast.add({
      title: "برای چت با پشتیبانی ابتدا وارد شوید",
      color: "error",
    });
    loading.value = false;
    return;
  }

  const id = await resolveSupportChat();
  if (id) {
    chatId.value = id;
  }

  loading.value = false;
});
</script>

<template>
  <ProfileShell title="چت پشتیبانی">
    <div
      class="overflow-hidden rounded-2xl border border-default bg-elevated"
      style="height: min(70dvh, 640px)"
    >
      <div
        v-if="loading"
        class="flex h-full items-center justify-center"
      >
        <UIcon
          name="i-lucide-loader-2"
          class="size-7 animate-spin text-primary"
        />
      </div>

      <ChatRoom
        v-else-if="chatId && userId"
        :chat-id="chatId"
        :current-user-id="userId"
        :is-admin="false"
      />

      <div
        v-else
        class="flex h-full flex-col items-center justify-center gap-3 px-6 text-center"
      >
        <UIcon
          name="i-lucide-message-circle-off"
          class="size-10 text-toned opacity-60"
        />
        <p class="text-sm text-toned">
          امکان باز کردن چت پشتیبانی وجود ندارد
        </p>
        <UButton
          color="primary"
          variant="soft"
          @click="navigateTo('/profile')"
        >
          بازگشت به پروفایل
        </UButton>
      </div>
    </div>
  </ProfileShell>
</template>
