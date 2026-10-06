<script setup lang="ts">
import { dependencies, devDependencies, licenses } from "virtual:package-info"
import {
  siteInfo as baseSiteInfo,
  siteFileLinks,
  siteRepositories,
} from "../data/siteInfo.ts"

const siteInfo = {
  ...baseSiteInfo,
  version: __APP_VERSION__,
}

const getLicenseColor = (license: string) => {
  if (license.includes("MIT")) return "badge-success"
  if (license.includes("Apache")) return "badge-info"
  if (license.includes("BSD")) return "badge-warning"
  if (license.includes("ISC")) return "badge-info"
  return "badge-neutral"
}
</script>

<template>
  <section class="w-full max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto">
    <div
      class="backdrop-blur-xl bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-2xl"
    >
      <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">Info</h1>
      <p class="text-neutral-400 text-sm mb-4">c30.lifeの情報</p>

      <div class="bg-neutral-700 w-full h-0.5 rounded mb-4" />

      <!-- Site Info -->
      <ul class="text-neutral-300 space-y-1 mb-4">
        <li>ホスト: {{ siteInfo.host }}</li>
        <li>オーナー: {{ siteInfo.owner }}</li>
        <li class="bg-neutral-700 w-full h-0.5 rounded my-2" />
        <li>このサイトバージョン: {{ siteInfo.version }}</li>
        <li class="bg-neutral-700 w-full h-0.5 rounded my-2" />
        <li v-for="item in siteFileLinks" :key="item.href">
          {{ item.label }}:
          <a
            :href="item.href"
            target="_blank"
            class="text-sky-400 hover:text-sky-300 transition-colors"
          >
            {{ item.text }}
          </a>
        </li>
        <li>
          Repository:
          <template v-for="(repo, index) in siteRepositories" :key="repo.href">
            <template v-if="index > 0"> , </template>
            <a
              :href="repo.href"
              target="_blank"
              class="text-sky-400 hover:text-sky-300 transition-colors"
            >
              {{ repo.text }}
            </a>
          </template>
        </li>
      </ul>

      <div class="bg-neutral-700 w-full h-0.5 rounded my-4" />

      <!-- Dependencies -->
      <details
        class="collapse collapse-arrow bg-neutral-800/50 border border-neutral-700 rounded-lg mb-3"
      >
        <summary class="collapse-title text-lg font-medium text-white">
          Dependencies
        </summary>
        <div class="collapse-content">
          <ul class="text-neutral-300 text-sm space-y-1 pt-2">
            <li v-for="dep in dependencies" :key="dep.name">
              {{ dep.name }}: {{ dep.version }}
            </li>
          </ul>
        </div>
      </details>

      <!-- DevDependencies -->
      <details
        class="collapse collapse-arrow bg-neutral-800/50 border border-neutral-700 rounded-lg mb-3"
      >
        <summary class="collapse-title text-lg font-medium text-white">
          DevDependencies
        </summary>
        <div class="collapse-content">
          <ul class="text-neutral-300 text-sm space-y-1 pt-2">
            <li v-for="dep in devDependencies" :key="dep.name">
              {{ dep.name }}: {{ dep.version }}
            </li>
          </ul>
        </div>
      </details>

      <div class="bg-neutral-700 w-full h-0.5 rounded my-4" />

      <!-- Licenses -->
      <details
        class="collapse collapse-arrow bg-neutral-800/50 border border-neutral-700 rounded-lg"
      >
        <summary class="collapse-title text-lg font-medium text-white">
          Licenses
        </summary>
        <div class="collapse-content">
          <div class="space-y-3 pt-2">
            <div
              v-for="pkg in licenses"
              :key="pkg.name"
              class="collapse collapse-arrow bg-neutral-900/50 border border-neutral-700 rounded-lg"
            >
              <input type="checkbox" />
              <div class="collapse-title">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-white font-medium">{{ pkg.name }}</span>
                  <span class="text-neutral-500 text-sm font-mono">{{
                    pkg.version
                  }}</span>
                  <span
                    class="badge badge-sm"
                    :class="getLicenseColor(pkg.license)"
                  >
                    {{ pkg.license }}
                  </span>
                </div>
                <div class="flex flex-wrap items-center gap-3 mt-1">
                  <a
                    :href="pkg.repository"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-sky-400 hover:text-sky-300 transition-colors text-xs flex items-center gap-1 relative z-10 pointer-events-auto"
                  >
                    <svg
                      class="w-3.5 h-3.5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                      />
                    </svg>
                    GitHub
                  </a>
                  <a
                    :href="`https://www.npmjs.com/package/${pkg.name}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-red-400 hover:text-red-300 transition-colors text-xs flex items-center gap-1 relative z-10 pointer-events-auto"
                  >
                    <svg
                      class="w-3.5 h-3.5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z"
                      />
                    </svg>
                    npm
                  </a>
                  <span v-if="pkg.publisher" class="text-neutral-500 text-xs">
                    by {{ pkg.publisher }}
                  </span>
                </div>
              </div>
              <div class="collapse-content">
                <div
                  class="bg-neutral-900/80 rounded-lg p-3 mt-2 overflow-x-auto border border-neutral-700"
                >
                  <pre
                    class="text-neutral-300 text-xs whitespace-pre-wrap font-mono"
                    >{{ pkg.licenseText }}</pre
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </details>

      <div class="mt-4 pt-4 border-t border-neutral-800">
        <p class="text-neutral-500 text-xs">
          All packages are used under their respective licenses.
        </p>
      </div>
    </div>
  </section>
</template>
