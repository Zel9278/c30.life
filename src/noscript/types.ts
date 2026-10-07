export interface NoscriptEnv {
  BLOG_BUCKET: R2Bucket
  BLOG_VIEWS: KVNamespace
  FILES_BUCKET: R2Bucket
  DOWNLOAD_COUNTS: KVNamespace
  ASSETS: Fetcher
}

export interface NoscriptContext {
  url: URL
  // ルートパターンにマッチした値 (例: /blog/:id の id)
  params: Record<string, string>
  env: NoscriptEnv
  waitUntil: (promise: Promise<unknown>) => void
}

export interface NoscriptResult {
  // noscript-container の中に入れる HTML (レイアウトは呼び出し側で付ける)
  body: string
  status?: number
  // OGP / <title> の上書き。未指定ならルート定義の値を使う
  title?: string
  description?: string
  image?: string
  noindex?: boolean
}

export type NoscriptRenderer = (ctx: NoscriptContext) => Promise<NoscriptResult>
