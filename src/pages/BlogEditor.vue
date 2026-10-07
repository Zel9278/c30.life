<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue"
import { onBeforeRouteLeave, useRoute, useRouter } from "vue-router"
import "highlight.js/styles/github-dark.css"
import { lint as markdownlint } from "markdownlint/promise"
import ImageViewerProvider from "@/components/ImageViewerProvider.vue"
import SocialEmbed from "@/components/SocialEmbed.vue"
import { parseFrontmatter } from "@/lib/blog/frontmatter.ts"
import { hasLanguage, highlightCode } from "@/lib/blog/hljs.ts"
import {
  renderBlogMarkdown,
  type SocialEmbedData,
} from "@/lib/blog/markdown.ts"
import { sanitizeBlogHtml } from "@/lib/blog/sanitize.ts"
// Worker の設定 (MonacoEnvironment) を済ませた monaco-editor
import * as monaco from "@/lib/monaco.ts"

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
const socialEmbeds = ref<SocialEmbedData[]>([])
const embedRenderKey = ref(0) // Force re-render of embeds

// Monaco editor instance
const editorContainer = ref<HTMLDivElement | null>(null)
const previewContainer = ref<HTMLDivElement | null>(null)
let monacoEditor: monaco.editor.IStandaloneCodeEditor | null = null

// Image upload
const imageFileInput = ref<HTMLInputElement | null>(null)
const imageUploading = ref(false)
const imageUploadError = ref("")
const isDragOver = ref(false)

// For new post
const newPostId = ref("")

// 公開ページ (BlogPost.vue) と同じパイプラインでプレビューを描画する。
// 本文と outline は API (functions/api/blog.ts) と同じ frontmatter パーサーで取り出す
const rendered = computed(() => {
  if (!rawContent.value) return null
  const { data, content } = parseFrontmatter(rawContent.value)
  return renderBlogMarkdown(content, {
    mode: "spa",
    outline: data.outline,
    highlight: highlightCode,
    hasLanguage,
  })
})

// 生 HTML を含むので DOMPurify を通してから v-html に渡す
const previewHtml = computed(() => sanitizeBlogHtml(rendered.value?.html ?? ""))

// code-group のタブ切り替え。プレビューは入力のたびに v-html で作り直されるので、
// 個々のタブではなくプレビュー全体でクリックを受ける
function onPreviewClick(e: MouseEvent) {
  if (!(e.target instanceof Element)) return
  const tab = e.target.closest(".code-group-tab")
  const group = tab?.closest(".code-group")
  if (!tab || !group || !previewContainer.value?.contains(group)) return

  const tabIndex = tab.getAttribute("data-tab")
  for (const t of group.querySelectorAll(
    ":scope > .code-group-tabs > .code-group-tab",
  )) {
    t.classList.toggle("active", t === tab)
  }
  for (const p of group.querySelectorAll(":scope > .code-group-panel")) {
    p.classList.toggle("active", p.getAttribute("data-panel") === tabIndex)
  }
}

// Watch for changes
watch(rawContent, (newVal) => {
  hasUnsavedChanges.value = newVal !== originalContent.value
})

