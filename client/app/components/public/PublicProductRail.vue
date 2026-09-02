<script setup lang="ts">
import type { TProduct } from '~/features/products/types/index.type'

const props = defineProps<{
  products: TProduct[]
  cardClass?: string
}>()

const scrollContainer = ref<HTMLElement | null>(null)
const isDragging = ref(false)
let dragStart = 0
let scrollStart = 0
let didDrag = false

function scrollByAmount(direction: 'left' | 'right'): void {
  const el = scrollContainer.value
  if (!el) return
  const amount = Math.min(360, el.clientWidth * 0.75)
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

function handleCardClick(event: MouseEvent): void {
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
    v-if="products.length"
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
      class="no-scrollbar flex flex-nowrap gap-3 overflow-x-auto px-1 py-1 sm:gap-4 md:px-10"
      :class="isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @touchstart.passive="handleTouchStart"
      @touchmove.passive="handleTouchMove"
    >
      <div
        v-for="product in products"
        :key="product.id"
        class="w-[158px] shrink-0 sm:w-[180px]"
        :class="cardClass"
        @click.capture="handleCardClick"
      >
        <PublicProductCard :product="product" />
      </div>
    </div>
  </div>
</template>
