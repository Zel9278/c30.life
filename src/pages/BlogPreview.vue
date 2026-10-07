<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue"
import "highlight.js/styles/github-dark.css"
import ImageViewerProvider from "@/components/ImageViewerProvider.vue"
import SocialEmbed from "@/components/SocialEmbed.vue"
import { parseFrontmatter as parseBlogFrontmatter } from "@/lib/blog/frontmatter.ts"
import { hasLanguage, highlightCode } from "@/lib/blog/hljs.ts"
import {
  type Outline,
  renderBlogMarkdown,
  type SocialEmbedData,
} from "@/lib/blog/markdown.ts"
import { sanitizeBlogHtml } from "@/lib/blog/sanitize.ts"

interface PostData {
  title: string
  date: string
  description?: string
  tags?: string[]
  author?: string
  outline?: Outline
  content: string
}

const postData = ref<PostData | null>(null)
const contentContainer = ref<HTMLElement | null>(null)
const socialEmbeds = ref<SocialEmbedData[]>([])

// Extract frontmatter and content
function parseFrontmatter(raw: string): PostData {
  const normalized = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
  const match = normalized.match(frontmatterRegex)

  const result: PostData = {
    title: "プレビュー",
    date: new Date().toISOString().split("T")[0],
    content: normalized,
  }

  if (match) {
    const frontmatter = match[1]
    result.content = match[2].trim()

    // Parse YAML-like frontmatter
    const titleMatch = frontmatter.match(/^title:\s*["']?(.+?)["']?\s*$/m)
    if (titleMatch) result.title = titleMatch[1]

    const dateMatch = frontmatter.match(/^date:\s*["']?(.+?)["']?\s*$/m)
    if (dateMatch) result.date = dateMatch[1]

    const descMatch = frontmatter.match(/^description:\s*["']?(.+?)["']?\s*$/m)
    if (descMatch) result.description = descMatch[1]

    const authorMatch = frontmatter.match(/^author:\s*["']?(.+?)["']?\s*$/m)
    if (authorMatch) result.author = authorMatch[1]

    const tagsMatch = frontmatter.match(/^tags:\s*\[(.*)\]\s*$/m)
    if (tagsMatch) {
      result.tags = tagsMatch[1]
        .split(",")
        .map((t) => t.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean)
    }

    // 目次の深さは公開ページと同じパーサーで読む ([[toc]] の中身を一致させるため)
    result.outline = parseBlogFrontmatter(normalized).data.outline
  }

  return result
}

// 公開ページ (BlogPost.vue) と同じパイプラインで描画する
const rendered = computed(() => {
  if (!postData.value) return null
  return renderBlogMarkdown(postData.value.content, {
    mode: "spa",
    outline: postData.value.outline,
    highlight: highlightCode,
    hasLanguage,
  })
})

// Rendered content (生 HTML を含むので DOMPurify を通してから v-html に渡す)
const renderedContent = computed(() =>
  sanitizeBlogHtml(rendered.value?.html ?? ""),
)

// Format date
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Character count
const characterCount = computed(() => {
  if (!postData.value) return 0
  return postData.value.content.replace(/\s/g, "").length
})

// Reading time
const readingTime = computed(() => {
  return Math.max(1, Math.ceil(characterCount.value / 500))
})

// iframe として埋め込まれているときだけ、同じオリジンの親 (エディター) とやり取りする
const isEmbedded = window.parent !== window

// Handle message from parent (editor)
function handleMessage(event: MessageEvent) {
  // 他のオリジンのページや親以外のウィンドウからの内容は描画しない
  if (!isEmbedded) return
  if (event.origin !== window.location.origin) return
  if (event.source !== window.parent) return

  if (event.data?.type === "blog-preview-update" && event.data?.content) {
    postData.value = parseFrontmatter(String(event.data.content))
    // Scroll to top on content update if requested
    if (event.data.scrollToTop) {
      window.scrollTo({ top: 0 })
    }
  }
}

// Setup code-group tab functionality
function setupCodeGroupTabs() {
  nextTick(() => {
    if (!contentContainer.value) return

    const codeGroups = contentContainer.value.querySelectorAll(".code-group")
    for (const group of codeGroups) {
      const tabs = group.querySelectorAll(".code-group-tab")
      const panels = group.querySelectorAll(".code-group-panel")

      for (const tab of tabs) {
        tab.addEventListener("click", () => {
          const tabIndex = tab.getAttribute("data-tab")

          for (const t of tabs) {
            t.classList.remove("active")
          }
          for (const p of panels) {
            p.classList.remove("active")
          }

          tab.classList.add("active")
          const activePanel = group.querySelector(
            `.code-group-panel[data-panel="${tabIndex}"]`,
          )
          activePanel?.classList.add("active")
        })
      }
    }
  })
}

onMounted(() => {
  window.addEventListener("message", handleMessage)

  // Notify parent that preview is ready (同じオリジンの親にだけ送る)
  if (isEmbedded) {
    window.parent.postMessage(
      { type: "blog-preview-ready" },
      window.location.origin,
    )
  }
})

onUnmounted(() => {
  window.removeEventListener("message", handleMessage)
})

// Watch for content changes to setup tabs and social embeds
watch(renderedContent, () => {
  setupCodeGroupTabs()
  // Update social embeds after DOM update
  nextTick(() => {
    socialEmbeds.value = rendered.value?.embeds ?? []
  })
})
</script>

<template>
  <div class="min-h-full bg-neutral-950 text-white overflow-auto">
    <div class="w-full p-3">
      <div
        class="backdrop-blur-xl bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 shadow-2xl"
      >
        <!-- Loading placeholder -->
        <div v-if="!postData" class="text-center py-8 text-neutral-400">
          <p>エディターからコンテンツを待機中...</p>
        </div>

        <!-- Post Content -->
        <template v-else>
          <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">
            {{ postData.title }}
          </h1>
          <div
            class="flex flex-wrap items-center gap-x-4 gap-y-2 text-neutral-400 text-sm mb-4"
          >
            <span>{{ formatDate(postData.date) }}</span>
            <span v-if="postData.author" class="flex items-center gap-1">
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
              {{ postData.author }}
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
            v-if="postData.tags && postData.tags.length > 0"
            class="flex flex-wrap gap-2 mb-4"
          >
            <span
              v-for="tag in postData.tags"
              :key="tag"
              class="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30"
            >
              {{ tag }}
            </span>
          </div>

          <!-- Description -->
          <p
            v-if="postData.description"
            class="text-neutral-400 text-sm mb-4 italic break-words [overflow-wrap:anywhere]"
          >
            {{ postData.description }}
          </p>

          <div class="bg-neutral-700 w-full h-0.5 rounded mb-4" />

          <!-- Content -->
          <ImageViewerProvider>
            <div
              ref="contentContainer"
              class="blog-content prose prose-invert max-w-none"
              v-html="renderedContent"
            />
            <!-- Social embeds rendered via Teleport -->
            <template v-for="embed in socialEmbeds" :key="embed.id">
              <Teleport
                :to="`[data-social-embed='${embed.id}']`"
                :disabled="!postData"
              >
                <SocialEmbed :embed-data="embed" />
              </Teleport>
            </template>
          </ImageViewerProvider>
        </template>
      </div>
    </div>
  </div>
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

/* Badges */
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
}

.blog-content .footnote-ref:hover {
  text-decoration: underline;
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
</style>
