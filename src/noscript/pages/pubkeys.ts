import { getPubkeyContents, pubkeys, pubkeysPage } from "../../data/pubkeys.ts"
import { escapeHtml } from "../html.ts"
import type { NoscriptRenderer } from "../types.ts"

export function renderPubkeysBody(): string {
  // コピーボタンは JS 専用なので出さない
  const keys = pubkeys
    .map(
      (key) => `<section>
<h2>${escapeHtml(key.title)}</h2>
${getPubkeyContents(key.content)
  .map((content) => `<pre><code>${escapeHtml(content)}</code></pre>`)
  .join("\n")}
</section>`,
    )
    .join("\n")

  return `<section class="noscript-card">
<h1>${escapeHtml(pubkeysPage.title)}</h1>
<p class="subtitle">${escapeHtml(pubkeysPage.subtitle)}</p>
<div class="ns-divider"></div>
${keys}
</section>`
}

export const render: NoscriptRenderer = async () => ({
  body: renderPubkeysBody(),
})
