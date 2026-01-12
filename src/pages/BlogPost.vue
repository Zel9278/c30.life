<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { marked } from "marked"
import { markedHighlight } from "marked-highlight"
// Import highlight.js core and only necessary languages
import hljs from "highlight.js/lib/core"
import javascript from "highlight.js/lib/languages/javascript"
import typescript from "highlight.js/lib/languages/typescript"
import python from "highlight.js/lib/languages/python"
import bash from "highlight.js/lib/languages/bash"
import json from "highlight.js/lib/languages/json"
import css from "highlight.js/lib/languages/css"
import xml from "highlight.js/lib/languages/xml"
import markdown from "highlight.js/lib/languages/markdown"
import rust from "highlight.js/lib/languages/rust"
import go from "highlight.js/lib/languages/go"
import java from "highlight.js/lib/languages/java"
import cpp from "highlight.js/lib/languages/cpp"
import c from "highlight.js/lib/languages/c"
import sql from "highlight.js/lib/languages/sql"
import yaml from "highlight.js/lib/languages/yaml"
import dockerfile from "highlight.js/lib/languages/dockerfile"
import lua from "highlight.js/lib/languages/lua"
import plaintext from "highlight.js/lib/languages/plaintext"
import "highlight.js/styles/github-dark.css"
import ImageViewerProvider from "@/components/ImageViewerProvider.vue"
import Window from "@/components/Window.vue"

// Register languages
hljs.registerLanguage("javascript", javascript)
hljs.registerLanguage("js", javascript)
hljs.registerLanguage("typescript", typescript)
hljs.registerLanguage("ts", typescript)
hljs.registerLanguage("python", python)
hljs.registerLanguage("py", python)
hljs.registerLanguage("bash", bash)
hljs.registerLanguage("sh", bash)
hljs.registerLanguage("shell", bash)
hljs.registerLanguage("json", json)
hljs.registerLanguage("css", css)
hljs.registerLanguage("xml", xml)
hljs.registerLanguage("html", xml)
hljs.registerLanguage("markdown", markdown)
hljs.registerLanguage("md", markdown)
hljs.registerLanguage("rust", rust)
hljs.registerLanguage("rs", rust)
hljs.registerLanguage("go", go)
hljs.registerLanguage("java", java)
hljs.registerLanguage("cpp", cpp)
hljs.registerLanguage("c", c)
hljs.registerLanguage("sql", sql)
hljs.registerLanguage("yaml", yaml)
hljs.registerLanguage("yml", yaml)
hljs.registerLanguage("dockerfile", dockerfile)
hljs.registerLanguage("docker", dockerfile)
hljs.registerLanguage("lua", lua)
hljs.registerLanguage("plaintext", plaintext)
hljs.registerLanguage("text", plaintext)

interface BlogPostDetail {
  id: string
  title: string
  date: string
  content: string
  views: number
}

const route = useRoute()
const router = useRouter()

const post = ref<BlogPostDetail | null>(null)
const loading = ref(true)
const error = ref(false)

// Configure marked with syntax highlighting
marked.use(
  markedHighlight({
    emptyLangClass: "hljs language-plaintext",
    langPrefix: "hljs language-",
    highlight(code, lang) {
      try {
        const language = hljs.getLanguage(lang) ? lang : "plaintext"
        return hljs.highlight(code, { language }).value
      } catch {
        // If highlighting fails, return escaped code
        return code
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
      }
    },
  }),
)

// Custom renderer to add data-viewer to images
const renderer = new marked.Renderer()
renderer.image = ({ href, title, text }) => {
  const titleAttr = title ? ` title="${title}"` : ""
  return `<img src="${href}" alt="${text}"${titleAttr} data-viewer="true" class="cursor-pointer transition-transform hover:scale-[1.02]" />`
}
marked.use({ renderer })

