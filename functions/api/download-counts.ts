import {
  type DownloadCounts,
  incrementDownloadCount,
  readDownloadCounts,
} from "../../src/lib/files.ts"

interface Env {
  DOWNLOAD_COUNTS: KVNamespace
}

// Get download counts for all files or specific files
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { DOWNLOAD_COUNTS } = context.env
  const url = new URL(context.request.url)
  const keys = url.searchParams.get("keys")

  try {
    // Get all counts
    const counts = await readDownloadCounts(DOWNLOAD_COUNTS)

    // If specific keys requested, filter
    if (keys) {
      const requestedKeys = keys.split(",")
      const filtered: DownloadCounts = {}
      for (const key of requestedKeys) {
        filtered[key] = counts[key] ?? 0
      }
      return new Response(JSON.stringify({ counts: filtered }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      })
    }

    return new Response(JSON.stringify({ counts }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    console.error("Error getting download counts:", error)
    return new Response(JSON.stringify({ error: "Failed to get counts" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
  }
}

// Increment download count for a file
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { DOWNLOAD_COUNTS } = context.env

  try {
    const body = (await context.request.json()) as { key: string }
    const { key } = body

    if (!key) {
      return new Response(JSON.stringify({ error: "Missing key" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      })
    }

    // Increment count (GET /api/download/* と同じ処理)
    const count = await incrementDownloadCount(DOWNLOAD_COUNTS, key)

    return new Response(JSON.stringify({ count }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    console.error("Error incrementing download count:", error)
    return new Response(
      JSON.stringify({ error: "Failed to increment count" }),
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
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
