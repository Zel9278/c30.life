interface Env {
  BLOG_BUCKET: R2Bucket
  BLOG_VIEWS: KVNamespace
  BLOG_EDIT_KEY?: string
}

interface BlogPost {
  id: string
  title: string
  date: string
  views: number
  description?: string
  tags?: string[]
  draft?: boolean
}

interface BlogPostDetail extends BlogPost {
  content: string
  author?: string
  image?: string
  outline?: number | [number, number] | "deep" | false
  draft?: boolean
}

// VitePress-compatible frontmatter interface
interface Frontmatter {
  title?: string
  date?: string
  description?: string
  tags?: string[]
  author?: string
  image?: string
  outline?: number | [number, number] | "deep" | false
  draft?: boolean
}

// Parse frontmatter from markdown (VitePress compatible)
function parseFrontmatter(content: string): {
  data: Frontmatter
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

  const data: Frontmatter = {}
  let currentKey = ""
  let inArray = false
  let arrayValues: string[] = []

  for (const line of frontmatter.split("\n")) {
    // Handle array continuation
    if (inArray) {
      const arrayItemMatch = line.match(/^\s*-\s*(.+)$/)
      if (arrayItemMatch) {
        arrayValues.push(arrayItemMatch[1].replace(/^["']|["']$/g, "").trim())
        continue
      } else {
        // End of array
        if (currentKey === "tags") data.tags = arrayValues
        inArray = false
        arrayValues = []
      }
    }

    const [key, ...valueParts] = line.split(":")
    if (key && valueParts.length > 0) {
      const rawValue = valueParts.join(":").trim()
      const value = rawValue.replace(/^["']|["']$/g, "")
      const trimmedKey = key.trim()

      // Check if this starts an array (empty value or inline array)
      if (rawValue === "" || rawValue === "[]") {
        currentKey = trimmedKey
        inArray = true
        arrayValues = []
        continue
      }

      // Handle inline array like tags: [tag1, tag2]
      if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
        const arrayContent = rawValue.slice(1, -1)
        const items = arrayContent
          .split(",")
          .map((item) => item.trim().replace(/^["']|["']$/g, ""))
          .filter(Boolean)
        if (trimmedKey === "tags") data.tags = items
        continue
      }

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
        case "author":
          data.author = value
          break
        case "image":
          data.image = value
          break
        case "outline":
          if (value === "deep") data.outline = "deep"
          else if (value === "false") data.outline = false
          else if (value.startsWith("[")) {
            const nums = value
              .slice(1, -1)
              .split(",")
              .map((n) => parseInt(n.trim(), 10))
            if (nums.length === 2) data.outline = [nums[0], nums[1]]
          } else {
            data.outline = parseInt(value, 10)
          }
          break
        case "draft":
          data.draft = value === "true"
          break
      }
    }
  }

  // Handle trailing array
  if (inArray && currentKey === "tags") {
    data.tags = arrayValues
  }

  return { data, content: body.trim() }
}

// Verify edit key for authentication
function verifyEditKey(request: Request, env: Env): boolean {
  const key = request.headers.get("X-Edit-Key")
  const envKey = env.BLOG_EDIT_KEY
  return !!key && !!envKey && key === envKey
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url)
  const id = url.searchParams.get("id")
  const raw = url.searchParams.get("raw")

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Edit-Key",
  }

  // Verify key check endpoint
  if (id === "_verify") {
    if (!verifyEditKey(context.request, context.env)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      })
    }
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    })
  }

  // Get single post with raw content for editing
  if (id && raw === "true") {
    if (!verifyEditKey(context.request, context.env)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      })
    }

    try {
      const object = await context.env.BLOG_BUCKET.get(`${id}.md`)
      if (!object) {
        return new Response(JSON.stringify({ error: "Post not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        })
      }

      const text = await object.text()
      return new Response(JSON.stringify({ id, raw: text }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error"
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
  }

  // Get single post
  if (id) {
    const maxRetries = 2

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const object = await context.env.BLOG_BUCKET.get(`${id}.md`)

        if (!object) {
          return new Response(JSON.stringify({ error: "Post not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          })
        }

        let views = 0
        try {
          const currentViews = await context.env.BLOG_VIEWS.get(`views:${id}`)
          views = (currentViews ? parseInt(currentViews, 10) : 0) + 1
          context.waitUntil(
            context.env.BLOG_VIEWS.put(`views:${id}`, views.toString()),
          )
        } catch {
          views = 0
        }

        const text = await object.text()
        const { data, content } = parseFrontmatter(text)

        const post: BlogPostDetail = {
          id,
          title: data.title || id,
          date: data.date || "",
          description: data.description,
          tags: data.tags,
          author: data.author,
          image: data.image,
          outline: data.outline,
          draft: data.draft,
          content,
          views,
        }

        return new Response(JSON.stringify(post), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        })
      } catch (error) {
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
        await new Promise((resolve) =>
          setTimeout(resolve, 100 * Math.pow(2, attempt)),
        )
      }
    }
  }

  // List all posts with pagination
  const page = parseInt(url.searchParams.get("page") || "1", 10)
  const limit = parseInt(url.searchParams.get("limit") || "8", 10)
  // Include drafts only for editors
  const includeDrafts =
    url.searchParams.get("includeDrafts") === "true" &&
    verifyEditKey(context.request, context.env)

  try {
    const listed = await context.env.BLOG_BUCKET.list()

    const validObjects = listed.objects.filter(
      (obj) => !obj.key.startsWith("_") && obj.key.endsWith(".md"),
    )

    validObjects.sort((a, b) => b.key.localeCompare(a.key))

    // First, fetch all posts to determine which are drafts
    const allPosts: BlogPost[] = []

    for (const object of validObjects) {
      const postId = object.key.replace(/\.md$/, "")

      try {
        const file = await context.env.BLOG_BUCKET.get(object.key)
        if (!file) continue

        let views = 0
        try {
          const viewCount = await context.env.BLOG_VIEWS.get(`views:${postId}`)
          views = viewCount ? parseInt(viewCount, 10) : 0
        } catch {
          // Ignore view count errors
        }

        const text = await file.text()
        const { data } = parseFrontmatter(text)

        allPosts.push({
          id: postId,
          title: data.title || postId,
          date: data.date || "",
          description: data.description,
          tags: data.tags,
          draft: data.draft,
          views,
        })
      } catch (e) {
        console.error(`Failed to fetch post ${postId}:`, e)
      }
    }

    // Filter out drafts unless includeDrafts is true
    const filteredPosts = includeDrafts
      ? allPosts
      : allPosts.filter((post) => !post.draft)

    filteredPosts.sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      return dateB.getTime() - dateA.getTime()
    })

    const totalPosts = filteredPosts.length
    const totalPages = Math.ceil(totalPosts / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const posts = filteredPosts.slice(startIndex, endIndex)

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

// Update or create post
export const onRequestPut: PagesFunction<Env> = async (context) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Edit-Key",
  }

  if (!verifyEditKey(context.request, context.env)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    })
  }

  try {
    const body = (await context.request.json()) as {
      id: string
      content: string
    }
    const { id, content } = body

    if (!id || !content) {
      return new Response(JSON.stringify({ error: "Missing id or content" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      })
    }

    // Validate id format
    if (!/^[a-zA-Z0-9-_]+$/.test(id)) {
      return new Response(JSON.stringify({ error: "Invalid id format" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      })
    }

    // Save to R2
    await context.env.BLOG_BUCKET.put(`${id}.md`, content, {
      httpMetadata: {
        contentType: "text/markdown",
      },
    })

    return new Response(JSON.stringify({ success: true, id }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error"
    console.error("Blog update error:", errorMessage)
    return new Response(
      JSON.stringify({ error: "Failed to update post", details: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    )
  }
}

// Delete post
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Edit-Key",
  }

  if (!verifyEditKey(context.request, context.env)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    })
  }

  const url = new URL(context.request.url)
  const id = url.searchParams.get("id")

  if (!id) {
    return new Response(JSON.stringify({ error: "Missing id" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    })
  }

  try {
    // Check if post exists
    const object = await context.env.BLOG_BUCKET.get(`${id}.md`)
    if (!object) {
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      })
    }

    // Delete from R2
    await context.env.BLOG_BUCKET.delete(`${id}.md`)

    // Optionally delete view count
    try {
      await context.env.BLOG_VIEWS.delete(`views:${id}`)
    } catch {
      // Ignore view count deletion errors
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error"
    console.error("Blog delete error:", errorMessage)
    return new Response(
      JSON.stringify({ error: "Failed to delete post", details: errorMessage }),
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
      "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Edit-Key",
    },
  })
}
