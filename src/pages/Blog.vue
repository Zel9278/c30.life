<script setup lang="ts">
import { ref, onMounted } from "vue"
import { RouterLink } from "vue-router"

interface BlogPost {
  id: string
  title: string
  date: string
  views: number
}

const posts = ref<BlogPost[]>([])
const loading = ref(true)
const error = ref(false)

onMounted(async () => {
  try {
    const response = await fetch("/api/blog")
    if (!response.ok) throw new Error("Failed to fetch")
    posts.value = await response.json()
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
</script>

<template>
  <section class="w-full max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto">
    <div
      class="backdrop-blur-xl bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-2xl"
    >
      <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">Blog</h1>
      <p class="text-neutral-400 text-sm mb-4">c30のブログです</p>

      <div class="bg-neutral-700 w-full h-0.5 rounded mb-4" />

      <!-- Loading -->
      <div v-if="loading" class="space-y-4">
        <div
          v-for="i in 3"
          :key="i"
          class="animate-pulse bg-neutral-800/50 rounded-xl p-4"
        >
          <div class="h-6 bg-neutral-700 rounded w-3/4 mb-2" />
          <div class="h-4 bg-neutral-700 rounded w-1/4" />
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-8">
        <p class="text-red-400">記事の読み込みに失敗しました</p>
      </div>

      <!-- Empty -->
      <div v-else-if="posts.length === 0" class="text-center py-8">
        <p class="text-neutral-400">まだ記事がありません</p>
      </div>

      <!-- Posts -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <RouterLink
          v-for="post in posts"
          :key="post.id"
          :to="`/blog/${post.id}`"
          class="bg-neutral-800/50 border border-neutral-700 rounded-xl p-4 hover:bg-neutral-700/50 transition-colors group"
        >
          <h2
            class="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors mb-2"
          >
            {{ post.title }}
          </h2>
          <div class="flex items-center gap-3 text-neutral-400 text-sm">
            <span>{{ formatDate(post.date) }}</span>
            <span class="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              {{ post.views }}
            </span>
          </div>
        </RouterLink>
      </div>
    </div>
  </section>
</template>
