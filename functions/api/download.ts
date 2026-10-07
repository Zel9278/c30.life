// GET /api/download?key=<FILES_BUCKET のキー>
// JS なしでもダウンロード数を数えられるようにするためのエンドポイント (noscript の /downloads が使う)。
// FILES_BUCKET にキーがあれば DOWNLOAD_COUNTS を +1 して、公開ホストのファイルへ 302 で飛ばす。
// SPA は今まで通り POST /api/download-counts で数えて直接開くので、ここは通らない (二重に数えない)

import { fileUrl, incrementDownloadCount } from "../../src/lib/files.ts"

interface Env {
  FILES_BUCKET: R2Bucket
  DOWNLOAD_COUNTS: KVNamespace
}

function textResponse(body: string, status: number): Response {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  })
}

// R2 のオブジェクト名の上限 (1024 バイト)。これより長いキーは head がエラーになるので先に弾く
const MAX_KEY_BYTES = 1024

async function handle(
  context: EventContext<Env, string, unknown>,
  count: boolean,
): Promise<Response> {
  const { FILES_BUCKET, DOWNLOAD_COUNTS } = context.env

  const key = new URL(context.request.url).searchParams.get("key")
  if (!key) {
    return textResponse("Bad Request", 400)
  }
  if (new TextEncoder().encode(key).length > MAX_KEY_BYTES) {
    return textResponse("Not Found", 404)
  }

  try {
    const object = await FILES_BUCKET.head(key)
    if (!object) {
      return textResponse("Not Found", 404)
    }
  } catch (error) {
    console.error("Error checking file:", error)
    return textResponse("Internal Server Error", 500)
  }

  // 数え損ねてもダウンロード自体は止めない (HEAD では数えない)
  if (count) {
    try {
      await incrementDownloadCount(DOWNLOAD_COUNTS, key)
    } catch (error) {
      console.error("Error incrementing download count:", error)
    }
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: fileUrl(key),
      // リダイレクトをキャッシュされると 2 回目以降が数えられない
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  })
}

export const onRequestGet: PagesFunction<Env> = (context) =>
  handle(context, true)

// リンクチェッカーなどの HEAD には同じ応答を返すが数えない
export const onRequestHead: PagesFunction<Env> = (context) =>
  handle(context, false)
