import { Feed } from "feed"
import { getSortedPostsData } from "@/utils/blog"

const baseURL = "https://c30.life"

export async function GET(request: Request) {
    const feed = new Feed({
        title: "C30.Life",
        description: "C30.Lifeのブログ",
        id: baseURL,
        link: baseURL,
        language: "ja",
        copyright: "© 2024",
        favicon: `${baseURL}/favicon.ico`,
        feedLinks: {
            rss: `${baseURL}/blog.atom`,
        },
    })

    const posts = getSortedPostsData()

    posts.forEach((post) => {
        feed.addItem({
            title: post.title,
            id: `${baseURL}/blog/${post.id}`,
            link: `${baseURL}/blog/${post.id}`,
            description: post.title,
            content: post.title,
            date: new Date(post.date),
        })
    })

    return new Response(feed.atom1(), {
        headers: {
            "Content-Type": "application/atom+xml",
        },
    })
}
