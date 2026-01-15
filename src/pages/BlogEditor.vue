<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue"
import { useRoute, useRouter } from "vue-router"
import { marked, type Tokens } from "marked"
import { markedHighlight } from "marked-highlight"
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
import * as monaco from "monaco-editor"
import { lint as markdownlint } from "markdownlint/async"

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

const route = useRoute()
const router = useRouter()

const isAuthenticated = ref(false)
const authKey = ref("")
const authError = ref("")

const postId = ref("")
const rawContent = ref("")
const originalContent = ref("")
const loading = ref(true)
const saving = ref(false)
const saveError = ref("")
const saveSuccess = ref(false)
const isNewPost = ref(false)
const hasUnsavedChanges = ref(false)
const isDraft = ref(true) // Track draft status

// Monaco editor instance
const editorContainer = ref<HTMLDivElement | null>(null)
let monacoEditor: monaco.editor.IStandaloneCodeEditor | null = null

// For new post
const newPostId = ref("")

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

const footnoteRefExtension: marked.TokenizerAndRendererExtension = {
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
  renderer(token) {
    const id = (token as { id: string }).id
    return `<sup><a href="#fn-${id}" id="fnref-${id}" class="footnote-ref">[${id}]</a></sup>`
  },
}

const footnoteDefExtension: marked.TokenizerAndRendererExtension = {
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
    // Don't render here - we'll collect and render at the end
    return ""
  },
}

// Render collected footnotes at the end
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

// Store line highlight info for post-processing
const lineHighlightStore = new Map<string, Set<number>>()
let codeBlockCounter = 0

