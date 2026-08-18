type Env = Record<string, never>

interface OGPData {
  url: string
  title: string | null
  description: string | null
  image: string | null
  siteName: string | null
  favicon: string | null
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url)
  const targetUrl = url.searchParams.get("url")

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: "Missing url parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const parsedUrl = new URL(targetUrl)

    // Fetch the page
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; OGPBot/1.0; +https://c30.life)",
        Accept: "text/html,application/xhtml+xml",
      },
      cf: {
        cacheTtl: 3600, // Cache for 1 hour
        cacheEverything: true,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`)
    }

    const html = await response.text()

    // Parse OGP meta tags
    const ogpData: OGPData = {
      url: targetUrl,
      title: null,
      description: null,
      image: null,
      siteName: null,
      favicon: null,
    }

    // Extract meta tags using regex (no DOM parser in CF Workers)
    const getMetaContent = (property: string, html: string): string | null => {
      // Try og: and twitter: prefixes
      const patterns = [
        new RegExp(
          `<meta[^>]+(?:property|name)=["'](?:og:|twitter:)?${property}["'][^>]+content=["']([^"']+)["']`,
          "i",
        ),
        new RegExp(
          `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:|twitter:)?${property}["']`,
          "i",
        ),
      ]

      for (const pattern of patterns) {
        const match = html.match(pattern)
        if (match) return match[1]
      }
      return null
    }

    // Get title
    ogpData.title =
      getMetaContent("title", html) ||
      html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ||
      null

    // Get description
    ogpData.description = getMetaContent("description", html)

    // Get image
    ogpData.image = getMetaContent("image", html)
    // Make image URL absolute
    if (ogpData.image && !ogpData.image.startsWith("http")) {
      ogpData.image = new URL(ogpData.image, targetUrl).href
    }

    // Get site name
    ogpData.siteName = getMetaContent("site_name", html) || parsedUrl.hostname

    // Get favicon
    const faviconPatterns = [
      /<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i,
      /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut )?icon["']/i,
      /<link[^>]+rel=["']apple-touch-icon["'][^>]+href=["']([^"']+)["']/i,
    ]

    for (const pattern of faviconPatterns) {
      const match = html.match(pattern)
      if (match) {
        ogpData.favicon = match[1]
        break
      }
    }

    // Make favicon URL absolute
    if (ogpData.favicon && !ogpData.favicon.startsWith("http")) {
      ogpData.favicon = new URL(ogpData.favicon, targetUrl).href
    }

    // Fallback to default favicon path
    if (!ogpData.favicon) {
      ogpData.favicon = `${parsedUrl.origin}/favicon.ico`
    }

    return new Response(JSON.stringify(ogpData), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
  }
}
