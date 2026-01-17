interface Env {
  FILES_BUCKET: R2Bucket
}

interface FileItem {
  name: string
  key: string
  size: number
  lastModified: string
  type: "file" | "folder"
  children?: FileItem[]
}

interface FileNode {
  [key: string]: FileNode | R2Object
}

// Build tree structure from flat file list
function buildTree(objects: R2Object[]): FileItem[] {
  const root: FileNode = {}

  for (const obj of objects) {
    const parts = obj.key.split("/")
    let current = root

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      if (!part) continue

      if (i === parts.length - 1) {
        // This is a file
        current[part] = obj
      } else {
        // This is a folder
        if (
          !current[part] ||
          (typeof current[part] === "object" && "key" in current[part])
        ) {
          current[part] = {}
        }
        current = current[part] as FileNode
      }
    }
  }

  return nodeToFileItems(root, "")
}

function nodeToFileItems(node: FileNode, basePath: string): FileItem[] {
  const items: FileItem[] = []

  for (const [name, value] of Object.entries(node)) {
    if (
      value &&
      typeof value === "object" &&
      "key" in value &&
      "size" in value
    ) {
      // This is an R2Object (file)
      const obj = value as R2Object
      items.push({
        name,
        key: obj.key,
        size: obj.size,
        lastModified: obj.uploaded.toISOString(),
        type: "file",
      })
    } else {
      // This is a folder
      const folderPath = basePath ? `${basePath}/${name}` : name
      items.push({
        name,
        key: folderPath,
        size: 0,
        lastModified: "",
        type: "folder",
        children: nodeToFileItems(value as FileNode, folderPath),
      })
    }
  }

  // Sort: folders first, then files, alphabetically
  return items.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === "folder" ? -1 : 1
    }
    return a.name.localeCompare(b.name)
  })
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
