<script setup lang="ts">
import type { TStory } from "~/features/stories/types/index.type";

interface Props {
  isOpen: boolean;
  stories: TStory[];
  initialIndex?: number;
}

const props = withDefaults(defineProps<Props>(), {
  initialIndex: 0,
});

const emit = defineEmits<{
  (event: "update:isOpen", value: boolean): void;
}>();

const currentIndex = ref(0);
const elapsed = ref(0);
let progressInterval: NodeJS.Timeout | null = null;

const currentStory = computed(() => props.stories[currentIndex.value] || null);
const progress = computed(() => {
  if (!currentStory.value) return 0;
  return Math.min(
    100,
    (elapsed.value / (currentStory.value.duration * 1000)) * 100,
  );
});

function closeViewer(): void {
  elapsed.value = 0;
  emit("update:isOpen", false);
}

function goToNextStory(): void {
  if (currentIndex.value < props.stories.length - 1) {
    currentIndex.value++;
    elapsed.value = 0;
  } else {
    closeViewer();
  }
}

function goToPreviousStory(): void {
  if (currentIndex.value > 0) {
    currentIndex.value--;
    elapsed.value = 0;
  }
}

function startProgress(): void {
  elapsed.value = 0;

  progressInterval = setInterval(() => {
    elapsed.value += 100; // 100ms

    if (
      currentStory.value &&
      elapsed.value >= currentStory.value.duration * 1000
    ) {
      goToNextStory();
    }
  }, 100);
}

function stopProgress(): void {
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
}

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      currentIndex.value = props.initialIndex;
      elapsed.value = 0;
      startProgress();
    } else {
      stopProgress();
    }
  },
);

watch(
  () => currentIndex.value,
  () => {
    elapsed.value = 0;
  },
);

onMounted(() => {
  if (props.isOpen) {
    currentIndex.value = props.initialIndex;
    startProgress();
  }
});

onUnmounted(() => {
  stopProgress();
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95"
      @click="closeViewer"
    >
      <div
        class="relative flex h-full w-full flex-col"
        @click.stop
      >
        <div
          v-if="currentStory"
          class="flex gap-1 bg-black/50 px-4 py-2"
        >
          <div
            v-for="(story, idx) in stories"
            :key="story.id"
            class="h-1 flex-1 rounded-full bg-gray-600 overflow-hidden"
          >
            <div
              class="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-100"
              :style="{
                width:
                  idx < currentIndex
                    ? '100%'
                    : idx === currentIndex
                      ? `${progress}%`
                      : '0%',
              }"
            />
          </div>
        </div>

        <div
          class="relative flex-1 overflow-hidden"
        >
          <img
            v-if="currentStory"
            :src="currentStory.imageUrl"
            :alt="'story-viewer-' + currentStory.id"
            class="absolute inset-0 h-full w-full object-contain"
            loading="eager"
            decoding="async"
          />

          <button
            v-if="currentIndex > 0"
            class="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/50 p-3 transition-all hover:bg-white/30"
            @click="goToPreviousStory"
          >
            <svg
              class="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <button
            v-if="currentIndex < stories.length - 1"
            class="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/50 p-3 transition-all hover:bg-white/30"
            @click="goToNextStory"
          >
            <svg
              class="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            class="absolute right-4 top-4 z-10 rounded-full bg-white/20 p-3 transition-all hover:bg-white/30"
            @click="closeViewer"
          >
            <svg
              class="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div class="absolute bottom-4 left-4 text-sm text-white/70">
            {{ currentIndex + 1 }} / {{ stories.length }}
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
