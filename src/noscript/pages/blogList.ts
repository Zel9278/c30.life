import {
  formatDateJa,
  formatNumber,
  toDatetimeAttr,
} from "../../lib/blog/format.ts"
import {
  BLOG_PAGE_SIZE,
  type BlogPagination,
  type BlogPostSummary,
  listPublishedPosts,
  paginate,
} from "../../lib/blog/posts.ts"
import { cached } from "../cache.ts"
import { escapeHtml, link } from "../html.ts"
import type { NoscriptRenderer } from "../types.ts"

// 公開済み記事の一覧 (R2 の list + 記事ごとの get が重いので 60 秒キャッシュ)
const LIST_CACHE_TTL = 60

function pageHref(page: number): string {
  return page <= 1 ? "/blog" : `/blog?page=${page}`
}

function renderDate(date: string): string {
  const label = formatDateJa(date)
  if (!label) return ""
  const datetime = toDatetimeAttr(date)
  return datetime
    ? `<time datetime="${escapeHtml(datetime)}">${escapeHtml(label)}</time>`
    : `<span>${escapeHtml(label)}</span>`
}

export function renderTags(tags: string[] | undefined): string {
  if (!tags || tags.length === 0) return ""
  const items = tags
    .map((tag) => `<li class="ns-badge">${escapeHtml(tag)}</li>`)
    .join("")
  return `<ul class="badge-group post-tags" aria-label="タグ">${items}</ul>`
}

function renderPost(post: BlogPostSummary): string {
  const meta = [
    renderDate(post.date),
    `${escapeHtml(formatNumber(post.views))} views`,
  ]
    .filter(Boolean)
    .join(" · ")
  const description = post.description
    ? `<p>${escapeHtml(post.description)}</p>`
    : ""

  return `<li><article>
<h2>${link(`/blog/${encodeURIComponent(post.id)}`, post.title)}</h2>
<p class="post-meta">${meta}</p>
${description}${renderTags(post.tags)}
</article></li>`
}

function renderPagination(pagination: BlogPagination): string {
  if (pagination.totalPages <= 1) return ""
  const { page, totalPages } = pagination

  const prev = pagination.hasPrev
    ? `<a href="${escapeHtml(pageHref(page - 1))}" rel="prev" aria-label="前のページ">←</a>`
    : `<span aria-hidden="true">←</span>`
  const next = pagination.hasNext
    ? `<a href="${escapeHtml(pageHref(page + 1))}" rel="next" aria-label="次のページ">→</a>`
    : `<span aria-hidden="true">→</span>`

  const numbers: string[] = []
  for (let n = 1; n <= totalPages; n++) {
    numbers.push(
      n === page
        ? `<a href="${escapeHtml(pageHref(n))}" aria-current="page">${n}</a>`
        : `<a href="${escapeHtml(pageHref(n))}">${n}</a>`,
    )
  }

  return `<nav class="pagination" aria-label="ページ">${prev}${numbers.join("")}${next}</nav>`
}

function renderPageInfo(pagination: BlogPagination): string {
  if (pagination.totalPosts === 0) return ""
  const { page, limit, totalPosts } = pagination
  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, totalPosts)
  return `<p class="muted small center">${totalPosts}件中 ${from}-${to}件を表示</p>`
}

export const render: NoscriptRenderer = async (ctx) => {
  const header = `<h1>Blog</h1>
<p class="subtitle">c30のブログです</p>
<p>${link("/api/rss", "RSS")}</p>
<div class="ns-divider"></div>`

  let allPosts: BlogPostSummary[]
  try {
    allPosts = await cached(ctx, "blog-list", LIST_CACHE_TTL, () =>
      listPublishedPosts(ctx.env.BLOG_BUCKET, ctx.env.BLOG_VIEWS),
    )
  } catch (e) {
    console.error("noscript blog list failed:", e)
    return {
      body: `<div class="noscript-card">
${header}
<p class="center">記事の読み込みに失敗しました</p>
</div>`,
    }
  }

  // キャッシュ経由でも下書きは絶対に出さない
  const published = allPosts.filter((post) => !post.draft)
  const requestedPage = parseInt(ctx.url.searchParams.get("page") ?? "1", 10)
  const { posts, pagination } = paginate(
    published,
    requestedPage,
    BLOG_PAGE_SIZE,
  )

  const list =
    posts.length === 0
      ? `<p class="muted center">まだ記事がありません</p>`
      : `<ul class="post-list">${posts.map(renderPost).join("\n")}</ul>`

  return {
    body: `<div class="noscript-card">
${header}
${list}
${renderPagination(pagination)}
${renderPageInfo(pagination)}
</div>`,
  }
}
