<script setup lang="ts">
import Links from "./components/Links.vue";
import Piano from "./components/Piano.vue";
</script>

<template>
  <div class="font-sans grid">
    <main class="flex flex-col items-center sm:items-center p-4">
      <h1 class="text-[32px]">c30.life</h1>
      <p>I don't have the energy to make a website.</p>
      <p>ced</p>
      <Piano />
      <div class="bg-[#3f3f3f] w-full h-1 my-2 rounded" />
      <h1 class="text-[24px]">Links</h1>
      <Links />
    </main>
  </div>
</template>
