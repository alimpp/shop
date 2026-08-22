<script setup lang="ts">
import { authController } from '../../features/auth/controllers/index.controller'

definePageMeta({
  layout: 'auth',
  robots: 'noindex, nofollow',
  title: 'کد تأیید'
})

const toast = useToast()

const loading = ref(false)
const phone = ref('')
const code = ref<string[]>([])

const timer = ref(120)
let interval: ReturnType<typeof setInterval> | undefined

const tryAgain = computed(() =>
  timer.value > 0 ? `${timer.value} ثانیه تا ارسال مجدد کد` : 'ارسال مجدد کد'
)

async function sendCodeAgain() {
  if (timer.value > 0 || loading.value) return

  timer.value = 120
  startTimer()

  const res = await authController.loginWithPhone({
    phoneNumber: phone.value
  })

  toast.add({
    title: res.message,
    color: res.success ? 'success' : 'error'
  })
}

async function verifyOtp() {
  if (loading.value) return

  loading.value = true

  const res = await authController.loginUser({
    phoneNumber: phone.value,
    otp: code.value.join('')
  })

  toast.add({
    title: res.message,
    color: res.success ? 'success' : 'error'
  })

  if (res.success) {
    await navigateTo('/')
  }

  loading.value = false
}

function startTimer() {
  clearInterval(interval)

  interval = setInterval(() => {
    if (timer.value > 0) {
      timer.value--
    } else {
      clearInterval(interval)
    }
  }, 1000)
}

onMounted(() => {
  const savedPhone = localStorage.getItem('phone')

  if (savedPhone) {
    phone.value = savedPhone
  }

  startTimer()
})

onUnmounted(() => {
  clearInterval(interval)
})
</script>

<template>
  <div class="flex flex-col items-center gap-6 fade-animation">
    <div class="text-center text-sm text-gray-500">
      کد تأیید به {{ phone }} ارسال شده است
    </div>

    <UPinInput
      v-model="code"
      :length="6"
      size="xl"
      class="mt-10"
      :ui="{
        base: 'size-12 rounded-xl border-0 text-center text-lg placeholder:text-dimmed focus:outline-none disabled:cursor-not-allowed disabled:opacity-75 sm:size-16'
      }"
      @complete="verifyOtp"
      type="number"
    />

    <div class="flex justify-center w-full mt-6">
      <span
        class="text-sm text-primary cursor-pointer"
        :class="{ 'opacity-50 pointer-events-none': timer > 0 }"
        @click="sendCodeAgain"
      >
        {{ tryAgain }}
      </span>
    </div>

    <UButton
      class="mt-4"
      block
      :loading="loading"
      :disabled="code.join('').length < 6"
      @click="verifyOtp"
    >
      ارسال کد تایید
    </UButton>
  </div>
</template>
