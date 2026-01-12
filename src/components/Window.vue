<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from "vue"
import { useWindowManager } from "@/composables/useWindowManager"

const props = withDefaults(
  defineProps<{
    title: string
    id: string
    isClose?: boolean
    isWindowDVD?: boolean
    enableBlur?: boolean
  }>(),
  {
    isClose: false,
    isWindowDVD: false,
    enableBlur: false,
  },
)

const emit = defineEmits<{
  close: []
}>()

const { registerWindow, unregisterWindow, bringToFront, getZIndex, isOnTop } =
  useWindowManager()

const isDragging = ref(false)
const isVisible = ref(true)
const position = ref({ x: 16, y: 100 })
const startPosition = ref({ x: 0, y: 0 })
const windowRef = ref<HTMLElement | null>(null)
const topSize = 64 // Header height
const bottomSize = 0
const isMobile = ref(false)

const moveX = ref(1)
const moveY = ref(1)
const accelX = ref(0.1)
const accelY = ref(0.1)

let dvdInterval: ReturnType<typeof setInterval> | null = null

const windowStyle = computed(() => ({
  top: "0px",
  left: "0px",
  transform: `translate(${position.value.x}px, ${position.value.y}px)`,
  zIndex: getZIndex(props.id),
}))

const isActive = computed(() => isOnTop(props.id))

// Mouse move handler
function handleMouseMove(event: MouseEvent) {
  event.preventDefault()

  let x = event.clientX - startPosition.value.x
  let y = event.clientY - startPosition.value.y

  const el = windowRef.value
  if (!el) return

  if (x < 0) {
    x = 0
  } else if (x + el.offsetWidth > window.innerWidth) {
    x = window.innerWidth - el.offsetWidth
  }

  if (y < topSize) {
    y = topSize
  } else if (y + el.offsetHeight > window.innerHeight - bottomSize) {
    y = window.innerHeight - el.offsetHeight - bottomSize
  }

  position.value = { x, y }
}

// Mouse up handler
function handleMouseUp() {
  isDragging.value = false
}

// Touch move handler
function handleTouchMove(event: TouchEvent) {
  event.preventDefault()

  const touch = event.touches[0]

  let x = touch.clientX - startPosition.value.x
  let y = touch.clientY - startPosition.value.y

  const el = windowRef.value
  if (!el) return

  if (x < 0) {
    x = 0
  } else if (x + el.offsetWidth > window.innerWidth) {
    x = window.innerWidth - el.offsetWidth
  }

  if (y < topSize) {
    y = topSize
  } else if (y + el.offsetHeight > window.innerHeight - bottomSize) {
    y = window.innerHeight - el.offsetHeight - bottomSize
  }

  position.value = { x, y }
}

// Touch end handler
function handleTouchEnd() {
  isDragging.value = false
  document.body.style.overscrollBehavior = "auto"
  document.body.style.touchAction = "auto"
  document.documentElement.style.overscrollBehavior = "auto"
  document.documentElement.style.touchAction = "auto"
}