const renderedContent = computed(() => {
  if (!post.value) return ""
  return marked(post.value.content)
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

const shareToX = () => {
  const title = encodeURIComponent(`${post.value?.title} | Blog`)
  const url = encodeURIComponent(`https://c30.life/blog/${route.params.id}`)
  window.open(`https://x.com/intent/post?url=${url}&text=${title}`, "_blank")
}

const copyUrl = async () => {
  const url = `https://c30.life/blog/${route.params.id}`
  await navigator.clipboard.writeText(url)
}

onMounted(async () => {
  const id = route.params.id as string
  const maxRetries = 2

  try {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(`/api/blog?id=${encodeURIComponent(id)}`)
        if (!response.ok) {
          if (response.status === 404) {
            router.push("/404")
            return
          }
          throw new Error(`HTTP ${response.status}`)
        }
        post.value = await response.json()
        return // Success, exit
      } catch (e) {
        if (attempt === maxRetries) {
          console.error("Blog fetch failed:", e)
          error.value = true
        } else {
          // Wait before retry (exponential backoff)
          await new Promise((resolve) =>
            setTimeout(resolve, 200 * Math.pow(2, attempt)),
          )
        }
      }
    }
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="w-full max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto">
    <div
      class="backdrop-blur-xl bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 md:p-6 shadow-2xl"
    >
      <!-- Loading -->
      <div v-if="loading" class="animate-pulse">
        <div class="h-8 bg-neutral-700 rounded w-3/4 mb-4" />
        <div class="h-4 bg-neutral-700 rounded w-1/4 mb-6" />
        <div class="space-y-3">
          <div class="h-4 bg-neutral-700 rounded w-full" />
          <div class="h-4 bg-neutral-700 rounded w-5/6" />
          <div class="h-4 bg-neutral-700 rounded w-4/6" />
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-8">
        <p class="text-red-400">記事の読み込みに失敗しました</p>
        <RouterLink to="/blog" class="text-blue-400 hover:underline mt-4 block">
          ← ブログ一覧に戻る
        </RouterLink>
      </div>

      <!-- Post Content -->
      <template v-else-if="post">
        <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">
          {{ post.title }}
        </h1>
        <div class="flex items-center gap-4 text-neutral-400 text-sm mb-4">
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
            {{ post.views }} views
          </span>
        </div>

        <div class="bg-neutral-700 w-full h-0.5 rounded mb-4" />

        <!-- Share -->
        <div class="flex flex-wrap gap-3 mb-4">
          <button
            type="button"
            class="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-sm transition-colors"
            @click="shareToX"
          >
            Share to X
          </button>
          <button
            type="button"
            class="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-sm transition-colors"
            @click="copyUrl"
          >
            Copy URL
          </button>
        </div>

        <div class="bg-neutral-700 w-full h-0.5 rounded mb-4" />

        <!-- Content -->
        <ImageViewerProvider>
          <div
            class="blog-content prose prose-invert max-w-none"
            v-html="renderedContent"
          />
        </ImageViewerProvider>

        <div class="bg-neutral-700 w-full h-0.5 rounded my-6" />

        <RouterLink
          to="/blog"
          class="text-blue-400 hover:underline inline-flex items-center gap-1"
        >
          ← ブログ一覧に戻る
        </RouterLink>
      </template>
    </div>
  </section>

  <!-- Advertisement Window -->
  <Window
    title="広告"
    id="advertisement"
    :is-close="true"
    :is-window-d-v-d="true"
  >
    <div class="space-y-2">
      <a
        href="https://misskey.art"
        target="_blank"
        class="flex items-center gap-2 text-gray-400 hover:text-white hover:underline"
      >
        <p>
          [広告] Misskey.art -
          創作活動をする人や見る人を歓迎するMisskeyのサーバーです。🔗
        </p>
        <img src="/mi-art.png" alt="misskey.art" class="w-[50px] h-[50px]" />
      </a>
      <a
        href="https://relay.tools.c30.life"
        target="_blank"
        class="block text-gray-400 hover:text-white hover:underline"
      >
        [広告] 炒めて切った野菜ジュース Activity Relay Service -
        ActivityPub用のリレーサービスです🔗
      </a>
      <a
        href="https://chat.dev.c30.life"
        target="_blank"
        class="block text-gray-400 hover:text-white hover:underline"
      >
        [広告] 炒めて切った野菜ジュースのチャット -
        OpenPGPのログイン対応、MFM対応のチャットサイトです🔗
      </a>
    </div>
  </Window>
</template>

<style>
.blog-content {
  color: #e5e5e5;
}

.blog-content h1 {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.blog-content h2 {
  font-size: 1.25rem;
  font-weight: bold;
  color: white;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.blog-content h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.blog-content p {
  margin-bottom: 1rem;
  line-height: 1.625;
}

.blog-content a {
  color: #60a5fa;
}

.blog-content a:hover {
  text-decoration: underline;
}

.blog-content ul,
.blog-content ol {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.blog-content ul {
  list-style-type: disc;
}

.blog-content ol {
  list-style-type: decimal;
}

.blog-content li {
  margin-bottom: 0.25rem;
}

.blog-content code {
  background-color: #262626;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-family: monospace;
}

.blog-content pre {
  background-color: #262626;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-bottom: 1rem;
}

.blog-content pre code {
  background-color: transparent;
  padding: 0;
}

.blog-content blockquote {
  border-left: 4px solid #525252;
  padding-left: 1rem;
  font-style: italic;
  color: #a3a3a3;
  margin: 1rem 0;
}

.blog-content img {
  border-radius: 0.5rem;
  max-width: 100%;
  height: auto;
  margin: 1rem 0;
}

.blog-content hr {
  border-color: #404040;
  margin: 1.5rem 0;
}

.blog-content table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

.blog-content th,
.blog-content td {
  border: 1px solid #404040;
  padding: 0.5rem 0.75rem;
}

.blog-content th {
  background-color: #262626;
  color: white;
}
</style>