// Configure marked
marked.use({
  extensions: [containerExtension, footnoteRefExtension, footnoteDefExtension],
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
    (match, attrs, blockId, code) => {
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

marked.use({ renderer })

// Store code groups for post-processing
const codeGroupStore = new Map<string, string>()

// Render code group tabs
function renderCodeGroup(content: string): string {
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

// Extract content (without frontmatter)
function extractContent(raw: string): string {
  const normalized = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
  const match = normalized.match(frontmatterRegex)

  if (match) {
    return match[2].trim()
  }
  return normalized
}

// Transform Badge components to proper HTML
function transformBadges(html: string): string {
  // Match <Badge type="..." text="..." /> or <badge type="..." text="..." />
  return html.replace(
    /<(Badge|badge)\s+type=["']([^"']+)["']\s+text=["']([^"']+)["']\s*\/?>/gi,
    (_match, _tag, type, text) => {
      return `<span class="badge badge-${type}">${text}</span>`
    },
  )
}

// Computed preview
const previewHtml = computed(() => {
  if (!rawContent.value) return ""

  codeBlockCounter = 0
  lineHighlightStore.clear()
  footnoteStore.clear()

  const content = extractContent(rawContent.value)
  const preprocessed = preprocessCodeGroups(content)
  let html = marked.parse(preprocessed) as string
  html = applyLineHighlighting(html)
  html = restoreCodeGroups(html)
  html = transformBadges(html)

  // Add footnotes at the end
  html += renderFootnotes()

  return html
})

// Watch for changes
watch(rawContent, (newVal) => {
  hasUnsavedChanges.value = newVal !== originalContent.value
})

// Authentication
const authenticate = () => {
  const storedKey = localStorage.getItem("blog_edit_key")
  if (storedKey) {
    isAuthenticated.value = true
    authKey.value = storedKey
    loadPost()
  }
}

const submitAuth = async () => {
  authError.value = ""

  try {
    // Verify the key by trying to access the API
    const res = await fetch("/api/blog?id=_verify", {
      headers: {
        "X-Edit-Key": authKey.value,
      },
    })

    // If 401, key is invalid; if 404, key is valid but post doesn't exist (which is fine)
    if (res.status === 401) {
      authError.value = "無効なキーです"
      return
    }

    localStorage.setItem("blog_edit_key", authKey.value)
    isAuthenticated.value = true
    loadPost()
  } catch {
    authError.value = "認証に失敗しました"
  }
}

const logout = () => {
  localStorage.removeItem("blog_edit_key")
  isAuthenticated.value = false
  authKey.value = ""
  router.push("/blog")
}

// Load post
const loadPost = async () => {
  const id = route.params.id as string | undefined
  const routeName = route.name

  // /blog/new/edit has no :id param (route name is BlogNew), so id is undefined
  if (!id || id === "new" || routeName === "BlogNew") {
    isNewPost.value = true
    isDraft.value = true // New posts are drafts by default
    rawContent.value = `---
title: 新しい記事
date: ${new Date().toISOString().split("T")[0]}
description: 
tags: []
author: c30
draft: true
---

ここに本文を書いてください。
`
    originalContent.value = rawContent.value
    // Set loading to false first so the editor container is rendered
    loading.value = false
    // Wait for DOM update, then initialize Monaco
    await nextTick()
    initMonaco()
    return
  }

  postId.value = id

  try {
    const response = await fetch(
      `/api/blog?id=${encodeURIComponent(id)}&raw=true`,
      {
        headers: {
          "X-Edit-Key": authKey.value,
        },
      },
    )

    if (!response.ok) {
      if (response.status === 404) {
        router.push("/404")
        return
      }
      throw new Error("Failed to fetch")
    }

    const data = (await response.json()) as { id: string; raw: string }
    rawContent.value = data.raw
    originalContent.value = data.raw
    // Parse draft status from frontmatter
    isDraft.value = /^---[\s\S]*?draft:\s*true[\s\S]*?---/.test(data.raw)

    // Update document title with post title
    const titleMatch = data.raw.match(
      /^---[\s\S]*?title:\s*["']?(.+?)["']?\s*$/m,
    )
    if (titleMatch) {
      document.title = `Edit: ${titleMatch[1]} | Blog | c30.life`
    }
  } catch (e) {
    console.error("Failed to load post:", e)
    saveError.value = "記事の読み込みに失敗しました"
  } finally {
    loading.value = false
    // Initialize Monaco after loading is complete and DOM is updated
    await nextTick()
    initMonaco()
  }
}

// Update draft status in frontmatter
const updateDraftStatus = (content: string, draft: boolean): string => {
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n")

  // Check if draft field exists in frontmatter
  if (/^---[\s\S]*?draft:\s*(true|false)[\s\S]*?---/.test(normalized)) {
    // Replace existing draft value
    return normalized.replace(
      /^(---[\s\S]*?)draft:\s*(true|false)([\s\S]*?---)/,
      `$1draft: ${draft}$3`,
    )
  }

  // Add draft field before closing ---
  const frontmatterMatch = normalized.match(/^(---\n[\s\S]*?)(---\n)/)
  if (frontmatterMatch) {
    return normalized.replace(
      /^(---\n[\s\S]*?)(---\n)/,
      `$1draft: ${draft}\n$2`,
    )
  }

  return normalized
}

// Save post (as draft or published)
const savePost = async (asDraft?: boolean) => {
  saving.value = true
  saveError.value = ""
  saveSuccess.value = false

  const id = isNewPost.value ? newPostId.value : postId.value

  if (isNewPost.value && !newPostId.value.trim()) {
    saveError.value = "記事IDを入力してください"
    saving.value = false
    return
  }

  // Validate ID format
  if (isNewPost.value && !/^[a-zA-Z0-9-_]+$/.test(newPostId.value)) {
    saveError.value = "記事IDは英数字、ハイフン、アンダースコアのみ使用できます"
    saving.value = false
    return
  }

  // Determine draft status: use parameter if provided, otherwise keep current status
  const shouldBeDraft = asDraft !== undefined ? asDraft : isDraft.value

  // Update draft status in content
  const contentToSave = updateDraftStatus(rawContent.value, shouldBeDraft)

  try {
    const response = await fetch("/api/blog", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Edit-Key": authKey.value,
      },
      body: JSON.stringify({
        id,
        content: contentToSave,
      }),
    })

    if (!response.ok) {
      const data = (await response.json()) as { error?: string }
      throw new Error(data.error || "Failed to save")
    }

    // Update local state
    rawContent.value = contentToSave
    if (monacoEditor && monacoEditor.getValue() !== contentToSave) {
      monacoEditor.setValue(contentToSave)
    }
    originalContent.value = contentToSave
    isDraft.value = shouldBeDraft
    hasUnsavedChanges.value = false
    saveSuccess.value = true

    // If new post, redirect to edit page with the new ID
    if (isNewPost.value) {
      router.replace(`/blog/${id}/edit`)
      postId.value = id
      isNewPost.value = false
    }

    setTimeout(() => {
      saveSuccess.value = false
    }, 3000)
  } catch (e) {
    saveError.value = e instanceof Error ? e.message : "保存に失敗しました"
  } finally {
    saving.value = false
  }
}

// Delete post
const deletePost = async () => {
  if (!confirm("本当にこの記事を削除しますか？この操作は取り消せません。")) {
    return
  }

  saving.value = true
  saveError.value = ""

  try {
    const response = await fetch(
      `/api/blog?id=${encodeURIComponent(postId.value)}`,
      {
        method: "DELETE",
        headers: {
          "X-Edit-Key": authKey.value,
        },
      },
    )

    if (!response.ok) {
      const data = (await response.json()) as { error?: string }
      throw new Error(data.error || "Failed to delete")
    }

    router.push("/blog")
  } catch (e) {
    saveError.value = e instanceof Error ? e.message : "削除に失敗しました"
  } finally {
    saving.value = false
  }
}

// View mode toggle
const viewMode = ref<"split" | "editor" | "preview">("split")

// Validate content with markdownlint
const validateContent = async (content: string) => {
  if (!monacoEditor) return

  const model = monacoEditor.getModel()
  if (!model) return

  const markers: monaco.editor.IMarkerData[] = []
  const lines = content.split("\n")

  // Run markdownlint
  try {
    const results = await markdownlint({
      strings: { content },
      config: {
        default: true,
        // Disable some rules that don't apply to blog posts
        MD013: false, // Line length
        MD033: false, // Inline HTML (we use custom containers)
        MD041: false, // First line should be heading (we use frontmatter)
        MD024: false, // No duplicate headings
        MD025: { front_matter_title: "" }, // Allow multiple h1 with frontmatter
        MD036: false, // Emphasis used instead of heading
      },
    })

    const lintResults = results.content || []
    for (const result of lintResults) {
      const severity =
        result.ruleNames.includes("MD001") ||
        result.ruleNames.includes("MD004") ||
        result.ruleNames.includes("MD007")
          ? monaco.MarkerSeverity.Info
          : monaco.MarkerSeverity.Warning

      markers.push({
        severity,
        message: `[${result.ruleNames.join("/")}] ${result.ruleDescription}${result.errorDetail ? `: ${result.errorDetail}` : ""}`,
        startLineNumber: result.lineNumber,
        startColumn: 1,
        endLineNumber: result.lineNumber,
        endColumn: lines[result.lineNumber - 1]?.length + 1 || 1,
      })
    }
  } catch (e) {
    console.error("markdownlint error:", e)
  }

  // Custom validations for blog frontmatter
  if (!content.startsWith("---")) {
    markers.push({
      severity: monaco.MarkerSeverity.Error,
      message:
        "Frontmatterが見つかりません。ファイルは---で始まる必要があります。",
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: 1,
      endColumn: lines[0]?.length + 1 || 1,
    })
  } else {
    // Find closing ---
    let closingLine = -1
    for (let i = 1; i < lines.length; i++) {
      if (lines[i] === "---") {
        closingLine = i
        break
      }
    }

    if (closingLine === -1) {
      markers.push({
        severity: monaco.MarkerSeverity.Error,
        message: "Frontmatterが閉じられていません。---で閉じてください。",
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 4,
      })
    } else {
      // Validate frontmatter fields
      const frontmatterLines = lines.slice(1, closingLine)
      let hasTitle = false
      let hasDate = false

      for (let i = 0; i < frontmatterLines.length; i++) {
        const line = frontmatterLines[i]
        const lineNum = i + 2 // 1-indexed, skip first ---

        if (line.startsWith("title:")) {
          hasTitle = true
          const value = line.substring(6).trim()
          if (!value) {
            markers.push({
              severity: monaco.MarkerSeverity.Warning,
              message: "titleが空です",
              startLineNumber: lineNum,
              startColumn: 1,
              endLineNumber: lineNum,
              endColumn: line.length + 1,
            })
          }
        }

        if (line.startsWith("date:")) {
          hasDate = true
          const value = line.substring(5).trim()
          if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            markers.push({
              severity: monaco.MarkerSeverity.Warning,
              message: "日付はYYYY-MM-DD形式で入力してください",
              startLineNumber: lineNum,
              startColumn: 6,
              endLineNumber: lineNum,
              endColumn: line.length + 1,
            })
          }
        }
      }

      if (!hasTitle) {
        markers.push({
          severity: monaco.MarkerSeverity.Warning,
          message: "titleフィールドがありません",
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: 1,
          endColumn: 4,
        })
      }

      if (!hasDate) {
        markers.push({
          severity: monaco.MarkerSeverity.Warning,
          message: "dateフィールドがありません",
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: 1,
          endColumn: 4,
        })
      }
    }
  }

  // Check for unclosed code blocks
  let inCodeBlock = false
  let codeBlockStart = 0
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("```")) {
      if (!inCodeBlock) {
        inCodeBlock = true
        codeBlockStart = i + 1
      } else {
        inCodeBlock = false
      }
    }
  }

  if (inCodeBlock) {
    markers.push({
      severity: monaco.MarkerSeverity.Error,
      message: "コードブロックが閉じられていません",
      startLineNumber: codeBlockStart,
      startColumn: 1,
      endLineNumber: codeBlockStart,
      endColumn: lines[codeBlockStart - 1]?.length + 1 || 1,
    })
  }

  // Check for unclosed custom containers (:::)
  let inContainer = false
  let containerStart = 0
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/^:::\s*\w+/)) {
      inContainer = true
      containerStart = i + 1
    } else if (lines[i] === ":::") {
      inContainer = false
    }
  }

  if (inContainer) {
    markers.push({
      severity: monaco.MarkerSeverity.Warning,
      message: "カスタムコンテナ(:::)が閉じられていません",
      startLineNumber: containerStart,
      startColumn: 1,
      endLineNumber: containerStart,
      endColumn: lines[containerStart - 1]?.length + 1 || 1,
    })
  }

  monaco.editor.setModelMarkers(model, "blog-validator", markers)
}

