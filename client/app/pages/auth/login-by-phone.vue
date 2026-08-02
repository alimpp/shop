<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import { authController } from "../../controllers/auth/index.controller";

definePageMeta({
  layout: "auth",
});

const toast = useToast();
const loading = ref(false);

const schema = z.object({
  phone: z.string().regex(/^09\d{9}$/, "شماره تلفن معتبر نیست"),
});

type Schema = z.output<typeof schema>;

const state = reactive<Schema>({
  phone: "",
});

const fields = [
  {
    key: "phone" as keyof Schema,
    label: "شماره تلفن",
    placeholder: "09123456789",
    type: "tel",
  },
];

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true;
  const serverResponse = await authController.loginWithPhone(event.data.phone);
  toast.add({
    title: serverResponse.message,
    color: serverResponse.success ? "success" : "error",
  });
  if (serverResponse.success) {
    if (import.meta.client) {
      localStorage.setItem("phone", event.data.phone);
    }
    await navigateTo("/auth/verifyotp");
  }
}
</script>

<template>
  <div class="space-y-6">
    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <UFormField
        v-for="field in fields"
        :key="field.key"
        :label="field.label"
        :name="field.key"
      >
        <UInput
          v-model="state[field.key]"
          :type="field.type"
          :placeholder="field.placeholder"
          class="w-full"
        />
      </UFormField>

      <UButton type="submit" block :loading="loading">
        ارسال شماره تلفن
      </UButton>
    </UForm>

    <div class="text-center">
      <NuxtLink to="/auth/login" class="text-sm text-primary hover:underline">
        ورود با نام کاربری و رمز عبور
      </NuxtLink>
    </div>
  </div>
</template>
