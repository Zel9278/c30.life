import { NextResponse } from "next/server"
import { writeFileSync, readFileSync } from "node:fs"
import { getSortedPostsData } from "@/utils/blog"

export async function POST(request: Request) {
  const { blogId } = await request.json()
  const counter = JSON.parse(readFileSync("./src/.counter.json", "utf-8"))

  if (blogId) {
    const posts = getSortedPostsData()
    const post = posts.find((p) => p.id === blogId)

    if (post) {
      counter[blogId] = counter[blogId] ? counter[blogId] + 1 : 1
      writeFileSync("./src/.counter.json", JSON.stringify(counter, null, 4))

      console.log(counter)

      return NextResponse.json({
        count: counter[blogId],
      })
    }

    return new Response("Not Found", {
      status: 404,
    })
  }
  counter.count++
  writeFileSync("./src/.counter.json", JSON.stringify(counter, null, 4))

  return NextResponse.json({
    count: counter.count,
  })
}
