// Proxy for fxtwitter API to fetch X/Twitter status data

export const onRequestGet: PagesFunction = async (context) => {
  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  }

  try {
    const url = new URL(context.request.url)
    const statusId = url.searchParams.get("id")
    const username = url.searchParams.get("user")

    if (!statusId && !username) {
      return new Response(
        JSON.stringify({ error: "Missing status id or username" }),
        {
          status: 400,
          headers: corsHeaders,
        },
      )
    }

    // Fetch profile if username is provided
    if (username) {
      const response = await fetch(`https://api.fxtwitter.com/${username}`, {
        headers: {
          "User-Agent": "c30.life-blog (+https://c30.life)",
        },
      })

      const data = await response.json()

      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: corsHeaders,
      })
    }

    // Fetch status
    const response = await fetch(
      `https://api.fxtwitter.com/status/${statusId}`,
      {
        headers: {
          "User-Agent": "c30.life-blog (+https://c30.life)",
        },
      },
    )

    const data = await response.json()

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: corsHeaders,
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error"
    console.error("fxtwitter API error:", errorMessage)
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
