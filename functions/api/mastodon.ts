// Proxy for Mastodon/Pleroma API to avoid CORS issues

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const url = new URL(context.request.url)
    const host = url.searchParams.get("host")
    const endpoint = url.searchParams.get("endpoint")

    if (!host || !endpoint) {
      return new Response(
        JSON.stringify({ error: "Missing host or endpoint" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      )
    }

    const response = await fetch(`https://${host}/api/v1/${endpoint}`)
    const data = await response.json()

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
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
