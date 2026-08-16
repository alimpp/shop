<script setup lang="ts">
import { chatController } from "~/features/chat/controllers/index.controller";
import { ChatDS } from "~/features/chat/data/index.store";
import { useAdminDS } from "~/dataStore";
import { profileAdminController } from "~/features/profile/admin/controllers/index.controller";
import ChatRoom from "~/features/chat/components/ChatRoom.vue";

definePageMeta({
  layout: "admin",
  middleware: "auth",
});

const route = useRoute();
const router = useRouter();
const chatDS = ChatDS.getInstance();
const adminDS = useAdminDS();
const toast = useToast();

const chatId = computed(() => String(route.params.id || ""));
const adminId = computed(() => adminDS.getAdmin.id || adminIdFromToken());
const ready = ref(false);

const selectedChat = computed(() => {
  return (
    chatDS.getSelectedChat ||
    chatDS.getChats.find((chat) => chat.id === chatId.value) ||
    null
  );
});

const roomTitle = computed(() => {
  if (selectedChat.value?.user) {
    return (
      [selectedChat.value.user.fristname, selectedChat.value.user.lastname]
        .filter(Boolean)
        .join(" ") || "چت پشتیبانی"
    );
  }
  return selectedChat.value?.subject || "چت پشتیبانی";
});

function adminIdFromToken(): string {
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

async function ensureAdmin(): Promise<void> {
  if (adminDS.getAdmin.id) {
    ready.value = true;
    return;
  }

  const fromToken = adminIdFromToken();
  if (fromToken) {
    adminDS.setAdmin({
      id: fromToken,
      username: adminDS.getAdmin.username || "",
      role: "admin",
    });
  }

  const response = await profileAdminController.getAdminProfile();
  if (response.success && response.data) {
    adminDS.setAdmin({
      id: (response.data as any).id || fromToken,
      username: (response.data as any).username || "",
      role: (response.data as any).role || "admin",
    });
  } else if (!fromToken) {
    toast.add({
      title: "شناسه ادمین یافت نشد",
      color: "error",
    });
  }

  ready.value = true;
}

function goBack(): void {
  router.push("/admin/chat");
}

onMounted(async () => {
  await ensureAdmin();

  if (!selectedChat.value && chatId.value) {
    const listResponse = await chatController.getChatsForAdmin({ limit: 50 });
    if (listResponse.success) {
      const chat = chatDS.getChats.find((item) => item.id === chatId.value);
      if (chat) {
        chatDS.setSelectedChat(chat);
      }
    }
  } else if (selectedChat.value) {
    chatDS.setSelectedChat(selectedChat.value);
  }
});
</script>

<template>
  <UDashboardPanel id="chat-room">
    <template #header>
      <UDashboardNavbar>
        <template #leading>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-arrow-right"
            @click="goBack"
          />
        </template>

        <template #title>
          <div class="flex flex-col items-start gap-0.5">
            <span class="text-sm font-medium">{{ roomTitle }}</span>
            <span
              v-if="selectedChat?.user?.phone"
              class="text-xs text-neutral-400 dark:text-neutral-500"
            >
              {{ selectedChat.user.phone }}
            </span>
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex h-[calc(100dvh-4rem)] min-h-0 flex-col">
        <ChatRoom
          v-if="ready && chatId && adminId"
          :chat-id="chatId"
          :current-user-id="adminId"
          :is-admin="true"
        />
        <div
          v-else
          class="flex flex-1 items-center justify-center text-neutral-400"
        >
          <UIcon name="i-lucide-loader-2" class="w-6 h-6 animate-spin" />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
