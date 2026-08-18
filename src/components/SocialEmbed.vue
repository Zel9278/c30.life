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
import kotlin from "highlight.js/lib/languages/kotlin"
import lua from "highlight.js/lib/languages/lua"
import markdown from "highlight.js/lib/languages/markdown"
import php from "highlight.js/lib/languages/php"
import plaintext from "highlight.js/lib/languages/plaintext"
import python from "highlight.js/lib/languages/python"
import ruby from "highlight.js/lib/languages/ruby"
import rust from "highlight.js/lib/languages/rust"
import sql from "highlight.js/lib/languages/sql"
import swift from "highlight.js/lib/languages/swift"
import typescript from "highlight.js/lib/languages/typescript"
import xml from "highlight.js/lib/languages/xml"
import yaml from "highlight.js/lib/languages/yaml"
import * as mfm from "mfm-js"
import { computed, onMounted, ref } from "vue"

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
hljs.registerLanguage("ruby", ruby)
hljs.registerLanguage("rb", ruby)
hljs.registerLanguage("php", php)
hljs.registerLanguage("swift", swift)
hljs.registerLanguage("kotlin", kotlin)
hljs.registerLanguage("kt", kotlin)
hljs.registerLanguage("plaintext", plaintext)
hljs.registerLanguage("text", plaintext)

type EmbedType =
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

// Global cache for embed data (persists across component instances)
const embedCache = new Map<
  string,
  { data: unknown; timestamp: number; type: string }
>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getCacheKey(type: EmbedType, url: string): string {
  return `${type}:${url}`
}

function getFromCache<T>(type: EmbedType, url: string): T | null {
  const key = getCacheKey(type, url)
  const cached = embedCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T
  }
  if (cached) {
    embedCache.delete(key) // Expired
  }
  return null
}

function setCache(type: EmbedType, url: string, data: unknown): void {
  const key = getCacheKey(type, url)
  embedCache.set(key, { data, timestamp: Date.now(), type })
}

interface EmbedData {
  type: EmbedType
  url: string
  instance?: string
  statusId?: string
  username?: string
}

interface GitHubCodeData {
  owner: string
  repo: string
  branch: string
  path: string
  filename: string
  extension: string
  startLine?: number
  endLine?: number
  code: string
  language: string
}

interface OGPData {
  url: string
  title: string | null
  description: string | null
  image: string | null
  siteName: string | null
  favicon: string | null
}

interface MastodonAccount {
  id: string
  username: string
  acct: string
  display_name: string
  note: string
  url: string
  avatar: string
  header: string
  followers_count: number
  following_count: number
  statuses_count: number
  created_at: string
  bot?: boolean
  fields?: { name: string; value: string; verified_at?: string }[]
}

interface MastodonStatus {
  content: string
  created_at: string
  account: {
    display_name: string
    username: string
    avatar: string
    url: string
  }
  media_attachments?: {
    type: string
    url: string
    preview_url: string
    description?: string
  }[]
  favourites_count?: number
  reblogs_count?: number
  replies_count?: number
}

interface MisskeyNote {
  text: string | null
  createdAt: string
  user: {
    name: string | null
    username: string
    avatarUrl: string
    host?: string | null
  }
  files?: {
    type: string
    url: string
    thumbnailUrl?: string
    comment?: string
  }[]
  reactions?: Record<string, number>
  renoteCount?: number
  repliesCount?: number
  cw?: string | null
}

interface MisskeyUserDetail {
  id: string
  name: string | null
  username: string
  host: string | null
  avatarUrl: string
  bannerUrl?: string | null
  description?: string | null
  followersCount: number
  followingCount: number
  notesCount: number
  createdAt: string
  isBot?: boolean
  fields?: { name: string; value: string }[]
  pinnedNotes?: MisskeyNote[]
}

// fxtwitter API types (based on 4m-mazi/fixup-twitter-link)
interface FxTwitterAuthor {
  id?: string
  name: string
  screen_name: string
  avatar_url?: string
  avatar_color?: string | null
  banner_url?: string
  description?: string
}

interface FxTwitterPhoto {
  type: "photo"
  url: string
  width: number
  height: number
}

interface FxTwitterVideo {
  type: "video" | "gif"
  url: string
  thumbnail_url: string
  width: number
  height: number
  format: string
}

interface FxTwitterMosaic {
  type: "mosaic_photo"
  width: number
  height: number
  formats: {
    webp: string
    jpeg: string
  }
}

interface FxTwitterPollChoice {
  label: string
  count: number
  percentage: number
}

interface FxTwitterPoll {
  choices: FxTwitterPollChoice[]
  total_votes: number
  ends_at: string
  time_left_en: string
}

interface FxTwitterTweet {
  id: string
  url: string
  text: string
  created_at: string
  created_timestamp: number
  color: string | null
  lang: string | null
  replying_to: string | null
  replying_to_status: string | null
  twitter_card: "tweet" | "summary" | "summary_large_image" | "player"
  author: FxTwitterAuthor
  likes: number
  retweets: number
  replies: number
  views: number | null
  quote?: FxTwitterTweet
  poll?: FxTwitterPoll
  media?: {
    external?: {
      type: string
      url: string
      height: number
      width: number
      duration: number
    }
    photos?: FxTwitterPhoto[]
    videos?: FxTwitterVideo[]
    mosaic?: FxTwitterMosaic
  }
  source: string
}

interface FxTwitterResponse {
  code: number
  message: string
  tweet?: FxTwitterTweet
}

const props = defineProps<{
  embedData: EmbedData
}>()

const loading = ref(true)
const error = ref(false)
const mastodonData = ref<MastodonStatus | null>(null)
const mastodonProfile = ref<MastodonAccount | null>(null)
const misskeyData = ref<MisskeyNote | null>(null)
const misskeyProfile = ref<MisskeyUserDetail | null>(null)
const twitterData = ref<FxTwitterTweet | null>(null)
const twitterProfile = ref<FxTwitterAuthor | null>(null)
const githubData = ref<GitHubCodeData | null>(null)
const ogpData = ref<OGPData | null>(null)
const showCwContent = ref(false)

// Highlighted code lines for GitHub embed
const highlightedCodeLines = computed(() => {
  if (!githubData.value) return []

  const lang = githubData.value.language.toLowerCase()
  const code = githubData.value.code
  const lines = code.split("\n")

  // Try to highlight the entire code block for better context
  try {
    const language = hljs.getLanguage(lang) ? lang : "plaintext"
    const highlighted = hljs.highlight(code, { language }).value
    // Split by newlines, preserving HTML tags that might span lines
    return highlighted.split("\n")
  } catch {
    // Fallback to plain text
    return lines.map((line) =>
      line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"),
    )
  }
})

const displayUrl = computed(() => {
  try {
    const url = new URL(props.embedData.url)
    return url.hostname + url.pathname
  } catch {
    return props.embedData.url
  }
})

