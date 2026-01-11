<script setup lang="ts">
import { ref } from "vue"

const pubkeys = [
  {
    title: "SSH",
    content:
      "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAUPX3H1WYraFO4i9XHZPA7Mytzxjl6buDkIsvP45adw",
  },
  {
    title: "PGP",
    content: "5717936DE6707ABE284ADB9A4C10C121022E422D",
  },
  {
    title: "Steam",
    content: ["1012960934", "fuji_midi"],
  },
]

const copiedKey = ref<string | null>(null)

const copyToClipboard = async (text: string, key: string) => {
  await navigator.clipboard.writeText(text)
  copiedKey.value = key
  setTimeout(() => {
    copiedKey.value = null
  }, 2000)
}

const getContents = (content: string | string[]): string[] => {
  return Array.isArray(content) ? content : [content]
}

const getCopyKey = (title: string, index: number): string => {
  return `${title}-${index}`
}
</script>

<template>
  <section class="w-full max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto">
    <div
      class="backdrop-blur-xl bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-2xl"
    >
      <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">
        Public Keys
      </h1>
      <p class="text-neutral-400 text-sm mb-4">c30の公開鍵・ID一覧</p>

      <div class="bg-neutral-700 w-full h-0.5 rounded mb-4" />

      <ul class="space-y-4">
        <li
          v-for="key in pubkeys"
          :key="key.title"
          class="rounded-lg p-4 bg-neutral-800/50 border border-neutral-700"
        >
          <h3 class="text-white font-semibold mb-2">{{ key.title }}</h3>
          <div class="space-y-2">
            <div
              v-for="(content, idx) in getContents(key.content)"
              :key="idx"
              class="flex items-center gap-2"
            >
              <code
                class="flex-1 text-neutral-300 text-sm font-mono px-3 py-2 rounded break-all transition-colors duration-300"
                :class="
                  copiedKey === getCopyKey(key.title, idx)
                    ? 'bg-green-900/50 ring-1 ring-green-600'
                    : 'bg-neutral-900/50'
                "
              >
                {{ content }}
              </code>
              <button
                type="button"
                class="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-lg transition-colors relative"
                title="Copy"
                @click="copyToClipboard(content, getCopyKey(key.title, idx))"
              >
                <!-- Check icon when copied -->
                <svg
                  v-if="copiedKey === getCopyKey(key.title, idx)"
                  class="w-5 h-5 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <!-- Copy icon -->
                <svg
                  v-else
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <!-- Copied tooltip -->
                <Transition name="fade">
                  <span
                    v-if="copiedKey === getCopyKey(key.title, idx)"
                    class="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs text-white bg-green-600 rounded whitespace-nowrap"
                  >
                    Copied!
                  </span>
                </Transition>
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
