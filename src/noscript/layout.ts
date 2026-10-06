import {
  footerText,
  menuItems,
  type NavIcon,
  siteTitle,
} from "../data/navigation.ts"
import { escapeHtml } from "./html.ts"

function isActive(pathname: string, to: string): boolean {
  const path = pathname.toLowerCase()
  if (to === "/") return path === "/"
  return path === to || path.startsWith(`${to}/`)
}

function renderIcon(icon: NavIcon): string {
  if (icon.type === "image") {
    return `<img class="ns-menu-item-icon ns-invert" src="${escapeHtml(icon.src)}" alt="">`
  }
  return `<svg class="ns-menu-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${escapeHtml(icon.d)}"/></svg>`
}

// SPA のヘッダー (src/components/Header.vue) と同じ見た目のメニュー。
// JS が無いのでチェックボックスの :checked で開閉する (ラベルとオーバーレイのクリックで切り替わる)
function renderHeader(pathname: string): string {
  const items = menuItems
    .map((item) => {
      const current = isActive(pathname, item.to) ? ' aria-current="page"' : ""
      return `<li><a class="ns-menu-item" href="${escapeHtml(item.to)}"${current}>${renderIcon(item.icon)}<span>${escapeHtml(item.label)}</span></a></li>`
    })
    .join("")

  return `<input type="checkbox" id="ns-menu-toggle" class="ns-menu-toggle" aria-label="メニューを開く" aria-controls="ns-menu">
<header class="ns-header">
<div class="ns-header-inner">
<a class="ns-logo" href="/">${escapeHtml(siteTitle)}</a>
<label class="ns-menu-button" for="ns-menu-toggle" aria-hidden="true"><span class="ns-menu-lines"><span></span><span></span><span></span></span></label>
</div>
</header>
<label class="ns-menu-overlay" for="ns-menu-toggle" aria-hidden="true"></label>
<nav id="ns-menu" class="ns-menu" aria-label="メニュー"><ul class="ns-menu-list">${items}</ul></nav>`
}

export function renderLayout(pathname: string, body: string): string {
  return `${renderHeader(pathname)}
<div class="noscript-container">
${body}
<footer class="noscript-footer">
<p>このページはJavaScriptなしでも閲覧できます。JavaScriptを有効にすると、より多くの機能が利用できます。</p>
<p>${escapeHtml(footerText)}</p>
</footer>
</div>`
}

// JavaScript が必須のページ用の本文
export function renderJsRequired(title: string, message: string): string {
  return `<div class="noscript-card">
<h1>${escapeHtml(title)}</h1>
<p>${escapeHtml(message)}</p>
<p><a href="/">トップページへ</a></p>
</div>`
}