// Resize handler
function handleResize(_event: Event) {
  isMobile.value = window.innerWidth < 640

  const width = window.innerWidth
  const height = window.innerHeight

  const el = windowRef.value
  if (!el) return

  const windowWidth = el.offsetWidth
  const windowHeight = el.offsetHeight

  let x = position.value.x
  let y = position.value.y

  // Left boundary
  if (x < 0) {
    x = 0
  }
  // Right boundary
  if (x + windowWidth > width) {
    x = Math.max(0, width - windowWidth)
  }
  // Top boundary (header)
  if (y < topSize) {
    y = topSize
  }
  // Bottom boundary
  if (y + windowHeight > height - bottomSize) {
    y = Math.max(topSize, height - windowHeight - bottomSize)
  }

  if (position.value.x !== x || position.value.y !== y) {
    position.value = { x, y }
  }

  // Restart DVD animation with new dimensions if enabled
  if (props.isWindowDVD && !isDragging.value) {
    stopDVDAnimation()
    startDVDAnimation()
  }
}
// DVD animation
function startDVDAnimation() {
  const el = windowRef.value
  if (!el || !props.isWindowDVD || isDragging.value) return

  accelX.value = (Math.random() - 0.5) * 0.8
  accelY.value = (Math.random() - 0.5) * 0.8

  dvdInterval = setInterval(() => {
    const currentEl = windowRef.value
    if (!currentEl) return

    // Get current dimensions dynamically
    const windowWidth = currentEl.offsetWidth
    const windowHeight = currentEl.offsetHeight
    const width = window.innerWidth
    const height = window.innerHeight

    moveX.value += accelX.value * 0.8
    moveY.value += accelY.value * 0.8

    // Limit max speed
    moveX.value = Math.max(-3, Math.min(3, moveX.value))
    moveY.value = Math.max(-3, Math.min(3, moveY.value))

    const nextX = position.value.x + moveX.value
    const nextY = position.value.y + moveY.value

    if (nextX < 0 || nextX + windowWidth > width) {
      moveX.value = -moveX.value
      accelX.value = -(Math.random() - 0.5) * 0.8
    }

    if (nextY < topSize || nextY + windowHeight > height - bottomSize) {
      moveY.value = -moveY.value
      accelY.value = -(Math.random() - 0.5) * 0.8
    }

    position.value = {
      x: Math.max(
        0,
        Math.min(width - windowWidth, position.value.x + moveX.value),
      ),
      y: Math.max(
        topSize,
        Math.min(
          height - windowHeight - bottomSize,
          position.value.y + moveY.value,
        ),
      ),
    }
  }, 1000 / 24)
}

function stopDVDAnimation() {
  if (dvdInterval) {
    clearInterval(dvdInterval)
    dvdInterval = null
  }
}

// Bring window to front using window manager
function handleBringToFront() {
  bringToFront(props.id)
}

// Titlebar mouse down
function onTitlebarMouseDown(event: MouseEvent) {
  event.preventDefault()
  isDragging.value = true
  startPosition.value = {
    x: event.clientX - position.value.x,
    y: event.clientY - position.value.y,
  }
}

// Titlebar touch start
function onTitlebarTouchStart(event: TouchEvent) {
  event.preventDefault()
  const touch = event.touches[0]

  document.body.style.overscrollBehavior = "none"
  document.body.style.touchAction = "none"
  document.documentElement.style.overscrollBehavior = "none"
  document.documentElement.style.touchAction = "none"

  isDragging.value = true
  startPosition.value = {
    x: touch.clientX - position.value.x,
    y: touch.clientY - position.value.y,
  }
}

// Close button click
function onCloseClick(event: MouseEvent) {
  event.preventDefault()
  isVisible.value = false
  unregisterWindow(props.id)
  emit("close")
}

// Watch dragging state
watch(isDragging, (dragging) => {
  if (dragging) {
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
    window.addEventListener("touchmove", handleTouchMove, { passive: false })
    window.addEventListener("touchend", handleTouchEnd, { passive: false })
    stopDVDAnimation()
  } else {
    window.removeEventListener("mousemove", handleMouseMove)
    window.removeEventListener("mouseup", handleMouseUp)
    window.removeEventListener("touchmove", handleTouchMove)
    window.removeEventListener("touchend", handleTouchEnd)
    if (props.isWindowDVD) {
      startDVDAnimation()
    }
  }
})

// Watch isWindowDVD prop
watch(
  () => props.isWindowDVD,
  (enabled) => {
    if (enabled && !isDragging.value) {
      startDVDAnimation()
    } else {
      stopDVDAnimation()
    }
  },
)

