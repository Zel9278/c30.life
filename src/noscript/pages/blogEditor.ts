import { escapeHtml, link } from "../html.ts"
import type { NoscriptRenderer } from "../types.ts"

// /blog/new/edit, /blog/:id/edit, /blog/preview
// エディター・プレビューはブラウザ上でしか動かないので、案内だけ出す (記事の中身は読まない)
export const render: NoscriptRenderer = async (ctx) => {
  const id = ctx.params.id ?? ""
  const lower = id.toLowerCase()
  const isPreview = lower === "preview"
  const isNew = lower === "new"
  const title = isPreview ? "Preview" : isNew ? "New Post" : "Edit Post"
  const postLink =
    !isPreview && !isNew && /^[A-Za-z0-9_-]+$/.test(id)
      ? `<li>${link(`/blog/${id}`, "この記事を見る")}</li>`
      : ""

  return {
    noindex: true,
    status: 200,
    body: `<div class="noscript-card">
<h1>${escapeHtml(title)}</h1>
<p>エディター/プレビューの利用にはJavaScriptが必要です。</p>
<ul class="plain-list">
${postLink}<li>${link("/blog", "ブログ一覧へ")}</li>
</ul>
</div>`,
  }
}
