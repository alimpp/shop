<script setup lang="ts">
import { chatController } from "~/features/chat/controllers/index.controller";
import { ChatDS } from "~/features/chat/data/index.store";
import ChatList from "~/features/chat/components/ChatList.vue";
import type { TChatReadFilter } from "~/features/chat/types/index.type";
import type { ChatModel } from "~/features/chat/models/index.model";

definePageMeta({
  layout: "admin",
  middleware: "auth",
});

const chatDS = ChatDS.getInstance();
const router = useRouter();
const toast = useToast();

const chats = computed(() => chatDS.getChats);
const loading = computed(() => chatDS.getLoading);
const selectedFilter = ref<TChatReadFilter>("all");

const filterItems = [
  { label: "همه", value: "all" },
  { label: "خوانده شده‌ها", value: "read" },
  { label: "خوانده نشده‌ها", value: "unread" },
];

async function fetchChats(): Promise<void> {
  const response = await chatController.getChatsForAdmin({
    filter: selectedFilter.value,
    limit: 50,
  });

  if (!response.success) {
    toast.add({
      title: response.message || "دریافت چت‌ها ناموفق بود",
      color: "error",
    });
  }
}

function handleSelectChat(chat: ChatModel): void {
  chatDS.setSelectedChat(chat);
  router.push(`/admin/chat/${chat.id}`);
}

watch(selectedFilter, () => {
  fetchChats();
});

onMounted(() => {
  fetchChats();
});
</script>

<template>
  <UDashboardPanel id="chat-list">
    <template #header>
      <UDashboardNavbar title="چت پشتیبانی">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <USelect
            v-model="selectedFilter"
            :items="filterItems"
            class="w-40"
          />
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-refresh-cw"
            :loading="loading"
            @click="fetchChats"
          >
            <span>بروزرسانی</span>
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <BaseDashboardPanelBody>
        <ChatList
          :chats="chats"
          :loading="loading"
          @select="handleSelectChat"
        />
      </BaseDashboardPanelBody>
    </template>
  </UDashboardPanel>
</template>
