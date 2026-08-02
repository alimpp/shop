<template>
  <div class="app-scrollbar h-full min-h-0 overflow-y-auto p-4">
    <slot />
  </div>
</template>

<style>
.app-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(113, 113, 122, 0.55) transparent;
}

.app-scrollbar::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.app-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.app-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(113, 113, 122, 0.45);
  border-radius: 9999px;
  border: 1px solid transparent;
  background-clip: content-box;
}

.app-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(63, 63, 70, 0.55);
}

.dark .app-scrollbar {
  scrollbar-color: rgba(161, 161, 170, 0.45) transparent;
}

.dark .app-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(161, 161, 170, 0.35);
}

.dark .app-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(228, 228, 231, 0.28);
}
</style>
