import {
  countCharacters,
  formatDateJa,
  formatNumber,
  readingMinutes,
  toDatetimeAttr,
} from "../../lib/blog/format.ts"
import { renderBlogMarkdown, type TocItem } from "../../lib/blog/markdown.ts"
import { getPost, isValidPostId, readViews } from "../../lib/blog/posts.ts"
import { escapeHtml, link } from "../html.ts"
import type { NoscriptRenderer, NoscriptResult } from "../types.ts"
import { renderTags } from "./blogList.ts"

// BlogPost.vue の共有 URL と同じく本番ドメインで固定する
const SITE_ORIGIN = "https://c30.life"

const BACK_LINK = `<p>${link("/blog", "← ブログ一覧に戻る")}</p>`

function notFound(): NoscriptResult {
  return {
    status: 404,
    noindex: true,
    title: "Not Found - c30.life",
    body: `<div class="noscript-card">
<h1>記事が見つかりません</h1>
<p class="subtitle">お探しの記事は存在しないか、削除された可能性があります。</p>
${BACK_LINK}
</div>`,
  }
}

// 相対パスの画像はリクエスト URL 基準で絶対 URL にする。http(s) 以外は使わない
function absoluteImage(
  image: string | undefined,
  base: URL,
): string | undefined {
  if (!image) return undefined
  try {
    const url = new URL(image.trim(), base)
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : undefined
  } catch {
    return undefined
  }
}

// 見出しレベルに合わせて入れ子の <ul> を組み立てる
export function renderToc(toc: TocItem[]): string {
  if (toc.length === 0) return ""

  // 開いている <ul> ごとの見出しレベル
  const stack: number[] = []
  let html = ""

  for (const item of toc) {
    const top = stack[stack.length - 1]
    if (top === undefined || item.level > top) {
      html += "<ul>"
      stack.push(item.level)
    } else {
      html += "</li>"
      while (stack.length > 1 && item.level < stack[stack.length - 1]) {
        stack.pop()
        html += "</ul>"
        // h2 → h4 → h3 のように途中のレベルへ戻ったときは、親の中に新しい階層を作る
        if (item.level > stack[stack.length - 1]) {
          html += "<ul>"
          stack.push(item.level)
          break
        }
        html += "</li>"
      }
    }
    html += renderTocLink(item)
  }

  html += "</li>"
  while (stack.length > 1) {
    stack.pop()
    html += "</ul></li>"
  }
  html += "</ul>"

  return `<details class="toc">
<summary>目次</summary>
<nav aria-label="目次">${html}</nav>
</details>`
}

function renderTocLink(item: TocItem): string {
  return `<li><a href="${escapeHtml(`#${item.id}`)}">${escapeHtml(item.text)}</a>`
}

export const render: NoscriptRenderer = async (ctx) => {
  const id = ctx.params.id ?? ""
  if (!isValidPostId(id)) return notFound()

  const stored = await getPost(ctx.env.BLOG_BUCKET, id)
  // 下書きは存在しない記事として扱い、タイトル等も一切出さない
  if (!stored || stored.meta.draft === true) return notFound()

  const { meta, content } = stored
  const title = meta.title || id
  const views = await readViews(ctx.env.BLOG_VIEWS, id)
  const { html, toc } = renderBlogMarkdown(content, {
    mode: "static",
    outline: meta.outline,
  })

  const characters = countCharacters(content)
  const dateLabel = formatDateJa(meta.date ?? "")
  const datetime = toDatetimeAttr(meta.date ?? "")
  const metaItems = [
    dateLabel
      ? datetime
        ? `<time datetime="${escapeHtml(datetime)}">${escapeHtml(dateLabel)}</time>`
        : `<span>${escapeHtml(dateLabel)}</span>`
      : "",
    meta.author ? `<span>${escapeHtml(meta.author)}</span>` : "",
    `<span>${escapeHtml(formatNumber(views))} views</span>`,
    `<span>${escapeHtml(formatNumber(characters))}文字</span>`,
    `<span>約${readingMinutes(characters)}分で読了</span>`,
  ].filter(Boolean)

  const description = meta.description
    ? `<p class="muted"><em>${escapeHtml(meta.description)}</em></p>`
    : ""

  const permalink = `${SITE_ORIGIN}/blog/${id}`
  const shareTitle = `${title} | Blog`
  const shareToX = `https://x.com/intent/post?url=${encodeURIComponent(permalink)}&text=${encodeURIComponent(shareTitle)}`

  const body = `<div class="noscript-card">
${BACK_LINK}
<article>
<header>
<h1>${escapeHtml(title)}</h1>
<p class="post-meta">${metaItems.join(" · ")}</p>
${renderTags(meta.tags)}
${description}
</header>
<div class="ns-divider"></div>
${renderToc(toc)}
<div class="blog-content">
${html}
</div>
</article>
<div class="ns-divider"></div>
<section aria-label="共有">
<p>${link(shareToX, "Share to X", { external: true })}</p>
<p class="small muted">URL: <code>${escapeHtml(permalink)}</code></p>
</section>
<div class="ns-divider"></div>
${BACK_LINK}
</div>`

  return {
    body,
    title: `${title} - c30.life`,
    description: meta.description || `${title}の記事`,
    image: absoluteImage(meta.image, ctx.url),
  }
}
