<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: string;
  maxlength?: number;
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}>(), {
  maxlength: 1000,
  loading: false,
  disabled: false,
  placeholder: "دیدگاه خود را بنویسید..."
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
  submit: [];
}>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);
const isFocused = ref(false);
const isHovered = ref(false);

const length = computed(() => String(props.modelValue ?? "").length);

function autoResize(): void {
  const el = textareaRef.value;
  if (!el) {
    return;
  }

  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

function onInput(event: Event): void {
  const target = event.target as HTMLTextAreaElement;
  emit("update:modelValue", target.value);
  autoResize();
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    emit("submit");
  }
}

onMounted(() => {
  autoResize();
});

watch(
  () => props.modelValue,
  () => {
    autoResize();
  }
);
</script>

<template>
  <div
    class="group relative w-full overflow-hidden rounded-2xl border bg-elevated/60 backdrop-blur-sm transition-all duration-300"
    :class="[
      isFocused
        ? 'border-primary ring-2 ring-primary/15 shadow-lg shadow-primary/10'
        : isHovered
          ? 'border-primary/50'
          : 'border-default'
    ]"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <div class="flex flex-col gap-2 px-4 pt-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <div class="flex items-center gap-2 text-toned">
        <span
          class="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors"
          :class="isFocused ? 'bg-primary text-white' : ''"
        >
          <UIcon
            name="i-lucide-message-square"
            class="size-3.5"
          />
        </span>
        <span class="text-xs font-semibold">
          دیدگاه شما
        </span>
      </div>

      <span class="text-[11px] tabular-nums text-toned">
        {{ length }}
        <span class="opacity-60">/ {{ maxlength }}</span>
      </span>
    </div>

    <textarea
      ref="textareaRef"
      :value="modelValue"
      :maxlength="maxlength"
      :disabled="disabled"
      rows="3"
      :placeholder="placeholder"
      dir="auto"
      class="w-full resize-none bg-transparent px-4 py-3 text-sm leading-7 text-highlighted outline-none transition-colors placeholder:text-toned/60 disabled:opacity-50"
      @input="onInput"
      @focus="isFocused = true"
      @blur="isFocused = false"
      @keydown="onKeydown"
    />

    <div class="flex flex-col gap-3 border-t border-default/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-2.5">
      <span class="hidden text-[11px] leading-5 text-toned sm:flex sm:items-center sm:gap-1.5">
        <UIcon
          name="i-lucide-corner-down-left"
          class="size-3.5 shrink-0"
        />
        برای ارسال Enter و برای خط جدید Shift + Enter بزنید
      </span>

      <UButton
        color="primary"
        size="sm"
        icon="i-lucide-send"
        class="w-full shrink-0 justify-center sm:w-auto"
        :loading="loading"
        :disabled="disabled || !modelValue.trim()"
        @click="emit('submit')"
      >
        ثبت دیدگاه
      </UButton>
    </div>
  </div>
</template>
