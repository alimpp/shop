<script setup lang="ts">
import { adminsController } from '~/features/admins/controllers/index.controller'
import type {
  TAdminPayload,
  TManagedAdmin
} from '~/features/admins/types/index.type'
import {
  emptyPermissions,
  fullPermissions,
  PERMISSION_ACTION_LABELS,
  PERMISSION_RESOURCE_LABELS,
  PERMISSION_RESOURCES,
  type TAdminPermissionsMap
} from '~/features/permissions/types/index.type'
import { useAdminPermissions } from '~/composables/useAdminPermissions'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const toast = useToast()
const { can, isSuperAdmin, admin: currentAdmin } = useAdminPermissions()

const loading = ref(false)
const submitting = ref(false)
const items = ref<TManagedAdmin[]>([])
const formOpen = ref(false)
const detailOpen = ref(false)
const editing = ref<TManagedAdmin | null>(null)
const detailAdmin = ref<TManagedAdmin | null>(null)

const form = reactive({
  username: '',
  password: '',
  role: 'admin' as 'admin' | 'super_admin',
  displayName: '',
  email: '',
  phone: '',
  isActive: true,
  permissions: emptyPermissions() as TAdminPermissionsMap
})

async function fetchItems(): Promise<void> {
  loading.value = true
  const response = await adminsController.getAdmins()
  loading.value = false

  if (!response.success) {
    toast.add({
      title: response.message || 'دریافت ادمین‌ها ناموفق بود',
      color: 'error'
    })
    return
  }

  items.value = response.data ?? []
}

function openCreate(): void {
  editing.value = null
  form.username = ''
  form.password = ''
  form.role = 'admin'
  form.displayName = ''
  form.email = ''
  form.phone = ''
  form.isActive = true
  form.permissions = emptyPermissions()
  formOpen.value = true
}

function openEdit(item: TManagedAdmin): void {
  editing.value = item
  form.username = item.username
  form.password = ''
  form.role = (item.role === 'super_admin' ? 'super_admin' : 'admin')
  form.displayName = item.displayName ?? ''
  form.email = item.email ?? ''
  form.phone = item.phone ?? ''
  form.isActive = item.isActive
  form.permissions = item.role === 'super_admin'
    ? fullPermissions()
    : { ...emptyPermissions(), ...item.permissions }
  formOpen.value = true
}

function openDetail(item: TManagedAdmin): void {
  detailAdmin.value = item
  detailOpen.value = true
}

function togglePermission(
  resource: keyof TAdminPermissionsMap,
  action: keyof (typeof PERMISSION_ACTION_LABELS)
): void {
  if (form.role === 'super_admin') return
  const current = form.permissions[resource] ?? {
    view: false,
    create: false,
    edit: false,
    delete: false
  }
  form.permissions[resource] = {
    ...current,
    [action]: !current[action]
  }
}

async function save(): Promise<void> {
  if (!form.username.trim()) {
    toast.add({ title: 'نام کاربری الزامی است', color: 'warning' })
    return
  }
  if (!editing.value && !form.password) {
    toast.add({ title: 'رمز عبور الزامی است', color: 'warning' })
    return
  }

  const payload: TAdminPayload = {
    username: form.username.trim(),
    role: form.role,
    displayName: form.displayName.trim() || undefined,
    email: form.email.trim() || undefined,
    phone: form.phone.trim() || undefined,
    isActive: form.isActive,
    permissions: form.role === 'super_admin' ? fullPermissions() : form.permissions
  }
  if (form.password) payload.password = form.password

  submitting.value = true
  const response = editing.value
    ? await adminsController.updateAdmin(editing.value.id, payload)
    : await adminsController.createAdmin(payload)
  submitting.value = false

  toast.add({
    title:
      response.message
      || (response.success
        ? editing.value
          ? 'ادمین بروزرسانی شد'
          : 'ادمین ساخته شد'
        : 'ذخیره ناموفق بود'),
    color: response.success ? 'success' : 'error'
  })

  if (response.success) {
    formOpen.value = false
    await fetchItems()
  }
}

