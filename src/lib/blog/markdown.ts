// ブログ本文の Markdown → HTML パイプライン (DOM 非依存)。
// SPA (BlogPost.vue) と noscript (サーバー側) の両方から使う。
//
// - mode "spa": BlogPost.vue がもともと出していたのと完全に同じマークアップ。
//   公開済み記事の描画結果を変えないため、出力はバイト単位で一致させている
//   (エスケープしない箇所や String.replace の "$" 置換の癖も含めて元のまま)。
// - mode "static": noscript 用。JS 不要で、生 HTML は許可リストのタグだけを属性なしで通し、
//   それ以外はすべてエスケープする。
//
// Workers の isolate ではモジュールの状態がリクエスト間で共有されるので、
// Marked インスタンスと一時的な Map/カウンタは呼び出しごとに作り直す。
// highlight.js はここでは import しない (Worker のバンドルを小さく保つため)。
// SPA 側は ./hljs.ts の関数を options で渡す。

import { Marked, Renderer, type RendererObject, type Tokens } from "marked"
import { markedHighlight } from "marked-highlight"
import { escapeHtml, neutralizeNoscript, safeUrl } from "../../noscript/html.ts"

export interface TocItem {
  id: string
  text: string
  level: number
}

export type Outline = number | [number, number] | "deep" | false

export type SocialEmbedType =
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

export interface SocialEmbedData {
  type: SocialEmbedType
  url: string
  id: string
}

export interface RenderBlogMarkdownOptions {
  // "spa": BlogPost.vue が今出しているのと同じマークアップ
  // "static": noscript 用。JS 不要・生 HTML は許可リスト以外エスケープ
  mode: "spa" | "static"
  outline?: Outline
  // コードハイライト (spa のみ)。未指定ならエスケープしたプレーンテキスト
  // lang は hasLanguage で解決済みの言語名 (未登録なら "plaintext")
  highlight?: (code: string, lang: string) => string
  // highlight が対応している言語か (spa のみ)。未指定なら常に "plaintext" 扱い
  hasLanguage?: (lang: string) => boolean
}

export interface RenderedBlogMarkdown {
  html: string
  toc: TocItem[]
  // @[type](url) の埋め込み。spa では <div data-social-embed="id"> の中身を
  // SocialEmbed コンポーネントで描画するのに使う
  embeds: SocialEmbedData[]
}

// 呼び出しごとの一時状態
interface RenderState {
  options: RenderBlogMarkdownOptions
  lineHighlightStore: Map<string, Set<number>>
  codeBlockCounter: number
  codeGroupStore: Map<string, string>
  socialEmbedStore: Map<string, SocialEmbedData>
  socialEmbedCounter: number
  // static: 生 HTML 中で開いたままの許可タグ
  openTags: string[]
  // static: 今描画中のブロックより外側で開いたタグの数。ブロックの中から外側のタグは閉じさせない
  floor: number
}

// 元の extractToc の戻り値 (slug は見出しの id と同じ規則)
interface RawTocItem {
  level: number
  text: string
  slug: string
}

// ---------------------------------------------------------------------------
// 共通ヘルパー
// ---------------------------------------------------------------------------

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
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w぀-ゟ゠-ヿ一-龯\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

function resolveLanguage(state: RenderState, lang: string): string {
  return state.options.hasLanguage?.(lang) ? lang : "plaintext"
}

