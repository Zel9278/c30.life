import { getSortedPostsData } from "@/utils/blog"
import { generate } from "@/utils/metadata"
import type { Metadata } from "next"
import Link from "next/link"

export default function Home() {
  const allPostsData = getSortedPostsData()

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-4 !items-center !justify-center">
          {allPostsData.map(({ id, date, title }) => (
            <div key={id} className="card bg-base-200 w-96 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">{title}</h2>
                <p>Publish: {date}</p>
                <div className="card-actions justify-end">
                  <Link href={`/blog/${id}`}>
                    <button type="button" className="btn btn-primary">
                      Read More
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export function generateMetadata(): Metadata {
  return generate("Blog", "c30のブログです。", "/blog")
}
