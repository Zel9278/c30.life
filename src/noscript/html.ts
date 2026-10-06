// noscript 用 HTML 文字列を組み立てるための小さなユーティリティ

export function escapeHtml(text: string | number): string {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

// http(s) / mailto / 相対パス / # だけを許可し、それ以外 (javascript: など) は # にする
export function safeUrl(url: string): string {
  // ブラウザの URL パーサーと同じく、途中のタブ・改行と前後の制御文字・空白を除いてから判定する
  // (そうしないと "java\nscript:" などが素通りする)
  const trimmed = url
    .replace(/[\t\n\r]/g, "")
    // biome-ignore lint/suspicious/noControlCharactersInRegex: URL 仕様の C0 制御文字の除去
    .replace(/^[\u0000-\u0020]+|[\u0000-\u0020]+$/g, "")
  if (/^(https?:|mailto:)/i.test(trimmed)) return trimmed
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return "#"
  return trimmed
}

export function link(
  href: string,
  text: string,
  attrs: { rel?: string; external?: boolean } = {},
): string {
  const rel = [attrs.rel, attrs.external ? "noopener noreferrer" : undefined]
    .filter(Boolean)
    .join(" ")
  return `<a href="${escapeHtml(safeUrl(href))}"${rel ? ` rel="${escapeHtml(rel)}"` : ""}>${escapeHtml(text)}</a>`
}

// <noscript> は JS 有効時に生テキストとして扱われ、最初の </noscript で終わる。
// 注入する HTML にそれが含まれると以降が本物の HTML として解釈されるので無害化する。
export function neutralizeNoscript(html: string): string {
  return html.replace(/<\/(noscript)/gi, "&lt;/$1")
}