// Watch for preview changes to update social embeds
watch(previewHtml, () => {
  // Use double nextTick to ensure DOM is fully updated
  nextTick(() => {
    nextTick(() => {
      socialEmbeds.value = rendered.value?.embeds ?? []
      // Increment key to force Teleport re-render
      embedRenderKey.value++
    })
  })
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
        MD011: false, // Reversed link syntax (we use [[toc]])
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
    // 全角の括弧など日本語の文字を「紛らわしい文字」として囲まない (VS Code の Markdown と同じ)
    unicodeHighlight: { ambiguousCharacters: false },
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

// Image upload helpers
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/svg+xml",
]

function insertImageMarkdown(url: string, alt = "image") {
  if (!monacoEditor) return
  const selection = monacoEditor.getSelection()
  if (!selection) return
  const text = `![${alt}](${url})`
  monacoEditor.executeEdits("", [{ range: selection, text }])
  monacoEditor.focus()
}

async function uploadImageFile(file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    imageUploadError.value = `非対応の形式です: ${file.type}`
    setTimeout(() => {
      imageUploadError.value = ""
    }, 3000)
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    imageUploadError.value = "10MB 以下にしてください"
    setTimeout(() => {
      imageUploadError.value = ""
    }, 3000)
    return
  }

  imageUploading.value = true
  imageUploadError.value = ""

  try {
    const form = new FormData()
    form.append("file", file)
    const res = await fetch("/api/blog-image", {
      method: "POST",
      headers: { "X-Edit-Key": authKey.value },
      body: form,
    })
    if (!res.ok) {
      const err = (await res.json()) as { error?: string }
      throw new Error(err.error ?? "Upload failed")
    }
    const { url } = (await res.json()) as { url: string }
    insertImageMarkdown(url, file.name.replace(/\.[^.]+$/, ""))
  } catch (e) {
    imageUploadError.value = e instanceof Error ? e.message : "アップロード失敗"
    setTimeout(() => {
      imageUploadError.value = ""
    }, 4000)
  } finally {
    imageUploading.value = false
  }
}

function onImageFileInputChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files?.length) return
  void uploadImageFile(files[0])
  ;(e.target as HTMLInputElement).value = ""
}

function onEditorDragOver(e: DragEvent) {
  if (e.dataTransfer?.types.includes("Files")) {
    e.preventDefault()
    isDragOver.value = true
  }
}

function onEditorDragLeave() {
  isDragOver.value = false
}

function onEditorDrop(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = false
  const file = e.dataTransfer?.files[0]
  if (file) void uploadImageFile(file)
}

function onEditorPaste(e: ClipboardEvent) {
  const file = Array.from(e.clipboardData?.items ?? [])
    .find((i) => i.kind === "file" && ALLOWED_IMAGE_TYPES.includes(i.type))
    ?.getAsFile()
  if (file) {
    e.preventDefault()
    void uploadImageFile(file)
  }
}

// Handle browser close/reload with unsaved changes
const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (hasUnsavedChanges.value) {
    e.preventDefault()
    // Modern browsers ignore custom messages, but this is required for the dialog to show
    e.returnValue = "未保存の変更があります。ページを離れますか？"
    return e.returnValue
  }
}

// Handle Vue Router navigation with unsaved changes
onBeforeRouteLeave((_to, _from, next) => {
  if (hasUnsavedChanges.value) {
    const answer = window.confirm(
      "未保存の変更があります。保存せずにページを離れますか？",
    )
    if (answer) {
      next()
    } else {
      next(false)
    }
  } else {
    next()
  }
})

