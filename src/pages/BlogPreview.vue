<script setup lang="ts">
import hljs from "highlight.js/lib/core"
import bash from "highlight.js/lib/languages/bash"
import c from "highlight.js/lib/languages/c"
import cpp from "highlight.js/lib/languages/cpp"
import css from "highlight.js/lib/languages/css"
import dockerfile from "highlight.js/lib/languages/dockerfile"
import go from "highlight.js/lib/languages/go"
import java from "highlight.js/lib/languages/java"
import javascript from "highlight.js/lib/languages/javascript"
import json from "highlight.js/lib/languages/json"
import lua from "highlight.js/lib/languages/lua"
import markdown from "highlight.js/lib/languages/markdown"
import plaintext from "highlight.js/lib/languages/plaintext"
import python from "highlight.js/lib/languages/python"
import rust from "highlight.js/lib/languages/rust"
import sql from "highlight.js/lib/languages/sql"
import typescript from "highlight.js/lib/languages/typescript"
import xml from "highlight.js/lib/languages/xml"
import yaml from "highlight.js/lib/languages/yaml"
import { marked, type TokenizerAndRendererExtension, type Tokens } from "marked"
import { markedHighlight } from "marked-highlight"
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue"
import "highlight.js/styles/github-dark.css"
import ImageViewerProvider from "@/components/ImageViewerProvider.vue"
import SocialEmbed from "@/components/SocialEmbed.vue"

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

interface PostData {
  title: string
  date: string
  description?: string
  tags?: string[]
  author?: string
  content: string
}

// Social embed types
type SocialEmbedType =
  | "x"
  | "mastodon"
  | "misskey"
  | "pleroma"
  | "x-profile"
  | "mastodon-profile"
  | "misskey-profile"
  | "pleroma-profile"
  | "github"
  | "link"

interface SocialEmbedData {
  type: SocialEmbedType
  url: string
  id: string
}

const postData = ref<PostData | null>(null)
const contentContainer = ref<HTMLElement | null>(null)
const socialEmbeds = ref<SocialEmbedData[]>([])

// Parse line highlight ranges
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
  const codeBlockRegex = /```(\w+)(?:\s+\[([^\]]+)\])?\s*\n([\s\S]*?)```/g
  const blocks: { lang: string; title: string; code: string }[] = []

  for (const match of content.matchAll(codeBlockRegex)) {
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
    const lines = src.split("\n")
    if (!lines[0].match(/^:::\s*\w+/)) return undefined

    const firstLine = lines[0]
    const typeMatch = firstLine.match(/^:::\s*(\w+)(?:\s+(.+))?$/)
    if (!typeMatch) return undefined

    const type = typeMatch[1]
    const title = typeMatch[2]?.trim()

    if (type === "code-group") return undefined

    let depth = 1
    let endIndex = -1
    let inCodeBlock = false

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]

      if (line.startsWith("```")) {
        inCodeBlock = !inCodeBlock
        continue
      }

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
    const raw = `${lines.slice(0, endIndex + 1).join("\n")}\n`

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

    if (type === "details") {
      const summary = title || "Details"
      const innerHtml = marked.parse(content)
      return `<details class="custom-block details">
<summary>${summary}</summary>
<div class="details-content">${innerHtml}</div>
</details>`
    }

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

// Footnote extension
const footnoteStore = new Map<string, string>()

const footnoteRefExtension: TokenizerAndRendererExtension = {
  name: "footnoteRef",
  level: "inline",
  start(src: string) {
    return src.match(/\[\^/)?.index
  },
  tokenizer(src: string) {
    const match = src.match(/^\[\^([^\]]+)\](?!:)/)
    if (match) {
      return {
        type: "footnoteRef",
        raw: match[0],
        id: match[1],
      }
    }
    return undefined
  },
  renderer(token: Tokens.Generic) {
    const id = token.id as string
    return `<sup><a href="#fn-${id}" id="fnref-${id}" class="footnote-ref">[${id}]</a></sup>`
  },
}

