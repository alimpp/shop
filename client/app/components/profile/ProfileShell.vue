<script setup lang="ts">
import { profileUserController } from '~/features/profile/user/controllers/index.controller'
import { useUserProfileDS } from '~/dataStore'

const props = defineProps<{
  title?: string
  backTo?: string
}>()

const token = useCookie<string | null>('token')
const toast = useToast()

const profileDS = useUserProfileDS()

const profileLoading = ref(false)

const isLoggedIn = computed(() => Boolean(token.value))

const backTarget = computed(() => props.backTo ?? '/profile')

async function loadProfile(): Promise<void> {
  if (!token.value || profileDS.getIsAuth) return

  profileLoading.value = true
  const response = await profileUserController.getProfile()

  if (response.success && response.data) {
    profileDS.setUser(response.data)
  } else {
    toast.add({
      title: response.message,
      color: 'error'
    })
  }

  profileLoading.value = false
}

onMounted(() => {
  if (isLoggedIn.value) {
    loadProfile()
  }
})
</script>

<template>
  <section
    class="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6"
    dir="rtl"
  >
    <template v-if="!isLoggedIn">
      <UCard :ui="{ body: 'p-6 sm:p-8' }">
        <div class="space-y-5">
          <h1 class="text-2xl font-black text-highlighted">
            برای مشاهده پروفایل ابتدا وارد حساب شوید
          </h1>
          <p class="text-sm leading-7 text-toned">
            از نوار بالا روی آیکون کاربر بزنید تا به صفحه ورود هدایت شوید.
          </p>
          <UButton
            color="primary"
            @click="navigateTo('/auth/login-by-phone')"
          >
            رفتن به ورود
          </UButton>
        </div>
      </UCard>
    </template>

    <template v-else>
      <div
        v-if="title"
        class="mb-6 flex items-center gap-3"
      >
        <UButton
          color="neutral"
          variant="ghost"
          square
          icon="i-lucide-arrow-right"
          :aria-label="'بازگشت به پروفایل'"
          class="shrink-0"
          @click="navigateTo(backTarget)"
        />

        <nav class="flex items-center gap-2 text-sm">
          <NuxtLink
            to="/profile"
            class="text-toned transition-colors hover:text-primary"
          >
            پروفایل
          </NuxtLink>
          <UIcon
            name="i-lucide-chevron-left"
            class="size-4 text-toned"
          />
          <span class="font-semibold text-highlighted">{{ title }}</span>
        </nav>
      </div>

      <div
        v-if="profileLoading"
        class="flex items-center justify-center py-20"
      >
        <UIcon
          name="i-lucide-loader-circle"
          class="size-8 animate-spin text-primary"
        />
      </div>

      <slot v-else />
    </template>
  </section>
</template>
