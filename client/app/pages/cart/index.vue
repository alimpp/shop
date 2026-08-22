<script setup lang="ts">
import CartPanel from '~/features/cart/components/CartPanel.vue'
import { SITE_NAME } from '~/utils/seo'

definePageMeta({
  title: 'سبد خرید',
  robots: 'noindex, nofollow',
  description: `مشاهده سبد خرید شما در ${SITE_NAME}`
})
</script>

<template>
  <CartPanel />
</template>
