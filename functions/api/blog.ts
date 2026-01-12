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
    const maxRetries = 2

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Fetch post first (critical)
        const object = await context.env.BLOG_BUCKET.get(`${id}.md`)

        if (!object) {
          return new Response(JSON.stringify({ error: "Post not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          })
        }

        // Fetch view count separately (non-critical, don't fail if this errors)
        let views = 0
        try {
          const currentViews = await context.env.BLOG_VIEWS.get(`views:${id}`)
          views = (currentViews ? parseInt(currentViews, 10) : 0) + 1

          // Update view count in background (don't await)
          context.waitUntil(
            context.env.BLOG_VIEWS.put(`views:${id}`, views.toString()),
          )
        } catch {
          // Ignore view count errors - not critical for displaying the post
          views = 0
        }

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
        // If this is the last attempt, return error
        if (attempt === maxRetries) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error"
          console.error(`Blog fetch failed for ${id}:`, errorMessage)
          return new Response(
            JSON.stringify({
              error: "Failed to fetch post",
              details: errorMessage,
            }),
            {
              status: 500,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            },
          )
        }
        // Wait before retry (exponential backoff)
        await new Promise((resolve) =>
          setTimeout(resolve, 100 * Math.pow(2, attempt)),
        )
      }
    }
  }

  // List all posts with pagination
  const page = parseInt(url.searchParams.get("page") || "1", 10)
  const limit = parseInt(url.searchParams.get("limit") || "8", 10)

  try {
    const listed = await context.env.BLOG_BUCKET.list()

    // Filter valid files first
    const validObjects = listed.objects.filter(
      (obj) => !obj.key.startsWith("_") && obj.key.endsWith(".md"),
    )

    // Sort by key (filename) descending first for consistent ordering
    // We'll re-sort by date after fetching, but this helps with pagination
    validObjects.sort((a, b) => b.key.localeCompare(a.key))

    const totalPosts = validObjects.length
    const totalPages = Math.ceil(totalPosts / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit

    // Only fetch the posts we need for this page
    const pageObjects = validObjects.slice(startIndex, endIndex)
    const posts: BlogPost[] = []

    // Process posts sequentially to avoid connection limit issues
    for (const object of pageObjects) {
      const id = object.key.replace(/\.md$/, "")

      try {
        const file = await context.env.BLOG_BUCKET.get(object.key)
        if (!file) continue

        // Fetch view count (non-critical)
        let views = 0
        try {
          const viewCount = await context.env.BLOG_VIEWS.get(`views:${id}`)
          views = viewCount ? parseInt(viewCount, 10) : 0
        } catch {
          // Ignore view count errors
        }

        const text = await file.text()
        const { data } = parseFrontmatter(text)

        posts.push({
          id,
          title: data.title || id,
          date: data.date || "",
          views,
        })
      } catch (e) {
        console.error(`Failed to fetch post ${id}:`, e)
        // Continue to next post
      }
    }

    // Sort by date descending
    posts.sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      return dateB.getTime() - dateA.getTime()
    })

    return new Response(
      JSON.stringify({
        posts,
        pagination: {
          page,
          limit,
          totalPosts,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      }),
      {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    )
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error"
    console.error("Blog list error:", errorMessage)
    return new Response(
      JSON.stringify({ error: "Failed to list posts", details: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    )
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