onMounted(() => {
  authenticate()
  window.addEventListener("beforeunload", handleBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener("beforeunload", handleBeforeUnload)
  if (monacoEditor) {
    monacoEditor.dispose()
    monacoEditor = null
  }
})
</script>

<template>
  <section class="w-full h-[calc(100vh-120px)] flex flex-col">
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
    <div v-else class="flex-1 flex flex-col min-h-0 overflow-hidden">
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
      <div v-else class="flex-1 flex overflow-hidden min-h-0">
        <!-- Editor Pane -->
        <div
          v-show="viewMode === 'editor' || viewMode === 'split'"
          :class="[
            'flex flex-col border-r border-neutral-800 min-w-0 min-h-0',
            viewMode === 'split' ? 'w-1/2' : 'w-full',
          ]"
        >
          <div
            class="bg-neutral-800/50 px-4 py-2 text-neutral-400 text-sm border-b border-neutral-700 shrink-0 flex items-center justify-between gap-2"
          >
            <span>Markdown</span>
            <!-- Image upload toolbar -->
            <div class="flex items-center gap-2">
              <!-- Upload error -->
              <span v-if="imageUploadError" class="text-red-400 text-xs">
                {{ imageUploadError }}
              </span>
              <!-- Upload button -->
              <button
                type="button"
                :disabled="imageUploading"
                class="flex items-center gap-1.5 px-2 py-1 bg-neutral-700 hover:bg-neutral-600 text-neutral-300 hover:text-white rounded text-xs transition-colors disabled:opacity-50"
                @click="imageFileInput?.click()"
              >
                <svg
                  v-if="!imageUploading"
                  class="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <svg
                  v-else
                  class="w-3.5 h-3.5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                <span>{{ imageUploading ? 'アップロード中...' : '画像' }}</span>
              </button>
              <!-- Hidden file input -->
              <input
                ref="imageFileInput"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,image/avif,image/svg+xml"
                class="hidden"
                @change="onImageFileInputChange"
              />
            </div>
          </div>
          <!-- Drop zone wrapper -->
          <div
            class="relative flex-1 min-h-0"
            @dragover="onEditorDragOver"
            @dragleave="onEditorDragLeave"
            @drop="onEditorDrop"
            @paste.capture="onEditorPaste"
          >
            <div
              ref="editorContainer"
              class="w-full h-full bg-neutral-900"
            />
            <!-- Drag overlay -->
            <div
              v-if="isDragOver"
              class="absolute inset-0 z-20 flex items-center justify-center bg-blue-900/40 border-2 border-dashed border-blue-400 pointer-events-none"
            >
              <span class="text-blue-300 text-sm font-medium">画像をドロップしてアップロード</span>
            </div>
          </div>
        </div>

        <!-- Preview Pane -->
        <div
          v-show="viewMode === 'preview' || viewMode === 'split'"
          :class="[
            'flex flex-col overflow-hidden min-w-0',
            viewMode === 'split' ? 'w-1/2' : 'w-full',
          ]"
        >
          <div
            class="bg-neutral-800/50 px-4 py-2 text-neutral-400 text-sm border-b border-neutral-700 flex items-center justify-between shrink-0"
          >
            <span>プレビュー</span>
          </div>
          <!-- 公開ページと同じく data-viewer="true" の画像はクリックで拡大表示 -->
          <ImageViewerProvider>
            <div
              ref="previewContainer"
              class="flex-1 overflow-y-auto p-4 bg-neutral-900/50 blog-content"
              @click="onPreviewClick"
              v-html="previewHtml"
            />
            <!-- Social embeds rendered via Teleport -->
            <template
              v-for="embed in socialEmbeds"
              :key="`${embed.id}-${embedRenderKey}`"
            >
              <Teleport
                :to="`[data-social-embed='${embed.id}']`"
                :disabled="!previewContainer"
                defer
              >
                <SocialEmbed :embed-data="embed" />
              </Teleport>
            </template>
          </ImageViewerProvider>
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

/* GitHub 形式のアラート: > [!IMPORTANT] */
.blog-content :deep(.custom-block.important) {
  @apply bg-purple-500/10 border-purple-500/30;
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

.blog-content :deep(.custom-block.important .custom-block-title) {
  @apply text-purple-400;
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

/* Table of Contents */
.blog-content :deep(.table-of-contents) {
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
}

.blog-content :deep(.table-of-contents)::before {
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

.blog-content :deep(.table-of-contents ul) {
  list-style: none;
  padding-left: 0;
  margin: 0;
}

.blog-content :deep(.table-of-contents li) {
  margin: 0.375rem 0;
  padding-left: 1rem;
  position: relative;
}

.blog-content :deep(.table-of-contents li)::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.6rem;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: #525252;
}

.blog-content :deep(.table-of-contents a) {
  color: #d4d4d4;
  text-decoration: none;
  font-size: 0.875rem;
}

.blog-content :deep(.table-of-contents a:hover) {
  color: #60a5fa;
}
</style>
