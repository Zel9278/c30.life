// Proxy for Mastodon/Pleroma API to avoid CORS issues

export const onRequestGet: PagesFunction = async (context) => {
  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  }

  try {
    const url = new URL(context.request.url)
    const host = url.searchParams.get("host")
    const endpoint = url.searchParams.get("endpoint")

    if (!host || !endpoint) {
      return new Response(
        JSON.stringify({ error: "Missing host or endpoint" }),
        {
          status: 400,
          headers: corsHeaders,
        },
      )
    }

    const response = await fetch(`https://${host}/api/v1/${endpoint}`)
    const data = await response.json()

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: corsHeaders,
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error"
    console.error("Mastodon API error:", errorMessage)
    return new Response(
      JSON.stringify({ error: "Failed to fetch", details: errorMessage }),
      {
        status: 500,
        headers: corsHeaders,
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