// Format date
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Render MFM to HTML
const renderMfm = (text: string, instance: string): string => {
  if (!text) return ""

  const escapeHtml = (str: string): string => {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
  }

  const renderNode = (node: mfm.MfmNode): string => {
    switch (node.type) {
      case "text":
        return escapeHtml(node.props.text).replace(/\n/g, "<br>")

      case "bold":
        return `<strong>${node.children.map(renderNode).join("")}</strong>`

      case "italic":
        return `<em>${node.children.map(renderNode).join("")}</em>`

      case "strike":
        return `<del>${node.children.map(renderNode).join("")}</del>`

      case "small":
        return `<small class="text-xs opacity-70">${node.children.map(renderNode).join("")}</small>`

      case "center":
        return `<div class="text-center">${node.children.map(renderNode).join("")}</div>`

      case "url":
        return `<a href="${escapeHtml(node.props.url)}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">${escapeHtml(node.props.url)}</a>`

      case "link":
        return `<a href="${escapeHtml(node.props.url)}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">${node.children.map(renderNode).join("")}</a>`

      case "mention": {
        const mentionHost = node.props.host || instance
        return `<a href="https://${escapeHtml(mentionHost)}/@${escapeHtml(node.props.username)}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">@${escapeHtml(node.props.username)}${node.props.host ? `@${escapeHtml(node.props.host)}` : ""}</a>`
      }

      case "hashtag":
        return `<a href="https://${escapeHtml(instance)}/tags/${escapeHtml(node.props.hashtag)}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">#${escapeHtml(node.props.hashtag)}</a>`

      case "emojiCode":
        // Custom emoji - try to render from instance
        return `<img src="https://${escapeHtml(instance)}/emoji/${escapeHtml(node.props.name)}.webp" alt=":${escapeHtml(node.props.name)}:" class="inline-block h-5 align-middle" loading="lazy" onerror="this.outerHTML=':${escapeHtml(node.props.name)}:'">`

      case "unicodeEmoji":
        return `<span class="text-lg">${node.props.emoji}</span>`

      case "inlineCode":
        return `<code class="bg-neutral-700 px-1 py-0.5 rounded text-sm font-mono">${escapeHtml(node.props.code)}</code>`

      case "blockCode":
        return `<pre class="bg-neutral-800 p-3 rounded-lg overflow-x-auto my-2"><code class="font-mono text-sm">${escapeHtml(node.props.code)}</code></pre>`

      case "mathInline":
        return `<code class="bg-neutral-700 px-1 py-0.5 rounded text-sm">${escapeHtml(node.props.formula)}</code>`

      case "mathBlock":
        return `<pre class="bg-neutral-800 p-3 rounded-lg overflow-x-auto my-2"><code class="font-mono text-sm">${escapeHtml(node.props.formula)}</code></pre>`

      case "quote":
        return `<blockquote class="border-l-4 border-neutral-500 pl-3 my-2 text-neutral-300">${node.children.map(renderNode).join("")}</blockquote>`

      case "search":
        return `<a href="https://www.google.com/search?q=${encodeURIComponent(node.props.query)}" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 bg-neutral-800 p-2 rounded-lg hover:bg-neutral-700 my-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg><span>${escapeHtml(node.props.query)}</span></a>`

      case "plain":
        return node.children.map(renderNode).join("")

      case "fn": {
        // MFM functions (animations, effects, etc.)
        const fnContent = node.children.map(renderNode).join("")
        switch (node.props.name) {
          case "tada":
            return `<span class="inline-block animate-bounce">${fnContent}</span>`
          case "jelly":
            return `<span class="inline-block animate-pulse">${fnContent}</span>`
          case "twitch":
          case "shake":
            return `<span class="inline-block animate-pulse">${fnContent}</span>`
          case "spin":
            return `<span class="inline-block animate-spin">${fnContent}</span>`
          case "jump":
            return `<span class="inline-block animate-bounce">${fnContent}</span>`
          case "bounce":
            return `<span class="inline-block animate-bounce">${fnContent}</span>`
          case "flip":
            return `<span class="inline-block" style="transform: scaleX(-1)">${fnContent}</span>`
          case "x2":
            return `<span class="text-2xl">${fnContent}</span>`
          case "x3":
            return `<span class="text-3xl">${fnContent}</span>`
          case "x4":
            return `<span class="text-4xl">${fnContent}</span>`
          case "font": {
            const font = node.props.args?.serif
              ? "serif"
              : node.props.args?.monospace
                ? "monospace"
                : "sans-serif"
            return `<span style="font-family: ${font}">${fnContent}</span>`
          }
          case "blur":
            return `<span class="blur-sm hover:blur-none transition-all">${fnContent}</span>`
          case "rainbow":
            return `<span class="bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 bg-clip-text text-transparent">${fnContent}</span>`
          case "sparkle":
            return `<span class="animate-pulse text-yellow-400">${fnContent}</span>`
          case "rotate": {
            const angle = node.props.args?.deg || "90"
            return `<span class="inline-block" style="transform: rotate(${angle}deg)">${fnContent}</span>`
          }
          case "position": {
            const x = node.props.args?.x || "0"
            const y = node.props.args?.y || "0"
            return `<span class="inline-block relative" style="left: ${x}em; top: ${y}em">${fnContent}</span>`
          }
          case "scale": {
            const scaleX = node.props.args?.x || "1"
            const scaleY = node.props.args?.y || "1"
            return `<span class="inline-block" style="transform: scale(${scaleX}, ${scaleY})">${fnContent}</span>`
          }
          case "fg": {
            const fgColor = node.props.args?.color || "fff"
            return `<span style="color: #${fgColor}">${fnContent}</span>`
          }
          case "bg": {
            const bgColor = node.props.args?.color || "000"
            return `<span style="background-color: #${bgColor}; padding: 0 2px; border-radius: 2px">${fnContent}</span>`
          }
          case "border":
            return `<span class="border border-current px-1 rounded">${fnContent}</span>`
          default:
            return fnContent
        }
      }

      default:
        // Unknown node type, try to render children if any
        if (
          "children" in node &&
          Array.isArray((node as { children?: unknown[] }).children)
        ) {
          return (node as { children: mfm.MfmNode[] }).children
            .map(renderNode)
            .join("")
        }
        return ""
    }
  }

  try {
    const parsed = mfm.parse(text)
    return parsed.map(renderNode).join("")
  } catch {
    // Fallback to escaped text
    return escapeHtml(text).replace(/\n/g, "<br>")
  }
}

// Computed MFM content for Misskey
const renderedMisskeyContent = computed(() => {
  if (!misskeyData.value?.text) return ""
  const instance = parseMisskeyUrl(props.embedData.url)?.instance || ""
  return renderMfm(misskeyData.value.text, instance)
})

// Computed MFM content for Misskey profile description
const renderedMisskeyProfileDescription = computed(() => {
  if (!misskeyProfile.value?.description) return ""
  const instance = parseMisskeyProfileUrl(props.embedData.url)?.instance || ""
  return renderMfm(misskeyProfile.value.description, instance)
})

// Parse Mastodon/Pleroma URL
const parseMastodonUrl = (
  url: string,
): { instance: string; statusId: string } | null => {
  try {
    const urlObj = new URL(url)
    const instance = urlObj.hostname
    // Match patterns like /@user/123456 or /users/user/statuses/123456
    const pathMatch = urlObj.pathname.match(
      /\/@[\w-]+\/(\d+)|\/users\/[\w-]+\/statuses\/(\d+)|\/notice\/(\w+)/,
    )
    if (pathMatch) {
      const statusId = pathMatch[1] || pathMatch[2] || pathMatch[3]
      return { instance, statusId }
    }
  } catch {
    // Invalid URL
  }
  return null
}

// Parse Misskey URL
const parseMisskeyUrl = (
  url: string,
): { instance: string; noteId: string } | null => {
  try {
    const urlObj = new URL(url)
    const instance = urlObj.hostname
    // Match pattern like /notes/xxxxx
    const pathMatch = urlObj.pathname.match(/\/notes\/([\w]+)/)
    if (pathMatch) {
      return { instance, noteId: pathMatch[1] }
    }
  } catch {
    // Invalid URL
  }
  return null
}

// Parse X/Twitter URL
const parseTwitterUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url)
    // Match /username/status/id pattern
    const pathMatch = urlObj.pathname.match(/\/[\w]+\/status\/(\d+)/)
    if (pathMatch) {
      return pathMatch[1]
    }
  } catch {
    // Invalid URL
  }
  return null
}

// Parse Mastodon/Pleroma profile URL
const parseMastodonProfileUrl = (
  url: string,
): { instance: string; username: string } | null => {
  try {
    const urlObj = new URL(url)
    const instance = urlObj.hostname
    // Match patterns like /@username or /users/username
    const pathMatch = urlObj.pathname.match(/^\/@([\w-]+)$|^\/users\/([\w-]+)$/)
    if (pathMatch) {
      const username = pathMatch[1] || pathMatch[2]
      return { instance, username }
    }
  } catch {
    // Invalid URL
  }
  return null
}

// Parse Misskey profile URL
const parseMisskeyProfileUrl = (
  url: string,
): { instance: string; username: string } | null => {
  try {
    const urlObj = new URL(url)
    const instance = urlObj.hostname
    // Match pattern like /@username
    const pathMatch = urlObj.pathname.match(/^\/@([\w-]+)$/)
    if (pathMatch) {
      return { instance, username: pathMatch[1] }
    }
  } catch {
    // Invalid URL
  }
  return null
}

