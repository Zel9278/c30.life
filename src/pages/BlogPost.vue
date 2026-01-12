<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { marked, type Tokens } from "marked"
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
import FediverseShare from "@/components/FediverseShare.vue"

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
  description?: string
  tags?: string[]
  author?: string
  image?: string
  outline?: number | [number, number] | "deep" | false
}

// TOC item interface
interface TocItem {
  level: number
  text: string
  slug: string
}

const route = useRoute()
const router = useRouter()

const post = ref<BlogPostDetail | null>(null)
const loading = ref(true)
const error = ref(false)
const tocItems = ref<TocItem[]>([])
const showFloatingToc = ref(false)
const activeHeading = ref<string>("")

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

// Parse line highlight ranges (e.g., "{1,4-6,8}")
function parseLineHighlights(meta: string): Set<number> {
  const highlighted = new Set<number>()
  const match = meta.match(/\{([\d,\s-]+)\}/)
  if (!match) return highlighted

  const parts = match[1].split(",")
  for (const part of parts) {
    const trimmed = part.trim()
    if (trimmed.includes("-")) {
      const [start, end] = trimmed.split("-").map((n) => parseInt(n.trim(), 10))
      for (let i = start; i <= end; i++) {
        highlighted.add(i)
      }
    } else {
      highlighted.add(parseInt(trimmed, 10))
    }
  }
  return highlighted
}

// Generate slug from text
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

// Render code group tabs
function renderCodeGroup(content: string): string {
  // Match code blocks with optional title in brackets
  // Format: ```lang [Title] or ```lang
  const codeBlockRegex = /```(\w+)(?:\s+\[([^\]]+)\])?\s*\n([\s\S]*?)```/g
  const blocks: { lang: string; title: string; code: string }[] = []
  let match: RegExpExecArray | null = null

  while ((match = codeBlockRegex.exec(content)) !== null) {
    blocks.push({
      lang: match[1],
      title: match[2] || match[1],
      code: match[3].trim(),
    })
  }

  if (blocks.length === 0) {
    return `<p>Code group: no code blocks found</p>`
  }

  const tabsHtml = blocks
    .map(
      (block, i) =>
        `<button class="code-group-tab${i === 0 ? " active" : ""}" data-tab="${i}">${block.title}</button>`,
    )
    .join("")

  const panelsHtml = blocks
    .map((block, i) => {
      const language = hljs.getLanguage(block.lang) ? block.lang : "plaintext"
      const highlighted = hljs.highlight(block.code, { language }).value
      return `<div class="code-group-panel${i === 0 ? " active" : ""}" data-panel="${i}">
      <pre><code class="hljs language-${language}">${highlighted}</code></pre>
    </div>`
    })
    .join("")

  return `<div class="code-group">
    <div class="code-group-tabs">${tabsHtml}</div>
    ${panelsHtml}
  </div>`
}

// VitePress-compatible custom containers extension
const containerExtension = {
  name: "container",
  level: "block" as const,
  start(src: string) {
    const match = src.match(/^:::\s*\w+/)
    return match?.index
  },
  tokenizer(src: string): Tokens.Generic | undefined {
    // Match ::: container syntax - must start at beginning
    const lines = src.split("\n")
    if (!lines[0].match(/^:::\s*\w+/)) return undefined

    const firstLine = lines[0]
    const typeMatch = firstLine.match(/^:::\s*(\w+)(?:\s+(.+))?$/)
    if (!typeMatch) return undefined

    const type = typeMatch[1]
    const title = typeMatch[2]?.trim()

    // Skip code-group - handled by preprocessor
    if (type === "code-group") return undefined

    // Find closing ::: (skip lines inside code blocks)
    let depth = 1
    let endIndex = -1
    let inCodeBlock = false

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]

      // Track code block state
      if (line.startsWith("```")) {
        inCodeBlock = !inCodeBlock
        continue
      }

      // Skip ::: detection inside code blocks
      if (inCodeBlock) continue

      if (line.match(/^:::\s*\w+/)) {
        depth++
      } else if (line === ":::") {
        depth--
        if (depth === 0) {
          endIndex = i
          break
        }
      }
    }

    if (endIndex === -1) return undefined

    const contentLines = lines.slice(1, endIndex)
    const content = contentLines.join("\n")
    const raw = lines.slice(0, endIndex + 1).join("\n") + "\n"

    return {
      type: "container",
      raw: raw,
      containerType: type,
      title: title,
      content: content,
    }
  },
  renderer(token: Tokens.Generic) {
    const type = token.containerType as string
    const title = token.title as string | undefined
    const content = token.content as string

    // Handle details container
    if (type === "details") {
      const summary = title || "Details"
      const innerHtml = marked.parse(content)
      return `<details class="custom-block details">
<summary>${summary}</summary>
<div class="details-content">${innerHtml}</div>
</details>`
    }

    // Map container types to CSS classes and default titles
    const typeMap: Record<string, { class: string; defaultTitle: string }> = {
      info: { class: "info", defaultTitle: "INFO" },
      tip: { class: "tip", defaultTitle: "TIP" },
      warning: { class: "warning", defaultTitle: "WARNING" },
      danger: { class: "danger", defaultTitle: "DANGER" },
      note: { class: "info", defaultTitle: "NOTE" },
    }

    const config = typeMap[type] || {
      class: "info",
      defaultTitle: type.toUpperCase(),
    }
    const displayTitle = title || config.defaultTitle
    const innerHtml = marked.parse(content)

    return `<div class="custom-block ${config.class}">
<p class="custom-block-title">${displayTitle}</p>
${innerHtml}
</div>`
  },
}

