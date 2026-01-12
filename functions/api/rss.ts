interface Env {
  BLOG_BUCKET: R2Bucket
}

interface BlogPost {
  id: string
  title: string
  date: string
  description?: string
  content: string
}

interface Frontmatter {
  title?: string
  date?: string
  description?: string
}

// Parse frontmatter from markdown
function parseFrontmatter(content: string): {
  data: Frontmatter
  content: string
} {
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
  const match = normalized.match(frontmatterRegex)

  if (!match) {
    return { data: {}, content: normalized }
  }

  const frontmatter = match[1]
  const body = match[2]

  const data: Frontmatter = {}

  for (const line of frontmatter.split("\n")) {
    const [key, ...valueParts] = line.split(":")
    if (key && valueParts.length > 0) {
      const value = valueParts
        .join(":")
        .trim()
        .replace(/^["']|["']$/g, "")
      const trimmedKey = key.trim()

      switch (trimmedKey) {
        case "title":
          data.title = value
          break
        case "date":
          data.date = value
          break
        case "description":
          data.description = value
          break
      }
    }
  }

  return { data, content: body }
}

// Escape XML special characters
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

// Strip markdown to plain text for description
function stripMarkdown(markdown: string): string {
  return (
    markdown
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, "")
      // Remove inline code
      .replace(/`[^`]+`/g, "")
      // Remove images
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
      // Remove links but keep text
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      // Remove headers
      .replace(/^#{1,6}\s+/gm, "")
      // Remove bold/italic
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/__([^_]+)__/g, "$1")
      .replace(/_([^_]+)_/g, "$1")
      // Remove custom containers
      .replace(/:::\s*\w+[\s\S]*?:::/g, "")
      // Remove horizontal rules
      .replace(/^---+$/gm, "")
      // Remove blockquotes
      .replace(/^>\s+/gm, "")
      // Remove list markers
      .replace(/^[\s]*[-*+]\s+/gm, "")
      .replace(/^[\s]*\d+\.\s+/gm, "")
      // Collapse whitespace
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  )
}

// Generate RSS 2.0 feed
function generateRss(posts: BlogPost[], baseUrl: string): string {
  const now = new Date().toUTCString()

  const items = posts
    .map((post) => {
      const pubDate = post.date ? new Date(post.date).toUTCString() : now
      const description =
        post.description || stripMarkdown(post.content).slice(0, 300) + "..."
      const link = `${baseUrl}/blog/${post.id}`

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(description)}</description>
    </item>`
    })
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>c30.life Blog</title>
    <link>${baseUrl}/blog</link>
    <description>ced's blog - プログラミング、技術、日常など</description>
    <language>ja</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${baseUrl}/api/rss" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request } = context
  const url = new URL(request.url)
  const baseUrl = `${url.protocol}//${url.host}`

  try {
    // List all blog posts
    const listed = await env.BLOG_BUCKET.list()
    const posts: BlogPost[] = []

    for (const object of listed.objects) {
      if (!object.key.endsWith(".md")) continue

      const file = await env.BLOG_BUCKET.get(object.key)
      if (!file) continue

      const rawContent = await file.text()
      const { data, content } = parseFrontmatter(rawContent)

      const id = object.key.replace(/\.md$/, "")
      const title = data.title || id
      const date = data.date || object.uploaded.toISOString().split("T")[0]

      posts.push({
        id,
        title,
        date,
        description: data.description,
        content,
      })
    }

    // Sort by date (newest first)
    posts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )

    // Limit to 20 most recent posts
    const recentPosts = posts.slice(0, 20)

    // Generate RSS feed
    const rss = generateRss(recentPosts, baseUrl)

    return new Response(rss, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (error) {
    console.error("RSS generation error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
