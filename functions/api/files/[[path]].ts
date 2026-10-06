import { buildTree } from "../../../src/lib/files.ts"

interface Env {
  FILES_BUCKET: R2Bucket
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const pathParts = context.params.path as string[] | undefined
  const path = pathParts?.join("/") || ""

  // If no path or path is "list", return file listing
  if (!path || path === "list") {
    try {
      const listed = await context.env.FILES_BUCKET.list()
      const tree = buildTree(listed.objects)

      return new Response(JSON.stringify({ files: tree }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      })
    } catch (error) {
      console.error("Error listing files:", error)
      return new Response(JSON.stringify({ error: "Failed to list files" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      })
    }
  }

  // Otherwise, download the file
  try {
    const object = await context.env.FILES_BUCKET.get(path)

    if (!object) {
      return new Response("Not Found", { status: 404 })
    }

    const headers = new Headers()
    headers.set(
      "Content-Type",
      object.httpMetadata?.contentType || "application/octet-stream",
    )
    headers.set("Content-Length", object.size.toString())
    headers.set(
      "Content-Disposition",
      `attachment; filename="${path.split("/").pop()}"`,
    )
    headers.set("Access-Control-Allow-Origin", "*")

    return new Response(object.body, { headers })
  } catch (error) {
    console.error("Error downloading file:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
