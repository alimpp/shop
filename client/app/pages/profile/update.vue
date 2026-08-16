<script setup lang="ts">
import ProfileShell from '~/components/profile/ProfileShell.vue'
import FileUploadModal from '~/features/files/components/FileUploadModal.vue'
import { filesController } from '~/features/files/controllers/index.controller'
import { profileUserController } from '~/features/profile/user/controllers/index.controller'
import { useUserProfileDS } from '~/dataStore'
import type { TFileItem } from '~/features/files/types/index.type'

definePageMeta({ title: "ویرایش پروفایل", robots: "noindex, nofollow" })


const toast = useToast()
const profileDS = useUserProfileDS()

const config = useRuntimeConfig()

const saving = ref(false)
const uploading = ref(false)
const uploadModalOpen = ref(false)

const user = computed(() => profileDS.getUser)

const form = reactive({
  fristname: '',
  lastname: '',
  email: '',
  avatarUrl: ''
})

function syncForm(): void {
  const current = profileDS.getUser
  if (!current) return
  form.fristname = current.fristname || ''
  form.lastname = current.lastname || ''
  form.email = current.email || ''
  form.avatarUrl = current.avatarUrl || ''
}

watch(user, syncForm, { immediate: true })

function buildFileUrl(file: TFileItem): string {
  const apiBase = String(config.public.apiBase ?? 'http://localhost:4000').replace(
    /\/+$/,
    ''
  )
  return `${apiBase}/files/${file.id}`
}

async function onAvatarUpload(file: File): Promise<void> {
  uploading.value = true

  try {
    const response = await filesController.uploadFile(file)

    if (response.success && response.data) {
      form.avatarUrl = buildFileUrl(response.data)

      const updateResponse = await profileUserController.updateProfile({
        fristname: form.fristname,
        lastname: form.lastname,
        email: form.email,
        avatarUrl: form.avatarUrl
      })

      if (updateResponse.success) {
        const profile = await profileUserController.getProfile()
        if (profile.success && profile.data) {
          profileDS.setUser(profile.data)
          syncForm()
        }

        toast.add({
          title: 'تصویر پروفایل بارگذاری و ذخیره شد',
          color: 'success'
        })
      } else {
        toast.add({
          title: updateResponse.message || 'خطا در ذخیره تصویر پروفایل',
          color: 'error'
        })
      }
    } else {
      toast.add({
        title: response.message || 'خطا در بارگذاری تصویر',
        color: 'error'
      })
    }
  } finally {
    uploading.value = false
  }
}

function removeAvatar(): void {
  form.avatarUrl = ''
}

async function saveProfile(): Promise<void> {
  saving.value = true
  const response = await profileUserController.updateProfile({
    fristname: form.fristname,
    lastname: form.lastname,
    email: form.email,
    avatarUrl: form.avatarUrl
  })

  toast.add({
    title: response.message,
    color: response.success ? 'success' : 'error'
  })

  if (response.success) {
    const profile = await profileUserController.getProfile()
    if (profile.success && profile.data) {
      profileDS.setUser(profile.data)
      syncForm()
    }
  }

  saving.value = false
}
</script>

<template>
  <ProfileShell title="ویرایش اطلاعات کاربری">
    <UCard :ui="{ body: 'p-6 sm:p-8' }">
      <UForm
        class="space-y-4"
        :state="form"
        @submit="saveProfile"
      >
        <div class="flex flex-col items-center gap-4">
          <UAvatar
            :src="form.avatarUrl || undefined"
            :icon="form.avatarUrl ? undefined : 'i-lucide-user-round'"
            size="3xl"
            color="primary"
          />

          <div class="flex items-center justify-center gap-2">
            <UButton
              type="button"
              color="primary"
              variant="soft"
              size="sm"
              icon="i-lucide-upload"
              :loading="uploading"
              @click="uploadModalOpen = true"
            >
              انتخاب تصویر پروفایل
            </UButton>

            <UButton
              v-if="form.avatarUrl"
              type="button"
              color="error"
              variant="ghost"
              size="sm"
              icon="i-lucide-trash-2"
              @click="removeAvatar"
            >
              حذف تصویر
            </UButton>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField
            name="fristname"
            label="نام"
          >
            <UInput
              v-model="form.fristname"
              placeholder="نام"
              class="w-full"
            />
          </UFormField>

          <UFormField
            name="lastname"
            label="نام خانوادگی"
          >
            <UInput
              v-model="form.lastname"
              placeholder="نام خانوادگی"
              class="w-full"
            />
          </UFormField>
        </div>

        <UFormField
          name="email"
          label="ایمیل"
        >
          <UInput
            v-model="form.email"
            type="email"
            placeholder="example@mail.com"
            class="w-full"
          />
        </UFormField>

        <UFormField
          name="phone"
          label="شماره تلفن"
        >
          <UInput
            :model-value="user?.phone ?? ''"
            disabled
            class="w-full"
          />
        </UFormField>

        <UButton
          type="submit"
          block
          :loading="saving"
          leading-icon="i-lucide-save"
        >
          ذخیره تغییرات
        </UButton>
      </UForm>
    </UCard>

    <FileUploadModal
      v-model:open="uploadModalOpen"
      :submitting="uploading"
      @submit="onAvatarUpload"
    />
  </ProfileShell>
</template>
