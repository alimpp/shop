<script setup lang="ts">
import { contactContent } from '~/content/contact.content'

const toast = useToast()
const submitting = ref(false)

const form = reactive({
  name: '',
  phone: '',
  subject: '',
  message: ''
})

const fields = contactContent.form.fields

async function handleSubmit(): Promise<void> {
  if (submitting.value) return

  if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) {
    toast.add({
      title: 'لطفاً نام، شماره تماس و متن پیام را کامل کنید',
      color: 'warning'
    })
    return
  }

  submitting.value = true
  await new Promise(resolve => setTimeout(resolve, 650))
  submitting.value = false

  form.name = ''
  form.phone = ''
  form.subject = ''
  form.message = ''

  toast.add({
    title: contactContent.form.successTitle,
    description: contactContent.form.successDescription,
    color: 'success'
  })
}
</script>

<template>
  <form
    id="contact-form"
    class="space-y-5 rounded-[1.75rem] border border-default bg-elevated/40 p-5 sm:p-7"
    @submit.prevent="handleSubmit"
  >
    <div class="space-y-2">
      <h3 class="text-xl font-black text-highlighted">
        {{ contactContent.form.title }}
      </h3>
      <p class="text-sm leading-7 text-toned">
        {{ contactContent.form.support }}
      </p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <UFormField :label="fields.name.label" name="name" required>
        <UInput
          v-model="form.name"
          :placeholder="fields.name.placeholder"
          class="w-full"
          autocomplete="name"
        />
      </UFormField>

      <UFormField :label="fields.phone.label" name="phone" required>
        <UInput
          v-model="form.phone"
          :placeholder="fields.phone.placeholder"
          class="w-full"
          inputmode="tel"
          autocomplete="tel"
          dir="ltr"
        />
      </UFormField>
    </div>

    <UFormField :label="fields.subject.label" name="subject">
      <UInput
        v-model="form.subject"
        :placeholder="fields.subject.placeholder"
        class="w-full"
      />
    </UFormField>

    <UFormField :label="fields.message.label" name="message" required>
      <UTextarea
        v-model="form.message"
        :placeholder="fields.message.placeholder"
        :rows="5"
        class="w-full"
        autoresize
      />
    </UFormField>

    <UButton
      type="submit"
      color="primary"
      size="lg"
      class="w-full justify-center sm:w-auto sm:min-w-[12rem]"
      trailing-icon="i-lucide-send"
      :loading="submitting"
    >
      {{ contactContent.form.submitLabel }}
    </UButton>
  </form>
</template>
