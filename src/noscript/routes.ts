import { render as renderBlogEditor } from "./pages/blogEditor.ts"
import { render as renderBlogList } from "./pages/blogList.ts"
import { render as renderBlogPost } from "./pages/blogPost.ts"
import { render as renderDownloads } from "./pages/downloads.ts"
import { render as renderEnvironments } from "./pages/environments.ts"
import { render as renderFediAccounts } from "./pages/fediAccounts.ts"
import { render as renderHome } from "./pages/home.ts"
import { render as renderInfo } from "./pages/info.ts"
import { render as renderLinks } from "./pages/links.ts"
import { render as renderNotFound } from "./pages/notFound.ts"
import { render as renderPubkeys } from "./pages/pubkeys.ts"
import { render as renderServers } from "./pages/servers.ts"
import { render as renderWatchedAnimes } from "./pages/watchedAnimes.ts"
import type { NoscriptRenderer } from "./types.ts"

export interface NoscriptRoute {
  // src/router/index.ts と同じ順番・同じ意味でマッチさせる
  // (vue-router と同じく大文字小文字は区別しない。キャプチャした値は元のまま)
  pattern: RegExp
  // pattern のキャプチャグループに付ける名前
  paramNames?: string[]
  // キャプチャしない固定の値 (/blog/new/edit の id など)
  fixedParams?: Record<string, string>
  // OGP / <title> の既定値
  title: string
  description: string
  render: NoscriptRenderer
}

export const routes: NoscriptRoute[] = [
  {
    pattern: /^\/$/i,
    title: "c30.life",
    description: "c30's homepage",
    render: renderHome,
  },
  {
    pattern: /^\/links\/?$/i,
    title: "Links - c30.life",
    description: "c30のリンク集",
    render: renderLinks,
  },
  {
    pattern: /^\/fediaccounts\/?$/i,
    title: "Fedi Accounts - c30.life",
    description: "c30のFediverseアカウント一覧",
    render: renderFediAccounts,
  },
  {
    pattern: /^\/info\/?$/i,
    title: "Info - c30.life",
    description: "c30.lifeの情報",
    render: renderInfo,
  },
  {
    pattern: /^\/environments\/?$/i,
    title: "Environments - c30.life",
    description: "c30の開発環境",
    render: renderEnvironments,
  },
  {
    pattern: /^\/servers\/?$/i,
    title: "Servers - c30.life",
    description: "c30が運営するサーバー一覧",
    render: renderServers,
  },
  {
    pattern: /^\/pubkeys\/?$/i,
    title: "Pubkeys - c30.life",
    description: "c30の公開鍵",
    render: renderPubkeys,
  },
  {
    pattern: /^\/watched-animes\/?$/i,
    title: "Watched Animes - c30.life",
    description: "c30が観たアニメ・映画",
    render: renderWatchedAnimes,
  },
  {
    // /downloads, /downloads/, /downloads/a/b
    pattern: /^\/downloads(?:\/(.*))?$/i,
    paramNames: ["path"],
    title: "Downloads - c30.life",
    description: "公開ファイルのダウンロード",
    render: renderDownloads,
  },
  {
    pattern: /^\/blog\/?$/i,
    title: "Blog - c30.life",
    description: "c30のブログ記事一覧",
    render: renderBlogList,
  },
  {
    pattern: /^\/blog\/new\/edit\/?$/i,
    fixedParams: { id: "new" },
    title: "New Post - Blog - c30.life",
    description: "ブログエディター",
    render: renderBlogEditor,
  },
  {
    pattern: /^\/blog\/([^/]+)\/edit\/?$/i,
    paramNames: ["id"],
    title: "Edit Post - Blog - c30.life",
    description: "ブログエディター",
    render: renderBlogEditor,
  },
  {
    pattern: /^\/blog\/preview\/?$/i,
    fixedParams: { id: "preview" },
    title: "Preview - Blog - c30.life",
    description: "ブログプレビュー",
    render: renderBlogEditor,
  },
  {
    pattern: /^\/blog\/([^/]+)\/?$/i,
    paramNames: ["id"],
    title: "Blog - c30.life",
    description: "c30のブログ記事",
    render: renderBlogPost,
  },
  {
    pattern: /.*/,
    title: "Not Found - c30.life",
    description: "ページが見つかりません",
    render: renderNotFound,
  },
]

export function matchRoute(pathname: string): {
  route: NoscriptRoute
  params: Record<string, string>
} {
  for (const route of routes) {
    const match = pathname.match(route.pattern)
    if (!match) continue
    const params: Record<string, string> = { ...route.fixedParams }
    route.paramNames?.forEach((name, i) => {
      params[name] = match[i + 1] ?? ""
    })
    return { route, params }
  }
  // 最後のルートが .* なのでここには来ない
  return { route: routes[routes.length - 1], params: {} }
}
