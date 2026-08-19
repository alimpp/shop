<script setup lang="ts">
import { usersController } from '~/features/users/controllers/index.controller'
import { useUsersDS } from '~/features/users/data/index.store'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const toast = useToast()
const usersDS = useUsersDS()
const router = useRouter()

const users = computed(() => usersDS.getUsers)
const loading = computed(() => usersDS.getLoading)
const meta = computed(() => usersDS.getMeta)

const searchInput = ref('')
const page = ref(1)
let searchTimer: ReturnType<typeof setTimeout> | null = null

async function fetchUsers(): Promise<void> {
  const response = await usersController.getUsers({
    search: searchInput.value.trim() || undefined,
    page: page.value,
    limit: 20
  })

  if (!response.success) {
    toast.add({
      title: response.message || 'دریافت کاربران ناموفق بود',
      color: 'error'
    })
  }
}

function onSearch(): void {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    page.value = 1
    fetchUsers()
  }, 280)
}

function openUser(id: string): void {
  router.push(`/admin/users/${id}`)
}

onMounted(() => {
  fetchUsers()
})

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
})
</script>

<template>
  <UDashboardPanel id="admin-users">
    <template #header>
      <UDashboardNavbar title="کاربران">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-refresh-cw"
            :loading="loading"
            class="hidden sm:inline-flex"
            @click="fetchUsers"
          >
            بروزرسانی
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <BaseDashboardPanelBody>
        <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-base font-black text-highlighted sm:text-lg">
              همه کاربران
            </h2>
            <p class="mt-1 text-xs text-toned sm:text-sm">
              {{ meta.total.toLocaleString('fa-IR') }} کاربر ثبت‌شده
            </p>
          </div>
          <UInput
            v-model="searchInput"
            icon="i-lucide-search"
            placeholder="جستجو با نام، موبایل یا ایمیل"
            class="w-full sm:max-w-sm"
            @update:model-value="onSearch"
          />
        </div>

        <div
          v-if="loading && !users.length"
          class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
        >
          <USkeleton
            v-for="index in 6"
            :key="index"
            class="h-28 w-full rounded-2xl"
          />
        </div>

        <div
          v-else-if="!users.length"
          class="rounded-3xl border border-dashed border-default px-6 py-16 text-center"
        >
          <UIcon
            name="i-lucide-users"
            class="mx-auto size-10 text-muted"
          />
          <p class="mt-3 text-sm text-toned">
            کاربری با این جستجو پیدا نشد.
          </p>
        </div>

        <div
          v-else
          class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
        >
          <button
            v-for="user in users"
            :key="user.id"
            type="button"
            class="group flex items-center gap-3 rounded-2xl border border-default bg-elevated/40 p-4 text-right transition-all hover:border-primary/40 hover:bg-elevated"
            @click="openUser(user.id)"
          >
            <UAvatar
              :src="user.avatarUrl || undefined"
              :alt="user.displayName"
              :text="user.initials"
              size="lg"
            />
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-black text-highlighted">
                {{ user.displayName }}
              </p>
              <p
                class="mt-0.5 truncate text-xs text-toned"
                dir="ltr"
              >
                {{ user.phone || 'بدون شماره' }}
              </p>
              <p class="mt-1 text-[11px] text-muted">
                عضویت {{ user.formattedDate }}
              </p>
            </div>
            <UIcon
              name="i-lucide-chevron-left"
              class="size-4 shrink-0 text-muted transition-transform group-hover:-translate-x-0.5 group-hover:text-primary"
            />
          </button>
        </div>

        <div
          v-if="meta.totalPages > 1"
          class="mt-6 flex justify-center"
        >
          <UPagination
            v-model:page="page"
            :total="meta.total"
            :items-per-page="meta.limit"
            @update:page="fetchUsers"
          />
        </div>
      </BaseDashboardPanelBody>
    </template>
  </UDashboardPanel>
</template>