async function remove(item: TManagedAdmin): Promise<void> {
  if (item.id === currentAdmin.value.id) {
    toast.add({ title: 'نمی‌توانید حساب خودتان را حذف کنید', color: 'warning' })
    return
  }
  const ok = window.confirm(`ادمین «${item.username}» حذف شود؟`)
  if (!ok) return

  const response = await adminsController.deleteAdmin(item.id)
  toast.add({
    title: response.message || (response.success ? 'حذف شد' : 'حذف ناموفق بود'),
    color: response.success ? 'success' : 'error'
  })
  if (response.success) await fetchItems()
}

watch(
  () => form.role,
  (role) => {
    if (role === 'super_admin') {
      form.permissions = fullPermissions()
    }
  }
)

onMounted(() => {
  void fetchItems()
})
</script>

<template>
  <UDashboardPanel id="admin-admins">
    <template #header>
      <UDashboardNavbar title="مدیریت ادمین‌ها">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            v-if="can('admins', 'create')"
            color="primary"
            icon="i-lucide-plus"
            @click="openCreate"
          >
            ادمین جدید
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <BaseDashboardPanelBody>
        <div
          v-if="loading && !items.length"
          class="flex justify-center py-16"
        >
          <UIcon
            name="i-lucide-loader-2"
            class="size-6 animate-spin text-primary"
          />
        </div>

        <div
          v-else-if="!items.length"
          class="rounded-2xl border border-dashed border-default px-4 py-16 text-center text-sm text-toned"
        >
          هنوز ادمینی ثبت نشده است.
        </div>

        <div
          v-else
          class="overflow-x-auto rounded-2xl border border-default"
        >
          <table class="min-w-full text-sm">
            <thead class="bg-elevated/60 text-toned">
              <tr>
                <th class="px-4 py-3 text-start font-medium">
                  کاربر
                </th>
                <th class="px-4 py-3 text-start font-medium">
                  نقش
                </th>
                <th class="px-4 py-3 text-start font-medium">
                  وضعیت
                </th>
                <th class="px-4 py-3 text-start font-medium">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in items"
                :key="item.id"
                class="border-t border-default"
              >
                <td class="px-4 py-3">
                  <p class="font-bold text-highlighted">
                    {{ item.displayName || item.username }}
                  </p>
                  <p
                    class="text-xs text-toned"
                    dir="ltr"
                  >
                    @{{ item.username }}
                  </p>
                </td>
                <td class="px-4 py-3">
                  <UBadge
                    :color="item.role === 'super_admin' ? 'primary' : 'neutral'"
                    variant="subtle"
                  >
                    {{ item.role === 'super_admin' ? 'ادمین اصلی' : 'ادمین' }}
                  </UBadge>
                </td>
                <td class="px-4 py-3">
                  <UBadge
                    :color="item.isActive ? 'success' : 'error'"
                    variant="subtle"
                  >
                    {{ item.isActive ? 'فعال' : 'غیرفعال' }}
                  </UBadge>
                </td>
                <td class="px-4 py-3">
                  <div class="flex gap-2">
                    <UButton
                      size="sm"
                      color="neutral"
                      variant="soft"
                      icon="i-lucide-eye"
                      @click="openDetail(item)"
                    />
                    <UButton
                      v-if="can('admins', 'edit')"
                      size="sm"
                      color="neutral"
                      variant="soft"
                      icon="i-lucide-pencil"
                      @click="openEdit(item)"
                    />
                    <UButton
                      v-if="can('admins', 'delete')"
                      size="sm"
                      color="error"
                      variant="soft"
                      icon="i-lucide-trash-2"
                      @click="remove(item)"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </BaseDashboardPanelBody>
    </template>
  </UDashboardPanel>

  <UModal
    v-model:open="formOpen"
    :title="editing ? 'ویرایش ادمین' : 'ساخت ادمین'"
    :ui="{ content: 'sm:max-w-4xl' }"
  >
    <template #body>
      <div class="space-y-4">
        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField
            label="نام کاربری"
            required
          >
            <UInput
              v-model="form.username"
              class="w-full"
              dir="ltr"
            />
          </UFormField>
          <UFormField
            :label="editing ? 'رمز عبور (اختیاری)' : 'رمز عبور'"
            :required="!editing"
          >
            <UInput
              v-model="form.password"
              type="password"
              class="w-full"
              dir="ltr"
            />
          </UFormField>
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
          <UFormField
            v-if="isSuperAdmin"
            label="نقش"
          >
            <USelect
              v-model="form.role"
              :items="[
                { label: 'ادمین', value: 'admin' },
                { label: 'ادمین اصلی', value: 'super_admin' }
              ]"
              class="w-full"
            />
          </UFormField>
        </div>

        <UCheckbox
          v-model="form.isActive"
          label="فعال باشد"
        />

        <div v-if="form.role !== 'super_admin'">
          <h3 class="mb-3 text-sm font-bold text-highlighted">
            ماتریس دسترسی
          </h3>
          <div class="overflow-x-auto rounded-2xl border border-default">
            <table class="min-w-full text-xs">
              <thead class="bg-elevated/60 text-toned">
                <tr>
                  <th class="px-3 py-2 text-start">
                    بخش
                  </th>
                  <th
                    v-for="(label, action) in PERMISSION_ACTION_LABELS"
                    :key="action"
                    class="px-3 py-2 text-center"
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
                  <td class="px-3 py-2 font-medium">
                    {{ PERMISSION_RESOURCE_LABELS[resource] }}
                  </td>
                  <td
                    v-for="(_, action) in PERMISSION_ACTION_LABELS"
                    :key="`${resource}-${action}`"
                    class="px-3 py-2 text-center"
                  >
                    <UCheckbox
                      :model-value="Boolean(form.permissions[resource]?.[action])"
                      @update:model-value="togglePermission(resource, action)"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <p
          v-else
          class="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-toned"
        >
          ادمین اصلی به تمام بخش‌ها دسترسی کامل دارد.
        </p>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton
          color="neutral"
          variant="outline"
          @click="formOpen = false"
        >
          انصراف
        </UButton>
        <UButton
          color="primary"
          :loading="submitting"
          @click="save"
        >
          ذخیره
        </UButton>
      </div>
    </template>
  </UModal>

  <UModal
    v-model:open="detailOpen"
    :title="detailAdmin ? `دسترسی‌های ${detailAdmin.username}` : 'دسترسی‌ها'"
    :ui="{ content: 'sm:max-w-3xl' }"
  >
    <template #body>
      <div
        v-if="detailAdmin"
        class="overflow-x-auto rounded-2xl border border-default"
      >
        <table class="min-w-full text-xs">
          <thead class="bg-elevated/60 text-toned">
            <tr>
              <th class="px-3 py-2 text-start">
                بخش
              </th>
              <th
                v-for="(label, action) in PERMISSION_ACTION_LABELS"
                :key="action"
                class="px-3 py-2 text-center"
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
              <td class="px-3 py-2 font-medium">
                {{ PERMISSION_RESOURCE_LABELS[resource] }}
              </td>
              <td
                v-for="(_, action) in PERMISSION_ACTION_LABELS"
                :key="`${resource}-${action}`"
                class="px-3 py-2 text-center"
              >
                <UIcon
                  :name="(detailAdmin.role === 'super_admin' || detailAdmin.permissions?.[resource]?.[action]) ? 'i-lucide-check' : 'i-lucide-x'"
                  :class="(detailAdmin.role === 'super_admin' || detailAdmin.permissions?.[resource]?.[action]) ? 'text-success' : 'text-muted'"
                  class="mx-auto size-4"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </UModal>
</template>
