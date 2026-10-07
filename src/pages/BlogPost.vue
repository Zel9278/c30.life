<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import "highlight.js/styles/github-dark.css"
import FediverseShare from "@/components/FediverseShare.vue"
import ImageViewerProvider from "@/components/ImageViewerProvider.vue"
import SocialEmbed from "@/components/SocialEmbed.vue"
import Window from "@/components/Window.vue"
import { formatDateJa } from "@/lib/blog/format.ts"
import { hasLanguage, highlightCode } from "@/lib/blog/hljs.ts"
import {
  countBlogCharacters,
  estimateReadingMinutes,
  type Outline,
  renderBlogMarkdown,
  type SocialEmbedData,
} from "@/lib/blog/markdown.ts"
import { sanitizeBlogHtml } from "@/lib/blog/sanitize.ts"

interface BlogPostDetail {
  id: string
  title: string
  date: string
  content: string
  views: number
  description?: string
  tags?: string[]
  author?: string
  image?: string
  outline?: Outline
}

const route = useRoute()
const router = useRouter()

const post = ref<BlogPostDetail | null>(null)
const loading = ref(true)
const error = ref(false)
const showFloatingToc = ref(false)
const activeHeading = ref<string>("")
const isEditor = ref(false)
const socialEmbeds = ref<SocialEmbedData[]>([])

// Track current heading with scroll
let headingElements: Element[] = []

function updateActiveHeading() {
  if (headingElements.length === 0) return

  const scrollY = window.scrollY
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight

  // If at the very top, clear or use first heading
  if (scrollY < 50) {
    activeHeading.value = ""
    return
  }

  // If at the bottom of the page, highlight the last heading
  if (scrollY + windowHeight >= documentHeight - 50) {
    activeHeading.value = headingElements[headingElements.length - 1].id
    return
  }

  // Find the last heading that has been scrolled past
  // This ensures even short sections get highlighted
  let currentHeading: Element | null = null

  for (const heading of headingElements) {
    const rect = heading.getBoundingClientRect()
    // If heading is above or near the top of viewport (with some offset for header)
    if (rect.top <= 120) {
      currentHeading = heading
    } else {
      // Once we find a heading below the threshold, stop
      break
    }
  }

  if (currentHeading) {
    activeHeading.value = currentHeading.id
  }
}

function setupHeadingObserver() {
  const headings = document.querySelectorAll(
    ".blog-content h1[id], .blog-content h2[id], .blog-content h3[id], .blog-content h4[id], .blog-content h5[id], .blog-content h6[id]",
  )

  if (headings.length === 0) return

  headingElements = Array.from(headings)

  // Initial update
  updateActiveHeading()

  // Update on scroll
  window.addEventListener("scroll", updateActiveHeading, { passive: true })
}

onUnmounted(() => {
  window.removeEventListener("scroll", updateActiveHeading)
})

const rendered = computed(() => {
  if (!post.value) return null
  return renderBlogMarkdown(post.value.content, {
    mode: "spa",
    outline: post.value.outline,
    highlight: highlightCode,
    hasLanguage,
  })
})

// 生 HTML を含むので DOMPurify を通してから v-html に渡す
const renderedContent = computed(() =>
  sanitizeBlogHtml(rendered.value?.html ?? ""),
)
const tocItems = computed(() => rendered.value?.toc ?? [])

// Track rendered embeds to mount after DOM update
const embedsToMount = ref<SocialEmbedData[]>([])

// Watch for rendered content changes to update embeds
watch(
  renderedContent,
  () => {
    // Get embeds from content after parsing
    embedsToMount.value = rendered.value?.embeds ?? []
    // Wait for DOM to update before Teleport can mount
    nextTick(() => {
      socialEmbeds.value = embedsToMount.value
    })
  },
  { immediate: true },
)

// noscript 版と同じ表示 ("2025年1月5日")。日付だけの値は閲覧者のタイムゾーンでずれない
const formatDate = (dateStr: string) => (dateStr ? formatDateJa(dateStr) : "")

// Calculate character count (excluding code blocks and frontmatter)
const characterCount = computed(() =>
  post.value ? countBlogCharacters(post.value.content) : 0,
)

// Calculate reading time (Japanese: ~400-600 chars/min, use 500)
const readingTime = computed(() => estimateReadingMinutes(characterCount.value))

const shareTitle = computed(() => `${post.value?.title} | Blog`)

const shareToX = () => {
  const title = encodeURIComponent(shareTitle.value)
  const url = encodeURIComponent(`https://c30.life/blog/${route.params.id}`)
  window.open(`https://x.com/intent/post?url=${url}&text=${title}`, "_blank")
}

