import {
  buildTree,
  type DownloadCounts,
  decodeName,
  downloadCountOf,
  downloadHref,
  type FileItem,
  findFolder,
  folderHref,
  formatDate,
  formatSize,
  readDownloadCounts,
} from "../../lib/files.ts"
import { cached } from "../cache.ts"
import { escapeHtml, link, safeUrl } from "../html.ts"
import type { NoscriptContext, NoscriptRenderer } from "../types.ts"

// functions/api/files の /api/files/list と同じ一覧を作る
async function loadTree(ctx: NoscriptContext): Promise<FileItem[]> {
  return cached(ctx, "files-tree", 60, async () => {
    const listed = await ctx.env.FILES_BUCKET.list()
    return buildTree(listed.objects)
  })
}

// /api/download-counts と同じ値。数は頻繁に変わるのでキャッシュしない。
// 読めなくても一覧は出す (SPA と同じく 0 扱い)
async function loadCounts(ctx: NoscriptContext): Promise<DownloadCounts> {
  try {
    return await readDownloadCounts(ctx.env.DOWNLOAD_COUNTS)
  } catch (e) {
    console.error("Failed to read download counts:", e)
    return {}
  }
}

function renderHeader(segments: string[]): string {
  const crumbs = [
    segments.length === 0
      ? `<span aria-current="page">Root</span>`
      : link(folderHref([]), "Root"),
    ...segments.map((segment, index) => {
      const text = decodeName(segment)
      return index === segments.length - 1
        ? `<span aria-current="page">${escapeHtml(text)}</span>`
        : link(folderHref(segments.slice(0, index + 1)), text)
    }),
  ].join(" / ")

  return `<h1>Downloads</h1>
<p class="subtitle">公開ファイルのダウンロード</p>
<div class="ns-divider"></div>
<nav aria-label="パンくずリスト"><p>${crumbs}</p></nav>
<section>
<h2>利用について</h2>
<p>ここで公開しているファイルは自由にダウンロードして使用できます。<br>
再配布はおやめください。<br>
The files published here are free to download and use. <br>
Please do not redistribute them.</p>
</section>`
}

function renderItems(
  segments: string[],
  items: FileItem[],
  counts: DownloadCounts,
): string {
  if (items.length === 0 && segments.length === 0) {
    return `<p class="muted center">このフォルダは空です</p>`
  }

  const rows: string[] = []
  if (segments.length > 0) {
    rows.push(`<tr>
<td>${link(folderHref(segments.slice(0, -1)), "..")}</td>
<td>-</td>
<td>-</td>
<td>-</td>
</tr>`)
  }

  for (const item of items) {
    const name = decodeName(item.name)
    if (item.type === "folder") {
      rows.push(`<tr>
<td>${link(folderHref([...segments, name]), `${name}/`)}</td>
<td>-</td>
<td>-</td>
<td>-</td>
</tr>`)
    } else {
      rows.push(`<tr>
<td><a href="${escapeHtml(safeUrl(downloadHref(item.key)))}" rel="nofollow" download>${escapeHtml(name)}</a></td>
<td>${escapeHtml(downloadCountOf(counts, item.key))}</td>
<td>${escapeHtml(formatSize(item.size))}</td>
<td><time datetime="${escapeHtml(item.lastModified)}">${escapeHtml(formatDate(item.lastModified, "Asia/Tokyo"))}</time></td>
</tr>`)
    }
  }

  return `<div class="table-wrap downloads-table">
<table>
<thead><tr><th scope="col">Name</th><th scope="col">DLs</th><th scope="col">Size</th><th scope="col">Modified</th></tr></thead>
<tbody>
${rows.join("\n")}
</tbody>
</table>
</div>`
}

export const render: NoscriptRenderer = async (ctx) => {
  // params.path は decode 済み。末尾スラッシュや連続スラッシュは無視する
  const segments = (ctx.params.path ?? "").split("/").filter(Boolean)
  const subPath = segments.join("/")
  const meta =
    segments.length > 0
      ? {
          title: `${segments[segments.length - 1]} - Downloads - c30.life`,
          description: `${subPath} のファイル一覧`,
        }
      : {}

  let tree: FileItem[]
  let counts: DownloadCounts
  try {
    ;[tree, counts] = await Promise.all([loadTree(ctx), loadCounts(ctx)])
  } catch (e) {
    console.error("Failed to list files:", e)
    return {
      ...meta,
      status: 503,
      body: `<div class="noscript-card">
${renderHeader(segments)}
<p class="center">ファイルの取得に失敗しました</p>
</div>`,
    }
  }

  const items = findFolder(tree, segments)
  if (!items) {
    return {
      status: 404,
      title: "Not Found - Downloads - c30.life",
      description: "フォルダが見つかりません",
      noindex: true,
      body: `<div class="noscript-card">
<h1>Downloads</h1>
<p class="subtitle">公開ファイルのダウンロード</p>
<div class="ns-divider"></div>
<p>フォルダ「${escapeHtml(subPath)}」は見つかりませんでした。</p>
<p>${link(folderHref([]), "Downloads のトップへ戻る")}</p>
</div>`,
    }
  }

  return {
    ...meta,
    body: `<div class="noscript-card">
${renderHeader(segments)}
${renderItems(segments, items, counts)}
</div>`,
  }
}
