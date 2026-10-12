import { serviceIcon } from "../../data/serviceIcons.ts"
import {
  formatUptime,
  loadServiceStatuses,
  type ServiceStatuses,
  serviceCategories,
  serviceHost,
  serviceHue,
  serviceMonogram,
  serviceStateLabels,
  servicesPage,
  statusOf,
  statusPageUrl,
} from "../../data/services.ts"
import { cached } from "../cache.ts"
import { escapeHtml, link } from "../html.ts"
import type { NoscriptContext, NoscriptRenderer } from "../types.ts"

function summary(statuses: ServiceStatuses | null): string {
  const all = serviceCategories.flatMap((c) => c.services)
  const parts = [`<span class="service-chip">${all.length} サービス</span>`]
  if (statuses) {
    const states = all.map((p) => statusOf(statuses, p)?.state)
    for (const state of ["up", "maintenance", "down"] as const) {
      const n = states.filter((s) => s === state).length
      if (n || state === "up")
        parts.push(
          `<span class="service-state ${state}">${n} ${serviceStateLabels[state]}</span>`,
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
  const nav = serviceCategories
    .map(
      (c) =>
        `<a href="#category-${escapeHtml(c.name.toLowerCase())}">${escapeHtml(c.name)} <span class="muted">${c.services.length}</span></a>`,
    )
    .join("")
  return `<div class="service-summary">${parts.join("")}<nav class="service-nav" aria-label="カテゴリ">${nav}</nav></div>`
}

export function renderServicesBody(
  statuses: ServiceStatuses | null = null,
): string {
  const sections = serviceCategories
    .map((category) => {
      const items = category.services
        .map((service) => {
          const hue = serviceHue(service.url)
          const favicon = serviceIcon(service.url)
          const icon = favicon
            ? `<span class="service-icon image${favicon.light ? " light" : ""}" aria-hidden="true"><img src="${escapeHtml(favicon.src)}" alt="" width="40" height="40" loading="lazy"></span>`
            : `<span class="service-icon" style="background:hsl(${hue} 55% 22%);color:hsl(${hue} 85% 78%)" aria-hidden="true">${escapeHtml(serviceMonogram(service.url))}</span>`
          const status = statusOf(statuses, service)
          const state = status
            ? `<a class="service-state ${status.state}" href="${escapeHtml(statusPageUrl(service.url))}" target="_blank" rel="noopener noreferrer">${serviceStateLabels[status.state]} · ${formatUptime(status.uptime30d)}${status.latency !== null ? ` · ${status.latency}ms` : ""}</a>`
            : ""
          return `<li class="service-card">
<div class="service-head">${icon}<div>${link(service.url, service.title, { external: true })}<span class="muted small service-host">${escapeHtml(serviceHost(service.url))}</span></div></div>
<p class="service-description">${escapeHtml(service.description)}</p>
<div class="service-foot">${state}</div>
</li>`
        })
        .join("\n")
      return `<section id="category-${escapeHtml(category.name.toLowerCase())}">
<h2>${escapeHtml(category.name)} <span class="muted small">${category.services.length}</span></h2>
<ul class="service-grid">
${items}
</ul>
</section>`
    })
    .join("\n")

  return `<section class="noscript-card">
<h1>${escapeHtml(servicesPage.title)}</h1>
<p class="subtitle">${escapeHtml(servicesPage.subtitle)}（稼働状況は ${link(servicesPage.statusUrl, serviceHost(servicesPage.statusUrl), { external: true })}）</p>
${summary(statuses)}
<div class="ns-divider"></div>
${sections}
</section>`
}

// 稼働状況は1分だけキャッシュする（status.c30.life の監視は5分ごと）
async function statusesFor(
  ctx: NoscriptContext,
): Promise<ServiceStatuses | null> {
  try {
    return await cached(ctx, "service-statuses", 60, loadServiceStatuses)
  } catch (error) {
    console.error("service statuses", error)
    return null
  }
}

export const render: NoscriptRenderer = async (ctx) => ({
  body: renderServicesBody(await statusesFor(ctx)),
})
