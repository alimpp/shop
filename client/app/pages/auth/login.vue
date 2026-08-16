<script setup lang="ts">
import { authController } from '../../features/auth/controllers/index.controller'

import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'auth',
  robots: 'noindex, nofollow',
  title: 'ورود | فروشگاه اینترنتی پرایم'
})

const toast = useToast()
const loading = ref(false)

const schema = z.object({
  username: z
    .string()
    .min(8, 'نام کاربری باید حداقل ۸ کاراکتر باشد')
    .max(16, 'نام کاربری باید حداکثر ۱۶ کاراکتر باشد'),

  password: z
    .string()
    .min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد')
    .max(30, 'رمز عبور باید حداکثر ۱۶ کاراکتر باشد')
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  username: '',
  password: ''
})

const fields = [
  {
    name: 'username',
    label: 'نام کاربری',
    placeholder: 'نام کاربری',
    type: 'text'
  },
  {
    name: 'password',
    label: 'رمز عبور',
    placeholder: 'رمز عبور',
    type: 'password'
  }
] as const

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  const serverResponse = await authController.login(event.data)
  toast.add({
    title: serverResponse.message,
    color: serverResponse.success ? 'success' : 'error'
  })
  if (serverResponse.success) await navigateTo('/admin/dashboard')
  loading.value = false
}
</script>

<template>
  <div class="space-y-6">
    <UForm
      :schema="schema"
      :state="state"
      class="space-y-4"
      @submit="onSubmit"
    >
      <UFormField
        v-for="field in fields"
        :key="field.name"
        :label="field.label"
        :name="field.name"
      >
        <UInput
          v-model="state[field.name]"
          :type="field.type"
          :placeholder="field.placeholder"
          class="w-full"
        />
      </UFormField>

      <UButton
        class="mt-5"
        type="submit"
        block
        :loading="loading"
      >
        ورود به پنل فروشگاه
      </UButton>
    </UForm>
  </div>
</template>
