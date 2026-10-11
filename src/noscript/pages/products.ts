import {
  productCategories,
  productHost,
  productsPage,
} from "../../data/products.ts"
import { escapeHtml, link } from "../html.ts"
import type { NoscriptRenderer } from "../types.ts"

export function renderProductsBody(): string {
  const sections = productCategories
    .map((category) => {
      const items = category.products
        .map(
          (product) =>
            `<li class="link-item">${link(product.url, product.title, { external: true })}<span class="muted small">${escapeHtml(productHost(product.url))}</span><span class="product-description">${escapeHtml(product.description)}</span></li>`,
        )
        .join("\n")
      return `<section>
<h2>${escapeHtml(category.name)}</h2>
<ul class="link-list product-list">
${items}
</ul>
</section>`
    })
    .join("\n")

  return `<section class="noscript-card">
<h1>${escapeHtml(productsPage.title)}</h1>
<p class="subtitle">${escapeHtml(productsPage.subtitle)}（稼働状況は ${link(productsPage.statusUrl, productHost(productsPage.statusUrl), { external: true })}）</p>
<div class="ns-divider"></div>
${sections}
</section>`
}

export const render: NoscriptRenderer = async () => ({
  body: renderProductsBody(),
})
