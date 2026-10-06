<script setup lang="ts">
import {
  environmentsPage,
  formatRooted,
  pc,
  pcSpecRows,
  phones,
} from "../data/environments.ts"
</script>

<template>
  <section class="w-full max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto">
    <div
      class="backdrop-blur-xl bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-2xl"
    >
      <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">
        {{ environmentsPage.title }}
      </h1>
      <p class="text-neutral-400 text-sm mb-4">
        {{ environmentsPage.subtitle }}
      </p>

      <div class="bg-neutral-700 w-full h-0.5 rounded mb-4" />

      <!-- PC Section -->
      <h3 class="text-xl font-semibold mb-2 text-white">PC</h3>
      <ul class="list-disc list-inside mb-6 text-neutral-300">
        <li v-for="row in pcSpecRows" :key="row.key">
          {{ row.label }}: {{ pc[row.key] }}
        </li>
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
            <td class="py-2 px-4">{{ formatRooted(phone.rooted) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