// hljs が無いときのフォールバック (元の catch 節と同じエスケープ)
function escapeCode(code: string): string {
  return code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function highlightWith(state: RenderState, code: string, language: string) {
  const highlight = state.options.highlight
  return highlight ? highlight(code, language) : escapeCode(code)
}

// href/src 用。ブラウザの URL パーサーはタブ・改行を取り除き、前後の制御文字と
// 空白を無視するので、スキーム判定の前に同じ正規化をしてから safeUrl に通す。
function cleanUrl(url: string): string {
  const withoutBreaks = url.replace(/[\t\n\r]/g, "")
  const isControlOrSpace = (i: number) => withoutBreaks.charCodeAt(i) <= 0x20
  let start = 0
  let end = withoutBreaks.length
  while (start < end && isControlOrSpace(start)) start++
  while (end > start && isControlOrSpace(end - 1)) end--
  return safeUrl(withoutBreaks.slice(start, end))
}

interface CodeGroupBlock {
  lang: string
  title: string
  code: string
}

function parseCodeGroupBlocks(content: string): CodeGroupBlock[] {
  // Match code blocks with optional title in brackets
  // Format: ```lang [Title] or ```lang
  const codeBlockRegex = /```(\w+)(?:\s+\[([^\]]+)\])?\s*\n([\s\S]*?)```/g
  const blocks: CodeGroupBlock[] = []

  for (const match of content.matchAll(codeBlockRegex)) {
    blocks.push({
      lang: match[1],
      title: match[2] || match[1],
      code: match[3].trim(),
    })
  }
  return blocks
}

// Extract TOC from content (excluding code blocks and code-groups)
function extractToc(content: string, outline?: Outline): RawTocItem[] {
  if (outline === false) return []

  // Remove code blocks and code-groups before extracting headings
  let cleanContent = content

  // Remove fenced code blocks (```...```)
  cleanContent = cleanContent.replace(/```[\s\S]*?```/g, "")

  // Remove code-group blocks (::: code-group ... :::)
  cleanContent = cleanContent.replace(/:::\s*code-group[\s\S]*?:::/g, "")

  const items: RawTocItem[] = []
  const headingRegex = /^(#{1,6})\s+(.+)$/gm

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

  for (const match of cleanContent.matchAll(headingRegex)) {
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

// Preprocess code-group before passing to marked
function preprocessCodeGroups(
  content: string,
  state: RenderState,
  renderGroup: (content: string) => string,
): string {
  state.codeGroupStore.clear()

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
        const rendered = renderGroup(codeGroupContent)
        const placeholder = `<!--CODE_GROUP_${groupId}-->`
        state.codeGroupStore.set(placeholder, rendered)
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

const SOCIAL_EMBED_X_RESERVED = [
  "home",
  "explore",
  "notifications",
  "messages",
  "settings",
  "i",
]

const MISSKEY_INSTANCES = [
  "misskey.io",
  "misskey.art",
  "nijimiss.moe",
  "submarin.online",
  "sushi.ski",
]

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
        !SOCIAL_EMBED_X_RESERVED.includes(urlObj.pathname.slice(1))
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
      if (MISSKEY_INSTANCES.some((inst) => hostname.includes(inst))) {
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
function preprocessSocialEmbeds(
  content: string,
  state: RenderState,
  placeholder: (embedId: string, index: number) => string,
): string {
  state.socialEmbedStore.clear()
  state.socialEmbedCounter = 0

  // Match @[type](url) or @[](url) for auto-detection
  // type can be: x, mastodon, misskey, pleroma, x-profile, mastodon-profile, misskey-profile, pleroma-profile, github, link, or empty for auto-detect
  const embedRegex =
    /^@\[(x|mastodon|misskey|pleroma|x-profile|mastodon-profile|misskey-profile|pleroma-profile|github|link)?\]\(([^)]+)\)$/gm

  return content.replace(embedRegex, (match, type, url) => {
    // Auto-detect type if not specified
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

    const index = state.socialEmbedCounter++
    const embedId = `social-embed-${index}`
    const embedData: SocialEmbedData = {
      type: embedType,
      url: url.trim(),
      id: embedId,
    }
    state.socialEmbedStore.set(embedId, embedData)

    return placeholder(embedId, index)
  })
}

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
      return segment.replace(/\*\*([^\n*]+?)\*\*/g, (_match, inner: string) => {
        const start = isPunct(inner[0]) ? "⁠" : ""
        const end = isPunct(inner[inner.length - 1]) ? "⁠" : ""
        return `**${start}${inner}${end}**`
      })
    })
    .join("")
}

// VitePress-compatible custom containers: tokenizer (共通)
function tokenizeContainer(src: string): Tokens.Generic | undefined {
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
  const raw = `${lines.slice(0, endIndex + 1).join("\n")}\n`

  return {
    type: "container",
    raw: raw,
    containerType: type,
    title: title,
    content: content,
  }
}

// Map container types to CSS classes and default titles
const CONTAINER_TYPES: Record<string, { class: string; defaultTitle: string }> =
  {
    info: { class: "info", defaultTitle: "INFO" },
    tip: { class: "tip", defaultTitle: "TIP" },
    warning: { class: "warning", defaultTitle: "WARNING" },
    danger: { class: "danger", defaultTitle: "DANGER" },
    note: { class: "info", defaultTitle: "NOTE" },
  }

function containerConfig(type: string) {
  return (
    CONTAINER_TYPES[type] || {
      class: "info",
      defaultTitle: type.toUpperCase(),
    }
  )
}

function createContainerExtension(render: (token: Tokens.Generic) => string) {
  return {
    name: "container",
    level: "block" as const,
    start(src: string) {
      const match = src.match(/^:::\s*\w+/)
      return match?.index
    },
    tokenizer: tokenizeContainer,
    renderer: render,
  }
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

const TOC_PLACEHOLDER_RE =
  /<nav class="table-of-contents" data-toc-placeholder><\/nav>/g

function headingText(tokens: Tokens.Generic[]): string {
  return tokens
    .map(
      (t) => (t as { text?: string }).text || (t as { raw?: string }).raw || "",
    )
    .join("")
}

// ---------------------------------------------------------------------------
// mode "spa": BlogPost.vue と同一の出力
// ---------------------------------------------------------------------------

// Render code group tabs
function renderCodeGroupSpa(content: string, state: RenderState): string {
  const blocks = parseCodeGroupBlocks(content)

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
      const language = resolveLanguage(state, block.lang)
      const highlighted = highlightWith(state, block.code, language)
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

function createSpaMarked(state: RenderState): Marked {
  // Simple Marked instance for parsing nested content in containers
  const simpleMarked = new Marked()

  const containerExtension = createContainerExtension((token) => {
    const type = token.containerType as string
    const title = token.title as string | undefined
    const content = token.content as string

    // Handle details container
    if (type === "details") {
      const summary = title || "Details"
      const innerHtml = simpleMarked.parse(content) as string
      return `<details class="custom-block details">
<summary>${summary}</summary>
<div class="details-content">${innerHtml}</div>
</details>`
    }

    const config = containerConfig(type)
    const displayTitle = title || config.defaultTitle
    const innerHtml = simpleMarked.parse(content) as string

    return `<div class="custom-block ${config.class}">
<p class="custom-block-title">${displayTitle}</p>
${innerHtml}
</div>`
  })

  const markedInstance = new Marked()

  // Configure marked with syntax highlighting and line highlighting
  // IMPORTANT: Register extensions FIRST before other configurations
  markedInstance.use({ extensions: [containerExtension, tocExtension] })
  markedInstance.use(
    markedHighlight({
      emptyLangClass: "hljs language-plaintext",
      langPrefix: "hljs language-",
      highlight(code, lang, _info) {
        try {
          // Parse language and line highlights (e.g., "js{1,3-5}")
          const langMatch = lang.match(/^(\w+)/)
          const actualLang = langMatch ? langMatch[1] : "plaintext"
          const language = resolveLanguage(state, actualLang)

          const highlighted = highlightWith(state, code, language)
          const lineHighlights = parseLineHighlights(lang)

          // If no line highlights, return as-is
          if (lineHighlights.size === 0) {
            return highlighted
          }

          // Store line highlights for post-processing and return with marker
          const blockId = `__CODE_BLOCK_${state.codeBlockCounter++}__`
          state.lineHighlightStore.set(blockId, lineHighlights)

          // Return highlighted code with marker prefix for post-processing
          return `${blockId}\n${highlighted}`
        } catch {
          // If highlighting fails, return escaped code
          return escapeCode(code)
        }
      },
    }),
  )

  // Custom renderer
  const renderer = new Renderer()

  // Custom renderer to add data-viewer to images
  renderer.image = ({ href, title, text }) => {
    const titleAttr = title ? ` title="${title}"` : ""
    return `<img src="${href}" alt="${text}"${titleAttr} data-viewer="true" class="cursor-pointer transition-transform hover:scale-[1.02]" />`
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

  // Custom heading renderer for TOC anchors
  renderer.heading = ({ tokens, depth }) => {
    const text = headingText(tokens)
    const slug = generateSlug(text)
    return `<h${depth} id="${slug}">${text}<a class="header-anchor" href="#${slug}">#</a></h${depth}>\n`
  }

  markedInstance.use({ renderer })
  return markedInstance
}

// Post-process HTML to apply line highlighting
function applyLineHighlighting(html: string, state: RenderState): string {
  // Find code blocks with our markers (with or without newline after marker)
  const result = html.replace(
    /<code([^>]*)>(__CODE_BLOCK_\d+__)(?:\n)?([\s\S]*?)<\/code>/g,
    (_match, attrs, blockId, code) => {
      const lineHighlights = state.lineHighlightStore.get(blockId)
      if (!lineHighlights) {
        return `<code${attrs}>${code}</code>`
      }

      // Apply line highlighting
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

  // Remove any leftover markers that weren't processed
  return result.replace(/__CODE_BLOCK_\d+__\n?/g, "")
}

// Restore code groups after marked parsing
// (元の実装どおり文字列置換なので、置換文字列中の "$&" などは解釈される)
function restoreCodeGroupsSpa(html: string, state: RenderState): string {
  let result = html
  for (const [placeholder, rendered] of state.codeGroupStore) {
    // Remove potential <p> wrapping around placeholder
    result = result.replace(`<p>${placeholder}</p>`, rendered)
    result = result.replace(placeholder, rendered)
  }
  return result
}

// Generate TOC HTML
function generateTocHtmlSpa(items: RawTocItem[]): string {
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

function renderSpa(
  rawContent: string,
  tocItems: RawTocItem[],
  state: RenderState,
): string {
  // Preprocess social embeds before code-groups
  // Return a placeholder div that will be replaced with Vue component
  const content = preprocessSocialEmbeds(
    rawContent,
    state,
    (embedId) => `\n<div data-social-embed="${embedId}"></div>\n`,
  )

  // Preprocess code-groups before parsing
  const preprocessed = preprocessCodeGroups(content, state, (group) =>
    renderCodeGroupSpa(group, state),
  )

  // Parse markdown
  let html = createSpaMarked(state).parse(preprocessed) as string

  // Apply line highlighting post-processing
  html = applyLineHighlighting(html, state)

  // Restore code groups (replace placeholders with actual rendered HTML)
  html = restoreCodeGroupsSpa(html, state)

  // Replace TOC placeholder with actual TOC
  const tocHtml = generateTocHtmlSpa(tocItems)
  html = html.replace(TOC_PLACEHOLDER_RE, tocHtml)

  return html
}

// ---------------------------------------------------------------------------
// mode "static": noscript 用
// ---------------------------------------------------------------------------

// 生 HTML で通すタグ (属性はすべて捨てる)
const ALLOWED_TAGS = new Set([
  "br",
  "b",
  "i",
  "em",
  "strong",
  "u",
  "s",
  "del",
  "ins",
  "sub",
  "sup",
  "small",
  "mark",
  "kbd",
  "code",
  "span",
  "div",
  "p",
  "details",
  "summary",
  "ruby",
  "rt",
  "rp",
  "hr",
])
const VOID_TAGS = new Set(["br", "hr"])

// 自前のプレースホルダーだけはコメントのまま残し、後で差し替える
const STATIC_PLACEHOLDER_RE = /^<!--(?:CODE_GROUP|SOCIAL_EMBED)_\d+-->$/

// 生 HTML 内のテキスト。既存の文字参照 (&amp; など) は二重にエスケープしない
function escapeHtmlText(text: string): string {
  return text
    .replace(
      /&(?!(?:#\d{1,7}|#[xX][\da-fA-F]{1,6}|[a-zA-Z][a-zA-Z\d]*);)/g,
      "&amp;",
    )
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function closeOpenTags(state: RenderState, depth: number): string {
  let out = ""
  while (state.openTags.length > depth) {
    out += `</${state.openTags.pop()}>`
  }
  return out
}

// 生 HTML (block / inline の html トークン) を許可リストで無害化する
function sanitizeRawHtml(html: string, state: RenderState): string {
  const tagRe =
    /<!--[\s\S]*?(?:-->|$)|<(\/?)([a-zA-Z][a-zA-Z0-9-]*)(?:\s[^<>]*)?\/?>/g
  let out = ""
  let last = 0

  for (const match of html.matchAll(tagRe)) {
    const index = match.index ?? 0
    out += escapeHtmlText(html.slice(last, index))
    last = index + match[0].length

    const whole = match[0]
    if (whole.startsWith("<!--")) {
      // コメントは捨てる (自前のプレースホルダーだけ残す)
      if (STATIC_PLACEHOLDER_RE.test(whole)) out += whole
      continue
    }

    const name = match[2].toLowerCase()
    if (!ALLOWED_TAGS.has(name)) {
      out += escapeHtmlText(whole)
      continue
    }

    if (match[1] === "/") {
      if (VOID_TAGS.has(name)) continue
      const at = state.openTags.lastIndexOf(name)
      // 開いていないタグの閉じタグは捨てる (外側のレイアウトを壊さないため)
      // 外側のブロックで開いたタグもここでは閉じない
      if (at !== -1 && at >= state.floor) out += closeOpenTags(state, at)
      continue
    }

    out += `<${name}>`
    if (!VOID_TAGS.has(name)) state.openTags.push(name)
  }

  out += escapeHtmlText(html.slice(last))
  return out
}

function staticLink(
  href: string,
  title: string | null | undefined,
  inner: string,
): string {
  const url = cleanUrl(href)
  const titleAttr = title ? ` title="${escapeHtml(title)}"` : ""
  const externalAttrs = /^https?:\/\//i.test(url)
    ? ' target="_blank" rel="noopener noreferrer"'
    : ""
  return `<a href="${escapeHtml(url)}"${titleAttr}${externalAttrs}>${inner}</a>`
}

function staticImage(
  href: string,
  title: string | null | undefined,
  text: string,
): string {
  const titleAttr = title ? ` title="${escapeHtml(title)}"` : ""
  return `<img src="${escapeHtml(cleanUrl(href))}" alt="${escapeHtml(text)}"${titleAttr} loading="lazy">`
}

function staticCodeBlock(code: string, lang: string, info: string): string {
  const highlights = parseLineHighlights(info)
  let body = escapeHtml(code)
  if (highlights.size > 0) {
    body = body
      .split("\n")
      .map(
        (line, i) =>
          `<span class="line${highlights.has(i + 1) ? " highlighted" : ""}">${line}</span>`,
      )
      .join("\n")
  }
  const classAttr = lang ? ` class="language-${escapeHtml(lang)}"` : ""
  return `<pre><code${classAttr}>${body}\n</code></pre>\n`
}

// コンテナ内の Markdown 用。SPA の simpleMarked と同じく拡張・ハイライト・
// 見出し id は無いが、生 HTML とリンク/画像は無害化する
// ブロック要素 (li / blockquote / 見出し / 表のセル) の中で開いたままの生 HTML タグは、
// ブラウザがそのブロックの終了タグで暗黙に閉じる。最後にまとめて閉じると余った </div> などが
// 外側のレイアウト (.blog-content やカード) を閉じてしまうので、ブロックの終了タグの直前で閉じる
const BLOCK_END_RE = /(<\/(?:li|blockquote|h[1-6]|td|th)>\n?)$/

function closeWithinBlock(
  state: RenderState,
  depth: number,
  html: string,
): string {
  const close = closeOpenTags(state, depth)
  return close ? html.replace(BLOCK_END_RE, `${close}$1`) : html
}

// render の間だけ、それより前に開いたタグを閉じられないようにする
function withScope<T>(state: RenderState, render: () => T): T {
  const floor = state.floor
  state.floor = state.openTags.length
  try {
    return render()
  } finally {
    state.floor = floor
  }
}

function scopedBlock<T>(
  state: RenderState,
  render: (this: Renderer, token: T) => string,
) {
  return function (this: Renderer, token: T): string {
    const depth = state.openTags.length
    const html = withScope(state, () => render.call(this, token))
    return closeWithinBlock(state, depth, html)
  }
}

function sharedStaticRenderer(state: RenderState): RendererObject {
  return {
    html({ text }) {
      return sanitizeRawHtml(text, state)
    },
    text(token) {
      if ("tokens" in token && token.tokens) {
        return this.parser.parseInline(token.tokens)
      }
      // marked は <pre> / <code> / <kbd> / <script> の後のテキストを "escaped" 扱いにして
      // そのまま出力する。生 HTML が素通りしないよう、ここで自分でエスケープする
      if ("escaped" in token && token.escaped) return escapeHtmlText(token.text)
      return false
    },
    listitem: scopedBlock(state, Renderer.prototype.listitem),
    blockquote: scopedBlock(state, Renderer.prototype.blockquote),
    tablecell: scopedBlock(state, Renderer.prototype.tablecell),
    // コンテナ内の見出し用 (外側の Marked は id 付きの heading で上書きする)
    heading: scopedBlock(state, Renderer.prototype.heading),
    link({ href, title, tokens }) {
      return staticLink(href, title, this.parser.parseInline(tokens))
    },
    image({ href, title, text }) {
      return staticImage(href, title, text)
    },
  }
}

function renderCodeGroupStatic(content: string): string {
  const blocks = parseCodeGroupBlocks(content)

  if (blocks.length === 0) {
    return `<p>Code group: no code blocks found</p>`
  }

  const panels = blocks
    .map(
      (block) =>
        `<p class="code-group-title">${escapeHtml(block.title)}</p>\n${staticCodeBlock(block.code, block.lang, "")}`,
    )
    .join("")
  return `<div class="code-group">\n${panels}</div>\n`
}

function generateTocHtmlStatic(items: RawTocItem[]): string {
  if (items.length === 0) return ""

  const minLevel = Math.min(...items.map((i) => i.level))
  const list = items
    .map(
      (item) =>
        `<li style="margin-left: ${(item.level - minLevel) * 1}rem"><a href="#${escapeHtml(item.slug)}">${escapeHtml(item.text)}</a></li>`,
    )
    .join("\n")
  return `<nav class="table-of-contents">\n<ul>\n${list}\n</ul>\n</nav>\n`
}

function renderEmbedStatic(embed: SocialEmbedData): string {
  const url = cleanUrl(embed.url)
  return `<p class="embed-link"><a href="${escapeHtml(url)}" rel="noopener noreferrer">${escapeHtml(embed.url)}</a></p>\n`
}

function createStaticMarked(state: RenderState): Marked {
  const innerMarked = new Marked()
  innerMarked.use({ renderer: sharedStaticRenderer(state) })

  const parseInner = (content: string) => {
    const depth = state.openTags.length
    const html = withScope(state, () =>
      innerMarked.parse(content, { async: false }),
    )
    return html + closeOpenTags(state, depth)
  }

  const containerExtension = createContainerExtension((token) => {
    const type = token.containerType as string
    const title = token.title as string | undefined
    const content = token.content as string

    if (type === "details") {
      const summary = title || "Details"
      return `<details class="custom-block details">
<summary>${escapeHtml(summary)}</summary>
<div class="details-content">${parseInner(content)}</div>
</details>\n`
    }

    const config = containerConfig(type)
    const displayTitle = title || config.defaultTitle
    return `<div class="custom-block ${escapeHtml(config.class)}">
<p class="custom-block-title">${escapeHtml(displayTitle)}</p>
${parseInner(content)}
</div>\n`
  })

  const markedInstance = new Marked()
  markedInstance.use({ extensions: [containerExtension, tocExtension] })
  markedInstance.use({
    renderer: {
      ...sharedStaticRenderer(state),
      code({ text, lang }) {
        const info = (lang || "").match(/\S*/)?.[0] ?? ""
        const name = info.match(/^(\w+)/)?.[1] ?? ""
        return staticCodeBlock(text, name, info)
      },
      heading({ tokens, depth }) {
        // id は SPA と同じ規則 (目次やアンカーのリンクが一致するように)
        const slug = escapeHtml(generateSlug(headingText(tokens)))
        const openDepth = state.openTags.length
        const inner = withScope(state, () => this.parser.parseInline(tokens))
        return `<h${depth} id="${slug}">${inner}${closeOpenTags(state, openDepth)}<a class="header-anchor" href="#${slug}">#</a></h${depth}>\n`
      },
    },
  })
  return markedInstance
}

function renderStatic(
  rawContent: string,
  tocItems: RawTocItem[],
  state: RenderState,
): string {
  const content = preprocessSocialEmbeds(
    rawContent,
    state,
    (_embedId, index) => `\n<!--SOCIAL_EMBED_${index}-->\n`,
  )
  const preprocessed = preprocessCodeGroups(
    content,
    state,
    renderCodeGroupStatic,
  )

  let html = createStaticMarked(state).parse(preprocessed, { async: false })
  html += closeOpenTags(state, 0)

  // プレースホルダーは自前の文字列を関数で差し込む ("$" の特殊置換を避ける)
  html = html.replace(
    /<p><!--CODE_GROUP_(\d+)--><\/p>|<!--CODE_GROUP_(\d+)-->/g,
    (_m, a?: string, b?: string) =>
      state.codeGroupStore.get(`<!--CODE_GROUP_${a ?? b}-->`) ?? "",
  )
  html = html.replace(
    /<p><!--SOCIAL_EMBED_(\d+)--><\/p>|<!--SOCIAL_EMBED_(\d+)-->/g,
    (_m, a?: string, b?: string) => {
      const embed = state.socialEmbedStore.get(`social-embed-${a ?? b}`)
      return embed ? renderEmbedStatic(embed) : ""
    },
  )
  html = html.replace(TOC_PLACEHOLDER_RE, () => generateTocHtmlStatic(tocItems))

  return neutralizeNoscript(html)
}

// ---------------------------------------------------------------------------
// 公開 API
// ---------------------------------------------------------------------------

export function renderBlogMarkdown(
  content: string,
  options: RenderBlogMarkdownOptions,
): RenderedBlogMarkdown {
  const state: RenderState = {
    options,
    lineHighlightStore: new Map(),
    codeBlockCounter: 0,
    codeGroupStore: new Map(),
    socialEmbedStore: new Map(),
    socialEmbedCounter: 0,
    openTags: [],
    floor: 0,
  }

  const rawContent = fixEmphasisFlanking(content)

  // Extract TOC items
  const tocItems = extractToc(rawContent, options.outline)

  const html =
    options.mode === "static"
      ? renderStatic(rawContent, tocItems, state)
      : renderSpa(rawContent, tocItems, state)

  return {
    html,
    toc: tocItems.map((item) => ({
      id: item.slug,
      text: item.text,
      level: item.level,
    })),
    embeds: Array.from(state.socialEmbedStore.values()),
  }
}

// Calculate character count (excluding code blocks and frontmatter)
export function countBlogCharacters(source: string): number {
  let content = source

  // Remove frontmatter
  content = content.replace(/^---[\s\S]*?---\n?/, "")

  // Remove code blocks
  content = content.replace(/```[\s\S]*?```/g, "")

  // Remove inline code
  content = content.replace(/`[^`]+`/g, "")

  // Remove markdown syntax
  content = content.replace(/[#*_[\]()!>-]/g, "")

  // Remove URLs
  content = content.replace(/https?:\/\/[^\s]+/g, "")

  // Remove whitespace and count
  return content.replace(/\s/g, "").length
}

// Calculate reading time (Japanese: ~400-600 chars/min, use 500)
export function estimateReadingMinutes(characterCount: number): number {
  const minutes = Math.ceil(characterCount / 500)
  return minutes < 1 ? 1 : minutes
}
