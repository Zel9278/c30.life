<script setup lang="ts">
import { ref, provide, onMounted, onUnmounted } from "vue"
import type { InjectionKey } from "vue"
import ImageViewer from "./ImageViewer.vue"
import {
  imageViewerKey,
  type ImageViewerState,
} from "@/composables/useImageViewer"

const isOpen = ref(false)
const imageProps = ref<ImageViewerState | null>(null)

function openViewer(state: ImageViewerState) {
  imageProps.value = state
  isOpen.value = true
}

function closeViewer() {
  isOpen.value = false
  imageProps.value = null
}

provide(imageViewerKey, { openViewer, closeViewer })

// Auto-attach click handler for images with data-viewer="true"
function handleImageClick(e: MouseEvent) {
  const target = e.target as HTMLImageElement

  if (target.tagName === "IMG" && target.dataset.viewer === "true") {
    e.preventDefault()
    e.stopPropagation()

    openViewer({
      src: target.src,
      alt: target.alt,
      width: target.naturalWidth,
      height: target.naturalHeight,
    })
  }
}

onMounted(() => {
  document.addEventListener("click", handleImageClick, { capture: true })
})

onUnmounted(() => {
  document.removeEventListener("click", handleImageClick, { capture: true })
})
</script>

<template>
  <slot />
  <Teleport to="body">
    <dialog
      v-if="isOpen && imageProps"
      open
      class="fixed inset-0 z-50 bg-black/90 w-full h-full p-0 m-0 border-none"
      @click="closeViewer"
      @keydown.enter="closeViewer"
      @keydown.space.prevent="closeViewer"
    >
      <div class="relative h-full w-full" @click.stop @keydown.stop>
        <button
          type="button"
          class="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors cursor-pointer"
          aria-label="画像ビューアーを閉じる"
          @click="closeViewer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <ImageViewer
          :src="imageProps.src"
          :alt="imageProps.alt"
          :width="imageProps.width"
          :height="imageProps.height"
          @close="closeViewer"
        />
      </div>
    </dialog>
  </Teleport>
</template>
