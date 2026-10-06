import { escapeHtml, link } from "../html.ts"
import type { NoscriptRenderer } from "../types.ts"

function decodePath(pathname: string): string {
  try {
    return decodeURIComponent(pathname)
  } catch {
    return pathname
  }
}

export const render: NoscriptRenderer = async (ctx) => {
  // パスは利用者が自由に指定できるので必ずエスケープする
  const path = escapeHtml(decodePath(ctx.url.pathname))

  return {
    status: 404,
    noindex: true,
    body: `<div class="noscript-card">
<h1>404 Not Found</h1>
<p class="subtitle">ページが見つかりませんでした</p>
<p>リクエストされたパス <code>${path}</code> は存在しません。</p>
<pre>Kernel panic - not syncing: HTTP_404_NOT_FOUND
Unable to resolve route "${path}". Page not found. The requested resource does not exist on this server.
---[ end Kernel panic - not syncing: HTTP_404_NOT_FOUND ]---</pre>
<ul class="plain-list">
<li>${link("/", "トップページへ")}</li>
<li>${link("/blog", "ブログ一覧へ")}</li>
</ul>
</div>`,
  }
}
