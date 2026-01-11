interface Env {
  BLOG_BUCKET: R2Bucket
  BLOG_VIEWS: KVNamespace
}

interface BlogPost {
  id: string
  title: string
  date: string
  views: number
}

interface BlogPostDetail extends BlogPost {
  content: string
}

// Parse frontmatter from markdown
function parseFrontmatter(content: string): {
  data: { title?: string; date?: string }
  content: string
} {
  // Normalize line endings to LF
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
  const match = normalized.match(frontmatterRegex)

  if (!match) {
    return { data: {}, content: normalized }
  }

  const frontmatter = match[1]
  const body = match[2]

  const data: { title?: string; date?: string } = {}
  for (const line of frontmatter.split("\n")) {
    const [key, ...valueParts] = line.split(":")
    if (key && valueParts.length > 0) {
      const value = valueParts
        .join(":")
        .trim()
        .replace(/^["']|["']$/g, "")
      if (key.trim() === "title") data.title = value
      if (key.trim() === "date") data.date = value
    }
  }

  return { data, content: body.trim() }
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url)
  const id = url.searchParams.get("id")

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  }

  // Get single post
  if (id) {
    try {
      const object = await context.env.BLOG_BUCKET.get(`${id}.md`)

      if (!object) {
        return new Response(JSON.stringify({ error: "Post not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        })
      }

      // Increment view count
      const viewKey = `views:${id}`
      const currentViews = await context.env.BLOG_VIEWS.get(viewKey)
      const views = (currentViews ? parseInt(currentViews, 10) : 0) + 1
      await context.env.BLOG_VIEWS.put(viewKey, views.toString())

      const text = await object.text()
      const { data, content } = parseFrontmatter(text)

      const post: BlogPostDetail = {
        id,
        title: data.title || id,
        date: data.date || "",
        content,
        views,
      }

      return new Response(JSON.stringify(post), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      })
    } catch (error) {
      return new Response(JSON.stringify({ error: "Failed to fetch post" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      })
    }
  }

  // List all posts
  try {
    const listed = await context.env.BLOG_BUCKET.list()
    const posts: BlogPost[] = []

    for (const object of listed.objects) {
      // Skip files starting with underscore
      if (object.key.startsWith("_")) continue
      // Only process .md files
      if (!object.key.endsWith(".md")) continue

      const id = object.key.replace(/\.md$/, "")
      const file = await context.env.BLOG_BUCKET.get(object.key)

      if (file) {
        const text = await file.text()
        const { data } = parseFrontmatter(text)

        // Get view count
        const viewKey = `views:${id}`
        const viewCount = await context.env.BLOG_VIEWS.get(viewKey)
        const views = viewCount ? parseInt(viewCount, 10) : 0

        posts.push({
          id,
          title: data.title || id,
          date: data.date || "",
          views,
        })
      }
    }

    // Sort by date descending
    posts.sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      return dateB.getTime() - dateA.getTime()
    })

    return new Response(JSON.stringify(posts), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to list posts" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    })
  }
}

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