// Parse X/Twitter profile URL
const parseTwitterProfileUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url)
    // Match /username pattern (no /status)
    const pathMatch = urlObj.pathname.match(/^\/([\w]+)$/)
    if (
      pathMatch &&
      ![
        "home",
        "explore",
        "notifications",
        "messages",
        "settings",
        "i",
      ].includes(pathMatch[1])
    ) {
      return pathMatch[1]
    }
  } catch {
    // Invalid URL
  }
  return null
}

// Parse GitHub code URL
interface GitHubUrlParsed {
  owner: string
  repo: string
  branch: string
  path: string
  startLine?: number
  endLine?: number
}

const parseGitHubUrl = (url: string): GitHubUrlParsed | null => {
  try {
    const urlObj = new URL(url)
    if (urlObj.hostname !== "github.com") return null

    // Match pattern: /owner/repo/blob/branch/path/to/file
    const pathMatch = urlObj.pathname.match(
      /^\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/,
    )
    if (!pathMatch) return null

    const [, owner, repo, branch, path] = pathMatch

    // Parse line numbers from hash: #L10 or #L10-L20
    let startLine: number | undefined
    let endLine: number | undefined

    if (urlObj.hash) {
      const lineMatch = urlObj.hash.match(/^#L(\d+)(?:-L(\d+))?$/)
      if (lineMatch) {
        startLine = parseInt(lineMatch[1], 10)
        endLine = lineMatch[2] ? parseInt(lineMatch[2], 10) : startLine
      }
    }

    return { owner, repo, branch, path, startLine, endLine }
  } catch {
    // Invalid URL
  }
  return null
}

// Map file extension to language
const getLanguageFromExtension = (filename: string): string => {
  const ext = filename.split(".").pop()?.toLowerCase() || ""
  const languageMap: Record<string, string> = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    py: "python",
    rb: "ruby",
    rs: "rust",
    go: "go",
    java: "java",
    kt: "kotlin",
    swift: "swift",
    c: "c",
    cpp: "cpp",
    cc: "cpp",
    cxx: "cpp",
    h: "c",
    hpp: "cpp",
    cs: "csharp",
    php: "php",
    sh: "bash",
    bash: "bash",
    zsh: "bash",
    fish: "fish",
    ps1: "powershell",
    sql: "sql",
    json: "json",
    yaml: "yaml",
    yml: "yaml",
    toml: "toml",
    xml: "xml",
    html: "html",
    htm: "html",
    css: "css",
    scss: "scss",
    sass: "sass",
    less: "less",
    md: "markdown",
    markdown: "markdown",
    vue: "vue",
    svelte: "svelte",
    dockerfile: "dockerfile",
    makefile: "makefile",
    cmake: "cmake",
    lua: "lua",
    r: "r",
    dart: "dart",
    ex: "elixir",
    exs: "elixir",
    erl: "erlang",
    hs: "haskell",
    clj: "clojure",
    scala: "scala",
    groovy: "groovy",
    pl: "perl",
    nim: "nim",
    zig: "zig",
    v: "v",
    sol: "solidity",
    graphql: "graphql",
    gql: "graphql",
    proto: "protobuf",
    tf: "hcl",
    hcl: "hcl",
  }
  return languageMap[ext] || "text"
}

