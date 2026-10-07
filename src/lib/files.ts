// Downloads (R2 の FILES_BUCKET) のファイル一覧まわりの純粋な処理。
// SPA (Downloads.vue)、functions/api/files・download・download-counts、noscript のレンダラーで共有する
// (R2 / Env には依存しない。KV はメソッドの形だけを受け取る)

export interface FileItem {
  name: string
  key: string
  size: number
  lastModified: string
  type: "file" | "folder"
  children?: FileItem[]
}

// R2Object のうち、ツリー作成に使うフィールドだけ
export interface FileObject {
  key: string
  size: number
  uploaded: Date
}

interface FileNode {
  [key: string]: FileNode | FileObject
}

// ブラウザから直接ダウンロードできる公開ホスト (SPA の window.open と同じ)
export const FILES_PUBLIC_BASE = "https://fs.c30.life"

function isFileObject(value: FileNode | FileObject): value is FileObject {
  return value && typeof value === "object" && "key" in value && "size" in value
}

// Build tree structure from flat file list
export function buildTree(objects: FileObject[]): FileItem[] {
  const root: FileNode = {}

  for (const obj of objects) {
    const parts = obj.key.split("/")
    let current = root

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      if (!part) continue

      if (i === parts.length - 1) {
        // This is a file
        current[part] = obj
      } else {
        // This is a folder
        if (
          !current[part] ||
          (typeof current[part] === "object" && "key" in current[part])
        ) {
          current[part] = {}
        }
        current = current[part] as FileNode
      }
    }
  }

  return nodeToFileItems(root, "")
}

function nodeToFileItems(node: FileNode, basePath: string): FileItem[] {
  const items: FileItem[] = []

  for (const [name, value] of Object.entries(node)) {
    if (isFileObject(value)) {
      // This is a file
      items.push({
        name,
        key: value.key,
        size: value.size,
        lastModified: value.uploaded.toISOString(),
        type: "file",
      })
    } else {
      // This is a folder
      const folderPath = basePath ? `${basePath}/${name}` : name
      items.push({
        name,
        key: folderPath,
        size: 0,
        lastModified: "",
        type: "folder",
        children: nodeToFileItems(value, folderPath),
      })
    }
  }

  // Sort: folders first, then files, alphabetically
  return items.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === "folder" ? -1 : 1
    }
    return a.name.localeCompare(b.name)
  })
}

export function decodeName(name: string): string {
  try {
    return decodeURIComponent(name)
  } catch {
    return name
  }
}

// パスのフォルダ名を順にたどって中身を返す。見つからなければ null
// (Downloads.vue の currentItems と同じく、name そのものか decodeName(name) で一致させる)
export function findFolder(
  tree: FileItem[],
  segments: string[],
): FileItem[] | null {
  let items = tree
  for (const folder of segments) {
    const found =
      items.find((item) => item.name === folder && item.type === "folder") ||
      items.find(
        (item) => decodeName(item.name) === folder && item.type === "folder",
      )
    if (!found?.children) return null
    items = found.children
  }
  return items
}

export function formatSize(bytes: number): string {
  if (bytes === 0) return "-"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`
}

// timeZone を省略するとブラウザのローカル時刻 (SPA と同じ)。Workers では Asia/Tokyo を渡す
export function formatDate(dateStr: string, timeZone?: string): string {
  if (!dateStr) return "-"
  const date = new Date(dateStr)
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  })
}

function encodeKeyPath(key: string): string {
  return key.split("/").map(encodeURIComponent).join("/")
}

// 公開ホスト上のダウンロード URL。キーはセグメントごとに URL エンコードする
export function fileUrl(key: string): string {
  return `${FILES_PUBLIC_BASE}/${encodeKeyPath(key)}`
}

// SPA (Downloads.vue) がこれまで window.open に渡してきた URL。キーをエンコードせずにつなぐ。
// fileUrl とはキーに % や # などを含むときに結果が変わるので、SPA の挙動を変えないために残している
export function rawFileUrl(key: string): string {
  return `${FILES_PUBLIC_BASE}/${key}`
}

// ダウンロード数を数えてから公開 URL へリダイレクトするエンドポイント (functions/api/download.ts)。
// JS なしの noscript ページから使う。キーはパスではなくクエリで渡す
// (public/_routes.json が /*.txt などを Functions から外しているので、パスの末尾に拡張子があると届かない)
export const DOWNLOAD_ENDPOINT = "/api/download"

export function downloadHref(key: string): string {
  return `${DOWNLOAD_ENDPOINT}?key=${encodeURIComponent(key)}`
}

// /downloads 配下のフォルダのページ URL
export function folderHref(segments: string[]): string {
  if (segments.length === 0) return "/downloads"
  return `/downloads/${segments.map(encodeURIComponent).join("/")}/`
}

// ダウンロード数は DOWNLOAD_COUNTS (KV) の 1 つのキーに { [ファイルのキー]: 回数 } の JSON でまとめて持つ。
// POST /api/download-counts と GET /api/download で同じ処理を使う
export const DOWNLOAD_COUNTS_KEY = "all_counts"

export type DownloadCounts = Record<string, number>

// KVNamespace のうち、ここで使うメソッドだけ
export interface DownloadCountsStore {
  get(key: string, type: "json"): Promise<unknown>
  put(key: string, value: string): Promise<void>
}

export async function readDownloadCounts(
  store: DownloadCountsStore,
): Promise<DownloadCounts> {
  const data = (await store.get(
    DOWNLOAD_COUNTS_KEY,
    "json",
  )) as DownloadCounts | null
  return data ?? {}
}

// counts[key] だと "constructor" などで Object.prototype の値を拾うので自前のプロパティだけ見る
export function downloadCountOf(counts: DownloadCounts, key: string): number {
  return Object.hasOwn(counts, key) ? counts[key] : 0
}

// 読んで +1 して書き戻す。KV に原子的な加算はないので、同時に来たリクエストの分は取りこぼすことがある
export async function incrementDownloadCount(
  store: DownloadCountsStore,
  key: string,
): Promise<number> {
  const counts = await readDownloadCounts(store)
  const count = downloadCountOf(counts, key) + 1
  counts[key] = count
  await store.put(DOWNLOAD_COUNTS_KEY, JSON.stringify(counts))
  return count
}
