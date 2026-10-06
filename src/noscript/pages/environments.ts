import {
  environmentsPage,
  formatRooted,
  pc,
  pcSpecRows,
  phones,
} from "../../data/environments.ts"
import { escapeHtml } from "../html.ts"
import type { NoscriptRenderer } from "../types.ts"

export function renderEnvironmentsBody(): string {
  const specs = pcSpecRows
    .map(
      (row) =>
        `<dt>${escapeHtml(row.label)}</dt><dd>${escapeHtml(pc[row.key])}</dd>`,
    )
    .join("\n")

  const phoneRows = phones
    .map(
      (phone) => `<tr>
<td>${escapeHtml(phone.name)}</td>
<td>${escapeHtml(phone.os)}</td>
<td>${escapeHtml(formatRooted(phone.rooted))}</td>
</tr>`,
    )
    .join("\n")

  return `<section class="noscript-card">
<h1>${escapeHtml(environmentsPage.title)}</h1>
<p class="subtitle">${escapeHtml(environmentsPage.subtitle)}</p>
<div class="ns-divider"></div>
<section>
<h2>PC</h2>
<dl class="info-list">
${specs}
</dl>
</section>
<div class="ns-divider"></div>
<section>
<h2>Phones</h2>
<div class="table-wrap">
<table>
<thead><tr><th scope="col">Name</th><th scope="col">OS</th><th scope="col">Rooted</th></tr></thead>
<tbody>
${phoneRows}
</tbody>
</table>
</div>
</section>
</section>`
}

export const render: NoscriptRenderer = async () => ({
  body: renderEnvironmentsBody(),
})
