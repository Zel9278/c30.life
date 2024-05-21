import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { remark } from "remark"
import html from "remark-html"

const postsDirectory = path.join(process.cwd(), "src/blog")

export function getSortedPostsData() {
    const fileNames = fs.readdirSync(postsDirectory)
    const allPostsData = fileNames.map((fileName) => {
        const id = fileName.replace(/\.md$/, "")

        const fullPath = path.join(postsDirectory, fileName)
        const fileContents = fs.readFileSync(fullPath, "utf8")

        const matterResult = matter(fileContents)

        return {
            id,
            ...(matterResult.data as { date: string; title: string }),
        }
    })

    return allPostsData.sort((a, b) => {
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)

        if (dateA < dateB) {
            return 1
        } else {
            return -1
        }
    })
}

export function getPostData(id: string) {
    const fullPath = path.join(postsDirectory, `${id}.md`)
    const fileContents = fs.readFileSync(fullPath, "utf8")

    const matterResult = matter(fileContents)

    const processedContent = remark()
        .use(html)
        .processSync(matterResult.content)
    const contentHtml = processedContent.toString()

    const index: string[] = []
    let index1 = 0
    let index2 = 0
    let index3 = 0

    contentHtml.split("\n").forEach((v) => {
        if (v.startsWith("<h1>")) {
            index1++
            index2 = 0
            index3 = 0
            index.push(`${index1}. ${v.replace(/<[^>]*>/g, "")}`)
        } else if (v.startsWith("<h2>")) {
            index2++
            index3 = 0
            index.push(`    ${index1}.${index2} ${v.replace(/<[^>]*>/g, "")}`)
        } else if (v.startsWith("<h3>")) {
            index3++
            index.push(
                `        ${index1}.${index2}.${index3} ${v.replace(
                    /<[^>]*>/g,
                    ""
                )}`
            )
        }
    })

    return {
        id,
        contentHtml,
        index,
        ...(matterResult.data as { date: string; title: string }),
    }
}
