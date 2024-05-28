import { getPostData, getPostDataSync } from "@/utils/blog"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import "../../../styles/blog.css"
import Link from "next/link"
import { generate } from "@/utils/metadata"
import { ClipBoard } from "@/components/clipboard"
import { FediverseShare } from "@/components/fediverse"
import { Window } from "@/components/window"

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
                <div>
                    <Window title="広告" id="advertisement" isClose>
                        <div className="p-2">
                            <Link
                                href="https://misskey.art"
                                target="_blank"
                                className="text-[#aaa] hover:text-[#fff] hover:underline"
                            >
                                [広告] Misskey.art -
                                創作活動をする人や見る人を歓迎するMisskeyのサーバーです。🔗
                            </Link>
                            <br />
                            <Link
                                href="https://misskey.io"
                                target="_blank"
                                className="text-[#aaa] hover:text-[#fff] hover:underline"
                            >
                                [広告] Misskey.io -
                                株式会社MisskeyHQが運営する地球で生まれた分散マイクロブログSNSです。🔗
                            </Link>
                        </div>
                    </Window>
                </div>

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
                        <ClipBoard title="This URL" text={`${title} ${url}`} />
                        <ClipBoard
                            title="RSS Link"
                            text="https://c30.life/blog/blog.atom"
                        />
                        <div className="bg-zinc-400 w-full h-0.5 rounded" />

                        <details className="collapse collapse-arrow bg-base-200">
                            <summary className="collapse-title text-xl font-medium">
                                目次
                            </summary>
                            <div className="collapse-content max-h-full">
                                <ul>
                                    {makeTocElement(
                                        postData.index,
                                        postData.indexNumbered,
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
    headingNumbereds: string | Headings,
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
