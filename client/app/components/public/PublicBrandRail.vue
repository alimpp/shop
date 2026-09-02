<script setup lang="ts">
import type { TProductBrandRef } from '~/features/products/types/index.type'

const props = defineProps<{
  brands: TProductBrandRef[]
}>()

const scrollContainer = ref<HTMLElement | null>(null)
const isDragging = ref(false)
let dragStart = 0
let scrollStart = 0
let didDrag = false

const activeBrands = computed(() =>
  props.brands.filter(brand => Boolean(brand.name))
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

function handleBrandClick(event: MouseEvent): void {
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
    v-if="activeBrands.length"
    class="relative"
  >
    <button
      type="button"
      class="absolute start-0 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-elevated/90 p-2 text-highlighted ring-1 ring-default transition hover:bg-primary hover:text-white md:inline-flex"
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
      class="absolute end-0 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-elevated/90 p-2 text-highlighted ring-1 ring-default transition hover:bg-primary hover:text-white md:inline-flex"
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
        v-for="brand in activeBrands"
        :key="brand.id"
        :to="`/products?brand=${brand.id}`"
        class="group flex w-[140px] shrink-0 flex-col items-center gap-3 sm:w-[160px]"
        @click="handleBrandClick"
      >
        <div class="flex size-[140px] items-center justify-center overflow-hidden rounded-full bg-[#1a1a1a] ring-1 ring-white/5 transition-transform duration-300 group-hover:scale-105 sm:size-40">
          <NuxtImg
            v-if="brand.logo"
            :src="brand.logo"
            :alt="brand.name"
            class="max-h-[70%] max-w-[70%] object-contain"
            loading="lazy"
            draggable="false"
          />
          <span
            v-else
            class="text-3xl font-black text-primary"
          >
            {{ brand.name.slice(0, 1) }}
          </span>
        </div>
        <p class="line-clamp-2 text-center text-sm font-bold text-[#565656] sm:text-base">
          {{ brand.name }}
        </p>
      </NuxtLink>
    </div>
  </div>
</template>
