import type { Outline } from "../../src/lib/blog/frontmatter.ts"
import {
  type BlogPostSummary,
  getPost,
  isValidPostId,
  listPosts,
  paginate,
} from "../../src/lib/blog/posts.ts"

interface Env {
  BLOG_BUCKET: R2Bucket
  BLOG_VIEWS: KVNamespace
  BLOG_EDIT_KEY?: string
}

interface BlogPostDetail extends BlogPostSummary {
  content: string
  author?: string
  image?: string
  outline?: Outline
  draft?: boolean
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
        const stored = await getPost(context.env.BLOG_BUCKET, id)

        if (!stored) {
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

        const { meta: data, content } = stored

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
        await new Promise((resolve) => setTimeout(resolve, 100 * 2 ** attempt))
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
    const filteredPosts = await listPosts(
      context.env.BLOG_BUCKET,
      context.env.BLOG_VIEWS,
      { includeDrafts },
    )

    // 範囲外のページは従来どおり空配列を返す (最終ページへは丸めない)
    const { posts, pagination } = paginate(filteredPosts, page, limit, {
      clampToLastPage: false,
    })

    return new Response(JSON.stringify({ posts, pagination }), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
        // Editor views (drafts) must always be fresh; public listings can
        // be cached briefly at the edge/browser to cut repeat R2 traffic.
        "Cache-Control": includeDrafts
          ? "no-store"
          : "public, max-age=30, stale-while-revalidate=300",
      },
    })
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
    if (!isValidPostId(id)) {
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
