<script setup lang="ts">
const pc = {
  cpu: "11th Gen Intel(R) Core(TM) i7-11800H @ 2.30 GHz",
  gpu: "RTX 3050 Ti Laptop GPU",
  ram: "16GB",
  storage: "512 GB NVMe + 1TB External SSD + 4TB External HDD",
  os: "Windows 11 Home",
  earPhone: "3ｍ earphone",
  mouse: "Logicool G203 LIGHTSYNC",
  tablet: "XPPen Artist 12 Second (Japan Only Model)",
  controller: "Xbox One Controller",
}

const phones = [
  {
    name: "AQUOS R9",
    os: "Android 15",
    rooted: false,
  },
  {
    name: "Google Pixel 8",
    os: "Android 15",
    rooted: true,
  },
  {
    name: "Moto g53y",
    os: "Android 15 with 2by2",
    rooted: true,
  },
]
</script>

<template>
  <section class="w-full max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto">
    <div
      class="backdrop-blur-xl bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-2xl"
    >
      <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">
        Environment
      </h1>
      <p class="text-neutral-400 text-sm mb-4">c30の開発環境</p>

      <div class="bg-neutral-700 w-full h-0.5 rounded mb-4" />

      <!-- PC Section -->
      <h3 class="text-xl font-semibold mb-2 text-white">PC</h3>
      <ul class="list-disc list-inside mb-6 text-neutral-300">
        <li>CPU: {{ pc.cpu }}</li>
        <li>GPU: {{ pc.gpu }}</li>
        <li>RAM: {{ pc.ram }}</li>
        <li>Storage: {{ pc.storage }}</li>
        <li>OS: {{ pc.os }}</li>
        <li>Earphone: {{ pc.earPhone }}</li>
        <li>Mouse: {{ pc.mouse }}</li>
        <li>Tablet: {{ pc.tablet }}</li>
        <li>Controller: {{ pc.controller }}</li>
      </ul>

      <div class="bg-neutral-700 w-full h-0.5 rounded mb-6" />

      <!-- Phones Section -->
      <h3 class="text-xl font-semibold mb-2 text-white">Phones</h3>
      <table
        class="table-auto w-full border border-neutral-700 rounded-lg overflow-hidden"
      >
        <thead class="bg-neutral-800 text-neutral-200">
          <tr>
            <th class="py-2 px-4 text-left">Name</th>
            <th class="py-2 px-4 text-left">OS</th>
            <th class="py-2 px-4 text-left">Rooted</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="phone in phones"
            :key="phone.name"
            class="even:bg-neutral-800/50 odd:bg-neutral-900/50 text-neutral-300"
          >
            <td class="py-2 px-4">{{ phone.name }}</td>
            <td class="py-2 px-4">{{ phone.os }}</td>
            <td class="py-2 px-4">{{ phone.rooted ? "Yes" : "No" }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
