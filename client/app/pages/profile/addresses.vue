<script setup lang="ts">
import ProfileShell from '~/components/profile/ProfileShell.vue'

definePageMeta({ title: "آدرس‌ها", robots: "noindex, nofollow" })

</script>

<template>
  <ProfileShell title="آدرس ها">
    <UCard :ui="{ body: 'p-6 sm:p-8' }">
      <div class="flex flex-col items-center gap-4 py-14 text-center">
        <UIcon
          name="i-lucide-construction"
          class="size-12 text-toned"
        />
        <h2 class="text-xl font-black text-highlighted">
          آدرس ها
        </h2>
        <p class="max-w-md text-sm leading-7 text-toned">
          این بخش در حال توسعه است و به زودی فعال می‌شود.
        </p>
      </div>
    </UCard>
  </ProfileShell>
</template>
