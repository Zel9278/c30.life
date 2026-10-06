<script setup lang="ts">
import {
  animeGroups,
  animeTableHeaders,
  ratingStar,
  watchedAnimesPage,
} from "../data/watchedAnimes.ts"
</script>

<template>
  <section class="w-full max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto">
    <div
      class="backdrop-blur-xl bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-2xl"
    >
      <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">
        {{ watchedAnimesPage.title }}
      </h1>
      <p class="text-neutral-400 text-sm mb-4">
        {{ watchedAnimesPage.subtitle }}
      </p>

      <div class="bg-neutral-700 w-full h-0.5 rounded mb-4" />

      <p class="text-neutral-300 text-sm mb-4">
        <template
          v-for="(line, lineIndex) in watchedAnimesPage.intro"
          :key="lineIndex"
        >
          <br v-if="lineIndex > 0" />{{ line }}
        </template>
      </p>

      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-center text-sm">
          <thead>
            <tr>
              <th
                v-for="header in animeTableHeaders"
                :key="header"
                class="border border-neutral-600 bg-neutral-800/50 px-3 py-2 text-white"
              >
                {{ header }}
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-for="group in animeGroups" :key="group.label">
              <!-- Group Header -->
              <tr>
                <td colspan="4" class="py-2 text-green-400 font-semibold">
                  {{ group.label }}
                </td>
              </tr>
              <!-- Group Animes -->
              <tr v-for="anime in group.animes" :key="anime.title">
                <td class="border border-neutral-600 px-3 py-2">
                  <a
                    :href="anime.url"
                    class="text-blue-400 hover:underline hover:text-blue-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ anime.title }}
                  </a>
                </td>
                <td
                  class="border border-neutral-600 px-3 py-2 text-neutral-300"
                >
                  {{ anime.genre }}
                </td>
                <td
                  class="border border-neutral-600 px-3 py-2 text-neutral-300"
                >
                  {{ anime.date }}
                </td>
                <td class="border border-neutral-600 px-3 py-2">
                  <span
                    v-for="i in ratingStar(anime.rating).fullStars"
                    :key="`full-${i}`"
                    class="text-yellow-400"
                    >★</span
                  >
                  <span
                    v-if="ratingStar(anime.rating).halfStar > 0"
                    class="text-yellow-400"
                    >✢</span
                  >
                  <span
                    v-for="i in ratingStar(anime.rating).emptyStars"
                    :key="`empty-${i}`"
                    class="text-gray-500"
                    >★</span
                  >
                  <span class="text-neutral-400 ml-1"
                    >({{ anime.rating }}/10)</span
                  >
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
