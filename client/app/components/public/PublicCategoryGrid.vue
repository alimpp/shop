<script setup lang="ts">
import type { TCategory } from '~/features/categories/types/index.type'

interface Props {
  categories: TCategory[]
}

const props = withDefaults(defineProps<Props>(), {
  categories: () => []
})

const scrollContainer = ref<HTMLElement | null>(null)
const isDragging = ref(false)
let dragStart = 0
let scrollStart = 0
let didDrag = false

const activeCategories = computed(() =>
  props.categories.filter(category => category.isActive && category.image)
)

function scrollByAmount(direction: 'left' | 'right'): void {
  const el = scrollContainer.value
  if (!el) return
  const amount = Math.min(320, el.clientWidth * 0.7)
  el.scrollBy({
    left: direction === 'left' ? -amount : amount,
    behavior: 'smooth'
  })
}

function handleMouseDown(event: MouseEvent): void {
  const el = scrollContainer.value
  if (!el) return
  isDragging.value = true
  didDrag = false
  dragStart = event.pageX
  scrollStart = el.scrollLeft
}

function handleMouseMove(event: MouseEvent): void {
  const el = scrollContainer.value
  if (!el || !isDragging.value) return
  const delta = event.pageX - dragStart
  if (Math.abs(delta) > 4) didDrag = true
  el.scrollLeft = scrollStart - delta
}

function handleMouseUp(): void {
  isDragging.value = false
}

function handleTouchStart(event: TouchEvent): void {
  const el = scrollContainer.value
  const touch = event.touches[0]
  if (!el || !touch) return
  didDrag = false
  dragStart = touch.pageX
  scrollStart = el.scrollLeft
}

function handleTouchMove(event: TouchEvent): void {
  const el = scrollContainer.value
  const touch = event.touches[0]
  if (!el || !touch) return
  const delta = touch.pageX - dragStart
  if (Math.abs(delta) > 4) didDrag = true
  el.scrollLeft = scrollStart - delta
}

function handleCategoryClick(event: MouseEvent): void {
  if (didDrag) {
    event.preventDefault()
    event.stopPropagation()
  }
  didDrag = false
  isDragging.value = false
}
</script>

<template>
  <div
    v-if="activeCategories.length > 0"
    class="relative"
  >
    <button
      type="button"
      class="absolute start-0 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-elevated/90 p-2 text-highlighted shadow-sm ring-1 ring-default transition hover:bg-primary hover:text-white md:inline-flex"
      aria-label="اسکرول به راست"
      @click="scrollByAmount('right')"
    >
      <UIcon
        name="i-lucide-chevron-right"
        class="size-5"
      />
    </button>

    <button
      type="button"
      class="absolute end-0 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-elevated/90 p-2 text-highlighted shadow-sm ring-1 ring-default transition hover:bg-primary hover:text-white md:inline-flex"
      aria-label="اسکرول به چپ"
      @click="scrollByAmount('left')"
    >
      <UIcon
        name="i-lucide-chevron-left"
        class="size-5"
      />
    </button>

    <div
      ref="scrollContainer"
      class="no-scrollbar flex flex-nowrap gap-4 overflow-x-auto px-1 py-2 sm:gap-5 md:px-10"
      :class="isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @touchstart.passive="handleTouchStart"
      @touchmove.passive="handleTouchMove"
    >
      <NuxtLink
        v-for="category in activeCategories"
        :key="category.id"
        :to="`/products?category=${category.id}`"
        class="group flex w-[118px] shrink-0 flex-col items-center gap-3 sm:w-[132px]"
        @click="handleCategoryClick"
      >
        <div class="overflow-hidden transition-transform duration-300 group-hover:scale-105">
          <NuxtImg
            :src="category.image"
            :alt="category.name"
            class="h-[118px] w-[118px] object-cover sm:h-28 sm:w-28"
            loading="lazy"
            decoding="async"
            draggable="false"
          />
        </div>
        <p class="line-clamp-2 text-center text-sm font-bold text-[#565656] sm:text-base">
          {{ category.name }}
        </p>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
