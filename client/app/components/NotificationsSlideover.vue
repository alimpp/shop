<script setup lang="ts">
const { isNotificationsSlideoverOpen } = useDashboard()

</script>

<template>
  <USlideover
    v-model:open="isNotificationsSlideoverOpen"
    title="اعلان ها"
  >
    <template #body>
       
    </template>
  </USlideover>
</template>
