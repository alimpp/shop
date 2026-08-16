<script setup lang="ts">
import type { TStory } from '~/features/stories/types/index.type';

interface Props {
  stories: TStory[];
}

defineProps<Props>();

const emit = defineEmits<{
  'view': (story: TStory, index: number) => void;
}>();

const scrollContainer = ref<HTMLElement | null>(null);
const isDragging = ref(false);
const dragStart = ref(0);
const scrollStart = ref(0);

function scrollLeft(): void {
  if (!scrollContainer.value) return;
  scrollContainer.value.scrollBy({
    left: -250,
    behavior: 'smooth',
  });
}

function scrollRight(): void {
  if (!scrollContainer.value) return;
  scrollContainer.value.scrollBy({
    left: 250,
    behavior: 'smooth',
  });
}

function handleMouseDown(e: MouseEvent): void {
  if (!scrollContainer.value) return;
  // صرف scroll container پر ہی drag شروع کریں، story items پر نہیں
  if ((e.target as HTMLElement).closest('[data-story-item]')) {
    return;
  }
  isDragging.value = true;
  dragStart.value = e.clientX;
  scrollStart.value = scrollContainer.value.scrollLeft;
}

function handleMouseMove(e: MouseEvent): void {
  if (!isDragging.value || !scrollContainer.value) return;
  e.preventDefault();
  const diff = e.clientX - dragStart.value;
  scrollContainer.value.scrollLeft = scrollStart.value - diff;
}

function handleMouseUp(): void {
  isDragging.value = false;
}

function handleTouchStart(e: TouchEvent): void {
  if (!scrollContainer.value) return;
  isDragging.value = true;
  dragStart.value = e.touches[0].clientX;
  scrollStart.value = scrollContainer.value.scrollLeft;
}

function handleTouchMove(e: TouchEvent): void {
  if (!isDragging.value || !scrollContainer.value) return;
  const diff = e.touches[0].clientX - dragStart.value;
  scrollContainer.value.scrollLeft = scrollStart.value - diff;
}

function handleTouchEnd(): void {
  isDragging.value = false;
}

onMounted(() => {
  const container = scrollContainer.value;
  if (!container) return;

  container.addEventListener('mousemove', handleMouseMove);
  container.addEventListener('mouseup', handleMouseUp);
  container.addEventListener('mouseleave', handleMouseUp);
  container.addEventListener('touchmove', handleTouchMove);
  container.addEventListener('touchend', handleTouchEnd);
});

onUnmounted(() => {
  const container = scrollContainer.value;
  if (!container) return;

  container.removeEventListener('mousemove', handleMouseMove);
  container.removeEventListener('mouseup', handleMouseUp);
  container.removeEventListener('mouseleave', handleMouseUp);
  container.removeEventListener('touchmove', handleTouchMove);
  container.removeEventListener('touchend', handleTouchEnd);
});
</script>

<template>
  <div class="relative px-4 py-6 sm:px-6 lg:px-8">
    <button
      class="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-r-lg bg-gradient-to-r from-black/80 to-transparent px-3 py-3 transition-all hover:from-black/90 sm:px-4"
      @click="scrollLeft"
    >
      <svg
        class="h-5 w-5 text-white sm:h-6 sm:w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>

    <div
      ref="scrollContainer"
      class="flex gap-4 overflow-x-auto scrollbar-hide py-2"
      :class="{ 'cursor-grabbing': isDragging, 'cursor-grab': !isDragging }"
      @mousedown="handleMouseDown"
      @touchstart="handleTouchStart"
    >
      <div
        v-for="(story, index) in stories"
        :key="story.id"
        data-story-item
        class="flex-shrink-0 transform transition-transform hover:scale-110"
        @click="() => {
          console.log('Story clicked:', { index, isDragging: isDragging.value, storyId: story.id });
          if (!isDragging.value) {
            emit('view', story, index);
          }
        }"
      >
        <div class="relative h-24 w-24 rounded-full border-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 p-0.5 cursor-pointer sm:h-28 sm:w-28">
          <div class="h-full w-full overflow-hidden rounded-full bg-gray-900">
            <img
              :src="story.imageUrl"
              :alt="'story-' + story.id"
              class="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </div>

    <button
      class="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-l-lg bg-gradient-to-l from-black/80 to-transparent px-3 py-3 transition-all hover:from-black/90 sm:px-4"
      @click="scrollRight"
    >
      <svg
        class="h-5 w-5 text-white sm:h-6 sm:w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

