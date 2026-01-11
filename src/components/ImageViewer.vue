<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue"

const props = defineProps<{
  src: string
  alt: string
  width?: number
  height?: number
}>()

const emit = defineEmits<{
  close: []
}>()

const scale = ref(1)
const offset = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const initialPos = ref({ x: 0, y: 0 })
const lastTouchDistance = ref<number | null>(null)

const zoomPercentage = computed(() => Math.round(scale.value * 100))

const imageStyle = computed(() => ({
  transform: `translate(${offset.value.x}px, ${offset.value.y}px) scale(${scale.value})`,
  imageRendering: "pixelated" as const,
  width: props.width ? `${props.width}px` : "auto",
  height: props.height ? `${props.height}px` : "auto",
  maxWidth: "100%",
  maxHeight: "100%",
}))

function handleWheel(e: WheelEvent) {
  e.preventDefault()
  const target = e.currentTarget as HTMLDivElement
  const rect = target.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top
  const delta = e.deltaY

  const scaleFactor = delta > 0 ? 0.9 : 1.1
  const newScale = Math.min(Math.max(scale.value * scaleFactor, 0.05), 100)

  offset.value = {
    x:
      mouseX -
      rect.width / 2 -
      (mouseX - rect.width / 2 - offset.value.x) * (newScale / scale.value),
    y:
      mouseY -
      rect.height / 2 -
      (mouseY - rect.height / 2 - offset.value.y) * (newScale / scale.value),
  }
  scale.value = newScale
}

function handleMouseDown(e: MouseEvent) {
  if (e.button !== 0) return
  e.preventDefault()
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }

  isDragging.value = true
  const target = e.currentTarget as HTMLDivElement
  const rect = target.getBoundingClientRect()
  initialPos.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  }
}

function handleMouseMove(e: MouseEvent) {
  if (!isDragging.value) return
  e.preventDefault()
  const target = e.currentTarget as HTMLDivElement
  const rect = target.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top

  const deltaX = mouseX - initialPos.value.x
  const deltaY = mouseY - initialPos.value.y

  if (mouseX < 0 || mouseX > rect.width || mouseY < 0 || mouseY > rect.height) {
    isDragging.value = false
    return
  }

  offset.value = {
    x: offset.value.x + deltaX,
    y: offset.value.y + deltaY,
  }
  initialPos.value = { x: mouseX, y: mouseY }
}

function handleMouseUp() {
  isDragging.value = false
}

function handleDoubleClick() {
  scale.value = 1
  offset.value = { x: 0, y: 0 }
}

function handleTouchStart(e: TouchEvent) {
  if (e.touches.length === 1) {
    isDragging.value = true
    const target = e.currentTarget as HTMLDivElement
    const rect = target.getBoundingClientRect()
    initialPos.value = {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top,
    }
  } else if (e.touches.length === 2) {
    const touch1 = e.touches[0]
    const touch2 = e.touches[1]
    const distance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY,
    )
    lastTouchDistance.value = distance
  }
}

function handleTouchMove(e: TouchEvent) {
  e.preventDefault()
  const target = e.currentTarget as HTMLDivElement
  const rect = target.getBoundingClientRect()

  if (e.touches.length === 1 && isDragging.value) {
    const mouseX = e.touches[0].clientX - rect.left
    const mouseY = e.touches[0].clientY - rect.top

    const deltaX = mouseX - initialPos.value.x
    const deltaY = mouseY - initialPos.value.y

    offset.value = {
      x: offset.value.x + deltaX,
      y: offset.value.y + deltaY,
    }
    initialPos.value = { x: mouseX, y: mouseY }
  } else if (e.touches.length === 2 && lastTouchDistance.value !== null) {
    const touch1 = e.touches[0]
    const touch2 = e.touches[1]

    const centerX = (touch1.clientX + touch2.clientX) / 2 - rect.left
    const centerY = (touch1.clientY + touch2.clientY) / 2 - rect.top

    const newDistance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY,
    )

    const scaleFactor = newDistance / lastTouchDistance.value
    const newScale = Math.min(Math.max(scale.value * scaleFactor, 0.05), 100)

    offset.value = {
      x:
        centerX -
        rect.width / 2 -
        (centerX - rect.width / 2 - offset.value.x) * (newScale / scale.value),
      y:
        centerY -
        rect.height / 2 -
        (centerY - rect.height / 2 - offset.value.y) * (newScale / scale.value),
    }

    scale.value = newScale
    lastTouchDistance.value = newDistance
  }
}

function handleTouchEnd() {
  isDragging.value = false
  lastTouchDistance.value = null
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === "Escape") {
    emit("close")
  }
}

onMounted(() => {
  document.addEventListener("keydown", handleKeyDown)
  document.body.style.overflow = "hidden"
})

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyDown)
  document.body.style.overflow = ""
})
</script>

<template>
  <div
    class="relative overflow-hidden h-screen w-full"
    style="touch-action: none; overscroll-behavior: none"
    @wheel.prevent="handleWheel"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseUp"
    @dblclick="handleDoubleClick"
    @touchstart="handleTouchStart"
    @touchmove.prevent="handleTouchMove"
    @touchend="handleTouchEnd"
    @touchcancel="handleTouchEnd"
  >
    <div class="absolute inset-0 flex items-center justify-center">
      <img
        class="object-contain select-none"
        :style="imageStyle"
        :src="src"
        :alt="alt"
        draggable="false"
      />
    </div>
    <div
      class="absolute top-4 right-16 px-3 py-1 bg-black/50 text-white rounded-lg text-sm"
    >
      {{ zoomPercentage }}%
    </div>
  </div>
</template>