const copyUrl = async () => {
  const url = `https://c30.life/blog/${route.params.id}`
  await navigator.clipboard.writeText(url)
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" })
  showFloatingToc.value = false
  activeHeading.value = ""
}

onMounted(async () => {
  const id = route.params.id as string
  const maxRetries = 2

  // Check if user has edit key stored
  const editKey = localStorage.getItem("blog_edit_key")
  isEditor.value = !!editKey

  try {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // 編集キーがあれば送る (下書きは編集キー付きのリクエストにだけ返される)
        const response = await fetch(`/api/blog?id=${encodeURIComponent(id)}`, {
          headers: editKey ? { "X-Edit-Key": editKey } : undefined,
        })
        if (!response.ok) {
          if (response.status === 404) {
            router.push("/404")
            return
          }
          throw new Error(`HTTP ${response.status}`)
        }
        const fetched = (await response.json()) as BlogPostDetail
        post.value = fetched

        // Update document title with post title
        document.title = `${fetched.title} | Blog | c30.life`

        // Setup code group tabs and heading observer after content is rendered
        setTimeout(() => {
          setupCodeGroupTabs()
          setupHeadingObserver()
        }, 0)
        return // Success, exit
      } catch (e) {
        if (attempt === maxRetries) {
          console.error("Blog fetch failed:", e)
          error.value = true
        } else {
          // Wait before retry (exponential backoff)
          await new Promise((resolve) =>
            setTimeout(resolve, 200 * 2 ** attempt),
          )
        }
      }
    }
  } finally {
    loading.value = false
  }
})

// Setup code group tab switching
function setupCodeGroupTabs() {
  const codeGroups = document.querySelectorAll(".code-group")
  codeGroups.forEach((group) => {
    const tabs = group.querySelectorAll(".code-group-tab")
    const panels = group.querySelectorAll(".code-group-panel")

    for (const tab of tabs) {
      tab.addEventListener("click", () => {
        const tabIndex = tab.getAttribute("data-tab")

        // Update tabs
        for (const t of tabs) t.classList.remove("active")
        tab.classList.add("active")

        // Update panels
        for (const p of panels) {
          if (p.getAttribute("data-panel") === tabIndex) {
            p.classList.add("active")
          } else {
            p.classList.remove("active")
          }
        }
      })
    }
  })
}
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
        <div
          class="flex flex-wrap items-center gap-x-4 gap-y-2 text-neutral-400 text-sm mb-4"
        >
          <span>{{ formatDate(post.date) }}</span>
          <span v-if="post.author" class="flex items-center gap-1">
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            {{ post.author }}
          </span>
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {{ characterCount.toLocaleString() }}文字
          </span>
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            約{{ readingTime }}分で読了
          </span>
        </div>

        <!-- Tags -->
        <div
          v-if="post.tags && post.tags.length > 0"
          class="flex flex-wrap gap-2 mb-4"
        >
          <span
            v-for="tag in post.tags"
            :key="tag"
            class="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30"
          >
            {{ tag }}
          </span>
        </div>

        <!-- Description -->
        <p
          v-if="post.description"
          class="text-neutral-400 text-sm mb-4 italic break-words [overflow-wrap:anywhere]"
        >
          {{ post.description }}
        </p>

        <div class="bg-neutral-700 w-full h-0.5 rounded mb-4" />

        <!-- Share -->
        <div class="flex flex-wrap gap-3 mb-4">
          <RouterLink
            v-if="isEditor"
            :to="`/blog/${$route.params.id}/edit`"
            class="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm transition-colors"
          >
            編集
          </RouterLink>
          <button
            type="button"
            class="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-sm transition-colors"
            @click="shareToX"
          >
            Share to X
          </button>
          <FediverseShare
            :title="shareTitle"
            :url="`https://c30.life/blog/${$route.params.id}`"
          />
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
          <!-- Social embeds rendered via Teleport -->
          <template v-for="embed in socialEmbeds" :key="embed.id">
            <Teleport
              :to="`[data-social-embed='${embed.id}']`"
              :disabled="!post"
            >
              <SocialEmbed :embed-data="embed" />
            </Teleport>
          </template>
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
    :is-window-d-v-d="false"
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
        href="https://mk-juice.dev"
        target="_blank"
        class="block text-gray-400 hover:text-white hover:underline"
      >
        [広告] Juice Server - Misskeyを使用した独自フォークの公式サーバーです🔗
      </a>
    </div>
  </Window>

  <!-- Floating TOC Button -->
  <Teleport to="body">
    <div v-if="post && tocItems.length > 0" class="fixed bottom-6 right-6 z-50">
      <!-- TOC Popup -->
      <Transition name="toc-popup">
        <div
          v-if="showFloatingToc"
          class="absolute bottom-14 right-0 w-72 max-h-96 overflow-y-auto bg-neutral-900/95 backdrop-blur-sm border border-neutral-700 rounded-xl shadow-2xl"
        >
          <div
            class="sticky top-0 bg-neutral-900/95 backdrop-blur-sm px-4 py-3 border-b border-neutral-700"
          >
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold text-blue-400">目次</span>
              <button
                type="button"
                class="text-neutral-400 hover:text-white transition-colors"
                @click="showFloatingToc = false"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
          <nav class="p-3">
            <!-- Scroll to top -->
            <button
              type="button"
              class="w-full px-2 py-1.5 mb-2 text-sm text-left text-neutral-400 hover:text-blue-400 hover:bg-neutral-800/50 rounded transition-colors flex items-center gap-2"
              @click="scrollToTop"
            >
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
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
              トップへ戻る
            </button>
            <div class="border-t border-neutral-700 mb-2"></div>
            <ul class="space-y-1">
              <li
                v-for="item in tocItems"
                :key="item.id"
                :style="{ paddingLeft: `${(item.level - 2) * 0.75}rem` }"
              >
                <a
                  :href="`#${item.id}`"
                  class="block px-2 py-1.5 text-sm rounded transition-colors"
                  :class="
                    activeHeading === item.id
                      ? 'text-blue-400 bg-blue-500/20 font-medium'
                      : 'text-neutral-300 hover:text-blue-400 hover:bg-neutral-800/50'
                  "
                  @click="showFloatingToc = false"
                >
                  {{ item.text }}
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </Transition>

      <!-- TOC Toggle Button -->
      <button
        type="button"
        class="w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
        :class="{ 'bg-blue-500 ring-2 ring-blue-400': showFloatingToc }"
        @click="showFloatingToc = !showFloatingToc"
        title="目次を表示"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 10h16M4 14h16M4 18h16"
          />
        </svg>
      </button>
    </div>
  </Teleport>
