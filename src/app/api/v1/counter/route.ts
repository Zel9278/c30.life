import { NextResponse } from "next/server"
import Counter from "@/.counter.json"
import { writeFileSync } from "fs"
import { getSortedPostsData } from "@/utils/blog"

type CountData = {
    [key: string]: number
}

export async function POST(request: Request) {
    const { blogId } = await request.json()
    const counter = Counter as CountData

    if (blogId) {
        const posts = getSortedPostsData()
        const post = posts.find((p) => p.id === blogId)

        if (post) {
            counter[blogId]++
            writeFileSync(
                "./src/.counter.json",
                JSON.stringify(counter, null, 4),
            )

            return NextResponse.json({
                count: counter[blogId],
            })
        } else {
            return new Response("Not Found", {
                status: 404,
            })
        }
    } else {
        counter.count++
        writeFileSync("./src/.counter.json", JSON.stringify(counter, null, 4))

        return NextResponse.json({
            count: counter.count,
        })
    }
}
