<script setup lang="ts">
import {
  productCategories,
  productHost,
  productsPage,
} from "../data/products.ts"
</script>

<template>
  <section class="w-full max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto">
    <div
      class="backdrop-blur-xl bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-2xl"
    >
      <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">
        {{ productsPage.title }}
      </h1>
      <p class="text-neutral-400 text-sm mb-4">
        {{ productsPage.subtitle }}（稼働状況は
        <a
          :href="productsPage.statusUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sky-400 hover:text-sky-300 transition-colors"
          >{{ productHost(productsPage.statusUrl) }}</a
        >）
      </p>

      <div class="bg-neutral-700 w-full h-0.5 rounded mb-4" />

      <div v-for="category in productCategories" :key="category.name" class="mb-8 last:mb-0">
        <h3 class="text-lg md:text-xl font-semibold text-neutral-300 mb-4">
          {{ category.name }}
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <a
            v-for="product in category.products"
            :key="product.url"
            :href="product.url"
            target="_blank"
            rel="noopener noreferrer"
            class="group flex flex-col gap-1 px-4 py-3 rounded-xl bg-neutral-800/50 border border-neutral-700/50 hover:border-neutral-600 hover:bg-neutral-800 transition-all duration-300"
          >
            <span
              class="text-neutral-200 group-hover:text-white transition-colors text-sm md:text-base font-medium"
            >
              {{ product.title }}
            </span>
            <span class="text-neutral-500 text-xs break-all">
              {{ productHost(product.url) }}
            </span>
            <span class="text-neutral-400 text-xs md:text-sm leading-relaxed mt-1">
              {{ product.description }}
            </span>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
