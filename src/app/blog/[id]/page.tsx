import { getPostData, getPostDataSync } from "@/utils/blog"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import "../../../styles/blog.css"
import Link from "next/link"
import { generate } from "@/utils/metadata"
import { ClipBoard } from "@/components/clipboard"
import { FediverseShare } from "@/components/fediverse"

type Props = {
    params: { id: string }
}

type Headings = (string | Headings)[]

export default async function Home({ params }: Props) {
    const postData = await getPostData(params.id)

    if (!postData) {
        return notFound()
    }

    const title = postData.title + " | Blog"
    const urlEncodedTitle = encodeURI(title)
    const url = `https://c30.life/blog/${params.id}`

    const xURL = `https://x.com/intent/post?url=${url}&text=${urlEncodedTitle}`
    const hatenaBookmarkURL = `https://b.hatena.ne.jp/entry/${url}`

    return (
        <>
            <main>
                <div className="card w-full bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">{postData.title}</h2>
                        <p>Publish: {postData.date}</p>

                        <div className="bg-zinc-400 w-full h-0.5 rounded" />
                        <h2>Share</h2>
                        <Link
                            href={xURL}
                            className="text-[#1da1f2] hover:underline hover:text-[#8bcdf7]"
                            target="_blank"
                        >
                            Share to X(旧Twitter)
                        </Link>
                        <Link
                            href={hatenaBookmarkURL}
                            className="text-[#00a4de] hover:underline hover:text-[#8bcdf7]"
                            target="_blank"
                        >
                            Hatena Bookmark
                        </Link>
                        <FediverseShare title={title} url={url} />
                        <ClipBoard title={title} url={url} />
                        <div className="bg-zinc-400 w-full h-0.5 rounded" />

                        <details className="collapse collapse-arrow bg-base-200">
                            <summary className="collapse-title text-xl font-medium">
                                目次
                            </summary>
                            <div className="collapse-content max-h-full">
                                <ul>
                                    {makeTocElement(
                                        postData.index,
                                        postData.indexNumbered
                                    )}
                                </ul>
                            </div>
                        </details>

                        <div className="bg-zinc-400 w-full h-0.5 rounded" />

                        <div
                            dangerouslySetInnerHTML={{
                                __html: postData.processedContent,
                            }}
                            className="blog-content"
                        />
                    </div>
                </div>
            </main>
        </>
    )
}

function makeTocElement(
    headings: Headings,
    headingNumbereds: string | Headings
): JSX.Element {
    return (
        <ul className="pl-4">
            {headings.map((heading, index) => {
                const headingNumbered = headingNumbereds[index]

                if (typeof heading === "string") {
                    const [text, num] = (headingNumbered as string).split(", ")

                    const element = (
                        <li key={index}>
                            <Link
                                href={`#i-${num}`}
                                className="hover:underline hover:text-blue-500"
                            >
                                <span>{text} </span>
                                {heading}
                            </Link>
                        </li>
                    )
                    return element
                } else {
                    return (
                        <li key={index}>
                            {makeTocElement(heading, headingNumbered)}
                        </li>
                    )
                }
            })}
        </ul>
    )
}

export function generateMetadata({ params }: Props): Metadata {
    const postData = getPostDataSync(params.id)

    if (!postData) {
        return notFound()
    }

    const title = postData.title + " | Blog"
    const description = `Publish: ${postData.date}`

    return generate(title, description, `https://c30.life/blog/${params.id}`)
}