// Initialize Monaco Editor
const initMonaco = async () => {
  await nextTick()
  if (!editorContainer.value) return

  // Dispose existing editor
  if (monacoEditor) {
    monacoEditor.dispose()
  }

  // Define custom dark theme with better contrast
  monaco.editor.defineTheme("blog-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      // Markdown specific
      { token: "keyword.md", foreground: "569cd6", fontStyle: "bold" },
      { token: "string.md", foreground: "ce9178" },
      { token: "variable.md", foreground: "9cdcfe" },
      { token: "comment.md", foreground: "6a9955" },
      { token: "keyword", foreground: "c586c0" },
      { token: "string", foreground: "ce9178" },
      // Heading colors
      { token: "markup.heading", foreground: "4fc1ff", fontStyle: "bold" },
    ],
    colors: {
      "editor.background": "#1a1a1a",
      "editor.foreground": "#e0e0e0",
      "editor.lineHighlightBackground": "#252525",
      "editor.lineHighlightBorder": "#333333",
      "editorLineNumber.foreground": "#666666",
      "editorLineNumber.activeForeground": "#ffffff",
      "editor.selectionBackground": "#264f78",
      "editor.inactiveSelectionBackground": "#3a3d41",
      "editorCursor.foreground": "#ffffff",
      "editorIndentGuide.background": "#333333",
      "editorIndentGuide.activeBackground": "#555555",
      "editorGutter.background": "#141414",
      "editorWidget.background": "#252526",
      "editorWidget.border": "#454545",
      "minimap.background": "#141414",
    },
  })

  // Create editor
  monacoEditor = monaco.editor.create(editorContainer.value, {
    value: rawContent.value,
    language: "markdown",
    theme: "blog-dark",
    automaticLayout: true,
    minimap: { enabled: true, scale: 1 },
    fontSize: 14,
    fontFamily:
      "'JetBrains Mono', 'Fira Code', Consolas, 'Courier New', monospace",
    lineNumbers: "on",
    wordWrap: "on",
    scrollBeyondLastLine: false,
    renderWhitespace: "selection",
    tabSize: 2,
    insertSpaces: true,
    padding: { top: 16, bottom: 16 },
    bracketPairColorization: { enabled: true },
    guides: {
      bracketPairs: true,
      indentation: true,
    },
    suggestOnTriggerCharacters: true,
    quickSuggestions: true,
    folding: true,
    foldingStrategy: "indentation",
    showFoldingControls: "always",
    smoothScrolling: true,
    cursorBlinking: "smooth",
    cursorSmoothCaretAnimation: "on",
  })

  // Initial validation
  validateContent(rawContent.value)

  // Sync content changes and validate
  monacoEditor.onDidChangeModelContent(() => {
    const content = monacoEditor?.getValue() || ""
    rawContent.value = content
    validateContent(content)
  })

  // Add save shortcut
  monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
    savePost()
  })

  // Register custom completion provider for markdown
  monaco.languages.registerCompletionItemProvider("markdown", {
    triggerCharacters: [":"],
    provideCompletionItems: (model, position) => {
      const lineContent = model.getLineContent(position.lineNumber)
      const textUntilPosition = lineContent.substring(0, position.column - 1)

      // Check if we're typing ::: at the start of a line
      if (textUntilPosition.match(/^::+$/)) {
        const range = {
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        }

        return {
          suggestions: [
            {
              label: ":::info",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: ":::info\n$1\n:::",
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: "情報ブロック（INFO）",
              range,
            },
            {
              label: ":::tip",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: ":::tip\n$1\n:::",
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: "ヒントブロック（TIP）",
              range,
            },
            {
              label: ":::warning",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: ":::warning\n$1\n:::",
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: "警告ブロック（WARNING）",
              range,
            },
            {
              label: ":::danger",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: ":::danger\n$1\n:::",
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: "危険ブロック（DANGER）",
              range,
            },
            {
              label: ":::details",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: ":::details ${1:クリックで展開}\n$2\n:::",
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: "折りたたみブロック（Details）",
              range,
            },
            {
              label: ":::code-group",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText:
                ":::code-group\n```${1:js} [${2:JavaScript}]\n$3\n```\n:::",
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: "コードグループ（タブ切り替え）",
              range,
            },
            {
              label: ":::info カスタムタイトル",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: ":::info ${1:タイトル}\n$2\n:::",
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: "カスタムタイトル付き情報ブロック",
              range,
            },
            {
              label: ":::tip カスタムタイトル",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: ":::tip ${1:タイトル}\n$2\n:::",
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: "カスタムタイトル付きヒントブロック",
              range,
            },
            {
              label: ":::warning カスタムタイトル",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: ":::warning ${1:タイトル}\n$2\n:::",
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: "カスタムタイトル付き警告ブロック",
              range,
            },
            {
              label: ":::danger カスタムタイトル",
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: ":::danger ${1:タイトル}\n$2\n:::",
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: "カスタムタイトル付き危険ブロック",
              range,
            },
          ],
        }
      }

      // Also provide suggestions when typing ``` for code blocks
      if (textUntilPosition.match(/^`{2,}$/)) {
        const range = {
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        }

        const languages = [
          { label: "javascript", alias: "js" },
          { label: "typescript", alias: "ts" },
          { label: "python", alias: "py" },
          { label: "bash", alias: "sh" },
          { label: "json", alias: null },
          { label: "html", alias: null },
          { label: "css", alias: null },
          { label: "rust", alias: "rs" },
          { label: "go", alias: null },
          { label: "java", alias: null },
          { label: "cpp", alias: null },
          { label: "c", alias: null },
          { label: "sql", alias: null },
          { label: "yaml", alias: "yml" },
          { label: "dockerfile", alias: "docker" },
          { label: "markdown", alias: "md" },
          { label: "lua", alias: null },
        ]

        return {
          suggestions: languages.map((lang) => ({
            label: `\`\`\`${lang.label}`,
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: `\`\`\`${lang.label}\n$1\n\`\`\``,
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: `${lang.label}のコードブロック${lang.alias ? ` (${lang.alias})` : ""}`,
            range,
          })),
        }
      }

      return { suggestions: [] }
    },
  })

  // Register general markdown snippets (triggered by typing)
  monaco.languages.registerCompletionItemProvider("markdown", {
    triggerCharacters: ["#", "-", "[", "!", "|", "*", ">", "$"],
    provideCompletionItems: (model, position) => {
      const lineContent = model.getLineContent(position.lineNumber)
      const textUntilPosition = lineContent.substring(0, position.column - 1)
      const word = model.getWordUntilPosition(position)

      const range = {
        startLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      }

      const suggestions: monaco.languages.CompletionItem[] = []

      // Headings (when typing # at start of line)
      if (textUntilPosition.match(/^#+$/)) {
        const headingRange = {
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        }
        suggestions.push(
          {
            label: "# 見出し1",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "# ${1:見出し}",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "見出しレベル1 (H1)",
            range: headingRange,
          },
          {
            label: "## 見出し2",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "## ${1:見出し}",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "見出しレベル2 (H2)",
            range: headingRange,
          },
          {
            label: "### 見出し3",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "### ${1:見出し}",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "見出しレベル3 (H3)",
            range: headingRange,
          },
          {
            label: "#### 見出し4",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "#### ${1:見出し}",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "見出しレベル4 (H4)",
            range: headingRange,
          },
        )
      }

      // Lists (when typing - at start of line)
      if (textUntilPosition.match(/^-\s*$/)) {
        const listRange = {
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        }
        suggestions.push(
          {
            label: "- [ ] タスク（未完了）",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "- [ ] ${1:タスク}",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "チェックボックス（未完了）",
            range: listRange,
          },
          {
            label: "- [x] タスク（完了）",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "- [x] ${1:タスク}",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "チェックボックス（完了）",
            range: listRange,
          },
        )
      }

      // Links (when typing [)
      if (textUntilPosition.endsWith("[")) {
        suggestions.push(
          {
            label: "[リンク](url)",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "[${1:テキスト}](${2:url})",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "リンク",
            range,
          },
          {
            label: "[リンク](url title)",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '[${1:テキスト}](${2:url} "${3:タイトル}")',
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "タイトル付きリンク",
            range,
          },
          {
            label: "[[内部リンク]]",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "[[${1:ページ名}]]",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Wiki形式の内部リンク",
            range,
          },
        )
      }

      // Images (when typing !)
      if (textUntilPosition.endsWith("!")) {
        suggestions.push(
          {
            label: "![画像](url)",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "![${1:alt}](${2:url})",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "画像を挿入",
            range,
          },
          {
            label: "![画像](url title)",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '![${1:alt}](${2:url} "${3:タイトル}")',
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "タイトル付き画像",
            range,
          },
        )
      }

      // Table (when typing |)
      if (textUntilPosition.match(/^\|*$/)) {
        const tableRange = {
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        }
        suggestions.push(
          {
            label: "| テーブル（2列）",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "| ${1:列1} | ${2:列2} |\n| --- | --- |\n| $3 | $4 |",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "2列のテーブル",
            range: tableRange,
          },
          {
            label: "| テーブル（3列）",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText:
              "| ${1:列1} | ${2:列2} | ${3:列3} |\n| --- | --- | --- |\n| $4 | $5 | $6 |",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "3列のテーブル",
            range: tableRange,
          },
          {
            label: "| テーブル（中央揃え）",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText:
              "| ${1:列1} | ${2:列2} | ${3:列3} |\n| :---: | :---: | :---: |\n| $4 | $5 | $6 |",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "中央揃えのテーブル",
            range: tableRange,
          },
        )
      }

      // Bold/Italic (when typing *)
      if (textUntilPosition.endsWith("*")) {
        suggestions.push(
          {
            label: "**太字**",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "*${1:太字}**",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "太字テキスト",
            range,
          },
          {
            label: "*斜体*",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "${1:斜体}*",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "斜体テキスト",
            range,
          },
          {
            label: "***太字斜体***",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "**${1:太字斜体}***",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "太字＋斜体テキスト",
            range,
          },
        )
      }

      // Blockquote (when typing >)
      if (textUntilPosition.match(/^>+\s*$/)) {
        const quoteRange = {
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        }
        suggestions.push(
          {
            label: "> 引用",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "> ${1:引用テキスト}",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "引用ブロック",
            range: quoteRange,
          },
          {
            label: "> [!NOTE]",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "> [!NOTE]\n> ${1:ノート}",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "GitHub形式のノート",
            range: quoteRange,
          },
          {
            label: "> [!TIP]",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "> [!TIP]\n> ${1:ヒント}",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "GitHub形式のヒント",
            range: quoteRange,
          },
          {
            label: "> [!WARNING]",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "> [!WARNING]\n> ${1:警告}",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "GitHub形式の警告",
            range: quoteRange,
          },
          {
            label: "> [!CAUTION]",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "> [!CAUTION]\n> ${1:注意}",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "GitHub形式の注意",
            range: quoteRange,
          },
        )
      }

      // Math (when typing $)
      if (textUntilPosition.endsWith("$")) {
        suggestions.push(
          {
            label: "$数式$",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "${1:x^2}$",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "インライン数式 (KaTeX)",
            range,
          },
          {
            label: "$$数式ブロック$$",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "$\n${1:E = mc^2}\n$$",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "数式ブロック (KaTeX)",
            range,
          },
        )
      }

      return { suggestions }
    },
  })

  // Register snippets that can be triggered anywhere
  monaco.languages.registerCompletionItemProvider("markdown", {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endLineNumber: position.lineNumber,
        endColumn: word.endColumn,
      }

      return {
        suggestions: [
          // Frontmatter
          {
            label: "frontmatter",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText:
              "---\ntitle: ${1:タイトル}\ndate: ${2:YYYY-MM-DD}\ndescription: ${3:説明}\ntags: [${4:tag1, tag2}]\nauthor: ${5:c30}\ndraft: ${6:false}\n---\n\n$0",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "VitePress用フロントマター",
            range,
          },
          // Horizontal rule
          {
            label: "hr",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "\n---\n",
            documentation: "水平線",
            range,
          },
          // Code blocks with line highlighting
          {
            label: "code-highlight",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "```${1:js}{${2:1,3-5}}\n$3\n```",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "行ハイライト付きコードブロック",
            range,
          },
          // Footnote
          {
            label: "footnote",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "[^${1:1}]: ${2:脚注テキスト}",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "脚注の定義",
            range,
          },
          {
            label: "footnote-ref",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "[^${1:1}]",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "脚注への参照",
            range,
          },
          // Strikethrough
          {
            label: "strikethrough",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "~~${1:打ち消し}~~",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "打ち消し線",
            range,
          },
          // Inline code
          {
            label: "code",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "`${1:コード}`",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "インラインコード",
            range,
          },
          // Badge (VitePress)
          {
            label: "badge",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText:
              '<Badge type="${1|info,tip,warning,danger|}" text="${2:テキスト}" />',
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "VitePressバッジ",
            range,
          },
          // Emoji
          {
            label: "emoji",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: ":${1:smile}:",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "絵文字 (:smile: など)",
            range,
          },
          // Keyboard
          {
            label: "kbd",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "<kbd>${1:Ctrl}</kbd>",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "キーボードキー表示",
            range,
          },
          // Abbreviation
          {
            label: "abbr",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '<abbr title="${1:正式名称}">${2:略語}</abbr>',
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "略語（ホバーで説明表示）",
            range,
          },
          // Mark/Highlight
          {
            label: "mark",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "<mark>${1:ハイライト}</mark>",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "マーカー/ハイライト",
            range,
          },
          // Superscript/Subscript
          {
            label: "sup",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "<sup>${1:上付き}</sup>",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "上付き文字",
            range,
          },
          {
            label: "sub",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "<sub>${1:下付き}</sub>",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "下付き文字",
            range,
          },
          // Definition list
          {
            label: "dl",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: "${1:用語}\n: ${2:定義}",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "定義リスト",
            range,
          },
          // YouTube embed
          {
            label: "youtube",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText:
              '<iframe width="560" height="315" src="https://www.youtube.com/embed/${1:VIDEO_ID}" frameborder="0" allowfullscreen></iframe>',
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "YouTube埋め込み",
            range,
          },
          // Twitter embed
          {
            label: "twitter",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText:
              '<blockquote class="twitter-tweet"><a href="https://twitter.com/${1:user}/status/${2:ID}"></a></blockquote>',
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Twitter埋め込み",
            range,
          },
          // Collapsible section (HTML)
          {
            label: "details-html",
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText:
              "<details>\n<summary>${1:クリックで展開}</summary>\n\n${2:内容}\n\n</details>",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "HTML形式の折りたたみ",
            range,
          },
        ],
      }
    },
  })
}

