<script setup lang="ts">
import { ref } from "vue"
import { RouterLink, useRoute } from "vue-router"
import { menuItems, siteTitle } from "../data/navigation.ts"

const route = useRoute()
const isOpen = ref(false)

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const closeMenu = () => {
  isOpen.value = false
}

const isActive = (path: string) => {
  if (path === "/") {
    return route.path === "/"
  }
  return route.path.startsWith(path)
}
</script>

<template>
  <!-- Header -->
  <header
    class="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-neutral-900/80 border-b border-neutral-800"
  >
    <div
      class="max-w-4xl lg:max-w-6xl xl:max-w-full xl:px-8 mx-auto px-4 h-14 flex items-center justify-between"
    >
      <!-- Logo -->
      <RouterLink
        to="/"
        class="text-lg font-bold text-white hover:text-neutral-300 transition-colors"
        @click="closeMenu"
      >
        {{ siteTitle }}
      </RouterLink>

      <!-- Hamburger Button -->
      <button
        type="button"
        class="relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-neutral-800 transition-colors"
        :aria-expanded="isOpen"
        aria-label="Menu"
        @click="toggleMenu"
      >
        <div class="w-5 h-4 flex flex-col justify-between">
          <span
            class="w-full h-0.5 bg-white rounded transition-all duration-300 origin-center"
            :class="isOpen ? 'rotate-45 translate-y-[7px]' : ''"
          />
          <span
            class="w-full h-0.5 bg-white rounded transition-all duration-300"
            :class="isOpen ? 'opacity-0 scale-0' : ''"
          />
          <span
            class="w-full h-0.5 bg-white rounded transition-all duration-300 origin-center"
            :class="isOpen ? '-rotate-45 -translate-y-[7px]' : ''"
          />
        </div>
      </button>
    </div>
  </header>

  <!-- Mobile Menu Overlay -->
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
      @click="closeMenu"
    />
  </Transition>

  <!-- Mobile Menu Panel -->
  <Transition name="slide">
    <nav
      v-if="isOpen"
      class="fixed top-14 right-0 z-50 w-64 h-[calc(100vh-3.5rem)] overflow-y-auto overscroll-contain bg-neutral-900 border-l border-neutral-800 shadow-2xl"
    >
      <ul class="p-4 space-y-2">
        <li v-for="item in menuItems" :key="item.to">
          <RouterLink
            :to="item.to"
            class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
            :class="
              isActive(item.to)
                ? 'bg-white/10 text-white border border-white/20'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
            "
            @click="closeMenu"
          >
            <svg
              v-if="item.icon.type === 'stroke'"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                :d="item.icon.d"
              />
            </svg>
            <img
              v-else
              :src="item.icon.src"
              alt=""
              class="w-5 h-5 invert"
            />
            <span>{{ item.label }}</span>
          </RouterLink>
        </li>
      </ul>
    </nav>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
