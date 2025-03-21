import { getPostData, getPostDataSync } from "@/utils/blog"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import "../../../styles/blog.css"
import Link from "next/link"
import Image from "next/image"
import { generate } from "@/utils/metadata"
import { ClipBoard } from "@/components/clipboard"
import { FediverseShare } from "@/components/fediverse"
import { Window } from "@/components/window"
import Counter from "@/components/counter"
import "highlight.js/styles/github-dark.css"
import DOMPurify from "isomorphic-dompurify"
import parse from "html-react-parser"
import type { JSX } from "react"
import { ImageViewerProvider } from "@/contexts/ImageViewerContext"
import { ImageViewerHandler } from "@/components/ImageViewerHandler"

type Props = {
  params: Promise<{ id: string }>
}

type Headings = (string | Headings)[]

export default async function Home({ params }: Props) {
  const { id } = await params
  const postData = await getPostData(id)

  if (!postData) {
    return notFound()
  }

  const title = `${postData.title} | Blog`
  const urlEncodedTitle = encodeURI(title)
  const url = `https://c30.life/blog/${id}`

  const xURL = `https://x.com/intent/post?url=${url}&text=${urlEncodedTitle}`
  const hatenaBookmarkURL = `https://b.hatena.ne.jp/entry/${url}`

  return (
    <>
      <div>
        <Window title="広告" id="advertisement" isClose isWindowDVD>
          <div className="p-2">
            <Link
              href="https://misskey.art"
              target="_blank"
              className="flex text-[#aaa] hover:text-[#fff] hover:underline"
            >
              <p>
                [広告] Misskey.art -
                創作活動をする人や見る人を歓迎するMisskeyのサーバーです。🔗
              </p>
              <Image
                src="/mi-art.png"
                alt="misskey.art"
                width={150}
                height={150}
              />
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
          <Counter blogId={postData.id} />

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
          <ClipBoard title="RSS Link" text="https://c30.life/blog/blog.atom" />
          <div className="bg-zinc-400 w-full h-0.5 rounded" />

          <details className="collapse collapse-arrow bg-base-200">
            <summary className="collapse-title text-xl font-medium">
              目次
            </summary>
            <div className="collapse-content max-h-full">
              <ul>{makeTocElement(postData.index, postData.indexNumbered)}</ul>
            </div>
          </details>

          <div className="bg-zinc-400 w-full h-0.5 rounded" />

          <div className="blog-content">
            <ImageViewerProvider>
              {parse(DOMPurify.sanitize(postData.processedContent))}
              <ImageViewerHandler />
            </ImageViewerProvider>
          </div>
        </div>
      </div>
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
            <li key={text + num}>
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
        }
        const uniqueKey = typeof heading === "string" ? heading : index
        return (
          <li key={uniqueKey}>{makeTocElement(heading, headingNumbered)}</li>
        )
      })}
    </ul>
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const postData = await getPostData(id)

  if (!postData) {
    return notFound()
  }

  const title = `${postData.title} | Blog`
  const description = `Publish: ${postData.date}`

  return generate(title, description, `https://c30.life/blog/${id}`)
}