// TOC extension - replaces [[toc]] with table of contents
const tocExtension = {
  name: "toc",
  level: "block" as const,
  start(src: string) {
    return src.match(/^\[\[toc\]\]/i)?.index
  },
  tokenizer(src: string): Tokens.Generic | undefined {
    const match = src.match(/^\[\[toc\]\]/i)
    if (match) {
      return {
        type: "toc",
        raw: match[0],
      }
    }
    return undefined
  },
  renderer() {
    // Placeholder - will be replaced after full parsing
    return '<nav class="table-of-contents" data-toc-placeholder></nav>'
  },
}

// Configure marked with syntax highlighting and line highlighting
// IMPORTANT: Register extensions FIRST before other configurations
marked.use({ extensions: [containerExtension, tocExtension] })
marked.use(
  markedHighlight({
    emptyLangClass: "hljs language-plaintext",
    langPrefix: "hljs language-",
    highlight(code, lang, info) {
      try {
        // Parse language and line highlights (e.g., "js{1,3-5}")
        const langMatch = lang.match(/^(\w+)/)
        const actualLang = langMatch ? langMatch[1] : "plaintext"
        const language = hljs.getLanguage(actualLang) ? actualLang : "plaintext"

        const highlighted = hljs.highlight(code, { language }).value
        const lineHighlights = parseLineHighlights(lang)

        if (lineHighlights.size === 0) {
          return highlighted
        }

        // Apply line highlighting
        const lines = highlighted.split("\n")
        return lines
          .map((line, i) => {
            const lineNum = i + 1
            if (lineHighlights.has(lineNum)) {
              return `<span class="line highlighted">${line}</span>`
            }
            return `<span class="line">${line}</span>`
          })
          .join("\n")
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

// Custom renderer
const renderer = new marked.Renderer()

// Custom renderer to add data-viewer to images
renderer.image = ({ href, title, text }) => {
  const titleAttr = title ? ` title="${title}"` : ""
  return `<img src="${href}" alt="${text}"${titleAttr} data-viewer="true" class="cursor-pointer transition-transform hover:scale-[1.02]" />`
}

// Custom heading renderer for TOC anchors
renderer.heading = ({ tokens, depth }) => {
  const text = tokens
    .map(
      (t) => (t as { text?: string }).text || (t as { raw?: string }).raw || "",
    )
    .join("")
  const slug = generateSlug(text)
  return `<h${depth} id="${slug}">${text}<a class="header-anchor" href="#${slug}">#</a></h${depth}>\n`
}

marked.use({ renderer })

// Extract TOC from content (excluding code blocks and code-groups)
function extractToc(
  content: string,
  outline?: number | [number, number] | "deep" | false,
): TocItem[] {
  if (outline === false) return []

  // Remove code blocks and code-groups before extracting headings
  let cleanContent = content

  // Remove fenced code blocks (```...```)
  cleanContent = cleanContent.replace(/```[\s\S]*?```/g, "")

  // Remove code-group blocks (::: code-group ... :::)
  cleanContent = cleanContent.replace(/:::\s*code-group[\s\S]*?:::/g, "")

  const items: TocItem[] = []
  const headingRegex = /^(#{1,6})\s+(.+)$/gm
  let match: RegExpExecArray | null = null

  // Determine depth range
  let minDepth = 2
  let maxDepth = 3
  if (outline === "deep") {
    maxDepth = 6
  } else if (typeof outline === "number") {
    maxDepth = outline
  } else if (Array.isArray(outline)) {
    minDepth = outline[0]
    maxDepth = outline[1]
  }

  while ((match = headingRegex.exec(cleanContent)) !== null) {
    const level = match[1].length
    if (level >= minDepth && level <= maxDepth) {
      const text = match[2].trim()
      items.push({
        level,
        text,
        slug: generateSlug(text),
      })
    }
  }

  return items
}

// Generate TOC HTML
function generateTocHtml(items: TocItem[]): string {
  if (items.length === 0) return ""

  const minLevel = Math.min(...items.map((i) => i.level))

  return `<nav class="table-of-contents">
    <ul>
      ${items
        .map(
          (item) => `
        <li style="margin-left: ${(item.level - minLevel) * 1}rem">
          <a href="#${item.slug}">${item.text}</a>
        </li>
      `,
        )
        .join("")}
    </ul>
  </nav>`
}

// Store code groups for post-processing
const codeGroupStore = new Map<string, string>()

// Preprocess code-group before passing to marked
function preprocessCodeGroups(content: string): string {
  codeGroupStore.clear()

  // Find all ::: code-group ... ::: blocks
  const lines = content.split("\n")
  const result: string[] = []
  let i = 0
  let groupId = 0

  while (i < lines.length) {
    const line = lines[i]

    // Check for code-group start
    if (line.match(/^:::\s*code-group\s*$/)) {
      // Find the closing :::
      let endIndex = -1
      let inCodeBlock = false

      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].startsWith("```")) {
          inCodeBlock = !inCodeBlock
        }
        if (!inCodeBlock && lines[j] === ":::") {
          endIndex = j
          break
        }
      }

      if (endIndex !== -1) {
        // Extract and render the code group
        const codeGroupContent = lines.slice(i + 1, endIndex).join("\n")
        const rendered = renderCodeGroup(codeGroupContent)
        const placeholder = `<!--CODE_GROUP_${groupId}-->`
        codeGroupStore.set(placeholder, rendered)
        // Add empty lines around placeholder to ensure it's not wrapped in <p>
        result.push("")
        result.push(placeholder)
        result.push("")
        groupId++
        i = endIndex + 1
        continue
      }
    }

    result.push(line)
    i++
  }

  return result.join("\n")
}

// Restore code groups after marked parsing
function restoreCodeGroups(html: string): string {
  let result = html
  for (const [placeholder, rendered] of codeGroupStore) {
    // Remove potential <p> wrapping around placeholder
    result = result.replace(`<p>${placeholder}</p>`, rendered)
    result = result.replace(placeholder, rendered)
  }
  return result
}

const renderedContent = computed(() => {
  if (!post.value) return ""

  // Extract TOC items
  tocItems.value = extractToc(post.value.content, post.value.outline)

  // Preprocess code-groups before parsing
  const preprocessed = preprocessCodeGroups(post.value.content)

  // Parse markdown
  let html = marked.parse(preprocessed) as string

  // Restore code groups (replace placeholders with actual rendered HTML)
  html = restoreCodeGroups(html)

  // Replace TOC placeholder with actual TOC
  const tocHtml = generateTocHtml(tocItems.value)
  html = html.replace(
    /<nav class="table-of-contents" data-toc-placeholder><\/nav>/g,
    tocHtml,
  )

  return html
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

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" })
  showFloatingToc.value = false
  activeHeading.value = ""
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
            setTimeout(resolve, 200 * Math.pow(2, attempt)),
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

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const tabIndex = tab.getAttribute("data-tab")

        // Update tabs
        tabs.forEach((t) => t.classList.remove("active"))
        tab.classList.add("active")

        // Update panels
        panels.forEach((p) => {
          if (p.getAttribute("data-panel") === tabIndex) {
            p.classList.add("active")
          } else {
            p.classList.remove("active")
          }
        })
      })
    })
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
        <div class="flex items-center gap-4 text-neutral-400 text-sm mb-4">
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
        <p v-if="post.description" class="text-neutral-400 text-sm mb-4 italic">
          {{ post.description }}
        </p>

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
          <FediverseShare
            :title="`${post.title} | Blog`"
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
        href="https://chat.dev.c30.life"
        target="_blank"
        class="block text-gray-400 hover:text-white hover:underline"
      >
        [広告] 炒めて切った野菜ジュースのチャット -
        OpenPGPのログイン対応、MFM対応のチャットサイトです🔗
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
                :key="item.slug"
                :style="{ paddingLeft: `${(item.level - 2) * 0.75}rem` }"
              >
                <a
                  :href="`#${item.slug}`"
                  class="block px-2 py-1.5 text-sm rounded transition-colors"
                  :class="
                    activeHeading === item.slug
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