const footnoteDefExtension: TokenizerAndRendererExtension = {
  name: "footnoteDef",
  level: "block",
  start(src: string) {
    return src.match(/^\[\^/)?.index
  },
  tokenizer(src: string) {
    const match = src.match(/^\[\^([^\]]+)\]:\s*(.+)(?:\n|$)/)
    if (match) {
      footnoteStore.set(match[1], match[2])
      return {
        type: "footnoteDef",
        raw: match[0],
        id: match[1],
        text: match[2],
      }
    }
    return undefined
  },
  renderer() {
    return ""
  },
}

function renderFootnotes(): string {
  if (footnoteStore.size === 0) return ""

  const footnotes = Array.from(footnoteStore.entries())
    .map(
      ([id, text]) =>
        `<div class="footnote" id="fn-${id}"><span class="footnote-id">[${id}]</span> ${text} <a href="#fnref-${id}" class="footnote-backref">↩</a></div>`,
    )
    .join("\n")

  return `<div class="footnotes-section">${footnotes}</div>`
}

// TOC item interface
interface TocItem {
  level: number
  text: string
  slug: string
}

// TOC extension
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
    return '<nav class="table-of-contents" data-toc-placeholder></nav>'
  },
}

// Extract TOC from content
function extractToc(content: string): TocItem[] {
  let cleanContent = content
  cleanContent = cleanContent.replace(/```[\s\S]*?```/g, "")
  cleanContent = cleanContent.replace(/:::\s*code-group[\s\S]*?:::/g, "")

  const items: TocItem[] = []
  const headingRegex = /^(#{1,6})\s+(.+)$/gm
  let match: RegExpExecArray | null = null

  for (const match of cleanContent.matchAll(headingRegex)) {
    const level = match[1].length
    if (level >= 2 && level <= 3) {
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

const lineHighlightStore = new Map<string, Set<number>>()
let codeBlockCounter = 0
const codeGroupStore = new Map<string, string>()

// Configure marked
marked.use({
  extensions: [
    containerExtension,
    tocExtension,
    footnoteRefExtension,
    footnoteDefExtension,
  ],
})
marked.use(
  markedHighlight({
    emptyLangClass: "hljs language-plaintext",
    langPrefix: "hljs language-",
    highlight(code, lang) {
      try {
        const langMatch = lang.match(/^(\w+)/)
        const actualLang = langMatch ? langMatch[1] : "plaintext"
        const language = hljs.getLanguage(actualLang) ? actualLang : "plaintext"

        const highlighted = hljs.highlight(code, { language }).value
        const lineHighlights = parseLineHighlights(lang)

        if (lineHighlights.size === 0) {
          return highlighted
        }

        const blockId = `__CODE_BLOCK_${codeBlockCounter++}__`
        lineHighlightStore.set(blockId, lineHighlights)

        return `${blockId}\n${highlighted}`
      } catch {
        return code
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
      }
    },
  }),
)

// Apply line highlighting
function applyLineHighlighting(html: string): string {
  return html.replace(
    /<code([^>]*)>(__CODE_BLOCK_\d+__)\n([\s\S]*?)<\/code>/g,
    (_match, attrs, blockId, code) => {
      const lineHighlights = lineHighlightStore.get(blockId)
      if (!lineHighlights) {
        return `<code${attrs}>${code}</code>`
      }

      const lines = code.split("\n")
      const wrappedLines = lines
        .map((line: string, i: number) => {
          const lineNum = i + 1
          if (lineHighlights.has(lineNum)) {
            return `<span class="line highlighted">${line}</span>`
          }
          return `<span class="line">${line}</span>`
        })
        .join("\n")

      return `<code${attrs}>${wrappedLines}</code>`
    },
  )
}

// Custom renderer
const renderer = new marked.Renderer()

renderer.image = ({ href, title, text }) => {
  const titleAttr = title ? ` title="${title}"` : ""
  return `<img src="${href}" alt="${text}"${titleAttr} class="max-w-full rounded" />`
}

renderer.heading = ({ tokens, depth }) => {
  const text = tokens
    .map(
      (t) => (t as { text?: string }).text || (t as { raw?: string }).raw || "",
    )
    .join("")
  const slug = generateSlug(text)
  return `<h${depth} id="${slug}">${text}<a class="header-anchor" href="#${slug}">#</a></h${depth}>\n`
}

// Open external links in a new tab so readers don't get navigated away
// from the post; relative/internal links stay in the current tab.
renderer.link = ({ href, title, text }) => {
  const titleAttr = title ? ` title="${title}"` : ""
  const isExternal = /^https?:\/\//i.test(href)
  const externalAttrs = isExternal
    ? ' target="_blank" rel="noopener noreferrer"'
    : ""
  return `<a href="${href}"${titleAttr}${externalAttrs}>${text}</a>`
}

marked.use({ renderer })

// CommonMark only opens/closes **bold** when the delimiter is "flanked" by
// whitespace or punctuation on the outside. If a `**` sits directly against
// ordinary text on one side and punctuation (e.g. `『`) on the other — common
// in Japanese, e.g. "の**『名前』**を" — the flanking rule fails and the
// literal ** shows up unrendered. Nudge it with an invisible U+2060 just
// inside the delimiter so the rule passes without changing the visible text.
function fixEmphasisFlanking(content: string): string {
  const isPunct = (ch: string) => /\p{P}/u.test(ch)
  // Skip fenced code blocks - `**` inside code is literal text, not markdown.
  return content
    .split(/(```[\s\S]*?```)/g)
    .map((segment, i) => {
      if (i % 2 === 1) return segment
      return segment.replace(/\*\*([^\n*]+?)\*\*/g, (match, inner: string) => {
        const start = isPunct(inner[0]) ? "\u2060" : ""
        const end = isPunct(inner[inner.length - 1]) ? "\u2060" : ""
        return `**${start}${inner}${end}**`
      })
    })
    .join("")
}

// Preprocess code-group
function preprocessCodeGroups(content: string): string {
  codeGroupStore.clear()

  const lines = content.split("\n")
  const result: string[] = []
  let i = 0
  let groupId = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.match(/^:::\s*code-group\s*$/)) {
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
        const codeGroupContent = lines.slice(i + 1, endIndex).join("\n")
        const rendered = renderCodeGroup(codeGroupContent)
        const placeholder = `<!--CODE_GROUP_${groupId}-->`
        codeGroupStore.set(placeholder, rendered)
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

// Restore code groups after parsing
function restoreCodeGroups(html: string): string {
  let result = html
  for (const [placeholder, rendered] of codeGroupStore) {
    result = result.replace(`<p>${placeholder}</p>`, rendered)
    result = result.replace(placeholder, rendered)
  }
  return result
}

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
  }

  return result
}

// Transform Badge components to proper HTML
function transformBadges(html: string): string {
  return html.replace(
    /<(Badge|badge)\s+type=["']([^"']+)["']\s+text=["']([^"']+)["']\s*\/?>/gi,
    (_match, _tag, type, text) => {
      return `<span class="badge badge-${type}">${text}</span>`
    },
  )
}

// Social embed store for post-processing
const socialEmbedStore = new Map<string, SocialEmbedData>()
let socialEmbedCounter = 0

// Detect social embed type from URL
function detectSocialEmbedType(url: string): SocialEmbedType | null {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()

    // X/Twitter
    if (hostname === "twitter.com" || hostname === "x.com") {
      // Profile: /username (no /status)
      if (
        urlObj.pathname.match(/^\/[\w]+$/) &&
        ![
          "home",
          "explore",
          "notifications",
          "messages",
          "settings",
          "i",
        ].includes(urlObj.pathname.slice(1))
      ) {
        return "x-profile"
      }
      // Status: /username/status/id
      if (urlObj.pathname.match(/\/[\w]+\/status\/\d+/)) {
        return "x"
      }
    }

    // GitHub code: /owner/repo/blob/branch/path
    if (
      hostname === "github.com" &&
      urlObj.pathname.match(/^\/[\w.-]+\/[\w.-]+\/blob\//)
    ) {
      return "github"
    }

    // Misskey note: /notes/xxx
    if (urlObj.pathname.match(/\/notes\/[\w]+/)) {
      return "misskey"
    }

    // Misskey profile: /@username (no /notes)
    if (
      urlObj.pathname.match(/^\/@[\w-]+$/) &&
      !urlObj.pathname.includes("/notes/")
    ) {
      // Could be Misskey or Mastodon - check for common Misskey instances
      const misskeyInstances = [
        "misskey.io",
        "misskey.art",
        "nijimiss.moe",
        "submarin.online",
        "sushi.ski",
      ]
      if (misskeyInstances.some((inst) => hostname.includes(inst))) {
        return "misskey-profile"
      }
      // Default to mastodon-profile for @user pattern without status ID
      return "mastodon-profile"
    }

    // Mastodon status: /@user/123456 or /users/user/statuses/123456
    if (
      urlObj.pathname.match(/\/@[\w-]+\/\d+/) ||
      urlObj.pathname.match(/\/users\/[\w-]+\/statuses\/\d+/)
    ) {
      return "mastodon"
    }

    // Mastodon profile: /users/username
    if (urlObj.pathname.match(/^\/users\/[\w-]+$/)) {
      return "mastodon-profile"
    }

    // Pleroma notice
    if (urlObj.pathname.match(/\/notice\/[\w]+/)) {
      return "pleroma"
    }
  } catch {
    // Invalid URL
  }
  return null
}

// Preprocess social embeds: @[type](url) syntax
function preprocessSocialEmbeds(content: string): string {
  socialEmbedStore.clear()
  socialEmbedCounter = 0

  const embedRegex =
    /^@\[(x|mastodon|misskey|pleroma|x-profile|mastodon-profile|misskey-profile|pleroma-profile|github|link)?\]\(([^)]+)\)$/gm

  return content.replace(embedRegex, (match, type, url) => {
    let embedType: SocialEmbedType | null = type || null
    if (!embedType) {
      embedType = detectSocialEmbedType(url)
    }

    // Fallback to link for any valid URL
    if (!embedType) {
      try {
        new URL(url)
        embedType = "link"
      } catch {
        return match
      }
    }

    const embedId = `social-embed-${socialEmbedCounter++}`
    const embedData: SocialEmbedData = {
      type: embedType,
      url: url.trim(),
      id: embedId,
    }
    socialEmbedStore.set(embedId, embedData)

    return `\n<div data-social-embed="${embedId}"></div>\n`
  })
}

// Get all social embeds from current content
function getSocialEmbedsFromContent(): SocialEmbedData[] {
  return Array.from(socialEmbedStore.values())
}

// Rendered content
const renderedContent = computed(() => {
  if (!postData.value) return ""

  codeBlockCounter = 0
  lineHighlightStore.clear()
  footnoteStore.clear()

  let content = fixEmphasisFlanking(postData.value.content)

  // Preprocess social embeds
  content = preprocessSocialEmbeds(content)

  // Extract TOC items
  const tocItems = extractToc(content)

  const preprocessed = preprocessCodeGroups(content)
  let html = marked.parse(preprocessed) as string
  html = applyLineHighlighting(html)
  html = restoreCodeGroups(html)
  html = transformBadges(html)

  // Replace TOC placeholder with actual TOC
  const tocHtml = generateTocHtml(tocItems)
  html = html.replace(
    /<nav class="table-of-contents" data-toc-placeholder><\/nav>/g,
    tocHtml,
  )

  html += renderFootnotes()

  return html
})

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

// Handle message from parent (editor)
function handleMessage(event: MessageEvent) {
  if (event.data?.type === "blog-preview-update" && event.data?.content) {
    postData.value = parseFrontmatter(event.data.content)
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

  // Notify parent that preview is ready
  window.parent.postMessage({ type: "blog-preview-ready" }, "*")
})

onUnmounted(() => {
  window.removeEventListener("message", handleMessage)
})

// Watch for content changes to setup tabs and social embeds
watch(renderedContent, () => {
  setupCodeGroupTabs()
  // Update social embeds after DOM update
  nextTick(() => {
    socialEmbeds.value = getSocialEmbedsFromContent()
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
