// Cloudflare Pages Middleware
// HTML リクエストに対して、ルートごとの OGP タグと <noscript> の中身を注入する

import { escapeHtml } from "../src/noscript/html.ts"
import { type NoscriptEnv, renderNoscript } from "../src/noscript/index.ts"

type Env = NoscriptEnv

const DEFAULT_IMAGE = "https://c30.life/c30.png"

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
    if (response.status === 304) {
      // 静的な index.html は全ルートで同じ ETag なので、304 のままだとルートごとに変わる
      // 内容 (OGP / noscript) が更新されない。HTML なら条件ヘッダーを外して本体を取り直す
      const headers = new Headers(request.headers)
      headers.delete("If-None-Match")
      headers.delete("If-Modified-Since")
      const fresh = await env.ASSETS.fetch(new Request(request, { headers }))
      if (!fresh.headers.get("content-type")?.includes("text/html")) {
        return response
      }
      response = fresh
    }
  } catch (e) {
    console.error("Middleware next() error:", e)
    return new Response("Internal Server Error", { status: 500 })
  }

  // Only modify HTML responses
  const contentType = response.headers.get("content-type")
  if (!contentType?.includes("text/html")) {
    return response
  }

  const page = await renderNoscript(url, env, (promise) =>
    context.waitUntil(promise),
  )
  const image = page.image ?? DEFAULT_IMAGE

  const rewriter = new HTMLRewriter()
    .on("title", {
      element(el) {
        el.setInnerContent(page.title)
      },
    })
    .on('meta[name="description"]', {
      element(el) {
        el.setAttribute("content", page.description)
      },
    })
    .on('meta[property="og:title"]', {
      element(el) {
        el.setAttribute("content", page.title)
      },
    })
    .on('meta[property="og:description"]', {
      element(el) {
        el.setAttribute("content", page.description)
      },
    })
    .on('meta[property="og:image"]', {
      element(el) {
        el.setAttribute("content", image)
      },
    })
    .on('meta[name="twitter:image"]', {
      element(el) {
        el.setAttribute("content", image)
      },
    })
    .on('meta[property="og:type"]', {
      element(el) {
        el.before(
          `<meta property="og:url" content="${escapeHtml(url.href)}" />\n  `,
          { html: true },
        )
      },
    })
    .on("head", {
      element(el) {
        if (page.noindex) {
          el.append('<meta name="robots" content="noindex" />\n', {
            html: true,
          })
        }
      },
    })
    .on("body > noscript", {
      element(el) {
        el.setInnerContent(page.html, { html: true })
      },
    })

  // Copy headers but exclude ones that no longer match the rewritten body
  const newHeaders = new Headers()
  for (const [key, value] of response.headers.entries()) {
    const lowerKey = key.toLowerCase()
    if (
      lowerKey !== "content-type" &&
      lowerKey !== "content-length" &&
      lowerKey !== "content-encoding" &&
      lowerKey !== "etag" &&
      lowerKey !== "last-modified"
    ) {
      newHeaders.set(key, value)
    }
  }
  newHeaders.set("Content-Type", "text/html; charset=utf-8")

  return rewriter.transform(
    new Response(response.body, {
      status: page.status,
      headers: newHeaders,
    }),
  )
}
