import {
  goneServerNote,
  type Server,
  serverSections,
  serverStatusLabels,
  serverStatusOrder,
  serversPage,
  serverTableHeaders,
  softwares,
} from "../../data/servers.ts"
import { escapeHtml, link } from "../html.ts"
import type { NoscriptRenderer } from "../types.ts"

function statusClass(status: Server["status"]): string {
  return `ns-status-${status}`
}

function renderRow(server: Server): string {
  // gone のサーバーは別人のドメインになっている可能性があるのでリンクにしない (SPA と同じ)
  const url =
    server.status === "gone"
      ? `${escapeHtml(server.url)} ${escapeHtml(goneServerNote)}`
      : link(server.url, server.url, { external: true })
  return `<tr class="${statusClass(server.status)}">
<td>${escapeHtml(server.name)}</td>
<td>${url}</td>
<td>${link(softwares[server.software], server.software, { external: true })}</td>
<td>${escapeHtml(server.created_at)}</td>
<td>${escapeHtml(serverStatusLabels[server.status])}</td>
</tr>`
}

export function renderServersBody(): string {
  const legend = serverStatusOrder
    .map(
      (status) =>
        `<span class="${statusClass(status)}">● ${escapeHtml(serverStatusLabels[status])}</span>`,
    )
    .join(" ")

  // SPA は状態を色だけで表すので、noscript では「状態」列を足して文字でも示す
  const headers = [...serverTableHeaders, "状態"]
    .map((header) => `<th scope="col">${escapeHtml(header)}</th>`)
    .join("")

  const sections = serverSections
    .map(
      (section) => `<section>
<h2>${escapeHtml(section.heading)}</h2>
<div class="table-wrap">
<table>
<thead><tr>${headers}</tr></thead>
<tbody>
${section.servers.map(renderRow).join("\n")}
</tbody>
</table>
</div>
</section>`,
    )
    .join("\n")

  return `<section class="noscript-card">
<h1>${escapeHtml(serversPage.title)}</h1>
<p class="subtitle">${escapeHtml(serversPage.subtitle)}</p>
<div class="ns-divider"></div>
<p class="small">${legend}</p>
${sections}
</section>`
}

export const render: NoscriptRenderer = async () => ({
  body: renderServersBody(),
})
