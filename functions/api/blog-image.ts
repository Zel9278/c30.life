interface Env {
  BLOG_BUCKET: R2Bucket
  BLOG_EDIT_KEY?: string
}

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/svg+xml": "svg",
}

const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Edit-Key",
}

function verifyEditKey(request: Request, env: Env): boolean {
  const key = request.headers.get("X-Edit-Key")
  const envKey = env.BLOG_EDIT_KEY
  return !!key && !!envKey && key === envKey
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  })
}

// POST /api/blog-image  → upload (multipart/form-data, field: "file")
export const onRequestPost: PagesFunction<Env> = async (context) => {
  if (!verifyEditKey(context.request, context.env)) {
    return json({ error: "Unauthorized" }, 401)
  }

  const contentType = context.request.headers.get("content-type") || ""
  if (!contentType.includes("multipart/form-data")) {
    return json({ error: "multipart/form-data required" }, 400)
  }

  let formData: FormData
  try {
    formData = await context.request.formData()
  } catch {
    return json({ error: "Failed to parse form data" }, 400)
  }

  const file = formData.get("file")
  if (!(file instanceof File)) {
    return json({ error: "No file provided" }, 400)
  }

  const ext = ALLOWED_TYPES[file.type]
  if (!ext) {
    return json({ error: `Unsupported type: ${file.type}` }, 400)
  }

  if (file.size > MAX_SIZE) {
    return json({ error: "File too large (max 10 MB)" }, 400)
  }

  // images/<timestamp>-<random>.<ext>
  const key = `images/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  try {
    await context.env.BLOG_BUCKET.put(key, file.stream(), {
      httpMetadata: { contentType: file.type },
    })
  } catch {
    return json({ error: "Upload failed" }, 500)
  }

  return json({ key, url: `/api/blog-image/${key}` })
}

// GET /api/blog-image/images/<key>  → serve image
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const params = context.params as { path?: string[] }
  const pathParts = params.path ?? []
  const key = pathParts.join("/")

  if (!key) {
    return json({ error: "No key" }, 400)
  }

  try {
    const object = await context.env.BLOG_BUCKET.get(key)
    if (!object) {
      return new Response("Not Found", { status: 404, headers: corsHeaders })
    }

    const headers = new Headers(corsHeaders)
    headers.set("Content-Type", object.httpMetadata?.contentType ?? "application/octet-stream")
    headers.set("Cache-Control", "public, max-age=31536000, immutable")

    return new Response(object.body, { headers })
  } catch {
    return new Response("Internal Server Error", { status: 500, headers: corsHeaders })
  }
}

// DELETE /api/blog-image?key=images/...  → delete
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  if (!verifyEditKey(context.request, context.env)) {
    return json({ error: "Unauthorized" }, 401)
  }

  const url = new URL(context.request.url)
  const key = url.searchParams.get("key")
  if (!key || !key.startsWith("images/")) {
    return json({ error: "Invalid key" }, 400)
  }

  try {
    await context.env.BLOG_BUCKET.delete(key)
    return json({ ok: true })
  } catch {
    return json({ error: "Delete failed" }, 500)
  }
}

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { headers: corsHeaders })
}
