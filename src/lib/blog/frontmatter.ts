// ブログ記事の frontmatter パーサー (VitePress 互換のサブセット)
// API (functions/api/blog.ts) と noscript レンダラーで共有する。DOM や Workers 固有の API は使わない

export type Outline = number | [number, number] | "deep" | false

// VitePress-compatible frontmatter interface
export interface Frontmatter {
  title?: string
  date?: string
  description?: string
  tags?: string[]
  author?: string
  image?: string
  outline?: Outline
  draft?: boolean
}

// Parse frontmatter from markdown (VitePress compatible)
export function parseFrontmatter(content: string): {
  data: Frontmatter
  content: string
} {
  // Normalize line endings to LF
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
  const match = normalized.match(frontmatterRegex)

  if (!match) {
    return { data: {}, content: normalized }
  }

  const frontmatter = match[1]
  const body = match[2]

  const data: Frontmatter = {}
  let currentKey = ""
  let inArray = false
  let arrayValues: string[] = []

  for (const line of frontmatter.split("\n")) {
    // Handle array continuation
    if (inArray) {
      const arrayItemMatch = line.match(/^\s*-\s*(.+)$/)
      if (arrayItemMatch) {
        arrayValues.push(arrayItemMatch[1].replace(/^["']|["']$/g, "").trim())
        continue
      } else {
        // End of array
        if (currentKey === "tags") data.tags = arrayValues
        inArray = false
        arrayValues = []
      }
    }

    const [key, ...valueParts] = line.split(":")
    if (key && valueParts.length > 0) {
      const rawValue = valueParts.join(":").trim()
      const value = rawValue.replace(/^["']|["']$/g, "")
      const trimmedKey = key.trim()

      // Check if this starts an array (empty value or inline array)
      if (rawValue === "" || rawValue === "[]") {
        currentKey = trimmedKey
        inArray = true
        arrayValues = []
        continue
      }

      // Handle inline array like tags: [tag1, tag2]
      if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
        const arrayContent = rawValue.slice(1, -1)
        const items = arrayContent
          .split(",")
          .map((item) => item.trim().replace(/^["']|["']$/g, ""))
          .filter(Boolean)
        if (trimmedKey === "tags") data.tags = items
        continue
      }

      switch (trimmedKey) {
        case "title":
          data.title = value
          break
        case "date":
          data.date = value
          break
        case "description":
          data.description = value
          break
        case "author":
          data.author = value
          break
        case "image":
          data.image = value
          break
        case "outline":
          if (value === "deep") data.outline = "deep"
          else if (value === "false") data.outline = false
          else if (value.startsWith("[")) {
            const nums = value
              .slice(1, -1)
              .split(",")
              .map((n) => parseInt(n.trim(), 10))
            if (nums.length === 2) data.outline = [nums[0], nums[1]]
          } else {
            data.outline = parseInt(value, 10)
          }
          break
        case "draft":
          data.draft = value === "true"
          break
      }
    }
  }

  // Handle trailing array
  if (inArray && currentKey === "tags") {
    data.tags = arrayValues
  }

  return { data, content: body.trim() }
}