// Update Monaco content when rawContent changes externally
watch(rawContent, (newVal) => {
  if (monacoEditor && monacoEditor.getValue() !== newVal) {
    monacoEditor.setValue(newVal)
  }
})

// Watch for view mode changes to reinitialize editor
watch(viewMode, async (newMode) => {
  if (newMode === "editor" || newMode === "split") {
    await nextTick()
    if (editorContainer.value && !monacoEditor) {
      initMonaco()
    } else if (monacoEditor) {
      monacoEditor.layout()
    }
  }
})

onMounted(() => {
  authenticate()
})

onUnmounted(() => {
  if (monacoEditor) {
    monacoEditor.dispose()
    monacoEditor = null
  }
})
</script>

<template>
  <section class="w-full min-h-[calc(100vh-120px)] flex flex-col">
    <!-- Auth Screen -->
    <div
      v-if="!isAuthenticated"
      class="max-w-md mx-auto backdrop-blur-xl bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 shadow-2xl"
    >
      <h1 class="text-2xl font-bold text-white mb-4">ブログエディター</h1>
      <p class="text-neutral-400 text-sm mb-4">
        編集するには認証キーを入力してください
      </p>

      <form @submit.prevent="submitAuth" class="space-y-4">
        <input
          v-model="authKey"
          type="password"
          placeholder="編集キー"
          class="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
        />

        <p v-if="authError" class="text-red-400 text-sm">{{ authError }}</p>

        <button
          type="submit"
          class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          認証
        </button>
      </form>

      <RouterLink
        to="/blog"
        class="block text-center text-neutral-400 hover:text-white text-sm mt-4"
      >
        ← ブログに戻る
      </RouterLink>
    </div>

    <!-- Editor -->
    <div v-else class="flex-1 flex flex-col min-h-0">
      <!-- Header -->
      <div
        class="backdrop-blur-xl bg-neutral-900/80 border-b border-neutral-800 p-4 flex items-center justify-between gap-4 flex-wrap"
      >
        <div class="flex items-center gap-4">
          <RouterLink
            to="/blog"
            class="text-neutral-400 hover:text-white transition-colors"
          >
            ← ブログ
          </RouterLink>

          <h1 class="text-lg font-bold text-white">
            {{ isNewPost ? "新規記事" : `編集: ${postId}` }}
          </h1>

          <span v-if="hasUnsavedChanges" class="text-yellow-400 text-sm">
            (未保存の変更あり)
          </span>
        </div>

        <div class="flex items-center gap-2">
          <!-- View mode buttons -->
          <div class="flex bg-neutral-800 rounded-lg p-1">
            <button
              @click="viewMode = 'editor'"
              :class="[
                'px-3 py-1 rounded text-sm transition-colors',
                viewMode === 'editor'
                  ? 'bg-neutral-700 text-white'
                  : 'text-neutral-400 hover:text-white',
              ]"
            >
              エディター
            </button>
            <button
              @click="viewMode = 'split'"
              :class="[
                'px-3 py-1 rounded text-sm transition-colors',
                viewMode === 'split'
                  ? 'bg-neutral-700 text-white'
                  : 'text-neutral-400 hover:text-white',
              ]"
            >
              分割
            </button>
            <button
              @click="viewMode = 'preview'"
              :class="[
                'px-3 py-1 rounded text-sm transition-colors',
                viewMode === 'preview'
                  ? 'bg-neutral-700 text-white'
                  : 'text-neutral-400 hover:text-white',
              ]"
            >
              プレビュー
            </button>
          </div>

          <!-- Actions -->
          <button
            v-if="!isNewPost"
            @click="deletePost"
            :disabled="saving"
            class="px-4 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            削除
          </button>

          <a
            v-if="!isNewPost"
            :href="`/blog/${postId}`"
            target="_blank"
            class="px-4 py-1.5 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg text-sm transition-colors"
          >
            表示
          </a>

          <!-- Draft/Publish status indicator -->
          <span
            :class="[
              'px-2 py-1 rounded text-xs font-medium',
              isDraft
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-green-500/20 text-green-400',
            ]"
          >
            {{ isDraft ? "下書き" : "公開済み" }}
          </span>

          <!-- Save as draft button -->
          <button
            @click="savePost(true)"
            :disabled="saving"
            class="px-4 py-1.5 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            <span v-if="saving">保存中...</span>
            <span v-else>下書き保存</span>
          </button>

          <!-- Publish button -->
          <button
            @click="savePost(false)"
            :disabled="saving"
            class="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            <span v-if="saving">公開中...</span>
            <span v-else>{{ isDraft ? "公開する" : "更新して公開" }}</span>
          </button>

          <button
            @click="logout"
            class="px-4 py-1.5 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg text-sm transition-colors"
          >
            ログアウト
          </button>
        </div>
      </div>

      <!-- Status messages -->
      <div
        v-if="saveError"
        class="bg-red-500/20 text-red-400 px-4 py-2 text-sm"
      >
        {{ saveError }}
      </div>
      <div
        v-if="saveSuccess"
        class="bg-green-500/20 text-green-400 px-4 py-2 text-sm"
      >
        {{ isDraft ? "下書きを保存しました！" : "記事を公開しました！" }}
      </div>

      <!-- New post ID input -->
      <div
        v-if="isNewPost"
        class="bg-neutral-800/50 px-4 py-3 border-b border-neutral-700"
      >
        <label class="flex items-center gap-3">
          <span class="text-neutral-400 text-sm">記事ID:</span>
          <input
            v-model="newPostId"
            type="text"
            placeholder="my-new-post"
            class="flex-1 max-w-md px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 text-sm"
          />
          <span class="text-neutral-500 text-xs">
            (英数字、ハイフン、アンダースコアのみ)
          </span>
        </label>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex-1 flex items-center justify-center">
        <div class="text-neutral-400">読み込み中...</div>
      </div>

      <!-- Editor Content -->
      <div v-else class="flex-1 flex overflow-hidden min-h-[500px]">
        <!-- Editor Pane -->
        <div
          v-show="viewMode === 'editor' || viewMode === 'split'"
          :class="[
            'flex flex-col border-r border-neutral-800',
            viewMode === 'split' ? 'w-1/2' : 'w-full',
          ]"
        >
          <div
            class="bg-neutral-800/50 px-4 py-2 text-neutral-400 text-sm border-b border-neutral-700"
          >
            Markdown
          </div>
          <div ref="editorContainer" class="flex-1 w-full bg-neutral-900" />
        </div>

        <!-- Preview Pane -->
        <div
          v-show="viewMode === 'preview' || viewMode === 'split'"
          :class="[
            'flex flex-col overflow-hidden',
            viewMode === 'split' ? 'w-1/2' : 'w-full',
          ]"
        >
          <div
            class="bg-neutral-800/50 px-4 py-2 text-neutral-400 text-sm border-b border-neutral-700"
          >
            プレビュー
          </div>
          <div
            class="flex-1 overflow-y-auto p-4 bg-neutral-900/50 blog-content prose prose-invert max-w-none"
            v-html="previewHtml"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@reference "tailwindcss";

