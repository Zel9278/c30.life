import { type Link, linkSections, linksPage } from "../../data/links.ts"
import { escapeHtml, link, safeUrl } from "../html.ts"
import type { NoscriptRenderer } from "../types.ts"

// SPA のバナー画像サイズ (src/components/Links.vue) と同じ既定値
const DEFAULT_BANNER_WIDTH = 200
const DEFAULT_BANNER_HEIGHT = 40

function isExternal(href: string): boolean {
  return /^https?:/i.test(href)
}

function relOf(item: Link): string | undefined {
  return [item.rel, isExternal(item.href) ? "noopener noreferrer" : undefined]
    .filter(Boolean)
    .join(" ")
}

function renderListItem(item: Link): string {
  return `<li class="link-item">${link(item.href, item.title, {
    rel: item.rel,
    external: isExternal(item.href),
  })}</li>`
}

function renderBannerItem(item: Link): string {
  // 画像がないものは SPA と同じくタイトル文字を表示する
  if (!item.image) {
    return `<li class="banner-item link-item">${link(item.href, item.title, {
      rel: item.rel,
      external: isExternal(item.href),
    })}</li>`
  }
  const rel = relOf(item)
  const width = item.width ?? DEFAULT_BANNER_WIDTH
  const height = item.height ?? DEFAULT_BANNER_HEIGHT
  return `<li class="banner-item"><a href="${escapeHtml(safeUrl(item.href))}"${
    rel ? ` rel="${escapeHtml(rel)}"` : ""
  }><img src="${escapeHtml(safeUrl(item.image))}" alt="${escapeHtml(
    item.alt ?? item.title,
  )}" width="${escapeHtml(width)}" height="${escapeHtml(height)}" loading="lazy" decoding="async"></a></li>`
}

// Links の各セクション (見出し + リンク群)。他ページから再利用できるように分けておく
export function renderLinkSections(headingLevel: 2 | 3 = 2): string {
  const h = `h${headingLevel}`
  return linkSections
    .map((section) => {
      const items =
        section.kind === "list"
          ? `<ul class="link-list">${section.links.map(renderListItem).join("")}</ul>`
          : `<ul class="banner-container">${section.links.map(renderBannerItem).join("")}</ul>`
      return `<section aria-labelledby="links-${escapeHtml(section.id)}">
<${h} id="links-${escapeHtml(section.id)}">${escapeHtml(section.title)}</${h}>
${items}
</section>`
    })
    .join("\n")
}

export const render: NoscriptRenderer = async () => ({
  body: `<div class="noscript-card">
<h1>${escapeHtml(linksPage.title)}</h1>
<p class="subtitle">${escapeHtml(linksPage.subtitle)}</p>
<div class="ns-divider" role="presentation"></div>
${renderLinkSections()}
</div>`,
})
