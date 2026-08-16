<template>
  <div class="flex flex-col items-center gap-4 py-24 text-center">
    <UIcon
      name="i-lucide-package-open"
      class="size-14 text-toned"
    />
    <h1 class="text-2xl font-black text-highlighted">
      محصول یافت نشد
    </h1>
    <p class="text-sm text-toned">
      محصول مورد نظر شما وجود ندارد یا حذف شده است.
    </p>
    <UButton
      color="primary"
      to="/products"
    >
      بازگشت به محصولات
    </UButton>
  </div>
</template>
