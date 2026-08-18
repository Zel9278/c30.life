<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue"
import { RouterView, useRoute } from "vue-router"
import Confetti from "./components/Confetti.vue"
import Header from "./components/Header.vue"

const route = useRoute()
const hideFooter = computed(() => route.meta.hideFooter === true)
const hideHeader = computed(() => route.meta.hideHeader === true)

// The Keep Android Open banner is loaded as a static <script> in index.html
// (so its query params take effect) and rendered into the fixed #my-banner
// bar. Measure that bar's height into --kao-banner-h so the header and page
// content (see index.html / Header.vue) are pushed down below it.
let bannerResize: ResizeObserver | null = null
onMounted(() => {
  const banner = document.getElementById("my-banner")
  if (!banner) return
  const apply = () => {
    document.documentElement.style.setProperty(
      "--kao-banner-h",
      `${banner.offsetHeight}px`,
    )
  }
  apply()
  bannerResize = new ResizeObserver(apply)
  bannerResize.observe(banner)
})

onUnmounted(() => {
  bannerResize?.disconnect()
})
</script>

<template>
  <div class="min-h-screen bg-[#0a0a0a]">
    <!-- Header with hamburger menu -->
    <Header v-if="!hideHeader" />

    <!-- Birthday Confetti -->
    <Confetti v-if="!hideHeader" />

    <!-- Subtle background gradient -->
    <div
      v-if="!hideHeader"
      class="fixed inset-0 overflow-hidden pointer-events-none"
    >
      <div
        class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-neutral-800/20 to-transparent rounded-full blur-3xl"
      />
    </div>

    <!-- Main content -->
    <main
      :class="[
        'relative z-10 flex flex-col items-center',
        hideHeader ? 'p-0' : 'px-4 xl:px-8 pt-[calc(5rem+var(--kao-banner-h,0px))] pb-8 md:pt-[calc(6rem+var(--kao-banner-h,0px))] md:pb-16',
      ]"
    >
      <RouterView />

      <!-- Footer -->
      <footer
        v-if="!hideFooter"
        class="w-full max-w-4xl lg:max-w-6xl xl:max-w-full mx-auto mt-12 md:mt-16 text-center text-gray-500 text-sm"
      >
        <p>© 2026 ced / c30.life</p>
      </footer>
    </main>
  </div>
</template>
