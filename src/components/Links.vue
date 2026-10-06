<script setup lang="ts">
import {
  contacts,
  linkSectionTitles,
  mutualLinks,
  myBanners,
  myFediverseServers,
  otherSites,
  socialLinks,
} from "../data/links.ts"
</script>

<template>
  <!-- Contacts Section -->
  <div class="mb-8">
    <h3 class="text-lg md:text-xl font-semibold text-neutral-300 mb-4">
      {{ linkSectionTitles.contacts }}
    </h3>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      <a
        v-for="link in contacts"
        :key="link.title"
        :href="link.href"
        :rel="link.rel"
        class="group relative px-4 py-3 rounded-xl bg-neutral-800/50 border border-neutral-700/50 hover:border-neutral-600 hover:bg-neutral-800 transition-all duration-300 text-center"
      >
        <span
          class="text-neutral-400 group-hover:text-white transition-colors text-sm md:text-base"
        >
          {{ link.title }}
        </span>
      </a>
    </div>
  </div>

  <!-- Socials Section -->
  <div class="mb-8">
    <h3 class="text-lg md:text-xl font-semibold text-neutral-300 mb-4">
      {{ linkSectionTitles.socials }}
    </h3>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      <a
        v-for="link in socialLinks"
        :key="link.title"
        :href="link.href"
        :rel="link.rel"
        class="group relative px-4 py-3 rounded-xl bg-neutral-800/50 border border-neutral-700/50 hover:border-neutral-600 hover:bg-neutral-800 transition-all duration-300 text-center"
      >
        <span
          class="text-neutral-400 group-hover:text-white transition-colors text-sm md:text-base"
        >
          {{ link.title }}
        </span>
      </a>
    </div>
  </div>

  <!-- Others Section -->
  <div class="mb-8">
    <h3 class="text-lg md:text-xl font-semibold text-neutral-300 mb-4">
      {{ linkSectionTitles.others }}
    </h3>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      <a
        v-for="link in otherSites"
        :key="link.title"
        :href="link.href"
        class="group relative px-4 py-3 rounded-xl bg-neutral-800/50 border border-neutral-700/50 hover:border-neutral-600 hover:bg-neutral-800 transition-all duration-300 text-center"
      >
        <span
          class="text-neutral-400 group-hover:text-white transition-colors text-sm md:text-base"
        >
          {{ link.title }}
        </span>
      </a>
    </div>
  </div>

  <!-- My Fediverse Servers Section -->
  <div class="mb-8">
    <h3 class="text-lg md:text-xl font-semibold text-neutral-300 mb-4">
      {{ linkSectionTitles.fediverse }}
    </h3>
    <div class="flex flex-wrap gap-4">
      <template v-for="link in myFediverseServers" :key="link.title">
        <a
          :href="link.href"
          class="group inline-block p-3 rounded-xl bg-neutral-800/50 border border-neutral-700/50 hover:border-neutral-600 hover:bg-neutral-800 transition-all duration-300"
        >
          <template v-if="link.image">
            <img
              :src="link.image || ''"
              :alt="link.alt"
              width="200"
              height="40"
              class="h-auto rounded-lg opacity-90 group-hover:opacity-100 transition-opacity"
            />
          </template>
          <template v-else>
            <div class="text-center text-neutral-300 font-medium px-4">
              {{ link.title }}
            </div>
          </template>
        </a>
      </template>
    </div>
  </div>

  <!-- Reciprocal Link Section -->
  <div class="mb-8">
    <h3 class="text-lg md:text-xl font-semibold text-neutral-300 mb-4">
      {{ linkSectionTitles.reciprocal }}
    </h3>
    <div class="flex flex-wrap gap-4">
      <template v-for="link in mutualLinks" :key="link.title">
        <a
          :href="link.href"
          class="group inline-block p-3 rounded-xl bg-neutral-800/50 border border-neutral-700/50 hover:border-neutral-600 hover:bg-neutral-800 transition-all duration-300"
        >
          <template v-if="link.image">
            <img
              :src="link.image || ''"
              :alt="link.alt"
              width="200"
              height="40"
              class="h-auto rounded-lg opacity-90 group-hover:opacity-100 transition-opacity"
            />
          </template>
          <template v-else>
            <div class="text-center text-neutral-300 font-medium px-4">
              {{ link.title }}
            </div>
          </template>
        </a>
      </template>
    </div>
  </div>

  <!-- My Banner Section -->
  <div>
    <h3 class="text-lg md:text-xl font-semibold text-neutral-300 mb-4">
      {{ linkSectionTitles.banner }}
    </h3>
    <div class="flex flex-wrap gap-4">
      <a
        v-for="banner in myBanners"
        :key="banner.image ?? banner.href"
        :href="banner.href"
        target="_blank"
        class="group inline-block p-3 rounded-xl bg-neutral-800/50 border border-neutral-700/50 hover:border-neutral-600 hover:bg-neutral-800 transition-all duration-300"
      >
        <img
          :src="banner.image ?? ''"
          :alt="banner.alt"
          :width="banner.width"
          :height="banner.height"
          class="h-auto rounded-lg opacity-90 group-hover:opacity-100 transition-opacity"
        />
      </a>
    </div>
  </div>
</template>
