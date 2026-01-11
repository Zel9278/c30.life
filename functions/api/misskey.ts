// Proxy for Misskey API to avoid CORS issues

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const requestData = (await context.request.json()) as {
      host: string
      endpoint: string
      body?: Record<string, unknown>
    }

    const { host, endpoint, body } = requestData

    const response = await fetch(`https://${host}/api/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : "{}",
    })

    const data = await response.json()

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch", details: String(error) }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    )
  }
}

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