.blog-content :deep(h1),
.blog-content :deep(h2),
.blog-content :deep(h3),
.blog-content :deep(h4),
.blog-content :deep(h5),
.blog-content :deep(h6) {
  @apply text-white font-bold mt-6 mb-3;
}

.blog-content :deep(h1) {
  @apply text-2xl;
}
.blog-content :deep(h2) {
  @apply text-xl;
}
.blog-content :deep(h3) {
  @apply text-lg;
}

.blog-content :deep(p) {
  @apply text-neutral-300 mb-4 leading-relaxed;
}

.blog-content :deep(a) {
  @apply text-blue-400 hover:underline;
}

.blog-content :deep(ul),
.blog-content :deep(ol) {
  @apply text-neutral-300 mb-4 pl-6;
}

.blog-content :deep(ul) {
  @apply list-disc;
}

.blog-content :deep(ol) {
  @apply list-decimal;
}

.blog-content :deep(li) {
  @apply mb-1;
}

.blog-content :deep(pre) {
  @apply bg-neutral-800 rounded-lg p-4 mb-4 overflow-x-auto;
}

.blog-content :deep(code) {
  @apply font-mono text-sm;
}

.blog-content :deep(:not(pre) > code) {
  @apply bg-neutral-800 px-1.5 py-0.5 rounded text-blue-300;
}

