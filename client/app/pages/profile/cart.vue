<script setup lang="ts">
import ProfileShell from '~/components/profile/ProfileShell.vue'
import CartPanel from '~/features/cart/components/CartPanel.vue'

definePageMeta({ title: 'سبد خرید', robots: 'noindex, nofollow' })
</script>

<template>
  <ProfileShell title="سبد خرید">
    <CartPanel embedded />
  </ProfileShell>
</template>
