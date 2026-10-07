// R2 (BLOG_BUCKET) / KV (BLOG_VIEWS) からブログ記事を読むための純粋なヘルパー
// バインディングは引数で受け取り、Env には依存しない。API と noscript レンダラーで共有する

import { type Frontmatter, parseFrontmatter } from "./frontmatter.ts"

export const BLOG_PAGE_SIZE = 8
const MAX_PAGE_SIZE = 50

export interface BlogPostSummary {
  id: string
  title: string
  date: string
  views: number
  description?: string
  tags?: string[]
  draft?: boolean
}

export interface BlogPagination {
  page: number
  limit: number
  totalPosts: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface StoredPost {
  meta: Frontmatter
  content: string
}

// 記事 ID として扱える文字列か (英数字・_・- のみ、先頭 _ と予約語は不可)
export function isValidPostId(id: string): boolean {
  return (
    /^[A-Za-z0-9_-]+$/.test(id) &&
    !id.startsWith("_") &&
    id !== "new" &&
    id !== "preview"
  )
}

// `${id}.md` を読んで frontmatter を分解する。存在しなければ null
export async function getPost(
  bucket: R2Bucket,
  id: string,
): Promise<StoredPost | null> {
  const object = await bucket.get(`${id}.md`)
  if (!object) return null
  const { data, content } = parseFrontmatter(await object.text())
  return { meta: data, content }
}

// 閲覧数を読むだけ (加算しない)。読めなければ 0
export async function readViews(
  views: KVNamespace,
  id: string,
): Promise<number> {
  try {
    const value = await views.get(`views:${id}`)
    const parsed = value ? parseInt(value, 10) : 0
    return Number.isFinite(parsed) ? parsed : 0
  } catch {
    return 0
  }
}

// バケット直下のオブジェクトを全部列挙する (キーの昇順)。
// 画像は images/ 以下にあるので delimiter で除外し、1000 件を超えても cursor で続きを取る
async function listTopLevelObjects(bucket: R2Bucket): Promise<R2Object[]> {
  const objects: R2Object[] = []
  let cursor: string | undefined
  do {
    const listed = await bucket.list({ delimiter: "/", cursor })
    objects.push(...listed.objects)
    cursor = listed.truncated ? listed.cursor : undefined
  } while (cursor)
  return objects
}

async function listTopLevelKeys(bucket: R2Bucket): Promise<string[]> {
  return (await listTopLevelObjects(bucket)).map((object) => object.key)
}

// 記事ファイルとして扱うキーか (`<有効な ID>.md`)
function isPostKey(key: string): boolean {
  return key.endsWith(".md") && isValidPostId(key.slice(0, -3))
}

export interface PublishedPostSource extends StoredPost {
  id: string
  // R2 へのアップロード日時 (frontmatter に date が無いときの代わりに使う)
  uploaded: Date
}

// 公開済み (draft でない、有効な ID の) 記事を本文込みで列挙する。順序はキーの昇順。
// 閲覧数は読まない。RSS など本文が必要な用途向け
export async function listPublishedPostSources(
  bucket: R2Bucket,
): Promise<PublishedPostSource[]> {
  const objects = (await listTopLevelObjects(bucket)).filter((object) =>
    isPostKey(object.key),
  )

  const fetched = await Promise.all(
    objects.map(async (object): Promise<PublishedPostSource | null> => {
      const id = object.key.slice(0, -3)
      try {
        const stored = await getPost(bucket, id)
        if (!stored || stored.meta.draft) return null
        return { id, uploaded: object.uploaded, ...stored }
      } catch (e) {
        console.error(`Failed to fetch post ${id}:`, e)
        return null
      }
    }),
  )

  return fetched.filter((post): post is PublishedPostSource => post !== null)
}

// 記事一覧 (日付の新しい順)。includeDrafts が false なら draft: true を除外する
export async function listPosts(
  bucket: R2Bucket,
  views: KVNamespace,
  options: { includeDrafts?: boolean } = {},
): Promise<BlogPostSummary[]> {
  const keys = (await listTopLevelKeys(bucket)).filter(isPostKey)

  keys.sort((a, b) => b.localeCompare(a))

  // 記事ごとに独立した R2/KV の往復なので並列に取る
  const fetchedPosts = await Promise.all(
    keys.map(async (key): Promise<BlogPostSummary | null> => {
      const postId = key.replace(/\.md$/, "")

      try {
        const [file, viewCount] = await Promise.all([
          bucket.get(key),
          views.get(`views:${postId}`).catch(() => null),
        ])
        if (!file) return null

        const viewsCount = viewCount ? parseInt(viewCount, 10) : 0
        const text = await file.text()
        const { data } = parseFrontmatter(text)

        return {
          id: postId,
          title: data.title || postId,
          date: data.date || "",
          description: data.description,
          tags: data.tags,
          draft: data.draft,
          views: viewsCount,
        }
      } catch (e) {
        console.error(`Failed to fetch post ${postId}:`, e)
        return null
      }
    }),
  )

  const allPosts = fetchedPosts.filter(
    (post): post is BlogPostSummary => post !== null,
  )

  const filteredPosts = options.includeDrafts
    ? allPosts
    : allPosts.filter((post) => !post.draft)

  filteredPosts.sort((a, b) => {
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    return dateB.getTime() - dateA.getTime()
  })

  return filteredPosts
}

// 公開済み (draft でない) 記事だけの一覧
export function listPublishedPosts(
  bucket: R2Bucket,
  views: KVNamespace,
): Promise<BlogPostSummary[]> {
  return listPosts(bucket, views, { includeDrafts: false })
}

function toInt(value: number, fallback: number): number {
  return Number.isFinite(value) ? Math.trunc(value) : fallback
}

// ページ分割。page は 1 以上、limit は 1..50 に丸める。
// clampToLastPage が true (既定) なら page を最終ページ以下にも丸める
export function paginate<T>(
  posts: T[],
  page: number,
  limit: number,
  options: { clampToLastPage?: boolean } = {},
): { posts: T[]; pagination: BlogPagination } {
  const safeLimit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, toInt(limit, BLOG_PAGE_SIZE)),
  )
  const totalPosts = posts.length
  const totalPages = Math.ceil(totalPosts / safeLimit)

  let safePage = Math.max(1, toInt(page, 1))
  if (options.clampToLastPage !== false) {
    safePage = Math.min(safePage, Math.max(1, totalPages))
  }

  const startIndex = (safePage - 1) * safeLimit
  return {
    posts: posts.slice(startIndex, startIndex + safeLimit),
    pagination: {
      page: safePage,
      limit: safeLimit,
      totalPosts,
      totalPages,
      hasNext: safePage < totalPages,
      hasPrev: safePage > 1,
    },
  }
}
