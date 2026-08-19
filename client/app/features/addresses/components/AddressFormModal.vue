<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import {
  getProvinceByCityName,
  IRAN_PROVINCES
} from '../data/iran-locations'
import type { TAddress, TAddressPayload } from '../types/index.type'

interface TAddressFormState {
  name: string
  city: string
  province: string
  address: string
  postalCode: string
}

const props = defineProps<{
  open: boolean
  address: TAddress | null
  submitting: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [payload: TAddressPayload, id: string | null]
}>()

function toEnglishDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, digit => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, digit => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
}

const addressSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'نام آدرس باید حداقل ۲ کاراکتر باشد')
    .max(80, 'نام آدرس باید حداکثر ۸۰ کاراکتر باشد'),
  city: z.string().trim().min(1, 'شهر را انتخاب کنید'),
  province: z.string().trim().min(1, 'استان را انتخاب کنید'),
  address: z
    .string()
    .trim()
    .min(8, 'آدرس باید حداقل ۸ کاراکتر باشد')
    .max(500, 'آدرس باید حداکثر ۵۰۰ کاراکتر باشد'),
  postalCode: z
    .string()
    .trim()
    .transform(toEnglishDigits)
    .refine(value => /^\d{10}$/.test(value), 'کد پستی باید ۱۰ رقم باشد')
})

type AddressSchema = z.output<typeof addressSchema>

const state = reactive<TAddressFormState>({
  name: '',
  city: '',
  province: '',
  address: '',
  postalCode: ''
})

const modalOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value)
})

const isEditing = computed(() => Boolean(props.address?.id))

const cityItems = computed(() =>
  IRAN_PROVINCES.flatMap(province =>
    province.cities.map(city => ({
      value: city.name,
      label: `${city.name} — ${province.name}`
    }))
  )
)

const provinceItems = computed(() => {
  const province = getProvinceByCityName(state.city)
  if (!province) return []
  return [{ value: province.name, label: province.name }]
})

watch(
  () => state.city,
  (city) => {
    const province = getProvinceByCityName(city)
    if (province) {
      state.province = province.name
    }
  }
)

function resetState(): void {
  state.name = ''
  state.city = ''
  state.province = ''
  state.address = ''
  state.postalCode = ''
}

function syncState(address: TAddress | null): void {
  if (!address) {
    resetState()
    return
  }

  state.name = address.name
  state.city = address.city
  state.province = address.province
  state.address = address.address
  state.postalCode = address.postalCode
}

function normalizePayload(data: AddressSchema): TAddressPayload {
  return {
    name: data.name.trim(),
    city: data.city.trim(),
    province: data.province.trim(),
    address: data.address.trim(),
    postalCode: toEnglishDigits(data.postalCode).trim()
  }
}

function closeModal(): void {
  modalOpen.value = false
}

function handleSubmit(event: FormSubmitEvent<AddressSchema>): void {
  emit('submit', normalizePayload(event.data), props.address?.id ?? null)
}

watch(
  () => [props.open, props.address] as const,
  ([isOpen, address]) => {
    if (!isOpen) {
      resetState()
      return
    }
    syncState(address)
  },
  { immediate: true }
)
</script>

<template>
  <UModal
    v-model:open="modalOpen"
    :title="isEditing ? 'ویرایش آدرس' : 'افزودن آدرس'"
  >
    <template #body>
      <UForm
        :schema="addressSchema"
        :state="state"
        class="space-y-4"
        @submit="handleSubmit"
      >
        <UFormField
          label="نام آدرس"
          name="name"
        >
          <UInput
            v-model="state.name"
            class="w-full"
            placeholder="مثلا خانه، محل کار"
          />
        </UFormField>

        <UFormField
          label="شهر"
          name="city"
        >
          <USelect
            v-model="state.city"
            :items="cityItems"
            class="w-full"
            placeholder="شهر را انتخاب کنید"
          />
        </UFormField>

        <UFormField
          label="استان"
          name="province"
        >
          <USelect
            v-model="state.province"
            :items="provinceItems"
            class="w-full"
            placeholder="ابتدا شهر را انتخاب کنید"
            :disabled="!state.city"
          />
        </UFormField>

        <UFormField
          label="آدرس"
          name="address"
        >
          <UTextarea
            v-model="state.address"
            class="w-full"
            :rows="3"
            placeholder="خیابان، کوچه، پلاک، واحد"
          />
        </UFormField>

        <UFormField
          label="کد پستی"
          name="postalCode"
        >
          <UInput
            v-model="state.postalCode"
            class="w-full"
            dir="ltr"
            maxlength="10"
            placeholder="۱۰ رقم"
          />
        </UFormField>

        <div class="grid grid-cols-2 gap-3 pt-2">
          <UButton
            type="button"
            color="neutral"
            variant="outline"
            icon="i-lucide-x"
            class="w-full justify-center"
            :disabled="submitting"
            @click="closeModal"
          >
            انصراف
          </UButton>
          <UButton
            type="submit"
            :icon="isEditing ? 'i-lucide-save' : 'i-lucide-plus'"
            class="w-full justify-center"
            :loading="submitting"
          >
            {{ isEditing ? 'ذخیره تغییرات' : 'ثبت آدرس' }}
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
