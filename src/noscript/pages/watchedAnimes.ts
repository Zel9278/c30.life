import {
  type Anime,
  animeGroups,
  animeTableHeaders,
  ratingStar,
  watchedAnimesPage,
} from "../../data/watchedAnimes.ts"
import { escapeHtml, link } from "../html.ts"
import type { NoscriptRenderer } from "../types.ts"

function renderRating(rating: number): string {
  const { fullStars, halfStar, emptyStars } = ratingStar(rating)
  // SPA と同じ記号 (★ / ✢ / 灰色の★)。数値は文字でも出すので記号は読み上げ対象外にする
  const filled = `${"★".repeat(fullStars)}${halfStar > 0 ? "✢" : ""}`
  const empty = "★".repeat(emptyStars)
  const stars = `<span class="ns-star-full" aria-hidden="true">${filled}</span>${empty ? `<span class="ns-star-empty muted" aria-hidden="true">${empty}</span>` : ""}`
  return `${stars} <span class="muted">(${escapeHtml(rating)}/10)</span>`
}

function renderRow(anime: Anime): string {
  return `<tr>
<td>${link(anime.url, anime.title, { external: true })}</td>
<td>${escapeHtml(anime.genre)}</td>
<td>${escapeHtml(anime.date ?? "")}</td>
<td>${renderRating(anime.rating)}</td>
</tr>`
}

export function renderWatchedAnimesBody(): string {
  const headers = animeTableHeaders
    .map((header) => `<th scope="col">${escapeHtml(header)}</th>`)
    .join("")

  // SPA と同じく 1 つの表にまとめ、グループごとに tbody と見出し行を置く
  const groups = animeGroups
    .map(
      (group) => `<tbody>
<tr><th scope="rowgroup" colspan="${animeTableHeaders.length}">${escapeHtml(group.label)}</th></tr>
${group.animes.map(renderRow).join("\n")}
</tbody>`,
    )
    .join("\n")

  return `<section class="noscript-card">
<h1>${escapeHtml(watchedAnimesPage.title)}</h1>
<p class="subtitle">${escapeHtml(watchedAnimesPage.subtitle)}</p>
<div class="ns-divider"></div>
<p>${watchedAnimesPage.intro.map((line) => escapeHtml(line)).join("<br>")}</p>
<div class="table-wrap">
<table>
<thead><tr>${headers}</tr></thead>
${groups}
</table>
</div>
</section>`
}

export const render: NoscriptRenderer = async () => ({
  body: renderWatchedAnimesBody(),
})
