<script setup lang="ts">
import { computed } from "vue"
import { RouterView, useRoute } from "vue-router"
import Confetti from "./components/Confetti.vue"
import Header from "./components/Header.vue"

const route = useRoute()
const hideFooter = computed(() => route.meta.hideFooter === true)
const hideHeader = computed(() => route.meta.hideHeader === true)
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
        hideHeader ? 'p-0' : 'px-4 xl:px-8 pt-20 pb-8 md:pt-24 md:pb-16',
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
