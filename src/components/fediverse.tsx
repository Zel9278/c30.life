"use client"

import Link from "next/link"
import { useState } from "react"

type Props = {
  title: string
  url: string
}

export function FediverseShare({ title, url }: Props) {
  const [misskeyURL, setMisskeyURL] = useState("")
  const [mastodonURL, setMastodonURL] = useState("")

  const text = encodeURI(`${title} ${url}`)

  return (
    <>
      <Link
        href="#"
        className="text-[#00a4de] hover:underline hover:text-[#8bcdf7]"
        onClick={() => {
          const stf = document.getElementById(
            "share-to-fediverse",
          ) as HTMLDialogElement
          if (stf) {
            stf.showModal()
          } else {
            console.error("element not found")
          }
        }}
      >
        Share to Fediverse(Misskey / Mastodon)
      </Link>
      <dialog id="share-to-fediverse" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">
            Share To Fediverse(Misskey / Mastodon)
          </h3>
          <div>
            <div className="flex">
              <input
                type="misskeyURL"
                name="misskey"
                id="misskey"
                placeholder="misskey url here"
                className="input input-bordered input-accent w-full max-w-xs m-1"
                onChange={(e) => setMisskeyURL(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-primary m-1"
                onClick={() => {
                  window.open(
                    `https://${misskeyURL}/share?text=${text}&visibility=public&localOnly=0`,
                  )
                  setMisskeyURL("")

                  const input = document.getElementById(
                    "misskey",
                  ) as HTMLInputElement
                  input.value = ""
                }}
              >
                Share to Misskey
              </button>
            </div>
            <p className="text-center">example: misskey.io</p>
            <div className="flex">
              <input
                type="mastodonURL"
                name="mastodon"
                id="mastodon"
                placeholder="mastodon url here"
                className="input input-bordered input-accent w-full max-w-xs m-1"
                onChange={(e) => setMastodonURL(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-primary m-1"
                onClick={() => {
                  window.open(`https://${mastodonURL}/share?text=${text}`)
                  setMastodonURL("")

                  const input = document.getElementById(
                    "mastodon",
                  ) as HTMLInputElement
                  input.value = ""
                }}
              >
                Share to Mastodon
              </button>
            </div>
            <p className="text-center">example: mastodon.social</p>
          </div>
          <div className="modal-action">
            <form method="dialog">
              <button type="submit" className="btn btn-primary">
                Close
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  )
}
