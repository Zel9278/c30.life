// Cloudflare Pages Middleware for OGP injection
// Injects OGP tags into index.html for all HTML requests

interface Env {
  BLOG_BUCKET: R2Bucket
  ASSETS: Fetcher
}

interface BlogMeta {
  title: string
  description: string
  date: string
  tags?: string[]
  image?: string
}

function parseFrontmatter(content: string): {
  meta: BlogMeta
  content: string
} {
  // Normalize line endings
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n")

  const match = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) {
    return {
      meta: { title: "Untitled", description: "", date: "" },
      content: normalized,
    }
  }

  const frontmatter = match[1]
  const meta: BlogMeta = { title: "Untitled", description: "", date: "" }

  for (const line of frontmatter.split("\n")) {
    const colonIndex = line.indexOf(":")
    if (colonIndex === -1) continue

    const key = line.slice(0, colonIndex).trim()
    let value = line.slice(colonIndex + 1).trim()

    // Remove quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (key === "title") meta.title = value
    else if (key === "description") meta.description = value
    else if (key === "date") meta.date = value
    else if (key === "image") meta.image = value
    else if (key === "tags") {
      // Parse YAML array
      const tagsMatch = value.match(/\[(.*)\]/)
      if (tagsMatch) {
        meta.tags = tagsMatch[1]
          .split(",")
          .map((t) => t.trim().replace(/['"]/g, ""))
      }
    }
  }

  return { meta, content: match[2] }
}

// OGP metadata for static pages
const staticPages: Record<string, { title: string; description: string }> = {
  "/": { title: "c30.life", description: "c30's homepage" },
  "/links": { title: "Links - c30.life", description: "c30のリンク集" },
  "/timeline": {
    title: "Timeline - c30.life",
    description: "c30のタイムライン",
  },
  "/info": { title: "Info - c30.life", description: "c30.lifeの情報" },
  "/misskey": {
    title: "Misskey - c30.life",
    description: "c30のMisskeyアカウント一覧",
  },
  "/mastodon": {
    title: "Mastodon - c30.life",
    description: "c30のMastodonアカウント一覧",
  },
  "/environments": {
    title: "Environments - c30.life",
    description: "c30の開発環境",
  },
  "/servers": {
    title: "Servers - c30.life",
    description: "c30が運営するサーバー一覧",
  },
  "/pubkeys": { title: "Pubkeys - c30.life", description: "c30の公開鍵" },
  "/watched-animes": {
    title: "Watched Animes - c30.life",
    description: "c30が観たアニメ・映画",
  },
  "/blog": { title: "Blog - c30.life", description: "c30のブログ記事一覧" },
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function injectOgp(
  html: string,
  title: string,
  description: string,
  url: string,
  image = "https://c30.life/c30.png",
): string {
  // Replace title
  html = html.replace(
    /<title>.*?<\/title>/,
    `<title>${escapeHtml(title)}</title>`,
  )

  // Replace meta tags
  html = html.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${escapeHtml(description)}" />`,
  )
  html = html.replace(
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
  )
  html = html.replace(
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
  )
  html = html.replace(
    /<meta property="og:image" content="[^"]*" \/>/,
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
  )

  // Add og:url
  if (html.includes('property="og:type"')) {
    html = html.replace(
      /<meta property="og:type" content="[^"]*" \/>/,
      `<meta property="og:url" content="${escapeHtml(url)}" />\n    <meta property="og:type" content="website" />`,
    )
  }

  return html
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, next, env } = context
  const url = new URL(request.url)
  const pathname = url.pathname

  // Skip API routes and static assets - must call next() for API handlers
  if (pathname.startsWith("/api/")) {
    return next()
  }

  if (
    pathname.match(
      /\.(js|css|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|xml|txt|json)$/,
    )
  ) {
    return next()
  }

  // Get the original response (index.html for SPA routes)
  let response: Response
  try {
    response = await next()
  } catch (e) {
    console.error("Middleware next() error:", e)
    return new Response("Internal Server Error", { status: 500 })
  }

  // Only modify HTML responses
  const contentType = response.headers.get("content-type")
  if (!contentType?.includes("text/html")) {
    return response
  }

  const originalHtml = await response.text()

  let title = "c30.life"
  let description = "c30's homepage"
  let image = "https://c30.life/c30.png"

  // Check for blog post
  const blogMatch = pathname.match(/^\/blog\/([^/]+)$/)
  if (blogMatch && env.BLOG_BUCKET) {
    const slug = blogMatch[1]
    try {
      const object = await env.BLOG_BUCKET.get(`${slug}.md`)
      if (object) {
        const content = await object.text()
        const { meta } = parseFrontmatter(content)
        title = `${meta.title} - c30.life`
        description = meta.description || `${meta.title}の記事`
        if (meta.image) {
          image = meta.image
        }
      }
    } catch (e) {
      console.error("Failed to fetch blog post:", e)
    }
  } else if (staticPages[pathname]) {
    // Static page
    title = staticPages[pathname].title
    description = staticPages[pathname].description
  }

  const modifiedHtml = injectOgp(
    originalHtml,
    title,
    description,
    url.href,
    image,
  )

  // Copy headers but exclude content-related headers that we'll set ourselves
  const newHeaders = new Headers()
  for (const [key, value] of response.headers.entries()) {
    const lowerKey = key.toLowerCase()
    if (
      lowerKey !== "content-type" &&
      lowerKey !== "content-length" &&
      lowerKey !== "content-encoding"
    ) {
      newHeaders.set(key, value)
    }
  }
  newHeaders.set("Content-Type", "text/html; charset=utf-8")

  return new Response(modifiedHtml, {
    status: response.status,
    headers: newHeaders,
  })
}
