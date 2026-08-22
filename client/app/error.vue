<script setup lang="ts">
import type { NuxtError } from '#app'
import { NOINDEX_ROBOTS } from '~/utils/seo'

defineProps<{
  error: NuxtError
}>()

useSeoMeta({
  title: 'صفحه یافت نشد',
  description: 'متأسفانه صفحه مورد نظر شما پیدا نشد.',
  robots: NOINDEX_ROBOTS
})

useHead({
  htmlAttrs: {
    lang: 'fa',
    dir: 'rtl'
  }
})
</script>

<template>
  <UApp>
    <UError :error="error" />
  </UApp>
</template>