// Fetch Mastodon/Pleroma status via proxy
const fetchMastodonStatus = async (instance: string, statusId: string) => {
  const url = props.embedData.url
  const type = props.embedData.type

  // Check cache first
  const cached = getFromCache<MastodonStatus>(type, url)
  if (cached) {
    mastodonData.value = cached
    loading.value = false
    return
  }

  try {
    // Use proxy to avoid CORS issues
    const response = await fetch(
      `/api/mastodon?host=${encodeURIComponent(instance)}&endpoint=${encodeURIComponent(`statuses/${statusId}`)}`,
    )
    if (!response.ok) throw new Error("Failed to fetch status")
    const data = (await response.json()) as MastodonStatus
    mastodonData.value = data
    setCache(type, url, data)
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

// Fetch Misskey note via proxy
const fetchMisskeyNote = async (instance: string, noteId: string) => {
  const url = props.embedData.url
  const type = props.embedData.type

  // Check cache first
  const cached = getFromCache<MisskeyNote>(type, url)
  if (cached) {
    misskeyData.value = cached
    loading.value = false
    return
  }

  try {
    // Use proxy to avoid CORS issues
    const response = await fetch(`/api/misskey`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host: instance,
        endpoint: "notes/show",
        body: { noteId },
      }),
    })
    if (!response.ok) throw new Error("Failed to fetch note")
    const data = (await response.json()) as MisskeyNote
    misskeyData.value = data
    setCache(type, url, data)
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

// Fetch X/Twitter status via fxtwitter proxy
const fetchTwitterStatus = async (statusId: string) => {
  const url = props.embedData.url
  const type = props.embedData.type

  // Check cache first
  const cached = getFromCache<FxTwitterTweet>(type, url)
  if (cached) {
    twitterData.value = cached
    loading.value = false
    return
  }

  try {
    const response = await fetch(
      `/api/twitter?id=${encodeURIComponent(statusId)}`,
    )
    if (!response.ok) throw new Error("Failed to fetch tweet")
    const data: FxTwitterResponse = await response.json()
    if (data.code !== 200 || !data.tweet) {
      throw new Error(data.message || "Tweet not found")
    }
    twitterData.value = data.tweet
    setCache(type, url, data.tweet)
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

// Fetch Mastodon/Pleroma profile via proxy
const fetchMastodonProfile = async (instance: string, username: string) => {
  const url = props.embedData.url
  const type = props.embedData.type

  // Check cache first
  const cached = getFromCache<MastodonAccount>(type, url)
  if (cached) {
    mastodonProfile.value = cached
    loading.value = false
    return
  }

  try {
    const response = await fetch(
      `/api/mastodon?host=${encodeURIComponent(instance)}&endpoint=${encodeURIComponent(`accounts/lookup?acct=${username}`)}`,
    )
    if (!response.ok) throw new Error("Failed to fetch profile")
    const data = (await response.json()) as MastodonAccount
    mastodonProfile.value = data
    setCache(type, url, data)
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

// Fetch Misskey profile via proxy
const fetchMisskeyProfile = async (instance: string, username: string) => {
  const url = props.embedData.url
  const type = props.embedData.type

  // Check cache first
  const cached = getFromCache<MisskeyUserDetail>(type, url)
  if (cached) {
    misskeyProfile.value = cached
    loading.value = false
    return
  }

  try {
    const response = await fetch(`/api/misskey`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host: instance,
        endpoint: "users/show",
        body: { username },
      }),
    })
    if (!response.ok) throw new Error("Failed to fetch profile")
    const data = (await response.json()) as MisskeyUserDetail
    misskeyProfile.value = data
    setCache(type, url, data)
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

// Fetch X/Twitter profile via fxtwitter proxy
const fetchTwitterProfile = async (username: string) => {
  const url = props.embedData.url
  const type = props.embedData.type

  // Check cache first
  const cached = getFromCache<FxTwitterAuthor>(type, url)
  if (cached) {
    twitterProfile.value = cached
    loading.value = false
    return
  }

  try {
    const response = await fetch(
      `/api/twitter?user=${encodeURIComponent(username)}`,
    )
    if (!response.ok) throw new Error("Failed to fetch profile")
    const data = (await response.json()) as {
      code: number
      message?: string
      user?: FxTwitterAuthor
    }
    if (data.code !== 200 || !data.user) {
      throw new Error(data.message || "User not found")
    }
    twitterProfile.value = data.user
    setCache(type, url, data.user)
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

// Fetch GitHub code
const fetchGitHubCode = async (parsed: GitHubUrlParsed) => {
  const url = props.embedData.url
  const type = props.embedData.type

  // Check cache first
  const cached = getFromCache<GitHubCodeData>(type, url)
  if (cached) {
    githubData.value = cached
    loading.value = false
    return
  }

  try {
    // Fetch raw content from GitHub
    const rawUrl = `https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/${parsed.branch}/${parsed.path}`
    const response = await fetch(rawUrl)
    if (!response.ok) throw new Error("Failed to fetch code")

    const fullCode = await response.text()
    const lines = fullCode.split("\n")

    // Extract specific lines if specified
    let code: string
    let startLine = parsed.startLine
    let endLine = parsed.endLine

    if (startLine !== undefined && endLine !== undefined) {
      // GitHub uses 1-based line numbers
      code = lines.slice(startLine - 1, endLine).join("\n")
    } else {
      code = fullCode
      startLine = 1
      endLine = lines.length
    }

    const filename = parsed.path.split("/").pop() || parsed.path
    const extension = filename.split(".").pop() || ""

    const data: GitHubCodeData = {
      owner: parsed.owner,
      repo: parsed.repo,
      branch: parsed.branch,
      path: parsed.path,
      filename,
      extension,
      startLine,
      endLine,
      code,
      language: getLanguageFromExtension(filename),
    }
    githubData.value = data
    setCache(type, url, data)
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

// Fetch OGP data for generic links
const fetchOGP = async (targetUrl: string) => {
  const url = props.embedData.url
  const type = props.embedData.type

  // Check cache first
  const cached = getFromCache<OGPData>(type, url)
  if (cached) {
    ogpData.value = cached
    loading.value = false
    return
  }

  try {
    const response = await fetch(
      `/api/ogp?url=${encodeURIComponent(targetUrl)}`,
    )
    if (!response.ok) throw new Error("Failed to fetch OGP")
    const data = (await response.json()) as OGPData
    ogpData.value = data
    setCache(type, url, data)
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

// Get total reactions count for Misskey
const totalReactions = computed(() => {
  if (!misskeyData.value?.reactions) return 0
  return Object.values(misskeyData.value.reactions).reduce(
    (sum, count) => sum + count,
    0,
  )
})

onMounted(() => {
  const { type, url } = props.embedData

  if (type === "x") {
    const statusId = parseTwitterUrl(url)
    if (statusId) {
      fetchTwitterStatus(statusId)
    } else {
      error.value = true
      loading.value = false
    }
    return
  }

  if (type === "x-profile") {
    const username = parseTwitterProfileUrl(url)
    if (username) {
      fetchTwitterProfile(username)
    } else {
      error.value = true
      loading.value = false
    }
    return
  }

  if (type === "mastodon" || type === "pleroma") {
    const parsed = parseMastodonUrl(url)
    if (parsed) {
      fetchMastodonStatus(parsed.instance, parsed.statusId)
    } else {
      error.value = true
      loading.value = false
    }
    return
  }

  if (type === "mastodon-profile" || type === "pleroma-profile") {
    const parsed = parseMastodonProfileUrl(url)
    if (parsed) {
      fetchMastodonProfile(parsed.instance, parsed.username)
    } else {
      error.value = true
      loading.value = false
    }
    return
  }

  if (type === "misskey") {
    const parsed = parseMisskeyUrl(url)
    if (parsed) {
      fetchMisskeyNote(parsed.instance, parsed.noteId)
    } else {
      error.value = true
      loading.value = false
    }
    return
  }

  if (type === "misskey-profile") {
    const parsed = parseMisskeyProfileUrl(url)
    if (parsed) {
      fetchMisskeyProfile(parsed.instance, parsed.username)
    } else {
      error.value = true
      loading.value = false
    }
    return
  }

  if (type === "github") {
    const parsed = parseGitHubUrl(url)
    if (parsed) {
      fetchGitHubCode(parsed)
    } else {
      error.value = true
      loading.value = false
    }
    return
  }

  if (type === "link") {
    fetchOGP(url)
    return
  }

  error.value = true
  loading.value = false
})
</script>

<template>
  <div class="social-embed my-4">
    <!-- Loading state -->
    <div
      v-if="loading"
      class="flex items-center justify-center p-8 bg-neutral-900 rounded-lg border border-neutral-700"
    >
      <span class="loading loading-spinner loading-md text-primary"></span>
    </div>

    <!-- Error state -->
    <div
      v-else-if="error"
      class="p-4 bg-neutral-900 rounded-lg border border-neutral-700"
    >
      <p class="text-neutral-400 text-sm">
        Failed to load embed from
        <a
          :href="embedData.url"
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary hover:underline"
        >
          {{ displayUrl }}
        </a>
      </p>
    </div>

    <!-- X/Twitter embed -->
    <div
      v-else-if="embedData.type === 'x' && twitterData"
      class="bg-neutral-900 rounded-lg border border-neutral-700 overflow-hidden"
    >
      <div class="p-4">
        <!-- Header -->
        <div class="flex items-start gap-3 mb-3">
          <a
            :href="`https://x.com/${twitterData.author.screen_name}`"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              v-if="twitterData.author.avatar_url"
              :src="twitterData.author.avatar_url"
              :alt="twitterData.author.name"
              class="w-12 h-12 rounded-full"
            />
            <div
              v-else
              class="w-12 h-12 rounded-full bg-neutral-700 flex items-center justify-center"
            >
              <span class="text-lg text-white">{{
                twitterData.author.name.charAt(0)
              }}</span>
            </div>
          </a>
          <div class="flex-1 min-w-0">
            <a
              :href="`https://x.com/${twitterData.author.screen_name}`"
              target="_blank"
              rel="noopener noreferrer"
              class="block hover:underline"
            >
              <span class="font-semibold text-white block truncate">
                {{ twitterData.author.name }}
              </span>
              <span class="text-neutral-400 text-sm">
                @{{ twitterData.author.screen_name }}
              </span>
            </a>
          </div>
          <div class="text-white">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
              />
            </svg>
          </div>
        </div>

        <!-- Content -->
        <div class="text-neutral-100 text-sm whitespace-pre-wrap mb-3">
          {{ twitterData.text }}
        </div>

        <!-- Quote Tweet -->
        <div
          v-if="twitterData.quote"
          class="border border-neutral-700 rounded-lg p-3 mb-3 bg-neutral-800/50"
        >
          <div class="flex items-center gap-2 mb-2">
            <img
              v-if="twitterData.quote.author.avatar_url"
              :src="twitterData.quote.author.avatar_url"
              :alt="twitterData.quote.author.name"
              class="w-5 h-5 rounded-full"
            />
            <span class="font-medium text-white text-sm">{{
              twitterData.quote.author.name
            }}</span>
            <span class="text-neutral-400 text-sm"
              >@{{ twitterData.quote.author.screen_name }}</span
            >
          </div>
          <div class="text-neutral-300 text-sm whitespace-pre-wrap">
            {{ twitterData.quote.text }}
          </div>
        </div>

        <!-- Poll -->
        <div v-if="twitterData.poll" class="mb-3 space-y-2">
          <div
            v-for="(choice, index) in twitterData.poll.choices"
            :key="index"
            class="relative bg-neutral-800 rounded-lg overflow-hidden"
          >
            <div
              class="absolute inset-0 bg-blue-500/20"
              :style="{ width: `${choice.percentage}%` }"
            />
            <div class="relative flex justify-between px-3 py-2 text-sm">
              <span class="text-white">{{ choice.label }}</span>
              <span class="text-neutral-400">{{ choice.percentage }}%</span>
            </div>
          </div>
          <p class="text-neutral-500 text-xs">
            {{ twitterData.poll.total_votes.toLocaleString() }} votes
          </p>
        </div>

        <!-- Media -->
        <div v-if="twitterData.media" class="mb-3">
          <!-- Mosaic (multiple photos stitched) -->
          <img
            v-if="twitterData.media.mosaic"
            :src="twitterData.media.mosaic.formats.webp"
            alt="Tweet media"
            class="w-full rounded-lg"
            loading="lazy"
          />
          <!-- Single/Multiple Photos -->
          <div
            v-else-if="
              twitterData.media.photos && twitterData.media.photos.length > 0
            "
            class="grid gap-2"
            :class="{
              'grid-cols-1': twitterData.media.photos.length === 1,
              'grid-cols-2': twitterData.media.photos.length > 1,
            }"
          >
            <img
              v-for="(photo, index) in twitterData.media.photos"
              :key="index"
              :src="photo.url"
              alt="Tweet photo"
              class="w-full rounded-lg object-cover max-h-80"
              loading="lazy"
            />
          </div>
          <!-- Videos -->
          <template
            v-if="
              twitterData.media.videos && twitterData.media.videos.length > 0
            "
          >
            <template
              v-for="(video, index) in twitterData.media.videos"
              :key="index"
            >
              <video
                v-if="video.type === 'video'"
                :src="video.url"
                :poster="video.thumbnail_url"
                controls
                class="w-full rounded-lg max-h-80"
              />
              <video
                v-else-if="video.type === 'gif'"
                :src="video.url"
                :poster="video.thumbnail_url"
                autoplay
                loop
                muted
                playsinline
                class="w-full rounded-lg max-h-80"
              />
            </template>
          </template>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between text-neutral-400 text-sm">
          <div class="flex items-center gap-4">
            <span class="flex items-center gap-1">
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              {{ twitterData.replies.toLocaleString() }}
            </span>
            <span class="flex items-center gap-1">
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {{ twitterData.retweets.toLocaleString() }}
            </span>
            <span class="flex items-center gap-1">
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {{ twitterData.likes.toLocaleString() }}
            </span>
            <span v-if="twitterData.views" class="flex items-center gap-1">
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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
              {{ twitterData.views.toLocaleString() }}
            </span>
          </div>
          <a
            :href="embedData.url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-neutral-500 hover:text-primary"
          >
            {{ formatDate(twitterData.created_at) }}
          </a>
        </div>
      </div>
    </div>

    <!-- Mastodon/Pleroma embed -->
    <div
      v-else-if="
        (embedData.type === 'mastodon' || embedData.type === 'pleroma') &&
        mastodonData
      "
      class="bg-neutral-900 rounded-lg border border-neutral-700 overflow-hidden"
    >
      <div class="p-4">
        <!-- Header -->
        <div class="flex items-start gap-3 mb-3">
          <a
            :href="mastodonData.account.url"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              :src="mastodonData.account.avatar"
              :alt="mastodonData.account.display_name"
              class="w-12 h-12 rounded-full"
            />
          </a>
          <div class="flex-1 min-w-0">
            <a
              :href="mastodonData.account.url"
              target="_blank"
              rel="noopener noreferrer"
              class="block hover:underline"
            >
              <span class="font-semibold text-white block truncate">
                {{ mastodonData.account.display_name }}
              </span>
              <span class="text-neutral-400 text-sm">
                @{{ mastodonData.account.username }}@{{
                  parseMastodonUrl(embedData.url)?.instance
                }}
              </span>
            </a>
          </div>
          <div class="flex items-center gap-1 text-neutral-400">
            <!-- Mastodon icon -->
            <svg
              v-if="embedData.type === 'mastodon'"
              class="w-5 h-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M21.327 8.566c0-4.339-2.843-5.61-2.843-5.61-1.433-.658-3.894-.935-6.451-.956h-.063c-2.557.021-5.016.298-6.45.956 0 0-2.843 1.272-2.843 5.61 0 .993-.019 2.181.012 3.441.103 4.243.778 8.425 4.701 9.463 1.809.479 3.362.579 4.612.51 2.268-.126 3.541-.809 3.541-.809l-.075-1.646s-1.621.511-3.441.449c-1.804-.062-3.707-.194-3.999-2.409a4.523 4.523 0 0 1-.04-.621s1.77.433 4.014.536c1.372.063 2.658-.08 3.965-.236 2.506-.299 4.688-1.843 4.962-3.254.434-2.223.398-5.424.398-5.424zm-3.353 5.59h-2.081V9.057c0-1.075-.452-1.62-1.357-1.62-1 0-1.501.647-1.501 1.927v2.791h-2.069V9.364c0-1.28-.501-1.927-1.502-1.927-.905 0-1.357.546-1.357 1.62v5.099H6.026V8.903c0-1.074.273-1.927.823-2.558.567-.631 1.307-.955 2.228-.955 1.065 0 1.872.409 2.405 1.228l.518.869.519-.869c.533-.819 1.34-1.228 2.405-1.228.92 0 1.66.324 2.227.955.55.631.824 1.484.824 2.558v5.253z"
              />
            </svg>
            <!-- Pleroma icon -->
            <svg
              v-else-if="embedData.type === 'pleroma'"
              class="w-5 h-5"
              viewBox="0 0 163.82249 261.80246"
              fill="currentColor"
            >
              <g transform="translate(-174.08876,-125.09877)">
                <g
                  transform="matrix(0.99659595,0,0,0.99659595,0.37313949,0.87143746)"
                >
                  <path
                    d="m 194.75841,124.65165 a 20.449443,20.449443 0 0 0 -20.44944,20.44945 v 242.24725 h 65.28091 v -262.6967 z"
                  />
                  <path
                    d="M 272.6236,124.65165 V 256 h 45.61799 a 20.449443,20.449443 0 0 0 20.44944,-20.44945 v -110.8989 z"
                  />
                  <path
                    d="m 272.6236,322.06744 v 65.28091 h 45.61799 a 20.449443,20.449443 0 0 0 20.44944,-20.44945 v -44.83146 z"
                  />
                </g>
              </g>
            </svg>
          </div>
        </div>

        <!-- Content -->
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div
          class="prose prose-invert prose-sm max-w-none mb-3"
          v-html="mastodonData.content"
        ></div>

        <!-- Media attachments -->
        <div
          v-if="
            mastodonData.media_attachments &&
            mastodonData.media_attachments.length > 0
          "
          class="grid gap-2 mb-3"
          :class="{
            'grid-cols-1': mastodonData.media_attachments.length === 1,
            'grid-cols-2': mastodonData.media_attachments.length > 1,
          }"
        >
          <template
            v-for="(media, index) in mastodonData.media_attachments"
            :key="index"
          >
            <img
              v-if="media.type === 'image'"
              :src="media.preview_url || media.url"
              :alt="media.description || 'Attached image'"
              class="w-full rounded-lg object-cover max-h-80"
              loading="lazy"
            />
            <video
              v-else-if="media.type === 'video' || media.type === 'gifv'"
              :src="media.url"
              :poster="media.preview_url"
              controls
              :autoplay="media.type === 'gifv'"
              :loop="media.type === 'gifv'"
              :muted="media.type === 'gifv'"
              class="w-full rounded-lg max-h-80"
            ></video>
          </template>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between text-neutral-400 text-sm">
          <div class="flex items-center gap-4">
            <span class="flex items-center gap-1">
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              {{ mastodonData.replies_count || 0 }}
            </span>
            <span class="flex items-center gap-1">
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {{ mastodonData.reblogs_count || 0 }}
            </span>
            <span class="flex items-center gap-1">
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
              {{ mastodonData.favourites_count || 0 }}
            </span>
          </div>
          <a
            :href="embedData.url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-neutral-500 hover:text-primary"
          >
            {{ formatDate(mastodonData.created_at) }}
          </a>
        </div>
      </div>
    </div>

    <!-- Misskey embed -->
    <div
      v-else-if="embedData.type === 'misskey' && misskeyData"
      class="bg-neutral-900 rounded-lg border border-neutral-700 overflow-hidden"
    >
      <div class="p-4">
        <!-- Header -->
        <div class="flex items-start gap-3 mb-3">
          <a
            :href="`https://${misskeyData.user.host || parseMisskeyUrl(embedData.url)?.instance}/@${misskeyData.user.username}`"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              :src="misskeyData.user.avatarUrl"
              :alt="misskeyData.user.name || misskeyData.user.username"
              class="w-12 h-12 rounded-full"
            />
          </a>
          <div class="flex-1 min-w-0">
            <a
              :href="`https://${misskeyData.user.host || parseMisskeyUrl(embedData.url)?.instance}/@${misskeyData.user.username}`"
              target="_blank"
              rel="noopener noreferrer"
              class="block hover:underline"
            >
              <span class="font-semibold text-white block truncate">
                {{ misskeyData.user.name || misskeyData.user.username }}
              </span>
              <span class="text-neutral-400 text-sm">
                @{{ misskeyData.user.username }}@{{
                  misskeyData.user.host ||
                  parseMisskeyUrl(embedData.url)?.instance
                }}
              </span>
            </a>
          </div>
          <div class="text-neutral-400">
            <!-- Misskey icon -->
            <svg class="w-5 h-5" viewBox="0 0 160 160" fill="currentColor">
              <g transform="matrix(0.28948,0,0,0.28948,-54.705,-30.7703)">
                <path
                  d="M256.418,188.976C248.558,188.944 240.758,190.308 233.379,193.013C220.308,197.613 209.533,205.888 201.091,217.802C193.02,229.329 188.977,242.195 188.977,256.409L188.977,508.89C188.977,527.332 195.52,543.29 208.576,556.732C222.032,569.803 237.99,576.331 256.418,576.331C275.259,576.331 291.204,569.803 304.274,556.747C317.73,543.291 324.441,527.332 324.441,508.89L324.441,462.983C324.584,453.04 334.824,455.655 340.01,462.983C349.691,479.76 372.36,494.119 394.193,494.119C416.026,494.119 438.005,482.196 448.375,462.983C452.304,458.354 463.377,450.455 464.52,462.983L464.52,508.89C464.52,527.332 471.047,543.29 484.104,556.732C497.574,569.803 513.511,576.331 531.953,576.331C550.78,576.331 566.739,569.803 579.809,556.747C593.265,543.291 599.977,527.332 599.977,508.89L599.977,256.409C599.977,242.195 595.752,229.329 587.309,217.802C579.224,205.874 568.653,197.613 555.597,193.013C547.912,190.314 540.228,188.976 532.543,188.976C511.788,188.976 494.301,197.046 480.073,213.188L411.636,293.281C410.107,294.438 405.006,303.247 394.178,303.247C383.379,303.247 378.868,294.439 377.325,293.296L308.297,213.188C294.47,197.046 277.173,188.976 256.418,188.976ZM682.904,188.983C666.763,188.983 652.926,194.748 641.404,206.271C630.261,217.413 624.691,231.054 624.691,247.196C624.691,263.338 630.261,277.174 641.404,288.697C652.926,299.839 666.763,305.41 682.904,305.41C699.046,305.41 712.88,299.839 724.412,288.697C735.935,277.174 741.693,263.338 741.693,247.196C741.693,231.054 735.935,217.413 724.412,206.271C712.88,194.748 699.046,188.983 682.904,188.983ZM683.473,316.947C667.331,316.947 653.495,322.713 641.972,334.236C630.449,345.768 624.691,359.602 624.691,375.744L624.691,518.118C624.691,534.259 630.449,548.095 641.972,559.618C653.504,570.761 667.341,576.331 683.473,576.331C699.624,576.331 713.27,570.761 724.412,559.618C735.935,548.095 741.693,534.259 741.693,518.118L741.693,375.744C741.693,359.593 735.935,345.759 724.412,334.236C713.261,322.713 699.614,316.947 683.473,316.947Z"
                />
              </g>
            </svg>
          </div>
        </div>

        <!-- CW (Content Warning) -->
        <div v-if="misskeyData.cw" class="mb-3">
          <div class="flex items-center gap-2 p-2 bg-neutral-800 rounded-lg">
            <span class="text-yellow-400 text-sm font-medium">CW:</span>
            <span class="text-neutral-300 text-sm">{{ misskeyData.cw }}</span>
            <button
              type="button"
              class="ml-auto text-xs px-2 py-1 bg-neutral-700 hover:bg-neutral-600 rounded text-neutral-300"
              @click="showCwContent = !showCwContent"
            >
              {{ showCwContent ? "Hide" : "Show" }}
            </button>
          </div>
        </div>

        <!-- Content -->
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div
          v-if="!misskeyData.cw || showCwContent"
          class="text-neutral-100 text-sm mb-3 mfm-content"
          v-html="renderedMisskeyContent"
        ></div>

        <!-- Files/Media -->
        <div
          v-if="
            (!misskeyData.cw || showCwContent) &&
            misskeyData.files &&
            misskeyData.files.length > 0
          "
          class="grid gap-2 mb-3"
          :class="{
            'grid-cols-1': misskeyData.files.length === 1,
            'grid-cols-2': misskeyData.files.length > 1,
          }"
        >
          <template v-for="(file, index) in misskeyData.files" :key="index">
            <img
              v-if="file.type.startsWith('image/')"
              :src="file.thumbnailUrl || file.url"
              :alt="file.comment || 'Attached image'"
              class="w-full rounded-lg object-cover max-h-80"
              loading="lazy"
            />
            <video
              v-else-if="file.type.startsWith('video/')"
              :src="file.url"
              :poster="file.thumbnailUrl"
              controls
              class="w-full rounded-lg max-h-80"
            ></video>
          </template>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between text-neutral-400 text-sm">
          <div class="flex items-center gap-4">
            <span class="flex items-center gap-1">
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              {{ misskeyData.repliesCount || 0 }}
            </span>
            <span class="flex items-center gap-1">
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {{ misskeyData.renoteCount || 0 }}
            </span>
            <span class="flex items-center gap-1">
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {{ totalReactions }}
            </span>
          </div>
          <a
            :href="embedData.url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-neutral-500 hover:text-primary"
          >
            {{ formatDate(misskeyData.createdAt) }}
          </a>
        </div>
      </div>
    </div>

    <!-- Mastodon/Pleroma Profile embed -->
    <div
      v-else-if="
        (embedData.type === 'mastodon-profile' ||
          embedData.type === 'pleroma-profile') &&
        mastodonProfile
      "
      class="bg-neutral-900 rounded-lg border border-neutral-700 overflow-hidden"
    >
      <!-- Header/Banner -->
      <div
        v-if="mastodonProfile.header"
        class="h-32 bg-cover bg-center"
        :style="{ backgroundImage: `url(${mastodonProfile.header})` }"
      ></div>
      <div
        v-else
        class="h-16 bg-linear-to-r from-primary/30 to-primary/10"
      ></div>

      <div class="p-4 -mt-12">
        <!-- Avatar and basic info -->
        <div class="flex items-end gap-4 mb-4">
          <a
            :href="mastodonProfile.url"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              :src="mastodonProfile.avatar"
              :alt="mastodonProfile.display_name"
              class="w-20 h-20 rounded-full border-4 border-neutral-900"
            />
          </a>
          <div class="flex-1 min-w-0 pb-1">
            <div class="flex items-center gap-2">
              <a
                :href="mastodonProfile.url"
                target="_blank"
                rel="noopener noreferrer"
                class="font-bold text-white text-lg truncate hover:underline"
              >
                {{ mastodonProfile.display_name || mastodonProfile.username }}
              </a>
              <span
                v-if="mastodonProfile.bot"
                class="text-xs bg-neutral-700 px-2 py-0.5 rounded text-neutral-300"
                >BOT</span
              >
            </div>
            <span class="text-neutral-400 text-sm">
              @{{ mastodonProfile.username }}@{{
                parseMastodonProfileUrl(embedData.url)?.instance
              }}
            </span>
          </div>
          <div class="text-neutral-400">
            <!-- Mastodon/Pleroma icon -->
            <svg
              v-if="embedData.type === 'mastodon-profile'"
              class="w-6 h-6"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M21.327 8.566c0-4.339-2.843-5.61-2.843-5.61-1.433-.658-3.894-.935-6.451-.956h-.063c-2.557.021-5.016.298-6.45.956 0 0-2.843 1.272-2.843 5.61 0 .993-.019 2.181.012 3.441.103 4.243.778 8.425 4.701 9.463 1.809.479 3.362.579 4.612.51 2.268-.126 3.541-.809 3.541-.809l-.075-1.646s-1.621.511-3.441.449c-1.804-.062-3.707-.194-3.999-2.409a4.523 4.523 0 0 1-.04-.621s1.77.433 4.014.536c1.372.063 2.658-.08 3.965-.236 2.506-.299 4.688-1.843 4.962-3.254.434-2.223.398-5.424.398-5.424zm-3.353 5.59h-2.081V9.057c0-1.075-.452-1.62-1.357-1.62-1 0-1.501.647-1.501 1.927v2.791h-2.069V9.364c0-1.28-.501-1.927-1.502-1.927-.905 0-1.357.546-1.357 1.62v5.099H6.026V8.903c0-1.074.273-1.927.823-2.558.567-.631 1.307-.955 2.228-.955 1.065 0 1.872.409 2.405 1.228l.518.869.519-.869c.533-.819 1.34-1.228 2.405-1.228.92 0 1.66.324 2.227.955.55.631.824 1.484.824 2.558v5.253z"
              />
            </svg>
            <svg
              v-else
              class="w-6 h-6"
              viewBox="0 0 163.82249 261.80246"
              fill="currentColor"
            >
              <g transform="translate(-174.08876,-125.09877)">
                <g
                  transform="matrix(0.99659595,0,0,0.99659595,0.37313949,0.87143746)"
                >
                  <path
                    d="m 194.75841,124.65165 a 20.449443,20.449443 0 0 0 -20.44944,20.44945 v 242.24725 h 65.28091 v -262.6967 z"
                  />
                  <path
                    d="M 272.6236,124.65165 V 256 h 45.61799 a 20.449443,20.449443 0 0 0 20.44944,-20.44945 v -110.8989 z"
                  />
                  <path
                    d="m 272.6236,322.06744 v 65.28091 h 45.61799 a 20.449443,20.449443 0 0 0 20.44944,-20.44945 v -44.83146 z"
                  />
                </g>
              </g>
            </svg>
          </div>
        </div>

        <!-- Bio -->
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div
          v-if="mastodonProfile.note"
          class="prose prose-invert prose-sm max-w-none mb-4"
          v-html="mastodonProfile.note"
        ></div>

        <!-- Fields -->
        <div
          v-if="mastodonProfile.fields && mastodonProfile.fields.length > 0"
          class="space-y-2 mb-4"
        >
          <div
            v-for="(field, index) in mastodonProfile.fields"
            :key="index"
            class="flex gap-2 text-sm bg-neutral-800 rounded-lg p-2"
          >
            <span class="text-neutral-400 font-medium min-w-20">{{
              field.name
            }}</span>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span class="text-neutral-100 flex-1" v-html="field.value"></span>
            <svg
              v-if="field.verified_at"
              class="w-4 h-4 text-green-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <!-- Stats -->
        <div class="flex items-center gap-6 text-sm">
          <span class="text-neutral-100">
            <span class="font-bold">{{
              mastodonProfile.statuses_count.toLocaleString()
            }}</span>
            <span class="text-neutral-400 ml-1">投稿</span>
          </span>
          <span class="text-neutral-100">
            <span class="font-bold">{{
              mastodonProfile.following_count.toLocaleString()
            }}</span>
            <span class="text-neutral-400 ml-1">フォロー</span>
          </span>
          <span class="text-neutral-100">
            <span class="font-bold">{{
              mastodonProfile.followers_count.toLocaleString()
            }}</span>
            <span class="text-neutral-400 ml-1">フォロワー</span>
          </span>
        </div>
      </div>
    </div>

    <!-- Misskey Profile embed -->
    <div
      v-else-if="embedData.type === 'misskey-profile' && misskeyProfile"
      class="bg-neutral-900 rounded-lg border border-neutral-700 overflow-hidden"
    >
      <!-- Header/Banner -->
      <div
        v-if="misskeyProfile.bannerUrl"
        class="h-32 bg-cover bg-center"
        :style="{ backgroundImage: `url(${misskeyProfile.bannerUrl})` }"
      ></div>
      <div
        v-else
        class="h-16 bg-linear-to-r from-green-500/30 to-green-300/10"
      ></div>

      <div class="p-4 -mt-12">
        <!-- Avatar and basic info -->
        <div class="flex items-end gap-4 mb-4">
          <a :href="embedData.url" target="_blank" rel="noopener noreferrer">
            <img
              :src="misskeyProfile.avatarUrl"
              :alt="misskeyProfile.name || misskeyProfile.username"
              class="w-20 h-20 rounded-full border-4 border-neutral-900"
            />
          </a>
          <div class="flex-1 min-w-0 pb-1">
            <div class="flex items-center gap-2">
              <a
                :href="embedData.url"
                target="_blank"
                rel="noopener noreferrer"
                class="font-bold text-white text-lg truncate hover:underline"
              >
                {{ misskeyProfile.name || misskeyProfile.username }}
              </a>
              <span
                v-if="misskeyProfile.isBot"
                class="text-xs bg-neutral-700 px-2 py-0.5 rounded text-neutral-300"
                >BOT</span
              >
            </div>
            <span class="text-neutral-400 text-sm">
              @{{ misskeyProfile.username }}@{{
                misskeyProfile.host ||
                parseMisskeyProfileUrl(embedData.url)?.instance
              }}
            </span>
          </div>
          <div class="text-neutral-400">
            <!-- Misskey icon -->
            <svg class="w-6 h-6" viewBox="0 0 160 160" fill="currentColor">
              <g transform="matrix(0.28948,0,0,0.28948,-54.705,-30.7703)">
                <path
                  d="M256.418,188.976C248.558,188.944 240.758,190.308 233.379,193.013C220.308,197.613 209.533,205.888 201.091,217.802C193.02,229.329 188.977,242.195 188.977,256.409L188.977,508.89C188.977,527.332 195.52,543.29 208.576,556.732C222.032,569.803 237.99,576.331 256.418,576.331C275.259,576.331 291.204,569.803 304.274,556.747C317.73,543.291 324.441,527.332 324.441,508.89L324.441,462.983C324.584,453.04 334.824,455.655 340.01,462.983C349.691,479.76 372.36,494.119 394.193,494.119C416.026,494.119 438.005,482.196 448.375,462.983C452.304,458.354 463.377,450.455 464.52,462.983L464.52,508.89C464.52,527.332 471.047,543.29 484.104,556.732C497.574,569.803 513.511,576.331 531.953,576.331C550.78,576.331 566.739,569.803 579.809,556.747C593.265,543.291 599.977,527.332 599.977,508.89L599.977,256.409C599.977,242.195 595.752,229.329 587.309,217.802C579.224,205.874 568.653,197.613 555.597,193.013C547.912,190.314 540.228,188.976 532.543,188.976C511.788,188.976 494.301,197.046 480.073,213.188L411.636,293.281C410.107,294.438 405.006,303.247 394.178,303.247C383.379,303.247 378.868,294.439 377.325,293.296L308.297,213.188C294.47,197.046 277.173,188.976 256.418,188.976ZM682.904,188.983C666.763,188.983 652.926,194.748 641.404,206.271C630.261,217.413 624.691,231.054 624.691,247.196C624.691,263.338 630.261,277.174 641.404,288.697C652.926,299.839 666.763,305.41 682.904,305.41C699.046,305.41 712.88,299.839 724.412,288.697C735.935,277.174 741.693,263.338 741.693,247.196C741.693,231.054 735.935,217.413 724.412,206.271C712.88,194.748 699.046,188.983 682.904,188.983ZM683.473,316.947C667.331,316.947 653.495,322.713 641.972,334.236C630.449,345.768 624.691,359.602 624.691,375.744L624.691,518.118C624.691,534.259 630.449,548.095 641.972,559.618C653.504,570.761 667.341,576.331 683.473,576.331C699.624,576.331 713.27,570.761 724.412,559.618C735.935,548.095 741.693,534.259 741.693,518.118L741.693,375.744C741.693,359.593 735.935,345.759 724.412,334.236C713.261,322.713 699.614,316.947 683.473,316.947Z"
                />
              </g>
            </svg>
          </div>
        </div>

        <!-- Bio -->
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div
          v-if="misskeyProfile.description"
          class="text-neutral-100 text-sm mb-4 mfm-content"
          v-html="renderedMisskeyProfileDescription"
        ></div>

        <!-- Fields -->
        <div
          v-if="misskeyProfile.fields && misskeyProfile.fields.length > 0"
          class="space-y-2 mb-4"
        >
          <div
            v-for="(field, index) in misskeyProfile.fields"
            :key="index"
            class="flex gap-2 text-sm bg-neutral-800 rounded-lg p-2"
          >
            <span class="text-neutral-400 font-medium min-w-20">{{
              field.name
            }}</span>
            <span class="text-neutral-100 flex-1">{{ field.value }}</span>
          </div>
        </div>

        <!-- Stats -->
        <div class="flex items-center gap-6 text-sm">
          <span class="text-neutral-100">
            <span class="font-bold">{{
              misskeyProfile.notesCount.toLocaleString()
            }}</span>
            <span class="text-neutral-400 ml-1">ノート</span>
          </span>
          <span class="text-neutral-100">
            <span class="font-bold">{{
              misskeyProfile.followingCount.toLocaleString()
            }}</span>
            <span class="text-neutral-400 ml-1">フォロー</span>
          </span>
          <span class="text-neutral-100">
            <span class="font-bold">{{
              misskeyProfile.followersCount.toLocaleString()
            }}</span>
            <span class="text-neutral-400 ml-1">フォロワー</span>
          </span>
        </div>
      </div>
    </div>

    <!-- X/Twitter Profile embed -->
    <div
      v-else-if="embedData.type === 'x-profile' && twitterProfile"
      class="bg-neutral-900 rounded-lg border border-neutral-700 overflow-hidden"
    >
      <!-- Header/Banner -->
      <div
        v-if="twitterProfile.banner_url"
        class="h-32 bg-cover bg-center"
        :style="{ backgroundImage: `url(${twitterProfile.banner_url})` }"
      ></div>
      <div
        v-else
        class="h-16 bg-linear-to-r from-sky-500/30 to-sky-300/10"
      ></div>

      <div class="p-4 -mt-12">
        <!-- Avatar and basic info -->
        <div class="flex items-end gap-4 mb-4">
          <a
            :href="`https://x.com/${twitterProfile.screen_name}`"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              :src="twitterProfile.avatar_url"
              :alt="twitterProfile.name"
              class="w-20 h-20 rounded-full border-4 border-neutral-900"
            />
          </a>
          <div class="flex-1 min-w-0 pb-1">
            <a
              :href="`https://x.com/${twitterProfile.screen_name}`"
              target="_blank"
              rel="noopener noreferrer"
              class="font-bold text-white text-lg truncate hover:underline block"
            >
              {{ twitterProfile.name }}
            </a>
            <span class="text-neutral-400 text-sm">
              @{{ twitterProfile.screen_name }}
            </span>
          </div>
          <div class="text-neutral-400">
            <!-- X icon -->
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
              />
            </svg>
          </div>
        </div>

        <!-- Bio -->
        <div
          v-if="twitterProfile.description"
          class="text-neutral-100 text-sm mb-4 whitespace-pre-wrap"
        >
          {{ twitterProfile.description }}
        </div>
      </div>
    </div>

    <!-- GitHub Code embed -->
    <div
      v-else-if="embedData.type === 'github' && githubData"
      class="bg-neutral-900 rounded-lg border border-neutral-700 overflow-hidden"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between px-4 py-2 bg-neutral-800 border-b border-neutral-700"
      >
        <div class="flex items-center gap-2 min-w-0">
          <!-- GitHub icon -->
          <svg
            class="w-5 h-5 text-neutral-400 shrink-0"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
            />
          </svg>
          <a
            :href="embedData.url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-neutral-300 hover:text-white text-sm font-medium truncate"
          >
            {{ githubData.owner }}/{{ githubData.repo }}
          </a>
          <span class="text-neutral-500">/</span>
          <span class="text-neutral-400 text-sm truncate">{{
            githubData.filename
          }}</span>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <span v-if="githubData.startLine" class="text-neutral-500 text-xs">
            L{{ githubData.startLine
            }}<span
              v-if="
                githubData.endLine &&
                githubData.endLine !== githubData.startLine
              "
              >-{{ githubData.endLine }}</span
            >
          </span>
          <span
            class="px-2 py-0.5 bg-neutral-700 rounded text-xs text-neutral-300"
          >
            {{ githubData.language }}
          </span>
        </div>
      </div>

      <!-- Code block -->
      <div class="relative github-code-block">
        <div class="overflow-x-auto">
          <table class="w-full text-sm font-mono">
            <tbody>
              <tr
                v-for="(line, index) in highlightedCodeLines"
                :key="index"
                class="hover:bg-neutral-800/50"
              >
                <td
                  class="select-none text-right px-3 py-0 text-neutral-500 border-r border-neutral-700 w-12"
                >
                  {{ (githubData.startLine || 1) + index }}
                </td>
                <td class="px-4 py-0 whitespace-pre" v-html="line"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Footer -->
      <div
        class="px-4 py-2 bg-neutral-800 border-t border-neutral-700 text-xs text-neutral-500"
      >
        <a
          :href="embedData.url"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:text-neutral-300"
        >
          {{ githubData.path }} @ {{ githubData.branch }}
        </a>
      </div>
    </div>

    <!-- Link (OGP) embed -->
    <a
      v-else-if="embedData.type === 'link' && ogpData"
      :href="ogpData.url"
      target="_blank"
      rel="noopener noreferrer"
      class="block bg-neutral-900 rounded-lg border border-neutral-700 overflow-hidden hover:border-neutral-600 transition-colors no-underline"
    >
      <div class="flex">
        <!-- Image -->
        <div v-if="ogpData.image" class="w-32 sm:w-48 shrink-0 bg-neutral-800">
          <img
            :src="ogpData.image"
            :alt="ogpData.title || ''"
            class="w-full h-full object-cover"
            loading="lazy"
            @error="($event.target as HTMLImageElement).style.display = 'none'"
          />
        </div>

        <!-- Content -->
        <div class="flex-1 p-4 min-w-0">
          <!-- Site info -->
          <div class="flex items-center gap-2 mb-2">
            <img
              v-if="ogpData.favicon"
              :src="ogpData.favicon"
              class="w-4 h-4"
              loading="lazy"
              @error="
                ($event.target as HTMLImageElement).style.display = 'none'
              "
            />
            <span class="text-neutral-500 text-xs truncate">
              {{ ogpData.siteName }}
            </span>
          </div>

          <!-- Title -->
          <h3
            v-if="ogpData.title"
            class="text-white font-medium text-sm sm:text-base line-clamp-2 mb-1"
          >
            {{ ogpData.title }}
          </h3>

          <!-- Description -->
          <p
            v-if="ogpData.description"
            class="text-neutral-400 text-xs sm:text-sm line-clamp-2"
          >
            {{ ogpData.description }}
          </p>
        </div>
      </div>
    </a>
  </div>
</template>

<style scoped>
.social-embed :deep(a) {
  color: rgb(var(--color-primary));
}

.social-embed :deep(.invisible) {
  display: none;
}

.social-embed :deep(.ellipsis::after) {
  content: "...";
}

/* GitHub code block highlight.js styles */
.github-code-block :deep(.hljs-keyword) {
  color: #ff7b72;
}
.github-code-block :deep(.hljs-built_in) {
  color: #ffa657;
}
.github-code-block :deep(.hljs-type) {
  color: #ffa657;
}
.github-code-block :deep(.hljs-literal) {
  color: #79c0ff;
}
.github-code-block :deep(.hljs-number) {
  color: #79c0ff;
}
.github-code-block :deep(.hljs-string) {
  color: #a5d6ff;
}
.github-code-block :deep(.hljs-regexp) {
  color: #a5d6ff;
}
.github-code-block :deep(.hljs-symbol) {
  color: #79c0ff;
}
.github-code-block :deep(.hljs-variable) {
  color: #ffa657;
}
.github-code-block :deep(.hljs-template-variable) {
  color: #ffa657;
}
.github-code-block :deep(.hljs-attr) {
  color: #79c0ff;
}
.github-code-block :deep(.hljs-attribute) {
  color: #79c0ff;
}
.github-code-block :deep(.hljs-selector-tag) {
  color: #7ee787;
}
.github-code-block :deep(.hljs-selector-id) {
  color: #79c0ff;
}
.github-code-block :deep(.hljs-selector-class) {
  color: #7ee787;
}
.github-code-block :deep(.hljs-title) {
  color: #d2a8ff;
}
.github-code-block :deep(.hljs-title.function_) {
  color: #d2a8ff;
}
.github-code-block :deep(.hljs-title.class_) {
  color: #ffa657;
}
.github-code-block :deep(.hljs-params) {
  color: #e6edf3;
}
.github-code-block :deep(.hljs-comment) {
  color: #8b949e;
  font-style: italic;
}
.github-code-block :deep(.hljs-doctag) {
  color: #8b949e;
}
.github-code-block :deep(.hljs-meta) {
  color: #79c0ff;
}
.github-code-block :deep(.hljs-section) {
  color: #79c0ff;
  font-weight: bold;
}
.github-code-block :deep(.hljs-tag) {
  color: #7ee787;
}
.github-code-block :deep(.hljs-name) {
  color: #7ee787;
}
.github-code-block :deep(.hljs-property) {
  color: #79c0ff;
}
.github-code-block :deep(.hljs-subst) {
  color: #e6edf3;
}
.github-code-block :deep(.hljs-punctuation) {
  color: #e6edf3;
}
.github-code-block :deep(.hljs-operator) {
  color: #ff7b72;
}
</style>
