<script setup lang="ts">
import { profileAdminController } from '~/features/profile/admin/controllers/index.controller'
import {
  PERMISSION_ACTION_LABELS,
  PERMISSION_RESOURCE_LABELS,
  PERMISSION_RESOURCES
} from '~/features/permissions/types/index.type'
import { useAdminPermissions } from '~/composables/useAdminPermissions'

const open = defineModel<boolean>('open', { default: false })

const toast = useToast()
const { admin, isSuperAdmin, permissions } = useAdminPermissions()
const submitting = ref(false)

const form = reactive({
  displayName: '',
  email: '',
  phone: '',
  avatarUrl: '',
  currentPassword: '',
  newPassword: ''
})

watch(
  () => open.value,
  (value) => {
    if (!value) return
    form.displayName = admin.value.displayName ?? ''
    form.email = admin.value.email ?? ''
    form.phone = admin.value.phone ?? ''
    form.avatarUrl = admin.value.avatarUrl ?? ''
    form.currentPassword = ''
    form.newPassword = ''
  }
)

async function saveProfile(): Promise<void> {
  submitting.value = true
  const response = await profileAdminController.updateAdminProfile({
    displayName: form.displayName.trim() || null,
    email: form.email.trim() || null,
    phone: form.phone.trim() || null,
    avatarUrl: form.avatarUrl.trim() || null,
    currentPassword: form.currentPassword || undefined,
    newPassword: form.newPassword || undefined
  })
  submitting.value = false

  toast.add({
    title: response.message || (response.success ? 'پروفایل بروزرسانی شد' : 'ذخیره ناموفق بود'),
    color: response.success ? 'success' : 'error'
  })

  if (response.success) {
    form.currentPassword = ''
    form.newPassword = ''
  }
}

function logout(): void {
  const token = useCookie('token')
  token.value = null
  navigateTo('/auth/login')
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="پروفایل ادمین"
    description="اطلاعات حساب و سطح دسترسی‌های شما"
    :ui="{ content: 'sm:max-w-3xl' }"
  >
    <template #body>
      <div class="space-y-6">
        <div class="flex flex-wrap items-center gap-3">
          <div class="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <UIcon
              name="i-lucide-user-round"
              class="size-7"
            />
          </div>
          <div>
            <p class="text-base font-black text-highlighted">
              {{ admin.displayName || admin.username }}
            </p>
            <p
              class="text-xs text-toned"
              dir="ltr"
            >
              @{{ admin.username }}
            </p>
            <UBadge
              class="mt-2"
              :color="isSuperAdmin ? 'primary' : 'neutral'"
              variant="subtle"
            >
              {{ isSuperAdmin ? 'ادمین اصلی' : 'ادمین' }}
            </UBadge>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField label="نام نمایشی">
            <UInput
              v-model="form.displayName"
              class="w-full"
            />
          </UFormField>
          <UFormField label="ایمیل">
            <UInput
              v-model="form.email"
              type="email"
              class="w-full"
              dir="ltr"
            />
          </UFormField>
          <UFormField label="شماره تماس">
            <UInput
              v-model="form.phone"
              class="w-full"
              dir="ltr"
            />
          </UFormField>
          <UFormField label="آدرس تصویر">
            <UInput
              v-model="form.avatarUrl"
              class="w-full"
              dir="ltr"
            />
          </UFormField>
          <UFormField label="رمز فعلی (برای تغییر رمز)">
            <UInput
              v-model="form.currentPassword"
              type="password"
              class="w-full"
              dir="ltr"
            />
          </UFormField>
          <UFormField label="رمز جدید">
            <UInput
              v-model="form.newPassword"
              type="password"
              class="w-full"
              dir="ltr"
            />
          </UFormField>
        </div>

        <div>
          <h3 class="mb-3 text-sm font-bold text-highlighted">
            دسترسی‌ها
          </h3>
          <div class="overflow-x-auto rounded-2xl border border-default">
            <table class="min-w-full text-xs">
              <thead class="bg-elevated/60 text-toned">
                <tr>
                  <th class="px-3 py-2 text-start font-medium">
                    بخش
                  </th>
                  <th
                    v-for="(label, action) in PERMISSION_ACTION_LABELS"
                    :key="action"
                    class="px-3 py-2 text-center font-medium"
                  >
                    {{ label }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="resource in PERMISSION_RESOURCES"
                  :key="resource"
                  class="border-t border-default"
                >
                  <td class="px-3 py-2 font-medium text-highlighted">
                    {{ PERMISSION_RESOURCE_LABELS[resource] }}
                  </td>
                  <td
                    v-for="(_, action) in PERMISSION_ACTION_LABELS"
                    :key="`${resource}-${action}`"
                    class="px-3 py-2 text-center"
                  >
                    <UIcon
                      :name="permissions?.[resource]?.[action] ? 'i-lucide-check' : 'i-lucide-x'"
                      :class="permissions?.[resource]?.[action] ? 'text-success' : 'text-muted'"
                      class="mx-auto size-4"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full flex-wrap justify-between gap-2">
        <UButton
          color="error"
          variant="soft"
          icon="i-lucide-log-out"
          @click="logout"
        >
          خروج
        </UButton>
        <div class="flex gap-2">
          <UButton
            color="neutral"
            variant="outline"
            @click="open = false"
          >
            بستن
          </UButton>
          <UButton
            color="primary"
            :loading="submitting"
            @click="saveProfile"
          >
            ذخیره پروفایل
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
