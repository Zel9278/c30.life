import { listPublishedPostSources } from "../../src/lib/blog/posts.ts"

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
        post.description || `${stripMarkdown(post.content).slice(0, 300)}...`
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
    // 公開済みの記事だけ (下書きと "_" 始まりなど無効な ID は除外)。キーの昇順
    const sources = await listPublishedPostSources(env.BLOG_BUCKET)
    const posts: BlogPost[] = sources.map(
      ({ id, meta, content, uploaded }) => ({
        id,
        title: meta.title || id,
        date: meta.date || uploaded.toISOString().split("T")[0],
        description: meta.description,
        content,
      }),
    )

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