.blog-content :deep(blockquote) {
  @apply border-l-4 border-neutral-600 pl-4 italic text-neutral-400 mb-4;
}

.blog-content :deep(hr) {
  @apply border-neutral-700 my-6;
}

.blog-content :deep(img) {
  @apply rounded-lg max-w-full;
}

.blog-content :deep(table) {
  @apply w-full border-collapse mb-4;
}

.blog-content :deep(th),
.blog-content :deep(td) {
  @apply border border-neutral-700 px-3 py-2 text-left;
}

.blog-content :deep(th) {
  @apply bg-neutral-800 font-semibold;
}

/* Custom blocks */
.blog-content :deep(.custom-block) {
  @apply rounded-lg p-4 mb-4 border;
}

.blog-content :deep(.custom-block.info) {
  @apply bg-blue-500/10 border-blue-500/30;
}

.blog-content :deep(.custom-block.tip) {
  @apply bg-green-500/10 border-green-500/30;
}

.blog-content :deep(.custom-block.warning) {
  @apply bg-yellow-500/10 border-yellow-500/30;
}

.blog-content :deep(.custom-block.danger) {
  @apply bg-red-500/10 border-red-500/30;
}

.blog-content :deep(.custom-block-title) {
  @apply font-bold mb-2 text-sm uppercase tracking-wide;
}