</template>

<style>
.blog-content {
  color: #e5e5e5;
  overflow-wrap: break-word;
  word-break: break-word;
}

.blog-content h1,
.blog-content h2,
.blog-content h3,
.blog-content h4,
.blog-content h5,
.blog-content h6 {
  scroll-margin-top: 5rem;
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
  display: block;
  width: 100%;
  overflow-x: auto;
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

/* VitePress-compatible custom containers */
.blog-content .custom-block {
  padding: 1rem 1.25rem;
  border-radius: 0.5rem;
  margin: 1rem 0;
  border-left: 4px solid;
}

.blog-content .custom-block-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.blog-content .custom-block.info {
  background-color: rgba(59, 130, 246, 0.1);
  border-color: #3b82f6;
}

.blog-content .custom-block.info .custom-block-title {
  color: #60a5fa;
}

.blog-content .custom-block.tip {
  background-color: rgba(34, 197, 94, 0.1);
  border-color: #22c55e;
}

.blog-content .custom-block.tip .custom-block-title {
  color: #4ade80;
}

.blog-content .custom-block.warning {
  background-color: rgba(234, 179, 8, 0.1);
  border-color: #eab308;
}

.blog-content .custom-block.warning .custom-block-title {
  color: #facc15;
}

.blog-content .custom-block.danger {
  background-color: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
}

.blog-content .custom-block.danger .custom-block-title {
  color: #f87171;
}

/* GitHub-style alert: > [!IMPORTANT] */
.blog-content .custom-block.important {
  background-color: rgba(168, 85, 247, 0.1);
  border-color: #a855f7;
}

.blog-content .custom-block.important .custom-block-title {
  color: #c084fc;
}

.blog-content .custom-block p:last-child {
  margin-bottom: 0;
}

/* Details container */
.blog-content details.custom-block {
  padding: 0;
  border-left: 4px solid #525252;
  background-color: rgba(64, 64, 64, 0.2);
  border-radius: 0.5rem;
  overflow: hidden;
}

.blog-content details.custom-block summary {
  padding: 0.75rem 1rem;
  cursor: pointer;
  font-weight: 600;
  color: #e5e5e5;
  list-style: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.blog-content details.custom-block summary::before {
  content: "▶";
  font-size: 0.75rem;
  transition: transform 0.2s;
}

.blog-content details.custom-block[open] summary::before {
  transform: rotate(90deg);
}

.blog-content details.custom-block summary::-webkit-details-marker {
  display: none;
}

.blog-content details.custom-block summary:hover {
  background-color: rgba(64, 64, 64, 0.3);
}

.blog-content details.custom-block[open] summary {
  border-bottom: 1px solid #404040;
}

.blog-content details.custom-block .details-content {
  padding: 1rem;
}

.blog-content details.custom-block .details-content > :first-child {
  margin-top: 0;
}

.blog-content details.custom-block .details-content > :last-child {
  margin-bottom: 0;
}

/* Table of Contents */
.blog-content .table-of-contents {
  background: linear-gradient(
    135deg,
    rgba(38, 38, 38, 0.8),
    rgba(30, 30, 30, 0.9)
  );
  border: 1px solid #404040;
  border-left: 3px solid #60a5fa;
  border-radius: 0.5rem;
  padding: 1.25rem 1.5rem;
  margin: 1.5rem 0;
  position: relative;
}

.blog-content .table-of-contents::before {
  content: "目次";
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #60a5fa;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(96, 165, 250, 0.2);
}

.blog-content .table-of-contents ul {
  list-style: none;
  padding-left: 0;
  margin: 0;
}

.blog-content .table-of-contents li {
  margin: 0.375rem 0;
  position: relative;
  padding-left: 1rem;
}

.blog-content .table-of-contents li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.6rem;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: #525252;
  transition: background-color 0.2s;
}

.blog-content .table-of-contents li:hover::before {
  background-color: #60a5fa;
}

.blog-content .table-of-contents a {
  color: #d4d4d4;
  text-decoration: none;
  font-size: 0.875rem;
  line-height: 1.5;
  transition:
    color 0.2s,
    padding-left 0.2s;
  display: inline-block;
}

.blog-content .table-of-contents a:hover {
  color: #60a5fa;
  padding-left: 0.25rem;
}

/* Header anchors */
.blog-content .header-anchor {
  margin-left: 0.5rem;
  opacity: 0;
  color: #60a5fa;
  text-decoration: none;
  transition: opacity 0.2s;
}

.blog-content h1:hover .header-anchor,
.blog-content h2:hover .header-anchor,
.blog-content h3:hover .header-anchor,
.blog-content h4:hover .header-anchor,
.blog-content h5:hover .header-anchor,
.blog-content h6:hover .header-anchor {
  opacity: 1;
}

/* Code group */
.blog-content .code-group {
  margin: 1rem 0;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid #404040;
}

.blog-content .code-group-tabs {
  display: flex;
  background-color: #1f1f1f;
  border-bottom: 1px solid #404040;
}

.blog-content .code-group-tab {
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  color: #a3a3a3;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.blog-content .code-group-tab:hover {
  color: #e5e5e5;
  background-color: rgba(64, 64, 64, 0.3);
}

.blog-content .code-group-tab.active {
  color: #60a5fa;
  background-color: #262626;
  border-bottom: 2px solid #60a5fa;
  margin-bottom: -1px;
}

.blog-content .code-group-panel {
  display: none;
}

.blog-content .code-group-panel.active {
  display: block;
}

.blog-content .code-group-panel pre {
  margin: 0;
  border-radius: 0;
  padding: 1rem;
  background-color: #262626;
}

.blog-content .code-group-panel pre code {
  padding: 0;
  background: transparent;
}

/* Line highlighting */
.blog-content pre .line {
  display: inline;
}

.blog-content pre .line.highlighted {
  background-color: rgba(59, 130, 246, 0.2);
  display: inline-block;
  width: calc(100% + 2rem);
  margin: 0 -1rem;
  padding: 0 1rem;
  border-left: 3px solid #3b82f6;
}

/* Badges: <Badge type="..." text="..." /> */
.blog-content .badge {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.blog-content .badge-info {
  background-color: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.blog-content .badge-tip {
  background-color: rgba(34, 197, 94, 0.2);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.blog-content .badge-warning {
  background-color: rgba(234, 179, 8, 0.2);
  color: #facc15;
  border: 1px solid rgba(234, 179, 8, 0.3);
}

.blog-content .badge-danger {
  background-color: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

/* Footnotes */
.blog-content .footnotes-section {
  border-top: 1px solid #404040;
  padding-top: 1rem;
  margin-top: 2rem;
}

.blog-content .footnote {
  display: block;
  font-size: 0.875rem;
  color: #a3a3a3;
  padding: 0.25rem 0;
  scroll-margin-top: 5rem;
}

.blog-content .footnote-id {
  color: #60a5fa;
  font-weight: 500;
  margin-right: 0.25rem;
}

.blog-content .footnote-backref {
  color: #60a5fa;
  text-decoration: none;
  margin-left: 0.25rem;
}

.blog-content .footnote-backref:hover {
  text-decoration: underline;
}

.blog-content .footnote-ref {
  color: #60a5fa;
  text-decoration: none;
  scroll-margin-top: 5rem;
}

.blog-content .footnote-ref:hover {
  text-decoration: underline;
}

/* Floating TOC popup animation */
.toc-popup-enter-active,
.toc-popup-leave-active {
  transition: all 0.2s ease;
}

.toc-popup-enter-from,
.toc-popup-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}
</style>
