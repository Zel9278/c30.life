import { ref } from "vue"

const BASE_Z_INDEX = 9000
const activeWindows = ref<string[]>([])

export function useWindowManager() {
  // Register a window
  function registerWindow(id: string) {
    if (!activeWindows.value.includes(id)) {
      activeWindows.value.push(id)
    }
  }

  // Unregister a window
  function unregisterWindow(id: string) {
    const index = activeWindows.value.indexOf(id)
    if (index > -1) {
      activeWindows.value.splice(index, 1)
    }
  }

  // Bring a window to front
  function bringToFront(id: string) {
    const index = activeWindows.value.indexOf(id)
    if (index > -1) {
      activeWindows.value.splice(index, 1)
      activeWindows.value.push(id)
    }
  }

  // Get z-index for a window
  function getZIndex(id: string): number {
    const index = activeWindows.value.indexOf(id)
    // If not registered yet, return base z-index
    if (index === -1) return BASE_Z_INDEX
    return BASE_Z_INDEX + index
  }

  // Check if a window is on top
  function isOnTop(id: string): boolean {
    return activeWindows.value[activeWindows.value.length - 1] === id
  }

  return {
    activeWindows,
    registerWindow,
    unregisterWindow,
    bringToFront,
    getZIndex,
    isOnTop,
  }
}