.blog-content :deep(.custom-block.info .custom-block-title) {
  @apply text-blue-400;
}

.blog-content :deep(.custom-block.tip .custom-block-title) {
  @apply text-green-400;
}

.blog-content :deep(.custom-block.warning .custom-block-title) {
  @apply text-yellow-400;
}

.blog-content :deep(.custom-block.danger .custom-block-title) {
  @apply text-red-400;
}

/* Header anchor */
.blog-content :deep(.header-anchor) {
  @apply ml-2 text-neutral-500 opacity-0 transition-opacity;
}

.blog-content :deep(h1:hover .header-anchor),
.blog-content :deep(h2:hover .header-anchor),
.blog-content :deep(h3:hover .header-anchor),
.blog-content :deep(h4:hover .header-anchor),
.blog-content :deep(h5:hover .header-anchor),
.blog-content :deep(h6:hover .header-anchor) {
  @apply opacity-100;
}

/* Line highlighting */
.blog-content :deep(.line.highlighted) {
  @apply bg-blue-500/20 -mx-4 px-4 inline-block w-[calc(100%+2rem)];
}

/* Code group */
.blog-content :deep(.code-group) {
  @apply rounded-lg overflow-hidden mb-4 border border-neutral-700;
}

.blog-content :deep(.code-group-tabs) {
  @apply flex bg-neutral-800 border-b border-neutral-700;
}

