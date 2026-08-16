<script setup lang="ts">
import ProfileShell from '~/components/profile/ProfileShell.vue'
import ProfileMenu from '~/components/profile/ProfileMenu.vue'

definePageMeta({ title: "پروفایل کاربری", robots: "noindex, nofollow" })

</script>

<template>
  <ProfileShell>
    <ProfileMenu />
  </ProfileShell>
</template>
