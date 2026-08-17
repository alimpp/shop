<script setup lang="ts">
import { notificationController } from "~/features/notifications/controllers/index.controller";
import type {
  TCreateNotificationPayload,
  TNotificationType,
} from "~/features/notifications/types/index.type";
import { NOTIFICATION_TYPE_LABELS } from "~/features/notifications/types/index.type";

definePageMeta({
  layout: "admin",
  middleware: "auth",
});

const toast = useToast();

const loadingUsers = ref(true);
const submitting = ref(false);

const users = ref<
  Array<{ id: string; fristname: string; lastname: string; phone: string }>
>([]);

const form = reactive({
  userId: "" as string | undefined,
  title: "",
  description: "",
  type: "message" as TNotificationType,
});

const typeItems = (
  Object.entries(NOTIFICATION_TYPE_LABELS) as Array<[TNotificationType, string]>
).map(([value, label]) => ({ value, label }));

const userItems = computed(() =>
  users.value.map((user) => {
    const name = [user.fristname, user.lastname].filter(Boolean).join(" ");
    return {
      value: user.id,
      label: name ? `${name} — ${user.phone}` : user.phone || user.id,
    };
  })
);

const canSubmit = computed(
  () =>
    Boolean(form.userId) &&
    Boolean(form.title.trim()) &&
    Boolean(form.description.trim()) &&
    Boolean(form.type) &&
    !submitting.value
);

async function fetchUsers(): Promise<void> {
  loadingUsers.value = true;
  const response = await notificationController.getUsers();
  loadingUsers.value = false;

  if (!response.success) {
    toast.add({
      title: response.message || "دریافت کاربران ناموفق بود",
      color: "error",
    });
    return;
  }

  users.value = response.data || [];
}

async function handleSubmit(): Promise<void> {
  if (!canSubmit.value || !form.userId) return;

  submitting.value = true;

  const payload: TCreateNotificationPayload = {
    userId: form.userId,
    title: form.title.trim(),
    description: form.description.trim(),
    type: form.type,
  };

  const response = await notificationController.createNotification(payload);
  submitting.value = false;

  toast.add({
    title:
      response.message ||
      (response.success
        ? "اعلان با موفقیت ارسال شد"
        : "ارسال اعلان ناموفق بود"),
    color: response.success ? "success" : "error",
  });

  if (response.success) {
    form.title = "";
    form.description = "";
    form.type = "message";
  }
}

onMounted(() => {
  fetchUsers();
});
</script>

<template>
  <UDashboardPanel id="admin-notifications">
    <template #header>
      <UDashboardNavbar title="ارسال اعلان">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <BaseDashboardPanelBody>
        <div class="mx-auto w-full max-w-2xl">
          <div class="mb-6">
            <h2 class="text-base font-bold text-highlighted">
              ارسال دستی اعلان به کاربر
            </h2>
            <p class="mt-1 text-sm text-toned">
              اعلان‌های خودکار (سفارش، پرداخت و ...) از داخل سرویس‌ها ارسال
              می‌شوند. این صفحه فقط برای ارسال دستی ادمین است.
            </p>
          </div>

          <div
            class="space-y-4 rounded-2xl border border-default bg-elevated p-5 sm:p-6"
          >
            <div v-if="loadingUsers" class="flex justify-center py-10">
              <UIcon
                name="i-lucide-loader-2"
                class="size-6 animate-spin text-primary"
              />
            </div>

            <template v-else>
              <UFormField label="کاربر" required>
                <USelect
                  v-model="form.userId"
                  :items="userItems"
                  placeholder="کاربر را انتخاب کنید"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="نوع اعلان" required>
                <USelect
                  v-model="form.type"
                  :items="typeItems"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="عنوان" required>
                <UInput
                  v-model="form.title"
                  placeholder="مثلاً: سفارش شما ثبت شد"
                  maxlength="200"
                  class="w-full"
                />
              </UFormField>

              <UFormField label="توضیحات" required>
                <UTextarea
                  v-model="form.description"
                  placeholder="متن اعلان را بنویسید..."
                  :rows="4"
                  maxlength="2000"
                  class="w-full"
                />
              </UFormField>

              <div class="flex justify-end pt-2">
                <UButton
                  color="primary"
                  icon="i-lucide-send"
                  :loading="submitting"
                  :disabled="!canSubmit"
                  @click="handleSubmit"
                >
                  ارسال اعلان
                </UButton>
              </div>
            </template>
          </div>
        </div>
      </BaseDashboardPanelBody>
    </template>
  </UDashboardPanel>
</template>
