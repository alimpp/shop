<script setup lang="ts">
const token = useCookie<string | null>("token");

const pageTitle = computed(() =>
  token.value ? "پروفایل کاربری" : "برای مشاهده پروفایل ابتدا وارد حساب شوید"
);

const pageDescription = computed(() =>
  token.value
    ? "صفحه پروفایل کاربر در این بخش تکمیل می‌شود. فعلاً مسیر ناوبری و ساختار پایه آماده شده است."
    : "از نوار بالا روی آیکون کاربر بزنید. اگر وارد نشده باشید، به صفحه ورود هدایت می‌شوید."
);

function goToLogin(): void {
  navigateTo("/auth/login");
}
</script>

<template>
  <section class="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8" dir="rtl">
    <UCard :ui="{ body: 'p-6 sm:p-8' }">
      <div class="space-y-5">
        <div class="space-y-2">
          <p class="text-sm font-bold text-primary">
            پروفایل
          </p>
          <h1 class="text-2xl font-black text-highlighted">
            {{ pageTitle }}
          </h1>
          <p class="text-sm leading-7 text-toned">
            {{ pageDescription }}
          </p>
        </div>

        <UButton
          v-if="!token"
          color="primary"
          icon="i-lucide-log-in"
          @click="goToLogin"
        >
          رفتن به ورود
        </UButton>
      </div>
    </UCard>
  </section>
</template>
