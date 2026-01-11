<script setup lang="ts">
import TimelineComponent from "../components/Timeline.vue"
</script>

<template>
  <section class="w-full max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto">
    <div
      class="backdrop-blur-xl bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-2xl"
    >
      <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">Timeline</h1>
      <p class="text-neutral-400 text-sm mb-4">
        色々と情報が抜けているタイムラインです
      </p>

      <div class="bg-neutral-700 w-full h-0.5 rounded mb-4" />

      <TimelineComponent />
    </div>
  </section>
</template>
