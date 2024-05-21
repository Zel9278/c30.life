import { getPostData } from "@/utils/blog"
import Link from "next/link"
import Style from "../../../styles/Blog.module.css"

export default function Home({ params }: { params: { id: string } }) {
    const postData = getPostData(params.id)

    return (
        <>
            <main>
                <div className="card w-full bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">{postData.title}</h2>
                        <p>Publish: {postData.date}</p>

                        <div className="bg-zinc-400 w-full h-0.5 rounded" />

                        <h2>目次</h2>
                        <ul>
                            {postData.index.map((index, v) => (
                                <li key={v}>
                                    <Link href={`#${index}`}>{index}</Link>
                                </li>
                            ))}
                        </ul>

                        <div className="bg-zinc-400 w-full h-0.5 rounded" />

                        <div
                            dangerouslySetInnerHTML={{
                                __html: postData.contentHtml,
                            }}
                            className="grid gap-4 mt-4"
                        />
                    </div>
                </div>
            </main>
        </>
    )
}
