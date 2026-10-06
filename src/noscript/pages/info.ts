import {
  siteFileLinks,
  siteInfo,
  siteRepositories,
} from "../../data/siteInfo.ts"
import { escapeHtml, link } from "../html.ts"
import type { NoscriptContext, NoscriptRenderer } from "../types.ts"

// vite.config.ts の packageInfoPlugin がビルド時に出力する /package-info.json
interface PackageInfo {
  version: string
  dependencies: { name: string; version: string }[]
  devDependencies: { name: string; version: string }[]
  licenses: {
    name: string
    version: string
    license: string
    repository: string
    publisher?: string
  }[]
}

async function loadPackageInfo(
  ctx: NoscriptContext,
): Promise<PackageInfo | null> {
  try {
    const res = await ctx.env.ASSETS.fetch(
      new URL("/package-info.json", ctx.url),
    )
    if (!res.ok) return null
    const data = (await res.json()) as Partial<PackageInfo>
    if (
      typeof data.version !== "string" ||
      !Array.isArray(data.dependencies) ||
      !Array.isArray(data.devDependencies) ||
      !Array.isArray(data.licenses)
    ) {
      return null
    }
    return data as PackageInfo
  } catch (e) {
    console.error("Failed to load package-info.json:", e)
    return null
  }
}

function renderDependencyList(
  title: string,
  deps: PackageInfo["dependencies"],
): string {
  const items = deps
    .map(
      (dep) => `<li>${escapeHtml(dep.name)}: ${escapeHtml(dep.version)}</li>`,
    )
    .join("\n")
  return `<details>
<summary>${escapeHtml(title)}</summary>
<ul class="plain-list">
${items}
</ul>
</details>`
}

function renderLicenses(licenses: PackageInfo["licenses"]): string {
  const rows = licenses
    .map((pkg) => {
      const publisher = pkg.publisher
        ? `<br><span class="muted small">by ${escapeHtml(pkg.publisher)}</span>`
        : ""
      return `<tr>
<td>${link(pkg.repository, pkg.name, { external: true })}${publisher}</td>
<td><code>${escapeHtml(pkg.version)}</code></td>
<td><span class="ns-badge">${escapeHtml(pkg.license)}</span></td>
<td>${link(`https://www.npmjs.com/package/${pkg.name}`, "npm", { external: true })}</td>
</tr>`
    })
    .join("\n")
  return `<details>
<summary>Licenses</summary>
<div class="table-wrap">
<table>
<thead><tr><th scope="col">Name</th><th scope="col">Version</th><th scope="col">License</th><th scope="col">npm</th></tr></thead>
<tbody>
${rows}
</tbody>
</table>
</div>
</details>`
}

export const render: NoscriptRenderer = async (ctx) => {
  const info = await loadPackageInfo(ctx)

  const fileLinks = siteFileLinks
    .map(
      (item) =>
        `<dt>${escapeHtml(item.label)}</dt><dd>${link(item.href, item.text)}</dd>`,
    )
    .join("\n")
  const repositories = siteRepositories
    .map((repo) => link(repo.href, repo.text, { external: true }))
    .join(", ")

  const packages = info
    ? `${renderDependencyList("Dependencies", info.dependencies)}
${renderDependencyList("DevDependencies", info.devDependencies)}
<div class="ns-divider"></div>
${renderLicenses(info.licenses)}`
    : `<p class="muted">パッケージ情報を取得できませんでした。</p>`

  const body = `<div class="noscript-card">
<h1>Info</h1>
<p class="subtitle">c30.lifeの情報</p>
<div class="ns-divider"></div>
<dl class="info-list">
<dt>ホスト</dt><dd>${escapeHtml(siteInfo.host)}</dd>
<dt>オーナー</dt><dd>${escapeHtml(siteInfo.owner)}</dd>
<dt>このサイトバージョン</dt><dd>${escapeHtml(info?.version ?? "不明")}</dd>
${fileLinks}
<dt>Repository</dt><dd>${repositories}</dd>
</dl>
<div class="ns-divider"></div>
${packages}
<p class="muted small">All packages are used under their respective licenses.</p>
</div>`

  return { body }
}