// Adjust initial position for mobile
function adjustInitialPosition() {
  const el = windowRef.value
  if (!el) return

  isMobile.value = window.innerWidth < 640

  const windowWidth = el.offsetWidth
  const windowHeight = el.offsetHeight
  const screenWidth = window.innerWidth
  const screenHeight = window.innerHeight

  let x = position.value.x
  let y = position.value.y

  // If window is wider than screen, position at left edge
  if (windowWidth > screenWidth) {
    x = 0
  } else if (x + windowWidth > screenWidth) {
    // If window goes off right edge, center it or move left
    x = Math.max(0, (screenWidth - windowWidth) / 2)
  }

  // If window is taller than available space
  if (windowHeight > screenHeight - topSize - bottomSize) {
    y = topSize
  } else if (y + windowHeight > screenHeight - bottomSize) {
    y = Math.max(topSize, screenHeight - windowHeight - bottomSize)
  }

  position.value = { x, y }
}

onMounted(() => {
  registerWindow(props.id)
  window.addEventListener("resize", handleResize)

  // Wait for DOM to be ready, then adjust position
  setTimeout(() => {
    adjustInitialPosition()
    if (props.isWindowDVD) {
      startDVDAnimation()
    }
  }, 0)
})

onUnmounted(() => {
  unregisterWindow(props.id)
  window.removeEventListener("resize", handleResize)
  window.removeEventListener("mousemove", handleMouseMove)
  window.removeEventListener("mouseup", handleMouseUp)
  window.removeEventListener("touchmove", handleTouchMove)
  window.removeEventListener("touchend", handleTouchEnd)
  stopDVDAnimation()
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      ref="windowRef"
      :id="`window-${id}`"
      class="fixed top-0 left-0 min-w-[120px] max-w-[calc(100vw-16px)] rounded-[6px] overflow-hidden backdrop-blur-xl"
      :style="{
        transform: `translate(${position.x}px, ${position.y}px)`,
        zIndex: getZIndex(id),
        boxShadow: isActive
          ? '0 0 0 1px rgba(100,160,220,0.8), 0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)'
          : '0 0 0 1px rgba(80,80,80,0.6), 0 8px 24px rgba(0,0,0,0.5)',
        background: isActive ? 'rgba(30,50,80,0.2)' : 'rgba(40,40,45,0.2)',
      }"
      @mousedown="handleBringToFront"
      @touchstart="handleBringToFront"
    >
      <!-- Titlebar -->
      <div
        :id="`window-${id}-titlebar`"
        class="relative flex justify-between items-center cursor-move select-none h-[26px]"
        :style="{
          background: isActive
            ? 'linear-gradient(180deg, rgba(80,130,200,0.4) 0%, rgba(50,90,150,0.2) 100%)'
            : 'linear-gradient(180deg, rgba(70,70,75,0.4) 0%, rgba(50,50,55,0.2) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }"
        @mousedown="onTitlebarMouseDown"
        @touchstart="onTitlebarTouchStart"
      >
        <div class="mx-3 flex items-center">
          <span
            class="text-[12px]"
            :style="{
              color: isActive ? '#ffffff' : '#888888',
              textShadow: '0 1px 2px rgba(0,0,0,0.5)',
            }"
          >
            {{ title }}
          </span>
        </div>
        <!-- Close button -->
        <div class="flex h-full items-center pr-1">
          <button
            v-if="isClose"
            type="button"
            class="w-[26px] h-[18px] rounded-[3px] flex items-center justify-center transition-all hover:brightness-110"
            :style="{
              background: 'linear-gradient(180deg, #c75050 0%, #b33a3a 100%)',
              border: '1px solid rgba(0,0,0,0.3)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)',
            }"
            @click.stop="onCloseClick"
            @touchend.stop.prevent="onCloseClick"
          >
            <svg class="w-[8px] h-[8px]" viewBox="0 0 10 10">
              <path
                d="M1 1L9 9M9 1L1 9"
                stroke="white"
                stroke-width="2"
                fill="none"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Content area -->
      <div class="relative p-3 text-white">
        <slot />
      </div>
    </div>
  </Teleport>
</template>
