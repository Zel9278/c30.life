import { productIcon } from "../../data/productIcons.ts"
import {
  formatUptime,
  loadProductStatuses,
  type ProductStatuses,
  productCategories,
  productHost,
  productHue,
  productMonogram,
  productStateLabels,
  productsPage,
  statusOf,
  statusPageUrl,
} from "../../data/products.ts"
import { cached } from "../cache.ts"
import { escapeHtml, link } from "../html.ts"
import type { NoscriptContext, NoscriptRenderer } from "../types.ts"

function summary(statuses: ProductStatuses | null): string {
  const all = productCategories.flatMap((c) => c.products)
  const parts = [`<span class="product-chip">${all.length} サービス</span>`]
  if (statuses) {
    const states = all.map((p) => statusOf(statuses, p)?.state)
    for (const state of ["up", "maintenance", "down"] as const) {
      const n = states.filter((s) => s === state).length
      if (n || state === "up")
        parts.push(
          `<span class="product-state ${state}">${n} ${productStateLabels[state]}</span>`,
        )
    }
    if (statuses.checkedAt) {
      const time = new Date(statuses.checkedAt).toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Tokyo",
      })
      parts.push(`<span class="muted small">${escapeHtml(time)} 時点</span>`)
    }
  } else {
    parts.push(
      '<span class="muted small">稼働状況を取得できませんでした</span>',
    )
  }
  const nav = productCategories
    .map(
      (c) =>
        `<a href="#category-${escapeHtml(c.name.toLowerCase())}">${escapeHtml(c.name)} <span class="muted">${c.products.length}</span></a>`,
    )
    .join("")
  return `<div class="product-summary">${parts.join("")}<nav class="product-nav" aria-label="カテゴリ">${nav}</nav></div>`
}

export function renderProductsBody(
  statuses: ProductStatuses | null = null,
): string {
  const sections = productCategories
    .map((category) => {
      const items = category.products
        .map((product) => {
          const hue = productHue(product.url)
          const favicon = productIcon(product.url)
          const icon = favicon
            ? `<span class="product-icon image${favicon.light ? " light" : ""}" aria-hidden="true"><img src="${escapeHtml(favicon.src)}" alt="" width="40" height="40" loading="lazy"></span>`
            : `<span class="product-icon" style="background:hsl(${hue} 55% 22%);color:hsl(${hue} 85% 78%)" aria-hidden="true">${escapeHtml(productMonogram(product.url))}</span>`
          const status = statusOf(statuses, product)
          const state = status
            ? `<a class="product-state ${status.state}" href="${escapeHtml(statusPageUrl(product.url))}" target="_blank" rel="noopener noreferrer">${productStateLabels[status.state]} · ${formatUptime(status.uptime30d)}${status.latency !== null ? ` · ${status.latency}ms` : ""}</a>`
            : ""
          return `<li class="product-card">
<div class="product-head">${icon}<div>${link(product.url, product.title, { external: true })}<span class="muted small product-host">${escapeHtml(productHost(product.url))}</span></div></div>
<p class="product-description">${escapeHtml(product.description)}</p>
<div class="product-foot">${state}</div>
</li>`
        })
        .join("\n")
      return `<section id="category-${escapeHtml(category.name.toLowerCase())}">
<h2>${escapeHtml(category.name)} <span class="muted small">${category.products.length}</span></h2>
<ul class="product-grid">
${items}
</ul>
</section>`
    })
    .join("\n")

  return `<section class="noscript-card">
<h1>${escapeHtml(productsPage.title)}</h1>
<p class="subtitle">${escapeHtml(productsPage.subtitle)}（稼働状況は ${link(productsPage.statusUrl, productHost(productsPage.statusUrl), { external: true })}）</p>
${summary(statuses)}
<div class="ns-divider"></div>
${sections}
</section>`
}

// 稼働状況は1分だけキャッシュする（status.c30.life の監視は5分ごと）
async function statusesFor(
  ctx: NoscriptContext,
): Promise<ProductStatuses | null> {
  try {
    return await cached(ctx, "product-statuses", 60, loadProductStatuses)
  } catch (error) {
    console.error("product statuses", error)
    return null
  }
}

export const render: NoscriptRenderer = async (ctx) => ({
  body: renderProductsBody(await statusesFor(ctx)),
})