.blog-content :deep(.code-group-tab) {
  @apply px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors border-b-2 border-transparent;
}

.blog-content :deep(.code-group-tab.active) {
  @apply text-white border-blue-500 bg-neutral-900;
}

.blog-content :deep(.code-group-panel) {
  @apply hidden;
}

.blog-content :deep(.code-group-panel.active) {
  @apply block;
}

.blog-content :deep(.code-group-panel pre) {
  @apply rounded-none border-0 m-0;
}

/* Badge component */
.blog-content :deep(.badge) {
  @apply inline-flex items-center px-2 py-0.5 rounded text-xs font-medium;
}

.blog-content :deep(.badge-info) {
  @apply bg-blue-500/20 text-blue-400 border border-blue-500/30;
}

.blog-content :deep(.badge-tip) {
  @apply bg-green-500/20 text-green-400 border border-green-500/30;
}

.blog-content :deep(.badge-warning) {
  @apply bg-yellow-500/20 text-yellow-400 border border-yellow-500/30;
}

.blog-content :deep(.badge-danger) {
  @apply bg-red-500/20 text-red-400 border border-red-500/30;
}

/* kbd element */
.blog-content :deep(kbd) {
  @apply inline-block px-2 py-0.5 text-xs font-mono bg-neutral-800 border border-neutral-600 rounded shadow-sm;
}

/* mark element */
.blog-content :deep(mark) {
  @apply bg-yellow-500/30 text-yellow-200 px-1 rounded;
}

/* abbr element */
.blog-content :deep(abbr) {
  @apply border-b border-dotted border-neutral-500 cursor-help;
}

/* sup/sub elements */
.blog-content :deep(sup),
.blog-content :deep(sub) {
  @apply text-xs;
}

/* details element */
.blog-content :deep(details) {
  @apply bg-neutral-800/50 rounded-lg mb-4 border border-neutral-700;
}

.blog-content :deep(details summary) {
  @apply px-4 py-2 cursor-pointer text-neutral-300 hover:text-white transition-colors;
}

.blog-content :deep(details[open] summary) {
  @apply border-b border-neutral-700;
}

.blog-content :deep(details > *:not(summary)) {
  @apply px-4 py-2;
}

/* GitHub style alerts */
.blog-content :deep(blockquote:has(p:first-child:is(:contains("[!NOTE]")))) {
  @apply bg-blue-500/10 border-blue-500;
}

/* Definition list */
.blog-content :deep(dl) {
  @apply mb-4;
}

.blog-content :deep(dt) {
  @apply font-bold text-white mt-2;
}

.blog-content :deep(dd) {
  @apply text-neutral-400 pl-4 mb-2;
}

/* Footnotes */
.blog-content :deep(.footnote-ref) {
  @apply text-blue-400 hover:text-blue-300 no-underline;
}

.blog-content :deep(.footnotes-section) {
  @apply border-t border-neutral-700 pt-4 mt-8;
}

.blog-content :deep(.footnote) {
  @apply block text-sm text-neutral-400 py-1;
}

.blog-content :deep(.footnote-id) {
  @apply text-blue-400 font-medium mr-1;
}

.blog-content :deep(.footnote-backref) {
  @apply text-blue-400 hover:text-blue-300 no-underline ml-1;
}
</style>
