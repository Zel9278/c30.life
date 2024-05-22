import { getSortedPostsData } from "@/utils/blog"
import Link from "next/link"

export default function Home() {
    const allPostsData = getSortedPostsData()

    return (
        <>
            <main>
                <ul className="grid">
                    {allPostsData.map(({ id, date, title }) => (
                        <li key={id}>
                            <div className="card w-96 bg-base-300 shadow-xl">
                                <div className="card-body">
                                    <h2 className="card-title">{title}</h2>
                                    <p>Publish: {date}</p>
                                    <div className="card-actions justify-end">
                                        <Link href={`/blog/${id}`}>
                                            <button className="btn btn-primary">
                                                Read More
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </main>
        </>
    )
}
